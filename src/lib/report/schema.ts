import { z } from "zod";

const severity = z.enum(["low", "medium", "high"]);

export const reportSchema = z.object({
  verdict: z.object({
    level: z
      .enum(["go", "caution", "avoid"])
      .describe("go — можно ехать смотреть; caution — есть вопросы; avoid — лучше пропустить"),
    headline: z.string().describe("Вывод одной фразой, до 90 символов"),
    summary: z.string().describe("2–4 предложения: почему такой вывод"),
  }),
  price: z.object({
    comment: z.string().describe("Оценка цены с учётом пробега, руля, состояния и средней цены"),
    negotiationTip: z.string().describe("Как и на чём торговаться с продавцом"),
  }),
  weakPoints: z
    .array(
      z.object({
        title: z.string(),
        details: z.string().describe("Что ломается, на каком пробеге, примерная цена ремонта в тенге"),
        severity,
      }),
    )
    .describe("Типичные болячки именно этой модели, поколения и мотора"),
  inspectionChecklist: z
    .array(z.object({ item: z.string(), why: z.string() }))
    .describe("Что конкретно проверить на осмотре и тест-драйве"),
  sellerQuestions: z.array(z.string()).describe("Вопросы продавцу до встречи"),
  redFlags: z
    .array(z.object({ text: z.string(), severity }))
    .describe("Подозрительное в самом объявлении. Пустой массив, если ничего"),
  ownershipNotes: z
    .string()
    .describe("Расходы на содержание в Казахстане: налог, страховка, запчасти, топливо"),
});

export type Report = z.infer<typeof reportSchema>;
