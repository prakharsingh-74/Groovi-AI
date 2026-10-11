import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cleanAgentResponse(text?: string | null): string {
  if (!text || typeof text !== 'string') return text ?? '';
  let cleaned = text;
  // 1. Remove markdown headers at start of lines (e.g. ### 📅 Title -> 📅 Title)
  cleaned = cleaned.replace(/^[ \t]*#{1,6}[ \t]*/gm, '');
  // 2. Remove any trailing header hashes (e.g. Title ### -> Title)
  cleaned = cleaned.replace(/[ \t]*#{1,6}[ \t]*$/gm, '');
  // 3. Remove consecutive hashes or standalone markdown hash symbols
  cleaned = cleaned.replace(/#{2,}/g, '');
  cleaned = cleaned.replace(/(^|\s)#[ \t]+/g, '$1');
  // 4. Convert bullet points starting with * to clean hyphens (- )
  cleaned = cleaned.replace(/^[ \t]*\*[ \t]+/gm, '- ');
  // 5. Remove bold/italic markdown asterisks (**bold**, *italic*, ***bolditalic***)
  cleaned = cleaned.replace(/\*{1,3}([\s\S]*?)\*{1,3}/g, (_match, p1) => p1);
  // 6. Remove any remaining stray asterisks
  cleaned = cleaned.replace(/\*/g, '');
  // 7. Clean up excessive empty lines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  return cleaned.trim();
}
