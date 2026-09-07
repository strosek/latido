# 0059 — Search task descriptions

Status: done

## Goal

Let the search box find tasks by their longer description text, not just title and tags. A task
whose title is generic ("sort out insurance") but whose description holds the searchable details is
currently unfindable.

## Requirements

- Extend `matchesSearch` in `views.ts` to also match against `task.description` (case-insensitive
  substring, same as title and tags).
- Keep matching behavior unchanged for title and tags; no new operators or syntax.
- The search still filters both the board and the Today/Later/quick sections, since they all pass
  through `matchesSearch`.

## Acceptance criteria

- Searching for a word that appears only in a task's description returns that task.
- Searching for words in the title or tags continues to work as before.
- Empty search returns all tasks.

## Nice to have

- Highlight the matched text in the description on the session screen, so it's obvious why the task
  matched (cosmetic; not required).
