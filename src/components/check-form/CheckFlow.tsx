"use client";

import { useState } from "react";
import type { ReportResult } from "@/lib/report/generate-report";
import { ReportView } from "@/components/report/ReportView";
import { CheckForm } from "./CheckForm";
import { LoadingState } from "./LoadingState";

type ApiResponse = { ok: true; data: ReportResult } | { ok: false; error: string };

type FlowState =
  | { status: "idle"; error: string | null }
  | { status: "loading" }
  | { status: "done"; result: ReportResult };

export function CheckFlow() {
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
    } catch {
      setState({
        status: "idle",
        error: "Нет связи с сервером. Проверьте интернет и попробуйте снова.",
      });
    }
  }

  if (state.status === "done") {
    return (
      <ReportView
        result={state.result}
        onReset={() => setState({ status: "idle", error: null })}
      />
    );
  }

  return (
    <>
      <header>
        <h1 className="font-display text-[2rem] font-bold leading-[1.1] tracking-tight sm:text-5xl">
          Разберём объявление с Kolesa до того, как вы поедете смотреть машину
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-asphalt-soft">
          Честная ли цена, что обычно ломается у этой модели, что проверить на осмотре и о
          чём спросить продавца.
        </p>
      </header>

      <div className="mt-10">
        {state.status === "loading" ? (
          <LoadingState />
        ) : (
          <CheckForm onSubmit={handleSubmit} error={state.error} />
        )}
      </div>
    </>
  );
}
