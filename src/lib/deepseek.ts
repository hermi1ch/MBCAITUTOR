import { buildSystemPrompt } from "./tutor-prompt";
import { mockTutor } from "./mock-tutor";
import type { StudentLang, TutorReply } from "./types";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

function asPose(value: unknown): TutorReply["pose"] {
  if (value === "talking" || value === "nod" || value === "think" || value === "explain") {
    return value;
  }
  return "explain";
}

function ttsLangFor(lang: StudentLang): TutorReply["ttsLang"] {
  if (lang === "yue") return "zh-HK";
  if (lang === "en") return "en-US";
  return "zh-TW";
}

function parseModelJson(raw: string, lang: StudentLang): TutorReply | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const data = JSON.parse(raw.slice(start, end + 1)) as {
      zh?: string;
      en?: string;
      pose?: string;
      inSyllabus?: boolean;
    };
    if (!data.zh || !data.en) return null;
    return {
      zh: data.zh.trim(),
      en: data.en.trim(),
      pose: asPose(data.pose),
      ttsLang: ttsLangFor(lang),
      inSyllabus: Boolean(data.inSyllabus),
    };
  } catch {
    return null;
  }
}

export async function askTutor(input: {
  message: string;
  lang: StudentLang;
  history?: Array<{ role: "student" | "tutor"; text: string }>;
}): Promise<{ reply: TutorReply; source: "mock" | "deepseek" }> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) {
    return { reply: mockTutor(input.message, input.lang), source: "mock" };
  }

  const history = (input.history ?? []).slice(-6).map((turn) => ({
    role: turn.role === "student" ? "user" : "assistant",
    content: turn.text,
  }));

  const response = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      temperature: 0.5,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt(input.lang) },
        ...history,
        { role: "user", content: input.message },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("DeepSeek error", response.status, detail.slice(0, 400));
    return { reply: mockTutor(input.message, input.lang), source: "mock" };
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content ?? "";
  const parsed = parseModelJson(content, input.lang);
  if (!parsed) {
    return { reply: mockTutor(input.message, input.lang), source: "mock" };
  }
  return { reply: parsed, source: "deepseek" };
}
