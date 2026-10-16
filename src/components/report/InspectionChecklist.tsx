"use client";

import { useState } from "react";
import type { Report } from "@/lib/report/schema";

type InspectionChecklistProps = { items: Report["inspectionChecklist"] };

export function InspectionChecklist({ items }: InspectionChecklistProps) {
  const [checked, setChecked] = useState<ReadonlySet<number>>(new Set());

  function toggle(index: number) {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <>
      <p className="mt-1 text-sm text-asphalt-soft">
        Отмечайте пункты прямо на осмотре. Проверено {checked.size} из {items.length}.
      </p>
      <ul className="mt-4 divide-y divide-line">
        {items.map((entry, index) => (
          <li key={entry.item}>
            <label className="flex cursor-pointer gap-4 py-4">
              <input
                type="checkbox"
                checked={checked.has(index)}
                onChange={() => toggle(index)}
                className="mt-1 h-5 w-5 shrink-0 accent-go"
              />
              <span className={checked.has(index) ? "text-asphalt-soft line-through decoration-asphalt-soft/50" : ""}>
                <span className="block font-medium">{entry.item}</span>
                <span className="mt-1 block text-sm leading-relaxed text-asphalt-soft">{entry.why}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </>
  );
}
