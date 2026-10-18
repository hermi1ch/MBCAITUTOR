import { REFUSE_EN, REFUSE_ZH_TW } from "./tutor-prompt";
import type { StudentLang, TutorReply } from "./types";

type Entry = {
  keys: string[];
  zh: string;
  en: string;
  pose?: TutorReply["pose"];
};

const LESSONS: Entry[] = [
  {
    keys: [
      "四大名著",
      "四大名著",
      "four great classics",
      "four classics",
      "名著有哪些",
      "名著有哪",
    ],
    zh: "四大名著是《三國演義》、《水滸傳》、《西遊記》和《紅樓夢》。它們都寫在明清小說那一篇裡。",
    en: "The Four Great Classics are Romance of the Three Kingdoms, Water Margin, Journey to the West, and Dream of the Red Chamber. They appear in the Ming and Qing fiction article.",
    pose: "explain",
  },
  {
    keys: ["水滸傳", "水滸", "water margin", "outlaws of the marsh"],
    zh: "《水滸傳》是四大名著之一，寫梁山好漢的故事，收在明清小說一篇。",
    en: "The Water Margin is one of the Four Great Classics. It tells of the heroes of Liangshan and is in the Ming and Qing fiction article.",
    pose: "explain",
  },
  {
    keys: ["三國演義", "三國", "three kingdoms"],
    zh: "《三國演義》是四大名著之一，講魏、蜀、吳爭雄的故事。",
    en: "Romance of the Three Kingdoms is one of the Four Great Classics. It tells of Wei, Shu, and Wu.",
    pose: "explain",
  },
  {
    keys: ["西遊記", "西游记", "journey to the west", "孫悟空", "孙悟空"],
    zh: "《西遊記》是四大名著之一，講唐僧師徒西天取經，孫悟空最出名。",
    en: "Journey to the West is one of the Four Great Classics. It follows the Tang monk and his disciples, especially Sun Wukong.",
    pose: "explain",
  },
  {
    keys: ["紅樓夢", "红楼梦", "dream of the red chamber"],
    zh: "《紅樓夢》是四大名著之一，寫賈府和大觀園裡的人情故事。",
    en: "Dream of the Red Chamber is one of the Four Great Classics. It is set in the Jia household and Prospect Garden.",
    pose: "explain",
  },
  {
    keys: [
      "四大發明",
      "四大发明",
      "four great inventions",
      "four inventions",
    ],
    zh: "中國古代四大發明是造紙術、印刷術、火藥和指南針。",
    en: "The Four Great Inventions of ancient China are papermaking, printing, gunpowder, and the compass.",
    pose: "explain",
  },
  {
    keys: ["造紙", "造纸", "papermaking", "paper making"],
    zh: "造紙術是四大發明之一，讓文字可以寫在又輕又方便的紙上。",
    en: "Papermaking is one of the Four Great Inventions. It let people write on light, handy paper.",
    pose: "explain",
  },
  {
    keys: ["印刷", "活字", "printing"],
    zh: "印刷術（包括活字）是四大發明之一，讓書籍可以一本一本印出來。",
    en: "Printing, including movable type, is one of the Four Great Inventions. It let books be made in many copies.",
    pose: "explain",
  },
  {
    keys: ["火藥", "火药", "gunpowder"],
    zh: "火藥是四大發明之一。課本把它放在古代科技篇裡講。",
    en: "Gunpowder is one of the Four Great Inventions. The book teaches it in ancient science and technology.",
    pose: "explain",
  },
  {
    keys: ["指南針", "指南针", "compass"],
    zh: "指南針是四大發明之一，幫助人們認清方向。",
    en: "The compass is one of the Four Great Inventions. It helped people find their way.",
    pose: "explain",
  },
  {
    keys: [
      "春節",
      "春节",
      "過年",
      "过年",
      "除夕",
      "spring festival",
      "lunar new year",
      "chinese new year",
    ],
    zh: "春節是書裡說的三大傳統節日之一。除夕是春節的一部分，大家團年、守歲。",
    en: "Spring Festival is one of the three major traditional festivals in the book. New Year’s Eve is part of it — families gather and stay up.",
    pose: "explain",
  },
  {
    keys: ["端午", "龍舟", "龙舟", "屈原", "duanwu", "dragon boat"],
    zh: "端午節是三大傳統節日之一，人們會划龍舟、吃粽子，紀念屈原。",
    en: "Duanwu Festival is one of the three major traditional festivals. People race dragon boats and eat zongzi in memory of Qu Yuan.",
    pose: "explain",
  },
  {
    keys: ["中秋", "月餅", "月饼", "mid-autumn", "mid autumn", "moon cake"],
    zh: "中秋節是三大傳統節日之一，家人賞月、吃月餅。",
    en: "Mid-Autumn Festival is one of the three major traditional festivals. Families watch the moon and eat mooncakes.",
    pose: "explain",
  },
  {
    keys: ["傳統節日", "传统节日", "節日", "节日", "festival"],
    zh: "書裡把春節、端午節、中秋節叫三大傳統節日，也寫到元宵、清明、七夕、重陽和臘八。",
    en: "The book names Spring Festival, Duanwu, and Mid-Autumn as the three major festivals. It also mentions Lantern, Qingming, Double Seventh, Double Ninth, and Laba.",
    pose: "explain",
  },
  {
    keys: [
      "十二生肖",
      "十二屬相",
      "十二属相",
      "zodiac",
      "屬相",
      "属相",
      "生肖",
    ],
    zh: "十二屬相是鼠、牛、虎、兔、龍、蛇、馬、羊、猴、雞、狗、豬，對應十二地支。",
    en: "The twelve symbolic animals are rat, ox, tiger, rabbit, dragon, snake, horse, goat, monkey, rooster, dog, and pig. They match the twelve Earthly Branches.",
    pose: "explain",
  },
  {
    keys: ["絲綢之路", "丝绸之路", "silk road", "絲路", "丝路"],
    zh: "絲綢之路是中外文化交流篇的一條，連接中國和西方，運送絲綢、香料和故事。",
    en: "The Silk Road is in the cultural-exchange unit. It linked China and the West, carrying silk, spices, and stories.",
    pose: "explain",
  },
  {
    keys: ["漢字", "汉字", "chinese character", "characters"],
    zh: "漢字一篇講漢字的起源和形體演變。我們螢幕上用繁體字，書本原文是簡體加英文。",
    en: "The Chinese-characters article covers their origin and changing shapes. On screen we use Traditional characters; the book itself is Simplified plus English.",
    pose: "explain",
  },
  {
    keys: ["書法", "书法", "calligraphy"],
    zh: "書法是藝術體育篇的一條，用毛筆寫漢字，講筆畫、結構和氣韻。",
    en: "Calligraphy is in the arts-and-sports unit. It is writing Chinese characters with a brush — stroke, structure, and spirit.",
    pose: "explain",
  },
  {
    keys: ["儒家", "孔子", "confucian", "confucius"],
    zh: "儒家思想是思想信仰篇的文化知識，講仁、禮和學習。我只講課本內容，不教拜祭。",
    en: "Confucianism is cultural knowledge in the thoughts-and-beliefs unit: ren, li, and study. I only teach what the book says, not worship.",
    pose: "explain",
  },
  {
    keys: ["兵馬俑", "兵马俑", "terracotta"],
    zh: "秦始皇陵兵馬俑是文物篇的一條，是陪葬的陶俑軍隊。",
    en: "The Terracotta Warriors are in the cultural-relics unit — a clay army buried with the First Emperor.",
    pose: "explain",
  },
  {
    keys: ["鄭和", "郑和", "zheng he"],
    zh: "鄭和下西洋在中外文化交流篇，講他率船隊遠航西洋。",
    en: "Zheng He’s voyages are in the cultural-exchange unit. He led fleets across the Western Ocean.",
    pose: "explain",
  },
  {
    keys: [
      "你好",
      "哈囉",
      "哈罗",
      "嗨",
      "hello",
      "hi",
      "早晨",
      "你是誰",
      "你是谁",
      "who are you",
    ],
    zh: "你好，我是小信。今日一齊學《中國文化常識》：民族、節日、文學、文物都可以問我。",
    en: "Hello, I am Xiao Xin. Today we study Common Knowledge about Chinese Culture — ethnic groups, festivals, literature, relics. Ask me one of those.",
    pose: "talking",
  },
];

const OFF_TOPIC = [
  "數學",
  "数学",
  "math",
  "english grammar",
  "homework",
  "功課",
  "功课",
  "quiz",
  "考試",
  "考试",
  "football",
  "soccer",
  "coding",
  "python",
  "news",
  "新聞",
  "新闻",
  "總統",
  "总统",
  "fortnite",
  "minecraft",
  "1+1",
  "2+2",
];

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function ttsLangFor(lang: StudentLang): TutorReply["ttsLang"] {
  if (lang === "yue") return "zh-HK";
  if (lang === "en") return "en-US";
  return "zh-TW";
}

export function mockTutor(message: string, lang: StudentLang): TutorReply {
  const q = normalize(message);
  const refuse: TutorReply = {
    zh: REFUSE_ZH_TW,
    en: REFUSE_EN,
    pose: "think",
    ttsLang: ttsLangFor(lang),
    inSyllabus: false,
  };

  if (!q) return refuse;

  if (OFF_TOPIC.some((key) => q.includes(key))) {
    return refuse;
  }

  const hit = LESSONS.find((entry) =>
    entry.keys.some((key) => q.includes(key.toLowerCase())),
  );
  if (hit) {
    return {
      zh: hit.zh,
      en: hit.en,
      pose: hit.pose ?? "explain",
      ttsLang: ttsLangFor(lang),
      inSyllabus: true,
    };
  }

  return refuse;
}
