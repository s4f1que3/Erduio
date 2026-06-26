import {
  Atom,
  BookOpen,
  Calculator,
  Dumbbell,
  FlaskConical,
  Globe,
  Landmark,
  Laptop,
  Leaf,
  LucideIcon,
  Music,
  Palette,
} from "lucide-react";

export interface ColorStyle {
  bg: string;
  text: string;
  solid: string;
  /** Light tinted panel background, for full-row/full-card color (not just an icon chip). */
  tintBg: string;
  /** Border to pair with tintBg. */
  tintBorder: string;
}

// Cycled by index so every subject/tile gets a distinct, deterministic color.
export const colorPalette: ColorStyle[] = [
  { bg: "bg-orange-100 dark:bg-orange-500/15", text: "text-orange-600 dark:text-orange-400", solid: "bg-orange-500", tintBg: "bg-orange-50 dark:bg-orange-500/10", tintBorder: "border-orange-200 dark:border-orange-500/20" },
  { bg: "bg-teal-100 dark:bg-teal-500/15", text: "text-teal-600 dark:text-teal-400", solid: "bg-teal-500", tintBg: "bg-teal-50 dark:bg-teal-500/10", tintBorder: "border-teal-200 dark:border-teal-500/20" },
  { bg: "bg-violet-100 dark:bg-violet-500/15", text: "text-violet-600 dark:text-violet-400", solid: "bg-violet-500", tintBg: "bg-violet-50 dark:bg-violet-500/10", tintBorder: "border-violet-200 dark:border-violet-500/20" },
  { bg: "bg-blue-100 dark:bg-blue-500/15", text: "text-blue-600 dark:text-blue-400", solid: "bg-blue-500", tintBg: "bg-blue-50 dark:bg-blue-500/10", tintBorder: "border-blue-200 dark:border-blue-500/20" },
  { bg: "bg-pink-100 dark:bg-pink-500/15", text: "text-pink-600 dark:text-pink-400", solid: "bg-pink-500", tintBg: "bg-pink-50 dark:bg-pink-500/10", tintBorder: "border-pink-200 dark:border-pink-500/20" },
  { bg: "bg-amber-100 dark:bg-amber-500/15", text: "text-amber-600 dark:text-amber-400", solid: "bg-amber-500", tintBg: "bg-amber-50 dark:bg-amber-500/10", tintBorder: "border-amber-200 dark:border-amber-500/20" },
  { bg: "bg-emerald-100 dark:bg-emerald-500/15", text: "text-emerald-600 dark:text-emerald-400", solid: "bg-emerald-500", tintBg: "bg-emerald-50 dark:bg-emerald-500/10", tintBorder: "border-emerald-200 dark:border-emerald-500/20" },
  { bg: "bg-indigo-100 dark:bg-indigo-500/15", text: "text-indigo-600 dark:text-indigo-400", solid: "bg-indigo-500", tintBg: "bg-indigo-50 dark:bg-indigo-500/10", tintBorder: "border-indigo-200 dark:border-indigo-500/20" },
];

export function colorByIndex(index: number): ColorStyle {
  return colorPalette[((index % colorPalette.length) + colorPalette.length) % colorPalette.length];
}

const SUBJECT_ICON_RULES: [RegExp, LucideIcon][] = [
  [/math|algebra|geometry|calc/i, Calculator],
  [/phys/i, Atom],
  [/chem|science/i, FlaskConical],
  [/bio|environ/i, Leaf],
  [/hist|civic/i, Landmark],
  [/geo/i, Globe],
  [/art|draw|paint/i, Palette],
  [/music/i, Music],
  [/comp|ict|programming/i, Laptop],
  [/p\.?e\.?|sport|physical educ/i, Dumbbell],
];

export function subjectIcon(name?: string | null): LucideIcon {
  if (!name) return BookOpen;
  for (const [pattern, icon] of SUBJECT_ICON_RULES) {
    if (pattern.test(name)) return icon;
  }
  return BookOpen;
}

export function gradeColorClass(grade: number): string {
  if (grade >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (grade >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export function gradeBadgeClass(grade: number): string {
  if (grade >= 80) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border-transparent";
  if (grade >= 60) return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border-transparent";
  return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400 border-transparent";
}
