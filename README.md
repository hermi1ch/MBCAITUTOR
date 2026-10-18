# 小信 · Primary 6 culture tutor

Visual-novel panel tutor for MBC Primary 6. Students talk to **小信** in Mandarin, Cantonese, or English. On-screen text is always Traditional Chinese + English. Answers stay inside 《中國文化常識（修訂本）》 / *Common Knowledge about Chinese Culture* (2015).

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No API keys are required for the demo: a syllabus-bounded mock tutor answers, and the browser Web Speech API handles TTS replay and STT (Chrome works best).

## What you get

- Garden panel with 小信 on the left (idle / talking / nod / think / explain)
- Cream bubble next to him, blue bubble for the student
- Speaker button replays 小信
- Headphone button starts speech recognition
- Anyone with the URL can use the panel — no Google sign-in
- DeepSeek on the server when `DEEPSEEK_API_KEY` is present; otherwise the mock tutor
- Azure Speech on the server when `AZURE_SPEECH_KEY` + `AZURE_SPEECH_REGION` are present; otherwise Web Speech

## Secrets (never ship these to the client)

Copy `.env.example` to `.env.local` and fill in:

| Variable | Where it lives | Needed for |
| --- | --- | --- |
| `DEEPSEEK_API_KEY` | server | Live tutor (not the mock) |
| `AZURE_SPEECH_KEY` | server | Azure TTS / STT |
| `AZURE_SPEECH_REGION` | server | Azure TTS / STT |
| `NEXT_PUBLIC_FIREBASE_*` | web config | unused (Hosting / later optional Auth) |
| `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY` | server | unused |

The tutor is open: no login, no school-email check. Firebase Auth helpers remain in `src/lib/firebase.ts` but the panel does not call them.

## Deploy

This is a Next.js app with server routes, so **Firebase App Hosting** (or Hosting with the Next.js web-frameworks adapter) is the path — not a static-only `public/` folder.

```bash
npx -y firebase-tools@latest login
npx -y firebase-tools@latest use --add
npx -y firebase-tools@latest deploy
```

Set the server secrets in App Hosting / Functions config, not in git.

## Character art

Canonical files live in `public/character/`: `hero.png`, `expressions.png`, `reference.jpg`, plus sliced poses and `garden.jpg`. Re-slice after an art update:

```bash
python3 scripts/prepare-art.py
```
