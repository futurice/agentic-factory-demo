"use client";

import { useEffect, useRef, useState } from "react";
import { generateCode } from "./shorten";

type Result = {
  hostname: string;
  code: string;
};

export function UrlShortenerCard() {
  const [input, setInput] = useState<string>("");
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  function handleShorten() {
    const hostname = new URL(input).hostname;
    const code = generateCode();
    setResult({ hostname, code });
    setCopied(false);
  }

  function handleCopy() {
    if (!result) return;
    const shortCode = `/${result.code}`;
    navigator.clipboard.writeText(shortCode).then(
      () => {
        setCopied(true);
        if (copyTimeoutRef.current !== null) {
          clearTimeout(copyTimeoutRef.current);
        }
        copyTimeoutRef.current = setTimeout(() => {
          setCopied(false);
          copyTimeoutRef.current = null;
        }, 2000);
      },
      () => {
        // Clipboard write rejected — label stays "Copy", no state change needed.
      },
    );
  }

  return (
    <article
      className="rounded-[10px] border border-[#1E2939] bg-[#101828] p-[24px] [font-family:var(--font-inter)]"
      aria-label="URL shortener"
    >
      <div className="flex flex-col gap-[16px]">
        <div className="flex gap-[16px]">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a URL…"
            className="h-[40px] w-full rounded-[8px] border border-[#1E2939] bg-[#0B1220] px-[12px] text-[14px] leading-[20px] text-[#FFFFFF] placeholder-[#6B7280] outline-none ring-[#3B82F6] focus:ring-2 [font-family:var(--font-inter)]"
          />
          <button
            type="button"
            onClick={handleShorten}
            className="h-[40px] rounded-[9999px] bg-[#155DFC] px-[12px] text-[14px] leading-[20px] text-[#FFFFFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] [font-family:var(--font-inter)]"
          >
            Shorten
          </button>
        </div>

        {result !== null ? (
          <div
            data-testid="result-row"
            className="flex items-center gap-[12px]"
          >
            <span className="text-[14px] leading-[20px] text-[#99A1AF] [font-family:var(--font-inter)]">
              {result.hostname}
            </span>
            <span className="text-[14px] leading-[20px] font-bold text-[#FFFFFF] [font-family:var(--font-inter)]">
              {`/${result.code}`}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="h-[40px] rounded-[9999px] bg-[#1E2939] px-[12px] text-[14px] leading-[20px] text-[#FFFFFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] [font-family:var(--font-inter)]"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
