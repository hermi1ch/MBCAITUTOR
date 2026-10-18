import type { TutorReply } from "./types";

const VOICES: Record<TutorReply["ttsLang"], string> = {
  "zh-HK": "zh-HK-WanLungNeural",
  "zh-TW": "zh-TW-YunJheNeural",
  "en-US": "en-US-GuyNeural",
};

function escapeXml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function azureSpeak(text: string, ttsLang: TutorReply["ttsLang"]): Promise<ArrayBuffer> {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) {
    throw new Error("Azure Speech is not configured");
  }

  const ssml = `<speak version="1.0" xml:lang="${ttsLang}">
  <voice name="${VOICES[ttsLang]}">${escapeXml(text)}</voice>
</speak>`;

  const response = await fetch(
    `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
        "User-Agent": "xiaoxin-tutor",
      },
      body: ssml,
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Azure TTS ${response.status}: ${detail.slice(0, 200)}`);
  }
  return response.arrayBuffer();
}

export async function azureTranscribe(
  audio: ArrayBuffer,
  language: string,
  contentType: string,
): Promise<string> {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) {
    throw new Error("Azure Speech is not configured");
  }

  const url = new URL(
    `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`,
  );
  url.searchParams.set("language", language);
  url.searchParams.set("format", "simple");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": contentType || "audio/wav",
      Accept: "application/json",
    },
    body: audio,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Azure STT ${response.status}: ${detail.slice(0, 200)}`);
  }

  const data = (await response.json()) as { DisplayText?: string; RecognitionStatus?: string };
  return data.DisplayText?.trim() || "";
}
