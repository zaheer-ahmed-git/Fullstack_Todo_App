"use client";

import { useCallback, useEffect, useState } from "react";
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

  async function handleCreate(payload: TaskInput) {
    const created = await api.createTask(payload);
    setTasks((current) => [created, ...current]);
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
