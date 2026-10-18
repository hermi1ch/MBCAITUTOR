import { azureSpeak } from "@/lib/azure-speech";
import { hasAzureSpeech } from "@/lib/config";
import type { TutorReply } from "@/lib/types";

const TTS_LANGS: TutorReply["ttsLang"][] = ["zh-HK", "zh-TW", "en-US"];

export async function POST(request: Request) {
  if (!hasAzureSpeech()) {
    return Response.json({ fallback: "browser" });
  }

  let body: { text?: string; ttsLang?: TutorReply["ttsLang"] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text = body.text?.trim() ?? "";
  if (!text) {
    return Response.json({ error: "Text is required" }, { status: 400 });
  }
  const ttsLang = TTS_LANGS.includes(body.ttsLang as TutorReply["ttsLang"])
    ? (body.ttsLang as TutorReply["ttsLang"])
    : "zh-TW";

  try {
    const audio = await azureSpeak(text, ttsLang);
    return new Response(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(error);
    return Response.json({ fallback: "browser" });
  }
}
