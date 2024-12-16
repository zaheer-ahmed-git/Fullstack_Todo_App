"use client";

import type { Category, Task, TaskInput } from "@/lib/types";
import { CommentPanel } from "./CommentPanel";
import { TaskForm } from "./TaskForm";

type Props = {
  task: Task;
  categories: Category[];
  onUpdate: (id: number, payload: TaskInput) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  editing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
};

export function TaskCard({
  task,
  categories,
  onUpdate,
  onDelete,
  editing,
  onEdit,
  onCancelEdit,
}: Props) {
  const category = categories.find((item) => item.id === task.category_id);

  if (editing) {
    return (
      <TaskForm
        categories={categories}
        initial={task}
        onCancel={onCancelEdit}
        onSubmit={async (payload) => {
          await onUpdate(task.id, payload);
          onCancelEdit();
        }}
      />
    );
  }

  return (
    <article className="rounded-2xl border border-[var(--line)] bg-black/25 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg text-white">{task.title}</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">{task.description || "No description"}</p>
        </div>
        <span className="rounded-full border border-[var(--line)] px-2 py-1 text-xs uppercase tracking-wide text-[var(--muted)]">
          {task.priority}
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
        <span className="rounded-md bg-slate-800/80 px-2 py-1">{task.status.replace("_", " ")}</span>
        {category ? (
          <span
            className="rounded-md px-2 py-1 text-slate-950"
            style={{ backgroundColor: category.color }}
          >
            {category.name}
          </span>
        ) : null}
        {task.assignee ? (
          <span className="rounded-md bg-slate-800/80 px-2 py-1">@{task.assignee}</span>
        ) : null}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm hover:bg-white/5"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="rounded-lg border border-red-400/40 px-3 py-1.5 text-sm text-red-200 hover:bg-red-500/10"
        >
          Delete
        </button>
      </div>
      <CommentPanel taskId={task.id} />
    </article>
  );
}
