const PALETTE = [
  { bg: "bg-[#1E3A5F]", text: "text-[#93C5FD]" },
  { bg: "bg-[#1B4332]", text: "text-[#6EE7B7]" },
  { bg: "bg-[#3B1F5E]", text: "text-[#C4B5FD]" },
  { bg: "bg-[#4C1D24]", text: "text-[#FCA5A5]" },
  { bg: "bg-[#451A03]", text: "text-[#FCD34D]" },
] as const;

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  const first = words[0]?.[0]?.toUpperCase() ?? "";
  const last =
    words.length > 1 ? (words[words.length - 1]?.[0]?.toUpperCase() ?? "") : "";
  return first + last;
}

type AvatarProps = {
  name: string;
  size: "sm" | "lg";
};

export default function Avatar({ name, size }: AvatarProps) {
  const index = name.charCodeAt(0) % 5;
  const { bg, text } = PALETTE[index];

  const sizeClasses =
    size === "sm"
      ? "w-8 h-8 rounded-full text-xs"
      : "w-12 h-12 rounded-full text-base";

  return (
    <div
      className={`${sizeClasses} ${bg} ${text} flex shrink-0 items-center justify-center font-medium select-none`}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  );
}
