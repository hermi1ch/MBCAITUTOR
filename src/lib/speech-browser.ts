import type { StudentLang, TutorReply } from "./types";

export function recognitionLang(lang: StudentLang): string {
  if (lang === "yue") return "zh-HK";
  if (lang === "en") return "en-US";
  return "zh-TW";
}

export function speakWithBrowser(text: string, ttsLang: TutorReply["ttsLang"]): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      reject(new Error("Web Speech TTS is not available"));
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = ttsLang;
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((voice) => voice.lang.replace("_", "-") === ttsLang)
      ?? voices.find((voice) => voice.lang.startsWith(ttsLang.slice(0, 2)));
    if (match) utter.voice = match;
    utter.rate = ttsLang === "en-US" ? 0.95 : 0.92;
    utter.onend = () => resolve();
    utter.onerror = (event) => reject(new Error(event.error || "TTS error"));
    window.speechSynthesis.speak(utter);
  });
}

export function stopBrowserSpeech(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

type RecognitionCtor = new () => SpeechRecognition;

export function getSpeechRecognition(): SpeechRecognition | null {
  if (typeof window === "undefined") return null;
  const ctor = (window.SpeechRecognition
    ?? window.webkitSpeechRecognition) as RecognitionCtor | undefined;
  if (!ctor) return null;
  return new ctor();
}
