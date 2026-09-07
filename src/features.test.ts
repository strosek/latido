// @vitest-environment happy-dom
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

/**
 * DOM-level feature tests for 0067–0074: first-run welcome, live quick-add
 * parsing feedback, the completion animation, and reorder undo.
 */

beforeAll(async () => {
  document.body.innerHTML = '<div id="app"></div>';
  await import("./main");
});

beforeEach(async () => {
  localStorage.clear();
  const { setDoneSectionOpen, setState, setSettings } = await import("./state");
  const { emptyState } = await import("./storage");
  const { DEFAULT_SETTINGS } = await import("./types");
  const { render } = await import("./views");
  setState(emptyState());
  setSettings({ ...DEFAULT_SETTINGS });
  setDoneSectionOpen(false);
  render();
});

function addTask(title: string): void {
  const input = document.querySelector<HTMLInputElement>("#task-title")!;
  input.value = title;
  document.getElementById("add-task")!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

describe("first-run welcome (0070)", () => {
  it("shows the welcome on an empty board", () => {
    expect(document.querySelector("#app")!.innerHTML).toContain('class="welcome"');
  });

  it("dismisses the welcome permanently", () => {
    document
      .querySelector<HTMLElement>('[data-action="dismiss-onboarding"]')!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(document.querySelector("#app")!.innerHTML).not.toContain("welcome");
  });
});

describe("live quick-add feedback (0071)", () => {
  it("shows parsed chips while typing", async () => {
    const input = document.querySelector<HTMLInputElement>("#task-title")!;
    input.value = "write report #work !1 tomorrow";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await sleep(220); // debounce + parse
    const chips = document.getElementById("add-parse-feedback")!.textContent ?? "";
    expect(chips).toContain("#work");
    expect(chips).toContain("P1");
    expect(chips).toContain("tomorrow");
  });

  it("clears chips once the task is added", async () => {
    const input = document.querySelector<HTMLInputElement>("#task-title")!;
    input.value = "report #work";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await sleep(220);
    addTask("report #work");
    expect(document.getElementById("add-parse-feedback")!.textContent).toBe("");
  });
});

describe("completion animation (0067)", () => {
  it("commits the task as done after the checkmark animation", async () => {
    const { state } = await import("./state");
    addTask("Buy milk");
    const taskId = state.tasks[0].id;
    const btn = document.querySelector<HTMLElement>(`.check[data-id="${taskId}"]`)!;
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(btn.classList.contains("checking")).toBe(true);
    await sleep(220);
    expect(state.tasks[0].done).toBe(true);
    expect(document.querySelector("#app")!.innerHTML).toContain("done-section");
  });
});

describe("reorder undo (0074)", () => {
  it("restores the previous manual order", async () => {
    const { state } = await import("./state");
    const { reorderTasks } = await import("./actions");
    for (const title of ["A", "B", "C"]) addTask(title);
    const first = state.tasks.find((t) => t.title === "A")!;
    const last = state.tasks.find((t) => t.title === "C")!;

    reorderTasks(first.id, last.id);
    expect(state.tasks.find((t) => t.id === first.id)!.order).toBe(3);

    const undo = document.querySelector<HTMLElement>("#undo-action")!;
    undo.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(state.tasks.find((t) => t.id === first.id)!.order).toBe(1);
  });
});

describe("always-visible start button", () => {
  it("renders the start button outside the hover-only actions", () => {
    addTask("Review email");
    const row = document.querySelector<HTMLElement>(".task")!;
    expect(row.querySelector(".task-start")).not.toBeNull();
    expect(row.querySelector<HTMLElement>(".task-start [data-action='start']")).not.toBeNull();
  });
});

describe("settings tabs (0076)", () => {
  const openSettings = (): HTMLElement => {
    document
      .querySelector<HTMLElement>('[data-action="open-settings"]')!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    return document.querySelector<HTMLElement>(".overlay")!;
  };

  it("opens on Basic and switches to Advanced on click", () => {
    const overlay = openSettings();
    expect(overlay.querySelector("#panel-basic")!.hasAttribute("hidden")).toBe(false);
    expect(overlay.querySelector("#panel-advanced")!.hasAttribute("hidden")).toBe(true);
    expect(overlay.querySelector("#tab-basic")!.getAttribute("aria-selected")).toBe("true");
    // The Advanced tab carries a count of the data/danger controls behind it.
    expect(overlay.querySelector("#tab-advanced .tab-count")!.textContent).toBe("8");

    overlay
      .querySelector<HTMLElement>("#tab-advanced")!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(overlay.querySelector("#panel-advanced")!.hasAttribute("hidden")).toBe(false);
    expect(overlay.querySelector("#panel-basic")!.hasAttribute("hidden")).toBe(true);
    expect(overlay.querySelector("#tab-advanced")!.getAttribute("aria-selected")).toBe("true");
    expect(overlay.querySelector("#btn-export")).not.toBeNull();
    overlay.remove();
  });

  it("switches tabs with arrow keys", () => {
    const overlay = openSettings();
    overlay
      .querySelector<HTMLElement>("#tab-basic")!
      .dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(overlay.querySelector("#panel-advanced")!.hasAttribute("hidden")).toBe(false);
    overlay.remove();
  });

  it("preserves typed values when switching tabs", () => {
    const overlay = openSettings();
    const work = overlay.querySelector<HTMLInputElement>("#set-work")!;
    work.value = "33";
    overlay
      .querySelector<HTMLElement>("#tab-advanced")!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    overlay
      .querySelector<HTMLElement>("#tab-basic")!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(overlay.querySelector<HTMLInputElement>("#set-work")!.value).toBe("33");
    overlay.remove();
  });
});

describe("completed section (0075)", () => {
  it("folds completed tasks into a collapsed section and expands on click", async () => {
    const { state } = await import("./state");
    addTask("Buy milk");
    const taskId = state.tasks[0].id;
    const btn = document.querySelector<HTMLElement>(`.check[data-id="${taskId}"]`)!;
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await sleep(220);

    const collapsed = document.querySelector("#app")!.innerHTML;
    expect(collapsed).toContain("done-section");
    expect(collapsed).toContain("Completed");
    expect(collapsed).not.toContain('id="done-list"'); // collapsed → no list rendered

    document
      .querySelector<HTMLElement>('[data-action="toggle-done-section"]')!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    const expanded = document.querySelector("#app")!.innerHTML;
    expect(expanded).toContain("done-list");
    expect(expanded).toContain("Buy milk");
  });

  it("reopening a completed task moves it back to the open list", async () => {
    const { state } = await import("./state");
    addTask("Pay rent");
    const taskId = state.tasks[0].id;
    document
      .querySelector<HTMLElement>(`.check[data-id="${taskId}"]`)!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await sleep(220);
    // Expand the section so the done row is in the DOM.
    document
      .querySelector<HTMLElement>('[data-action="toggle-done-section"]')!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    document
      .querySelector<HTMLElement>(`.check[data-id="${taskId}"]`)!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const html = document.querySelector("#app")!.innerHTML;
    expect(state.tasks[0].done).toBe(false);
    expect(html).toContain("Pay rent");
    expect(html).not.toContain("done-section");
  });
});
