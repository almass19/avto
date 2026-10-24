import { z } from "zod";

export const modelCardSchema = z.object({
  weakPoints: z
    .array(
      z.object({
        title: z.string().describe("Узел и проблема коротко, например «Масложор 2AR-FE»"),
        details: z.string().describe("Что происходит, как проявляется, как проверить на осмотре"),
        mileage: z.string().describe("На каком пробеге обычно проявляется, например «150–200 тыс. км»"),
        repairCostKzt: z.string().describe("Примерная цена ремонта в тенге, например «300–450 тыс. ₸»"),
        severity: z.enum(["low", "medium", "high"]),
      }),
    )
    .describe("Типичные болячки этого поколения, мотора и коробки, от самых серьёзных"),
  strengths: z.array(z.string()).describe("Чем модель хороша по отзывам владельцев, 2–4 пункта"),
  notes: z.string().describe("Важные оговорки: разные версии мотора/коробки внутри поколения, отзывные кампании"),
});

export type ModelCard = z.infer<typeof modelCardSchema>;

export type CardSource = { url: string; title: string };
