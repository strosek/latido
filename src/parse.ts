import { startOfLocalDay } from "./dates";
import type { Quadrant } from "./types";

/* ------------------------------------------------------------------ */
/* Natural-language quick-add (0046)                                   */
/* ------------------------------------------------------------------ */

const WEEKDAY_TO_DOW: Record<string, number> = {
  sun: 0,
  sunday: 0,
  mon: 1,
  monday: 1,
  tue: 2,
  tues: 2,
  tuesday: 2,
  wed: 3,
  wednesday: 3,
  thu: 4,
  thur: 4,
  thurs: 4,
  thursday: 4,
  fri: 5,
  friday: 5,
  sat: 6,
  saturday: 6,
};

export interface QuickParse {
  clean: string;
  priority?: number;
  timeMin?: number;
  dueDay?: number; // 0 = today, 1 = tomorrow, otherwise a JS weekday (0..6)
}

export function parseQuickAdd(raw: string): QuickParse {
  let clean = raw;
  let priority: number | undefined;

  const prio = clean.match(/(^|\s)[!p]([1-5])(?=\s|$)/i);
  if (prio) {
    priority = Number(prio[2]);
    clean = clean.replace(prio[0], " ");
  }

  let timeMin: number | undefined;

  let dueDay: number | undefined;
  const word = clean.match(
    /(^|\s)(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun)(?=\s|$)/i,
  );
  if (word) {
    const w = word[2].toLowerCase();
    if (w === "today") dueDay = 0;
    else if (w === "tomorrow") dueDay = 1;
    else dueDay = WEEKDAY_TO_DOW[w];
    clean = clean.replace(word[0], " ");
  }

  // Only strip a time when a date word is present, so "Meet at 12:30" keeps its text.
  if (dueDay !== undefined) {
    const t24 = clean.match(/(^|\s)(\d{1,2}):(\d{2})(?=\s|$)/);
    if (t24) {
      const h = Number(t24[2]);
      const m = Number(t24[3]);
      if (h <= 23 && m <= 59) {
        timeMin = h * 60 + m;
        clean = clean.replace(t24[0], " ");
      }
    } else {
      const t12 = clean.match(/(^|\s)(\d{1,2})\s*(am|pm)(?=\s|$)/i);
      if (t12) {
        const h = Number(t12[2]);
        if (h >= 1 && h <= 12) {
          let hour = h % 12;
          if (t12[3].toLowerCase() === "pm") hour += 12;
          timeMin = hour * 60;
          clean = clean.replace(t12[0], " ");
        }
      }
    }
  }

  return { clean: clean.replace(/\s+/g, " ").trim(), priority, timeMin, dueDay };
}

export function plannedForFrom(
  dueDay: number | undefined,
  timeMin: number | undefined,
): number | null {
  if (dueDay === undefined) return null;
  const now = new Date();
  if (dueDay === 1) {
    now.setDate(now.getDate() + 1);
  } else if (dueDay > 1) {
    const diff = dueDay - now.getDay();
    now.setDate(now.getDate() + (diff <= 0 ? diff + 7 : diff));
  }
  return startOfLocalDay(now.getTime()) + (timeMin ?? 0) * 60_000;
}

/* ------------------------------------------------------------------ */
/* CSV import (0048)                                                   */
/* ------------------------------------------------------------------ */

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  const s = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inQuotes) {
      if (ch === '"') {
        if (s[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      cell = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else if (ch !== "\r") {
      cell += ch;
    }
  }
  row.push(cell);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  return rows;
}

export interface CsvTaskStub {
  title: string;
  priority: number;
  quadrant: Quadrant;
  tags: string[];
  done: boolean;
  estimatedMin: number | null;
}

const QUADRANT_BY_NUMBER: Record<string, Quadrant> = {
  "1": "q1",
  "2": "q2",
  "3": "q3",
  "4": "q4",
};

export function parseQuadrant(value: string): Quadrant {
  const v = value.trim().toLowerCase();
  if (v === "q1" || v === "q2" || v === "q3" || v === "q4") return v;
  return QUADRANT_BY_NUMBER[v] ?? "q2";
}

export function parseCsvTasks(rows: string[][]): { tasks: CsvTaskStub[]; skipped: number } {
  if (!rows.length) return { tasks: [], skipped: 0 };
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (names: string[]): number => {
    for (const n of names) {
      const i = header.indexOf(n);
      if (i >= 0) return i;
    }
    return -1;
  };
  const titleIdx = idx(["title", "content"]);
  if (titleIdx < 0) return { tasks: [], skipped: rows.length };

  const priorityIdx = idx(["priority"]);
  const quadrantIdx = idx(["quadrant", "type"]);
  const tagsIdx = idx(["tags", "labels"]);
  const doneIdx = idx(["done", "completed"]);
  const estIdx = idx(["estimated_min", "estimate"]);

  const isTodoist = header.includes("type") && header.includes("content");

  const tasks: CsvTaskStub[] = [];
  let skipped = 0;
  for (const row of rows.slice(1)) {
    const title = (row[titleIdx] ?? "").trim();
    if (!title) {
      skipped++;
      continue;
    }
    const priorityRaw = (row[priorityIdx] ?? "").trim();
    const priority = priorityRaw === "" ? 3 : Math.min(5, Math.max(1, Number(priorityRaw) || 3));
    const tags = (row[tagsIdx] ?? "")
      .split(/[,\s]+/)
      .map((t) => t.trim().replace(/^#/, "").toLowerCase())
      .filter(Boolean);
    const doneRaw = (row[doneIdx] ?? "").trim().toLowerCase();
    const done = doneRaw === "true" || doneRaw === "1" || doneRaw === "yes" || doneRaw === "done";
    const estRaw = (row[estIdx] ?? "").trim();
    const estimatedMin = estRaw === "" ? null : Math.round(Number(estRaw) || 0) || null;

    let quadrant: Quadrant;
    if (isTodoist) {
      // Todoist priority: 1 (highest) .. 4 (lowest); UltradianDrift quadrant defaults to q2.
      quadrant = "q2";
    } else {
      quadrant = quadrantIdx >= 0 ? parseQuadrant(row[quadrantIdx] ?? "") : "q2";
    }

    tasks.push({ title, priority, quadrant, tags, done, estimatedMin });
  }
  return { tasks, skipped };
}
