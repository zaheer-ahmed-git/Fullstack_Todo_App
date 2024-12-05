"use client";

import { FormEvent, useState } from "react";
import type { Category, Task, TaskInput, TaskPriority, TaskStatus } from "@/lib/types";

const emptyForm: TaskInput = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  category_id: null,
  assignee: "",
};

type Props = {
  categories: Category[];
  initial?: Task | null;
  onSubmit: (payload: TaskInput) => Promise<void>;
  onCancel?: () => void;
};

export function TaskForm({ categories, initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<TaskInput>(
    initial
      ? {
          title: initial.title,
          description: initial.description,
          status: initial.status,
          priority: initial.priority,
          category_id: initial.category_id,
          assignee: initial.assignee ?? "",
        }
      : emptyForm
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        ...form,
        assignee: form.assignee?.trim() ? form.assignee.trim() : null,
      });
      if (!initial) {
        setForm(emptyForm);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl border border-[var(--line)] bg-black/20 p-4"
    >
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="text-[var(--muted)]">Title</span>
          <input
            className="w-full rounded-lg border border-[var(--line)] bg-slate-900/70 px-3 py-2"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Ship collaboration panel"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-[var(--muted)]">Assignee</span>
          <input
            className="w-full rounded-lg border border-[var(--line)] bg-slate-900/70 px-3 py-2"
            value={form.assignee ?? ""}
            onChange={(e) => setForm({ ...form, assignee: e.target.value })}
            placeholder="teammate"
          />
        </label>
      </div>

      <label className="block space-y-1 text-sm">
        <span className="text-[var(--muted)]">Description</span>
        <textarea
          className="min-h-20 w-full rounded-lg border border-[var(--line)] bg-slate-900/70 px-3 py-2"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </label>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="space-y-1 text-sm">
          <span className="text-[var(--muted)]">Status</span>
          <select
            className="w-full rounded-lg border border-[var(--line)] bg-slate-900/70 px-3 py-2"
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as TaskStatus })
            }
          >
            <option value="todo">Todo</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-[var(--muted)]">Priority</span>
          <select
            className="w-full rounded-lg border border-[var(--line)] bg-slate-900/70 px-3 py-2"
            value={form.priority}
            onChange={(e) =>
              setForm({ ...form, priority: e.target.value as TaskPriority })
            }
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-[var(--muted)]">Category</span>
          <select
            className="w-full rounded-lg border border-[var(--line)] bg-slate-900/70 px-3 py-2"
            value={form.category_id ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                category_id: e.target.value ? Number(e.target.value) : null,
              })
            }
          >
            <option value="">Uncategorized</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
        >
          {saving ? "Saving..." : initial ? "Save changes" : "Create task"}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
