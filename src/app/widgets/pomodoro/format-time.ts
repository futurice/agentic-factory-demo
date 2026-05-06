/**
 * Format a non-negative integer number of seconds as a zero-padded `MM:SS`
 * string. Inputs of 60 or more roll into the minutes component; values
 * exceeding `99 * 60 + 59` still render but minutes will exceed two digits.
 */
export function formatMmSs(seconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remaining = totalSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(remaining).padStart(2, "0");
  return `${mm}:${ss}`;
}
