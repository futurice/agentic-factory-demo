import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#030712]">
      <main className="mx-auto w-full max-w-[1280px] px-[58.5px] pt-8">
        <header className="flex flex-col gap-2">
          <h1 className="bg-gradient-to-r from-[#51A2FF] to-[#AD46FF] bg-clip-text [font-family:var(--font-space-grotesk)] text-[36px] leading-[40px] font-bold text-transparent">
            Widget Showcase
          </h1>
          <p className="[font-family:var(--font-inter)] text-[16px] leading-[24px] tracking-[-0.3125px] text-[#99A1AF]">
            A collection of self-contained widgets to explore agentic coding.
          </p>
        </header>
        <div className="mt-8">
          <Link
            href="/widgets/pomodoro"
            className="block h-[478px] w-[410.66px] rounded-[10px] border border-[#1E2939] bg-[#101828] p-[33px] pb-[32px] [font-family:var(--font-space-grotesk)] text-[#FFFFFF]"
          >
            <span className="text-[24px] leading-[32px] font-bold">
              Pomodoro · Work Time
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
