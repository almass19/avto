"use client";

import { useState, type ReactNode } from "react";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { ReportView } from "@/components/report/ReportView";
import type { ReportResult } from "@/lib/report/generate-report";
import { CheckForm } from "./CheckForm";
import { LoadingState } from "./LoadingState";

type ApiResponse = { ok: true; data: ReportResult } | { ok: false; error: string };

type FlowState =
  | { status: "idle"; error: string | null }
  | { status: "loading" }
  | { status: "done"; result: ReportResult };

type CheckFlowProps = {
  /** Hero visual shown beside the form (server-rendered). */
  preview: ReactNode;
  /** Landing sections below the hero (server-rendered). */
  children: ReactNode;
};

export function CheckFlow({ preview, children }: CheckFlowProps) {
  const [state, setState] = useState<FlowState>({ status: "idle", error: null });

  async function handleSubmit(url: string, sellerText: string) {
    setState({ status: "loading" });
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, sellerText: sellerText || undefined }),
      });
      const body = (await response.json()) as ApiResponse;
      setState(
        body.ok
          ? { status: "done", result: body.data }
          : { status: "idle", error: body.error },
      );
      window.scrollTo({ top: 0 });
    } catch {
      setState({
        status: "idle",
        error: "Нет связи с сервером. Проверьте интернет и попробуйте снова.",
      });
    }
  }

  if (state.status === "done") {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto w-full max-w-3xl px-4 pb-24 pt-6 sm:px-6">
          <ReportView
            result={state.result}
            onReset={() => setState({ status: "idle", error: null })}
          />
        </main>
      </>
    );
  }

  return (
    <>
      <div className="bg-asphalt text-white">
        <SiteHeader tone="dark" />
        <section
          id="check"
          aria-labelledby="hero-heading"
          className="mx-auto grid w-full max-w-6xl scroll-mt-4 items-center gap-12 px-4 pb-20 pt-8 sm:px-6 lg:grid-cols-[1.25fr_1fr] lg:pb-28 lg:pt-14"
        >
          <div>
            <h1
              id="hero-heading"
              className="font-display text-[2rem] font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.15rem]"
            >
              Разберём любое объявление с Kolesa до осмотра
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">
              Честная ли цена, что обычно ломается у этой модели, что проверить на осмотре и о
              чём спросить продавца. Без VIN — достаточно ссылки.
            </p>
            <div className="mt-9 text-asphalt">
              {state.status === "loading" ? (
                <LoadingState />
              ) : (
                <CheckForm onSubmit={handleSubmit} error={state.error} />
              )}
            </div>
          </div>
          {preview}
        </section>
      </div>
      <main>{children}</main>
    </>
  );
}
