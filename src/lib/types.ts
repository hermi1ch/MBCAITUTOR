export type Pose = "idle" | "talking" | "nod" | "think" | "explain";

export type StudentLang = "yue" | "cmn" | "en";

export type TutorReply = {
  zh: string;
  en: string;
  pose: Pose;
  ttsLang: "zh-HK" | "zh-TW" | "en-US";
  inSyllabus: boolean;
};

export type TutorRequest = {
  message: string;
  lang: StudentLang;
  history?: Array<{ role: "student" | "tutor"; text: string }>;
};

export type HealthStatus = {
  tutor: "mock" | "deepseek";
  tts: "browser" | "azure";
  stt: "browser" | "azure";
  auth: "open";
};
