import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  client ??= new Anthropic();
  return client;
}

/** One log line per API call, so per-report cost can be read from the server logs. */
export function logUsage(step: string, usage: Anthropic.Usage): void {
  console.info(
    `[usage] ${step}: in=${usage.input_tokens} out=${usage.output_tokens}` +
      ` searches=${usage.server_tool_use?.web_search_requests ?? 0}`,
  );
}
