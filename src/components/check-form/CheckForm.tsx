"use client";

import { useId, useState, type FormEvent } from "react";

type CheckFormProps = {
  onSubmit: (url: string, sellerText: string) => void;
  error: string | null;
};

export function CheckForm({ onSubmit, error }: CheckFormProps) {
  const [url, setUrl] = useState("");
  const [sellerText, setSellerText] = useState("");
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const urlId = useId();
  const errorId = useId();
  const descriptionId = useId();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (url.trim()) onSubmit(url.trim(), sellerText.trim());
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_0_var(--line),0_12px_32px_-16px_rgba(29,36,48,0.25)] sm:p-6"
    >
      <label htmlFor={urlId} className="block font-medium">
        Ссылка на объявление
      </label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
        <input
          id={urlId}
          type="url"
          inputMode="url"
          required
          autoComplete="off"
          placeholder="https://kolesa.kz/a/show/…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="min-w-0 flex-1 rounded-xl border-2 border-line bg-road/40 px-4 py-3 text-base transition-colors duration-[var(--duration-fast)] placeholder:text-asphalt-soft/60 hover:border-asphalt-soft/40 focus:border-sky focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-xl bg-sky px-6 py-3 font-display text-sm font-bold text-white transition-[background-color,transform] duration-[var(--duration-fast)] hover:bg-sky-deep active:translate-y-px"
        >
          Разобрать
        </button>
      </div>

      {error && (
        <p id={errorId} role="alert" className="mt-3 text-sm font-medium text-avoid">
          {error}
        </p>
      )}

      <div className="mt-5 border-t border-line pt-4">
        {isDescriptionOpen ? (
          <>
            <label htmlFor={descriptionId} className="block font-medium">
              Описание от продавца
            </label>
            <p className="mt-1 text-sm text-asphalt-soft">
              Скопируйте текст из объявления — так разбор будет точнее.
            </p>
            <textarea
              id={descriptionId}
              rows={4}
              maxLength={4000}
              value={sellerText}
              onChange={(e) => setSellerText(e.target.value)}
              className="mt-2 w-full rounded-xl border-2 border-line bg-road/40 px-4 py-3 text-base focus:border-sky focus:outline-none"
            />
          </>
        ) : (
          <button
            type="button"
            onClick={() => setIsDescriptionOpen(true)}
            className="text-sm font-medium text-sky-deep underline decoration-sky/40 underline-offset-4 hover:decoration-sky"
          >
            Добавить описание от продавца
          </button>
        )}
      </div>
    </form>
  );
}
