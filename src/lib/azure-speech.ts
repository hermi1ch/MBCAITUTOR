import type { TutorReply } from "./types";

// Young boy / child-like neural voices. Yunxi is a lively young male;
// Yunxia is a child neural (used as fallback). Pitch is lifted in SSML.
const VOICES: Record<TutorReply["ttsLang"], string> = {
  "zh-HK": "zh-CN-YunxiNeural",
  "zh-TW": "zh-CN-YunxiNeural",
  "en-US": "en-US-AndrewNeural",
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

  const xmlLang = ttsLang === "zh-HK" ? "zh-CN" : ttsLang;
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${xmlLang}">
  <voice name="${VOICES[ttsLang]}">
    <prosody pitch="+18%" rate="+6%">${escapeXml(text)}</prosody>
  </voice>
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
