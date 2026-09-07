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
  const { setState, setSettings } = await import("./state");
  const { emptyState } = await import("./storage");
  const { DEFAULT_SETTINGS } = await import("./types");
  const { render } = await import("./views");
  setState(emptyState());
  setSettings({ ...DEFAULT_SETTINGS });
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
    expect(document.querySelector("#app")!.innerHTML).toContain('class="task q2 done');
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
