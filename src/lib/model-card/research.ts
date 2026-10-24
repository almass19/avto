import type Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getAnthropic, logUsage } from "@/lib/anthropic";
import type { VehicleDescriptor } from "./card-key";
import { modelCardSchema, type CardSource } from "./schema";
import type { StoredCard } from "./store";

const RESEARCH_MODEL = process.env.RESEARCH_MODEL ?? "claude-sonnet-5-5";
const STRUCTURE_MODEL = process.env.STRUCTURE_MODEL ?? "claude-haiku-5-5";
const MAX_SEARCHES = 5;
const MAX_CONTINUATIONS = 3;
const MAX_SOURCES = 8;

const RESEARCH_SYSTEM = `Ты — исследователь для сервиса проверки б/у авто в Казахстане. Найди в интернете типичные болячки конкретной машины: отзывы владельцев (drom.ru, drive2.ru, kolesa.kz, auto.ru, профильные форумы и клубы), обзоры автоподборщиков, отзывные кампании.

Правила:
- Только то, что относится к этому поколению, мотору и коробке. Если внутри поколения были разные моторы или коробки (например, автомат и вариатор под одним названием), явно раздели их.
- Для каждой проблемы: что ломается, как проявляется, на каком пробеге, примерная цена ремонта. Цены в рублях переведи в тенге по актуальному курсу и пометь «≈».
- Опирайся на источники, а не на догадки. Если данных мало — так и скажи.
- Пиши по-русски, сжато, списком.`;

function describe(vehicle: VehicleDescriptor): string {
  return [
    `${vehicle.brand} ${vehicle.model}`,
    `поколение: ${vehicle.generation}`,
    `двигатель: ${vehicle.engine ?? "не указан"}`,
    `коробка: ${vehicle.gearbox ?? "не указана"}`,
  ].join(", ");
}

function collectSources(content: Anthropic.ContentBlock[], into: Map<string, CardSource>): void {
  for (const block of content) {
    if (block.type !== "text") continue;
    for (const citation of block.citations ?? []) {
      if (citation.type !== "web_search_result_location") continue;
      if (!/^https?:\/\//.test(citation.url) || into.has(citation.url)) continue;
      into.set(citation.url, { url: citation.url, title: citation.title ?? citation.url });
    }
  }
}

/** Runs web search, continuing the server-side loop on pause_turn. Returns findings text and cited sources. */
async function searchWeakPoints(vehicle: VehicleDescriptor): Promise<{ text: string; sources: CardSource[] }> {
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: `Машина: ${describe(vehicle)}. Найди её типичные болячки.` },
  ];
  const sources = new Map<string, CardSource>();
  const texts: string[] = [];

  for (let turn = 0; turn <= MAX_CONTINUATIONS; turn++) {
    // Low effort + direct search (no dynamic-filtering code runs): ~25 s and 2–5 searches
    // instead of 6+ minutes with the defaults, with the same quality of findings.
    const response = await getAnthropic().messages.create({
      model: RESEARCH_MODEL,
      max_tokens: 8000,
      system: RESEARCH_SYSTEM,
      messages,
      tools: [
        { type: "web_search_20260318", name: "web_search", max_uses: MAX_SEARCHES, allowed_callers: ["direct"] },
      ],
      output_config: { effort: "low" },
    });
    logUsage("research", response.usage);

    collectSources(response.content, sources);
    texts.push(...response.content.flatMap((block) => (block.type === "text" ? [block.text] : [])));

    if (response.stop_reason !== "pause_turn") break;
    messages.push({ role: "assistant", content: response.content });
  }

  return { text: texts.join("").trim(), sources: [...sources.values()].slice(0, MAX_SOURCES) };
}

export async function researchModelCard(vehicle: VehicleDescriptor): Promise<StoredCard> {
  const findings = await searchWeakPoints(vehicle);
  if (!findings.text) throw new Error("research returned no text");

  const message = await getAnthropic().messages.parse({
    model: STRUCTURE_MODEL,
    max_tokens: 8000,
    // Plain transcription: thinking would only eat the token budget and cut the JSON off.
    thinking: { type: "disabled" },
    system: "Перенеси результаты исследования в заданную структуру. Ничего не добавляй от себя, только то, что есть в тексте.",
    messages: [{ role: "user", content: `Машина: ${describe(vehicle)}\n\nРезультаты исследования:\n${findings.text}` }],
    output_config: { format: zodOutputFormat(modelCardSchema) },
  });

  logUsage("structure", message.usage);

  if (!message.parsed_output) {
    throw new Error(`structuring returned no output (${message.stop_reason})`);
  }
  return { card: message.parsed_output, sources: findings.sources };
}
