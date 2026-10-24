import type { Listing } from "@/lib/kolesa/types";
import type { ModelCard } from "@/lib/model-card/schema";
import type { PriceComparison } from "./price";

export const SYSTEM_PROMPT = `Ты — опытный автоподборщик из Казахстана с 15 годами практики. Ты разбираешь объявление с Kolesa.kz для покупателя, который ещё не видел машину вживую.

Правила:
- Пиши по-русски, просто и конкретно, как другу. Без воды и общих советов вроде «проверьте состояние».
- Болячки и советы — именно для этой марки, модели, поколения, мотора и коробки. Указывай пробег, на котором проблема обычно проявляется, и примерную стоимость ремонта в тенге.
- Учитывай реалии Казахстана: правый руль, растаможка и постановка на учёт, «японцы» и «американцы» после аварий, скрутка пробега, климат (морозы, пыль, соль), доступность запчастей.
- Не выдумывай факты о конкретной машине. Если чего-то нельзя понять из объявления — так и скажи и добавь это в вопросы продавцу или чек-лист.
- Цену оценивай относительно средней цены Kolesa (если она есть) с поправкой на пробег, руль и комплектацию.
- Тон честный: если машина выглядит рискованной — говори прямо.`;

function formatKzt(value: number | null): string {
  return value ? `${value.toLocaleString("ru-RU")} ₸` : "нет данных";
}

function formatModelCard(card: ModelCard): string {
  const points = card.weakPoints
    .map((p) => `- [${p.severity}] ${p.title}: ${p.details} Пробег: ${p.mileage}. Ремонт: ${p.repairCostKzt}.`)
    .join("\n");
  const strengths = card.strengths.map((s) => `- ${s}`).join("\n");

  return `

Проверенные данные по этой модели (собраны из отзывов владельцев и обзоров, используй их как основу для слабых мест, чек-листа и вопросов; дополняй своими знаниями, только если уверен):
${points || "- нет данных"}
Сильные стороны:
${strengths || "- нет данных"}
Оговорки: ${card.notes || "нет"}`;
}

export function buildUserPrompt(
  listing: Listing,
  price: PriceComparison,
  sellerText: string | null,
  modelCard: ModelCard | null = null,
): string {
  const params = Object.entries(listing.params)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join("\n");

  const delta =
    price.deltaPercent === null
      ? "сравнить не с чем"
      : `${price.deltaPercent > 0 ? "+" : ""}${price.deltaPercent}% к средней`;

  return `Объявление: ${listing.title}
Ссылка: ${listing.url}
Цена: ${formatKzt(listing.priceKzt)}
Средняя цена похожих авто на Kolesa: ${formatKzt(listing.avgPriceKzt)} (${delta})
Фото в объявлении: ${listing.photoCount}
Опубликовано: ${listing.publishedAt ?? "неизвестно"}

Характеристики:
${params || "- нет данных"}

Описание от продавца:
${sellerText?.trim() || "не предоставлено"}${modelCard ? formatModelCard(modelCard) : ""}

Сделай разбор: вывод, цена, слабые места модели (4–7 пунктов), чек-лист осмотра (6–10 пунктов), вопросы продавцу (5–8), красные флаги в объявлении, расходы на содержание.`;
}
