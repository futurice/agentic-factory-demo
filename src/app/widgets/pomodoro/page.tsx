import { PomodoroCard } from "./PomodoroCard";

export default function PomodoroWidgetPage() {
  return (
    <main className="min-h-screen bg-[#030712] px-[58.5px] pt-[32px]">
      <div className="mx-auto max-w-[1280px]">
        <PomodoroCard />
      </div>
    </main>
  );
}
