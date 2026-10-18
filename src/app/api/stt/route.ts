import { azureTranscribe } from "@/lib/azure-speech";
import { hasAzureSpeech } from "@/lib/config";

export async function POST(request: Request) {
  if (!hasAzureSpeech()) {
    return Response.json({ fallback: "browser" });
  }

  const language = request.headers.get("x-speech-language") || "zh-HK";
  const contentType = request.headers.get("content-type") || "audio/wav";
  const audio = await request.arrayBuffer();
  if (!audio.byteLength) {
    return Response.json({ error: "Empty audio" }, { status: 400 });
  }

  try {
    const text = await azureTranscribe(audio, language, contentType);
    return Response.json({ text });
  } catch (error) {
    console.error(error);
    return Response.json({ fallback: "browser" });
  }
}
