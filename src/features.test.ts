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
  const {
    SECTION_DEFAULTS,
    setBreakState,
    setDescriptionHintVisible,
    setFilterPriority,
    setFilterQuadrant,
    setFocusMode,
    setHiddenAt,
    setHiddenSessionId,
    setLastFinished,
    setLastWatch,
    setOpenMenuTaskId,
    setQuickRun,
    setResumeHintVisible,
    setSearchQuery,
    setSectionOpen,
    setSettings,
    setSortBy,
    setState,
    setSubView,
  } = await import("./state");
  const { emptyState } = await import("./storage");
  const { DEFAULT_SETTINGS } = await import("./types");
  const { render } = await import("./views");
  const { stopRepaint } = await import("./repaint");
  stopRepaint();
  setState(emptyState());
  setSettings({ ...DEFAULT_SETTINGS });
  for (const key of Object.keys(SECTION_DEFAULTS) as Array<keyof typeof SECTION_DEFAULTS>) {
    setSectionOpen(key, SECTION_DEFAULTS[key]);
  }
  setBreakState(null);
  setQuickRun(null);
  setFocusMode(false);
  setSubView(null);
  setOpenMenuTaskId(null);
  setResumeHintVisible(true);
  setDescriptionHintVisible(true);
  setFilterPriority(null);
  setFilterQuadrant(null);
  setSortBy("priority");
  setSearchQuery("");
  setHiddenAt(null);
  setHiddenSessionId(null);
  setLastWatch(null);
  setLastFinished(null);
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

describe("flowtime vs pomodoro explainer (0077)", () => {
  it("opens the chooser with a 'What's the difference?' control", () => {
    addTask("Deep work");
    document
      .querySelector<HTMLElement>(".task-start [data-action='start']")!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    const overlay = document.querySelector<HTMLElement>(".overlay")!;
    expect(overlay.querySelector('[data-tech="learn"]')!.textContent).toContain(
      "What's the difference?",
    );
    overlay.remove();
  });

  it("shows the explainer without closing the chooser", () => {
    addTask("Deep work");
    document
      .querySelector<HTMLElement>(".task-start [data-action='start']")!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    document
      .querySelector<HTMLElement>('[data-tech="learn"]')!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const overlays = document.querySelectorAll<HTMLElement>(".overlay");
    expect(overlays.length).toBe(2); // chooser stays underneath
    const explainer = overlays[overlays.length - 1];
    expect(explainer.textContent).toContain("ultradian");
    expect(explainer.textContent).toContain("Flowtime");
    expect(explainer.textContent).toContain("Pomodoro");
    expect(explainer.querySelector("#explain-ok")).not.toBeNull();
    explainer.remove();
    overlays[0].remove();
  });
});

describe("rest guide (0078)", () => {
  it("shows the Learn control on the running break and opens the guide", async () => {
    const { setBreakState } = await import("./state");
    const { render } = await import("./views");
    setBreakState({
      startedAt: Date.now(),
      endsAt: Date.now() + 5 * 60 * 1000,
      taskId: "t1",
      technique: "flowtime",
      done: false,
    });
    render();

    const learn = document.querySelector<HTMLElement>('[data-action="rest-guide"]')!;
    expect(learn.textContent).toContain("Learn to rest");
    learn.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const overlay = document.querySelector<HTMLElement>(".overlay")!;
    expect(overlay.textContent).toContain("How to actually rest");
    expect(overlay.textContent).toContain("Move");
    expect(overlay.textContent).toContain("Breathe");
    overlay.remove();
    setBreakState(null);
    render();
  });

  it("keeps the break countdown running while the guide is open", async () => {
    const { setBreakState } = await import("./state");
    const { render } = await import("./views");
    setBreakState({
      startedAt: Date.now(),
      endsAt: Date.now() + 5 * 60 * 1000,
      taskId: "t1",
      technique: "pomodoro",
      done: false,
    });
    render();

    document
      .querySelector<HTMLElement>('[data-action="rest-guide"]')!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(document.querySelectorAll<HTMLElement>(".overlay").length).toBe(1);
    // The session view behind the overlay is still a break with a clock.
    const overlay = document.querySelector<HTMLElement>(".overlay")!;
    overlay.remove();
    expect(document.querySelector("#app")!.textContent).toContain("Break");
    setBreakState(null);
    render();
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
      .querySelector<HTMLElement>('[data-action="toggle-section"][data-section="done"]')!
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
      .querySelector<HTMLElement>('[data-action="toggle-section"][data-section="done"]')!
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

describe("three-dot menu on compact rows", () => {
  it("shows and opens the ⋯ menu on quick tasks", async () => {
    const { state } = await import("./state");
    const { render } = await import("./views");
    addTask("Quickie");
    state.tasks[0].quick = true;
    render();

    const item = document.querySelector<HTMLElement>(".quick-item")!;
    const btn = item.querySelector<HTMLElement>('[data-action="open-menu"]')!;
    expect(btn).not.toBeNull();
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const menu = document.querySelector<HTMLElement>("[data-menu]")!;
    expect(menu).not.toBeNull();
    expect(menu.textContent).toContain("Edit");
    expect(menu.textContent).toContain("Repeat");
  });

  it("shows and opens the ⋯ menu on tasks planned for today", async () => {
    const { state } = await import("./state");
    const { render } = await import("./views");
    addTask("Today's thing");
    state.tasks[0].plannedFor = Date.now();
    render();

    const item = document.querySelector<HTMLElement>(".quick-item")!;
    const btn = item.querySelector<HTMLElement>('[data-action="open-menu"]')!;
    expect(btn).not.toBeNull();
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const menu = document.querySelector<HTMLElement>("[data-menu]")!;
    expect(menu).not.toBeNull();
    expect(menu.textContent).toContain("Defer");
  });
});

describe("mark done from session view", () => {
  const startFlowtime = async (): Promise<string> => {
    const { state } = await import("./state");
    addTask("Write report");
    const taskId = state.tasks[0].id;
    document
      .querySelector<HTMLElement>(".task-start [data-action='start']")!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    document
      .querySelector<HTMLElement>('[data-tech="flowtime"]')!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    return taskId;
  };

  it("marks the current task done and finishes the session", async () => {
    const { state } = await import("./state");
    const taskId = await startFlowtime();
    const mark = document.querySelector<HTMLElement>(
      '.session-controls [data-action="mark-done"]',
    )!;
    expect(mark).not.toBeNull();
    expect(mark.textContent).toContain("Mark done");

    mark.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(state.tasks.find((t) => t.id === taskId)!.done).toBe(true);
    expect(state.activeSessionId).toBeNull();
    expect(state.sessions.find((s) => s.taskId === taskId)!.status).toBe("done");
    expect(document.querySelector("#undo-finish")).not.toBeNull();
  });

  it("marks the current task done and finishes from focus mode", async () => {
    const { state } = await import("./state");
    const taskId = await startFlowtime();
    document
      .querySelector<HTMLElement>('[data-action="toggle-focus"]')!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const mark = document.querySelector<HTMLElement>(
      '[data-action="mark-done"][data-id="' + taskId + '"]',
    )!;
    expect(mark).not.toBeNull();
    mark.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(state.tasks.find((t) => t.id === taskId)!.done).toBe(true);
    expect(state.activeSessionId).toBeNull();
    expect(state.sessions.find((s) => s.taskId === taskId)!.status).toBe("done");
  });
});

describe("board section consistency", () => {
  it("titles the open tasks section and drops legacy section classes", () => {
    addTask("Alpha");
    addTask("Beta");
    const html = document.querySelector("#app")!.innerHTML;
    expect(html).toContain('<span class="section-title">Open</span>');
    expect(html).not.toContain("quick-section");
    expect(html).not.toContain("plan-section");
    // Rows still live in the shared task list.
    expect(document.querySelectorAll(".open-section .task").length).toBe(2);
  });

  it("renders quick tasks inside the shared section card", async () => {
    const { state } = await import("./state");
    const { render } = await import("./views");
    addTask("Quickie");
    state.tasks[0].quick = true;
    render();
    const html = document.querySelector("#app")!.innerHTML;
    expect(html).toContain("Quick tasks");
    expect(document.querySelectorAll(".section").length).toBeGreaterThanOrEqual(2);
  });

  it("renders the completed section as a card when unfolded", async () => {
    const { state } = await import("./state");
    addTask("Buy milk");
    const taskId = state.tasks[0].id;
    document
      .querySelector<HTMLElement>(`.check[data-id="${taskId}"]`)!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await sleep(220);
    document
      .querySelector<HTMLElement>('[data-action="toggle-section"][data-section="done"]')!
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const section = document.querySelector<HTMLElement>(".done-section")!;
    expect(section.classList.contains("section")).toBe(true);
    expect(section.querySelector("#done-list")).not.toBeNull();
  });

  it("places the play button to the right of the row actions", () => {
    addTask("Alpha");
    const li = document.querySelector<HTMLElement>(".open-section .task")!;
    const children = Array.from(li.children);
    const actionsIdx = children.findIndex((c) => c.classList.contains("task-actions"));
    const startIdx = children.findIndex((c) => c.classList.contains("task-start"));
    expect(actionsIdx).toBeGreaterThan(-1);
    expect(startIdx).toBeGreaterThan(actionsIdx);
  });

  it("shows quadrant and priority in compact today rows", async () => {
    const { state } = await import("./state");
    const { render } = await import("./views");
    addTask("Today's thing");
    state.tasks[0].plannedFor = Date.now();
    render();
    const meta = document.querySelector<HTMLElement>(".section .quick-item .task-meta")!;
    expect(meta.textContent).toContain("P2");
    expect(meta.textContent).toContain("Important");
  });
});
