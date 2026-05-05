import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-[#fafafa] font-[family-name:var(--font-geist-sans)] dark:bg-black">
      <main className="flex w-full max-w-[800px] flex-1 flex-col items-start justify-between bg-white px-[60px] py-[120px] max-[601px]:px-6 max-[601px]:py-12 dark:bg-black">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-start gap-6 text-left max-[601px]:gap-4">
          <h1 className="max-w-[320px] text-[40px] leading-[48px] font-semibold tracking-[-2.4px] text-balance text-black max-[601px]:text-[32px] max-[601px]:leading-[40px] max-[601px]:tracking-[-1.92px] dark:text-[#ededed]">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-[440px] text-[18px] leading-[32px] text-balance text-[#666] dark:text-[#999]">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              className="font-medium text-black dark:text-[#ededed]"
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              className="font-medium text-black dark:text-[#ededed]"
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex w-full max-w-[440px] flex-row gap-4 text-[14px]">
          <a
            className="flex h-10 w-fit cursor-pointer items-center justify-center gap-2 rounded-[128px] border border-transparent bg-black px-4 font-medium text-[#fafafa] transition-all duration-200 dark:bg-[#ededed] dark:text-black [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[#383838] dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-[#cccccc]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-10 w-fit cursor-pointer items-center justify-center rounded-[128px] border border-[#ebebeb] px-4 font-medium transition-all duration-200 dark:border-[#1a1a1a] [@media(hover:hover)_and_(pointer:fine)]:hover:border-transparent [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[#f2f2f2] dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-[#1a1a1a]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
