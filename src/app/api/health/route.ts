import { hasAzureSpeech, hasDeepSeekKey } from "@/lib/config";
import type { HealthStatus } from "@/lib/types";

export async function GET() {
  const body: HealthStatus = {
    tutor: hasDeepSeekKey() ? "deepseek" : "mock",
    tts: hasAzureSpeech() ? "azure" : "browser",
    stt: hasAzureSpeech() ? "azure" : "browser",
    auth: "open",
  };
  return Response.json(body);
}
