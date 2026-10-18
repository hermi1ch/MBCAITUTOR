import type { StudentLang, TutorReply } from "./types";

export function recognitionLang(lang: StudentLang): string {
  if (lang === "yue") return "zh-HK";
  if (lang === "en") return "en-US";
  return "zh-TW";
}

export type SpeakHooks = {
  onStart?: () => void;
  onViseme?: (mouthOpen: boolean) => void;
  onPause?: () => void;
  onEnd?: () => void;
};

const BOYISH = /yunxi|yunxia|yunxiao|yunye|yunfeng|yunze|yunyang|wanlung|kangkang|haohao|jason|andrew|guy|david|daniel|ryan|brandon|brian|tony|kefu|boy|child|kid|young|male|männlich|homme|男/;
const FEMALE = /female|woman|girl|samantha|karen|susan|zira|heera|ting|meijia|hanhan|xiaoxiao|xiaochen|xiaoyi|xiaoyou|xiaoshuang|hiugai|hiumaan|siri|女/;

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve([]);
      return;
    }
    const now = window.speechSynthesis.getVoices();
    if (now.length) {
      resolve(now);
      return;
    }
    const done = () => resolve(window.speechSynthesis.getVoices());
    window.speechSynthesis.addEventListener("voiceschanged", done, { once: true });
    window.setTimeout(done, 700);
  });
}

function langScore(voiceLang: string, ttsLang: TutorReply["ttsLang"]): number {
  const lang = voiceLang.replace("_", "-").toLowerCase();
  const wanted = ttsLang.toLowerCase();
  if (lang === wanted) return 40;
  if (wanted.startsWith("zh")) {
    if (wanted === "zh-hk" && lang.startsWith("zh-hk")) return 38;
    if (wanted === "zh-tw" && (lang.startsWith("zh-tw") || lang.startsWith("zh-cn"))) return 34;
    if (lang.startsWith("zh-cn")) return 28;
    if (lang.startsWith("zh-hk")) return 24;
    if (lang.startsWith("zh-tw")) return 24;
    if (lang.startsWith("zh")) return 16;
  }
  if (wanted === "en-us") {
    if (lang === "en-us") return 40;
    if (lang.startsWith("en")) return 22;
  }
  return 0;
}

export function pickBoyVoice(
  voices: SpeechSynthesisVoice[],
  ttsLang: TutorReply["ttsLang"],
): SpeechSynthesisVoice | undefined {
  let best: SpeechSynthesisVoice | undefined;
  let bestScore = -999;
  for (const voice of voices) {
    const name = voice.name.toLowerCase();
    let score = langScore(voice.lang, ttsLang);
    if (score <= 0) continue;
    if (BOYISH.test(name)) score += 24;
    if (FEMALE.test(name)) score -= 20;
    if (/yunxi/.test(name)) score += 12;
    if (/yunxia/.test(name)) score += 8;
    if (score > bestScore) {
      best = voice;
      bestScore = score;
    }
  }
  return best;
}

export async function speakWithBrowser(
  text: string,
  ttsLang: TutorReply["ttsLang"],
  hooks: SpeakHooks = {},
): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    throw new Error("Web Speech TTS is not available");
  }
  window.speechSynthesis.cancel();
  const voices = await loadVoices();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = ttsLang === "zh-TW" ? "zh-CN" : ttsLang;
  const match = pickBoyVoice(voices, ttsLang) ?? pickBoyVoice(voices, "zh-TW");
  if (match) {
    utter.voice = match;
    utter.lang = match.lang || utter.lang;
  }
  const name = (match?.name ?? "").toLowerCase();
  const boyish = BOYISH.test(name) && !FEMALE.test(name);
  // Young boy: lift pitch on male voices; don't turn a woman into a cartoon.
  utter.pitch = boyish ? 1.28 : 1.12;
  utter.rate = ttsLang === "en-US" ? 1.02 : 1.04;

  let open = true;
  const startedAt = Date.now();
  return new Promise((resolve, reject) => {
    const finishOk = () => {
      hooks.onEnd?.();
      resolve();
    };
    utter.onstart = () => {
      open = true;
      hooks.onStart?.();
      hooks.onViseme?.(true);
    };
    utter.onboundary = () => {
      open = !open;
      hooks.onViseme?.(open);
    };
    utter.onpause = () => hooks.onPause?.();
    utter.onend = () => {
      // Chrome sometimes fires end immediately if voices are not ready.
      if (Date.now() - startedAt < 450) {
        reject(new Error("TTS ended too quickly"));
        return;
      }
      finishOk();
    };
    utter.onerror = (event) => {
      reject(new Error(event.error || "TTS error"));
    };
    try {
      window.speechSynthesis.resume();
    } catch {
      // ignore
    }
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
