"use client";

import { useCallback, useEffect, useState } from "react";
import { useTaskSocket } from "@/hooks/useTaskSocket";
import { api } from "@/lib/api";
import type { Category, Task, TaskFilters as Filters, TaskInput } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { TaskFilters } from "./TaskFilters";
import { TaskForm } from "./TaskForm";

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [taskData, categoryData] = await Promise.all([
        api.listTasks(filters),
        api.listCategories(),
      ]);
      setTasks(taskData);
      setCategories(categoryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load board");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void load();
  }, [load]);

  useTaskSocket({
    onStatus: setLive,
    onCreated: (task) => {
      setTasks((current) => {
        if (current.some((item) => item.id === task.id)) {
          return current;
        }
        return [task, ...current];
      });
    },
    onUpdated: (task) => {
      setTasks((current) =>
        current.map((item) => (item.id === task.id ? task : item))
      );
    },
    onDeleted: (id) => {
      setTasks((current) => current.filter((item) => item.id !== id));
    },
  });

  async function handleCreate(payload: TaskInput) {
    const created = await api.createTask(payload);
    setTasks((current) => {
      if (current.some((item) => item.id === created.id)) {
        return current;
      }
      return [created, ...current];
    });
  }

  async function handleUpdate(id: number, payload: TaskInput) {
    const updated = await api.updateTask(id, payload);
    setTasks((current) => current.map((task) => (task.id === id ? updated : task)));
  }

  async function handleDelete(id: number) {
    await api.deleteTask(id);
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[var(--muted)]">
          Live sync keeps every open board in step.
        </p>
        <span
          className={`rounded-full px-3 py-1 text-xs ${
            live
              ? "bg-emerald-500/20 text-emerald-200"
              : "bg-amber-500/20 text-amber-100"
          }`}
        >
          {live ? "Realtime connected" : "Reconnecting..."}
        </span>
      </div>

      <TaskForm categories={categories} onSubmit={handleCreate} />
      <TaskFilters categories={categories} filters={filters} onChange={setFilters} />

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Loading tasks...</p>
      ) : null}
      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            categories={categories}
            editing={editingId === task.id}
            onEdit={() => setEditingId(task.id)}
            onCancelEdit={() => setEditingId(null)}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {!loading && tasks.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--line)] p-8 text-center text-[var(--muted)]">
          No tasks yet. Create the first one above.
        </p>
      ) : null}
    </div>
  );
}
