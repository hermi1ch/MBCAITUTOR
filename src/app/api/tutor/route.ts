import { askTutor } from "@/lib/deepseek";
import type { StudentLang } from "@/lib/types";

export const dynamic = "force-dynamic";

const LANGS: StudentLang[] = ["yue", "cmn", "en"];

export async function POST(request: Request) {
  let body: {
    message?: string;
    lang?: StudentLang;
    history?: Array<{ role: "student" | "tutor"; text: string }>;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = body.message?.trim() ?? "";
  if (!message) {
    return Response.json({ error: "Message is required" }, { status: 400 });
  }
  if (message.length > 800) {
    return Response.json({ error: "Message is too long" }, { status: 400 });
  }

  const lang = LANGS.includes(body.lang as StudentLang) ? (body.lang as StudentLang) : "cmn";
  const { reply, source } = await askTutor({
    message,
    lang,
    history: body.history,
  });

  return Response.json({ ...reply, source });
}
