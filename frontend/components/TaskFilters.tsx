"use client";

import type { Category, TaskFilters as Filters, TaskPriority, TaskStatus } from "@/lib/types";

type Props = {
  categories: Category[];
  filters: Filters;
  onChange: (next: Filters) => void;
};

export function TaskFilters({ categories, filters, onChange }: Props) {
  return (
    <div className="grid gap-3 rounded-2xl border border-[var(--line)] bg-black/20 p-4 md:grid-cols-6">
      <input
        className="rounded-lg border border-[var(--line)] bg-slate-900/70 px-3 py-2 text-sm md:col-span-2"
        placeholder="Search tasks"
        value={filters.q ?? ""}
        onChange={(e) => onChange({ ...filters, q: e.target.value })}
      />
      <input
        className="rounded-lg border border-[var(--line)] bg-slate-900/70 px-3 py-2 text-sm"
        placeholder="Assignee"
        value={filters.assignee ?? ""}
        onChange={(e) => onChange({ ...filters, assignee: e.target.value })}
      />
      <select
        className="rounded-lg border border-[var(--line)] bg-slate-900/70 px-3 py-2 text-sm"
        value={filters.status ?? ""}
        onChange={(e) =>
          onChange({ ...filters, status: e.target.value as TaskStatus | "" })
        }
      >
        <option value="">All statuses</option>
        <option value="todo">Todo</option>
        <option value="in_progress">In progress</option>
        <option value="done">Done</option>
      </select>
      <select
        className="rounded-lg border border-[var(--line)] bg-slate-900/70 px-3 py-2 text-sm"
        value={filters.priority ?? ""}
        onChange={(e) =>
          onChange({
            ...filters,
            priority: e.target.value as TaskPriority | "",
          })
        }
      >
        <option value="">All priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <select
        className="rounded-lg border border-[var(--line)] bg-slate-900/70 px-3 py-2 text-sm"
        value={filters.category_id ?? ""}
        onChange={(e) =>
          onChange({
            ...filters,
            category_id: e.target.value ? Number(e.target.value) : "",
          })
        }
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
}
