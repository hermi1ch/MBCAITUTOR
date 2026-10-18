"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getSpeechRecognition,
  recognitionLang,
  speakWithBrowser,
  stopBrowserSpeech,
} from "@/lib/speech-browser";
import type { HealthStatus, Pose, StudentLang, TutorReply } from "@/lib/types";

const GREETING_ZH = "你好，我是小信。今日一齊學《中國文化常識》。想問四大名著、傳統節日，還是四大發明？";
const GREETING_EN =
  "Hello, I am Xiao Xin. Today we study Common Knowledge about Chinese Culture. Ask about the Four Great Classics, festivals, or the Four Great Inventions.";

const POSE_SRC: Record<Pose, string> = {
  idle: "/character/idle.png",
  talking: "/character/talking.png",
  nod: "/character/nod.png",
  think: "/character/think.png",
  explain: "/character/explain.png",
};

const LANG_LABEL: Record<StudentLang, string> = {
  yue: "粵",
  cmn: "普",
  en: "EN",
};

type TutorState = TutorReply & { source?: "mock" | "deepseek" };

function SpeakerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 10v4h3l5 4V6L7 10H4z" fill="currentColor" />
      <path
        d="M16.5 8.5a5 5 0 0 1 0 7M18.8 6.2a8.5 8.5 0 0 1 0 11.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HeadphoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 13a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="3" y="12" width="5" height="8" rx="2" fill="currentColor" />
      <rect x="16" y="12" width="5" height="8" rx="2" fill="currentColor" />
    </svg>
  );
}

export function TutorApp() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [lang, setLang] = useState<StudentLang>("yue");
  const [pose, setPose] = useState<Pose>("talking");
  const [mouthOpen, setMouthOpen] = useState(true);
  const [tutor, setTutor] = useState<TutorState>({
    zh: GREETING_ZH,
    en: GREETING_EN,
    pose: "talking",
    ttsLang: "zh-HK",
    inSyllabus: true,
  });
  const [student, setStudent] = useState({ zh: "", en: "" });
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recRef = useRef<SpeechRecognition | null>(null);
  const nodTimer = useRef<number | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data: HealthStatus) => setHealth(data))
      .catch(() => null);
  }, []);

  const clearNod = useCallback(() => {
    if (nodTimer.current) {
      window.clearTimeout(nodTimer.current);
      nodTimer.current = null;
    }
  }, []);

  const stopVoice = useCallback(() => {
    stopBrowserSpeech();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setSpeaking(false);
  }, []);

  const settleAfterSpeech = useCallback(() => {
    setSpeaking(false);
    setMouthOpen(false);
    setPose("nod");
    clearNod();
    nodTimer.current = window.setTimeout(() => setPose("idle"), 650);
  }, [clearNod]);

  const playTutorVoice = useCallback(
    async (reply: TutorState) => {
      stopVoice();
      clearNod();
      const spoken = reply.ttsLang === "en-US" ? reply.en : reply.zh;
      setSpeaking(true);
      setMouthOpen(true);
      setPose("talking");

      const hooks = {
        onStart: () => {
          setSpeaking(true);
          setMouthOpen(true);
          setPose("talking");
        },
        onPause: () => {
          setSpeaking(false);
          setMouthOpen(false);
        },
        onEnd: () => settleAfterSpeech(),
      };

      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: spoken, ttsLang: reply.ttsLang }),
        });
        const type = res.headers.get("content-type") || "";
        if (type.includes("audio")) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audioRef.current = audio;
          await new Promise<void>((resolve, reject) => {
            audio.onplay = () => hooks.onStart();
            audio.onpause = () => {
              if (!audio.ended) hooks.onPause();
            };
            audio.onended = () => {
              hooks.onEnd();
              resolve();
            };
            audio.onerror = () => reject(new Error("audio"));
            audio.play().catch(reject);
          });
          URL.revokeObjectURL(url);
        } else {
          await speakWithBrowser(spoken, reply.ttsLang, hooks);
        }
      } catch {
        try {
          await speakWithBrowser(spoken, reply.ttsLang, hooks);
        } catch {
          settleAfterSpeech();
        }
      }
    },
    [clearNod, settleAfterSpeech, stopVoice],
  );

  useEffect(() => {
    if (!speaking) return;
    const tick = window.setInterval(() => {
      setMouthOpen((open) => !open);
    }, 170);
    return () => window.clearInterval(tick);
  }, [speaking]);

  const shownPose: Pose = speaking ? (mouthOpen ? "talking" : "idle") : pose;

  const ask = useCallback(
    async (text: string, spokenLang: StudentLang = lang) => {
      const message = text.trim();
      if (!message || busy) return;
      setBusy(true);
      setStudent({
        zh: spokenLang === "en" ? "" : message,
        en: spokenLang === "en" ? message : "",
      });
      setDraft("");
      setPose("think");
      setMouthOpen(false);
      stopVoice();

      try {
        const res = await fetch("/api/tutor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            lang: spokenLang,
            history: [
              { role: "tutor" as const, text: `${tutor.zh} ${tutor.en}` },
              { role: "student" as const, text: message },
            ],
          }),
        });
        if (!res.ok) throw new Error("tutor");
        const reply = (await res.json()) as TutorState;
        setTutor(reply);
        setPose(reply.pose === "talking" ? "explain" : reply.pose);
        await playTutorVoice(reply);
      } catch {
        const fallback: TutorState = {
          zh: "對唔住，我暫時聽唔到。請再試一次。",
          en: "Sorry, I could not answer just now. Please try again.",
          pose: "think",
          ttsLang: spokenLang === "en" ? "en-US" : spokenLang === "yue" ? "zh-HK" : "zh-TW",
          inSyllabus: false,
        };
        setTutor(fallback);
        setPose("idle");
        setMouthOpen(false);
      } finally {
        setBusy(false);
      }
    },
    [busy, lang, playTutorVoice, stopVoice, tutor.en, tutor.zh],
  );

  const startListening = useCallback(() => {
    if (busy) return;
    const existing = recRef.current;
    if (existing && listening) {
      existing.stop();
      return;
    }

    const rec = getSpeechRecognition();
    if (!rec) {
      setTutor((current) => ({
        ...current,
        zh: "這個瀏覽器未支援語音辨識。請用 Chrome，或在下方打字。",
        en: "This browser cannot do speech recognition. Please use Chrome, or type below.",
      }));
      return;
    }

    rec.lang = recognitionLang(lang);
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.onresult = (event) => {
      const chunk = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join("")
        .trim();
      if (!chunk) return;
      setStudent({
        zh: lang === "en" ? "" : chunk,
        en: lang === "en" ? chunk : "",
      });
      if (event.results[event.results.length - 1]?.isFinal) {
        rec.stop();
        void ask(chunk, lang);
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => {
      setListening(false);
      recRef.current = null;
    };
    recRef.current = rec;
    setListening(true);
    rec.start();
  }, [ask, busy, lang, listening]);

  const studentShown = student.zh || student.en;

  return (
    <div className="stage">
      <header className="topbar">
        <span className="topbar-title">小信</span>
        <span className="topbar-meta">小學六年級導師 · Primary 6 tutor</span>
      </header>

      <div className="panel">
        <img className="garden" src="/character/garden.jpg" alt="" />
        <img
          className={`xiaoxin${speaking ? " is-talking" : ""}`}
          src={POSE_SRC[shownPose]}
          alt="小信"
        />

        <div className="tutor-cluster">
          <div className="bubble bubble-tutor">
            <span className="tag tag-tutor">小信</span>
            <p className="line-zh">{tutor.zh}</p>
            <p className="line-en">{tutor.en}</p>
          </div>
          <button
            className="icon-btn speaker"
            type="button"
            aria-label="重播小信的話 / Replay Xiao Xin"
            onClick={() => void playTutorVoice(tutor)}
            disabled={busy && !speaking}
          >
            <SpeakerIcon />
          </button>
        </div>

        <div className="student-cluster">
          <div className="bubble bubble-student">
            <span className="tag tag-student">同學</span>
            {studentShown ? (
              <>
                {student.zh ? <p className="line-zh">{student.zh}</p> : null}
                {student.en ? <p className="line-en">{student.en}</p> : null}
              </>
            ) : (
              <>
                <p className="line-zh">{listening ? "正在聽… " : "按耳機說話，或在下方輸入。"}</p>
                <p className="line-en">{listening ? "Listening…" : "Tap the headphones, or type below."}</p>
              </>
            )}
          </div>
          <button
            className={`icon-btn headphones${listening ? " listening" : ""}`}
            type="button"
            aria-label="開始語音辨識 / Start speech recognition"
            onClick={startListening}
            disabled={busy}
          >
            <HeadphoneIcon />
          </button>
        </div>
      </div>

      <form
        className="composer"
        onSubmit={(event) => {
          event.preventDefault();
          void ask(draft);
        }}
      >
        <div className="lang-switch" role="group" aria-label="Spoken language">
          {(["yue", "cmn", "en"] as StudentLang[]).map((code) => (
            <button
              key={code}
              type="button"
              className={lang === code ? "active" : ""}
              onClick={() => setLang(code)}
            >
              {LANG_LABEL[code]}
            </button>
          ))}
        </div>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="問小信一個文化問題… / Ask Xiao Xin a culture question…"
          maxLength={800}
          disabled={busy}
        />
        <button className="send" type="submit" disabled={busy || !draft.trim()}>
          發送
        </button>
        {health ? (
          <span className="status-chip">
            開放 · {health.tutor} · {health.tts}
          </span>
        ) : null}
      </form>
    </div>
  );
}
