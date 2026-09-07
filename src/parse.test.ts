import { describe, expect, it } from "vitest";
import { startOfLocalDay } from "./dates";
import { parseCsv, parseCsvTasks, parseQuickAdd, plannedForFrom } from "./parse";

const MIN = 60_000;

describe("parseQuickAdd", () => {
  it("parses a priority via !N and strips it from the title", () => {
    expect(parseQuickAdd("review PRs !1")).toEqual({ clean: "review PRs", priority: 1 });
    expect(parseQuickAdd("!5 low")).toEqual({ clean: "low", priority: 5 });
  });

  it("parses a priority via pN and strips it from the title", () => {
    expect(parseQuickAdd("p2 stuff")).toEqual({ clean: "stuff", priority: 2 });
    expect(parseQuickAdd("buy milk p3")).toEqual({ clean: "buy milk", priority: 3 });
  });

  it("treats today as dueDay 0", () => {
    expect(parseQuickAdd("call mom today")).toEqual({ clean: "call mom", dueDay: 0 });
  });

  it("treats tomorrow as dueDay 1", () => {
    expect(parseQuickAdd("review PRs tomorrow")).toEqual({ clean: "review PRs", dueDay: 1 });
  });

  it("maps weekday words to their day-of-week", () => {
    expect(parseQuickAdd("meeting monday")).toEqual({ clean: "meeting", dueDay: 1 });
    expect(parseQuickAdd("run friday")).toEqual({ clean: "run", dueDay: 5 });
    expect(parseQuickAdd("standup wed")).toEqual({ clean: "standup", dueDay: 3 });
  });

  it("parses a 24-hour time only when a date word is present", () => {
    expect(parseQuickAdd("buy milk tomorrow 18:00")).toEqual({
      clean: "buy milk",
      dueDay: 1,
      timeMin: 18 * 60,
    });
  });

  it("parses a 12-hour time", () => {
    expect(parseQuickAdd("gym tomorrow 9am")).toEqual({
      clean: "gym",
      dueDay: 1,
      timeMin: 9 * 60,
    });
    expect(parseQuickAdd("dinner today 8pm")).toEqual({
      clean: "dinner",
      dueDay: 0,
      timeMin: 20 * 60,
    });
  });

  it("combines priority, date, and time", () => {
    expect(parseQuickAdd("review PRs tomorrow 9am !1")).toEqual({
      clean: "review PRs",
      priority: 1,
      dueDay: 1,
      timeMin: 9 * 60,
    });
  });

  it("ignores invalid fragments and keeps them in the title", () => {
    expect(parseQuickAdd("todo !9")).toEqual({ clean: "todo !9" });
    expect(parseQuickAdd("call at 25:99 tomorrow")).toEqual({
      clean: "call at 25:99",
      dueDay: 1,
    });
    expect(parseQuickAdd("wake at 13am today")).toEqual({ clean: "wake at 13am", dueDay: 0 });
  });

  it("does not strip a time without a date word (Meet at 12:30)", () => {
    expect(parseQuickAdd("Meet at 12:30")).toEqual({ clean: "Meet at 12:30" });
  });

  it("returns the raw title trimmed when nothing is parsed", () => {
    expect(parseQuickAdd("  just a title  ")).toEqual({ clean: "just a title" });
  });
});

describe("plannedForFrom", () => {
  it("returns null when no due day is given", () => {
    expect(plannedForFrom(undefined, undefined)).toBeNull();
  });

  it("plans for today (local midnight) when dueDay is 0", () => {
    expect(plannedForFrom(0, undefined)).toBe(startOfLocalDay(Date.now()));
  });

  it("plans for tomorrow when dueDay is 1", () => {
    const expected = new Date();
    expected.setDate(expected.getDate() + 1);
    expect(plannedForFrom(1, undefined)).toBe(startOfLocalDay(expected.getTime()));
  });

  it("plans for the next matching weekday", () => {
    const now = new Date();
    const diff = 3 - now.getDay(); // Wednesday
    now.setDate(now.getDate() + (diff <= 0 ? diff + 7 : diff));
    expect(plannedForFrom(3, undefined)).toBe(startOfLocalDay(now.getTime()));
  });

  it("applies the time of day on top of the planned day", () => {
    const expected = new Date();
    expected.setDate(expected.getDate() + 1);
    expect(plannedForFrom(1, 9 * 60)).toBe(startOfLocalDay(expected.getTime()) + 9 * 60 * MIN);
  });
});

describe("parseCsv", () => {
  it("splits rows and cells on commas and newlines", () => {
    expect(parseCsv("a,b\nc,d")).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
  });

  it("handles a quoted cell containing a comma", () => {
    expect(parseCsv('title,"note, with comma"\n')).toEqual([["title", "note, with comma"]]);
  });

  it("handles a quoted cell containing a newline", () => {
    expect(parseCsv('a,"line1\nline2"\nb,c')).toEqual([
      ["a", "line1\nline2"],
      ["b", "c"],
    ]);
  });

  it("handles escaped double quotes inside a quoted cell", () => {
    expect(parseCsv('a,"say ""hi"""\n')).toEqual([["a", 'say "hi"']]);
  });

  it("skips empty rows but keeps whitespace-only-trimmed cells", () => {
    expect(parseCsv("a,b\n\nc,d\n")).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
  });

  it("strips a UTF-8 BOM", () => {
    expect(parseCsv("\uFEFFa,b\n")).toEqual([["a", "b"]]);
  });
});

describe("parseCsvTasks", () => {
  const header = ["title", "priority", "quadrant", "tags", "done", "estimated_min"];

  it("returns no tasks and counts skipped rows when the title column is missing", () => {
    const result = parseCsvTasks([["priority"], ["1"]]);
    expect(result.tasks).toEqual([]);
    expect(result.skipped).toBe(2);
  });

  it("parses a simple row with defaults", () => {
    const result = parseCsvTasks([header, ["Write docs", "", "", "", "", ""]]);
    expect(result.tasks).toEqual([
      {
        title: "Write docs",
        priority: 3,
        quadrant: "q2",
        tags: [],
        done: false,
        estimatedMin: null,
      },
    ]);
    expect(result.skipped).toBe(0);
  });

  it("clamps priority to 1..5 and maps quadrant labels", () => {
    const result = parseCsvTasks([
      header,
      ["A", "9", "q4", "", "", ""],
      ["B", "-3", "2", "", "", ""],
      ["C", "2", "bogus", "", "", ""],
    ]);
    expect(result.tasks.map((t) => t.priority)).toEqual([5, 1, 2]);
    expect(result.tasks.map((t) => t.quadrant)).toEqual(["q4", "q2", "q2"]);
  });

  it("parses tags, done flags, and estimates", () => {
    const result = parseCsvTasks([header, ["Ship it", "1", "q1", "work, home", "true", "30"]]);
    expect(result.tasks[0]).toEqual({
      title: "Ship it",
      priority: 1,
      quadrant: "q1",
      tags: ["work", "home"],
      done: true,
      estimatedMin: 30,
    });
  });

  it("detects Todoist headers and keeps priority as-is with quadrant q2", () => {
    const result = parseCsvTasks([
      ["TYPE", "CONTENT", "PRIORITY"],
      ["task", "Buy milk", "4"],
    ]);
    expect(result.tasks).toEqual([
      { title: "Buy milk", priority: 4, quadrant: "q2", tags: [], done: false, estimatedMin: null },
    ]);
  });

  it("skips empty rows", () => {
    const result = parseCsvTasks([header, ["", "", "", "", "", ""], ["Real", "2", "", "", "", ""]]);
    expect(result.tasks).toHaveLength(1);
    expect(result.tasks[0].title).toBe("Real");
    expect(result.skipped).toBe(1);
  });
});
