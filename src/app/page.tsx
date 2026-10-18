import { Suspense } from "react";
import { TutorApp } from "@/components/TutorApp";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="stage">
          <header className="topbar">
            <span className="topbar-title">小信</span>
            <span className="topbar-meta">小學六年級導師 · Primary 6 tutor</span>
          </header>
        </div>
      }
    >
      <TutorApp />
    </Suspense>
  );
}
