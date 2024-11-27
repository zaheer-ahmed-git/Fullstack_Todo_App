import { TaskBoard } from "@/components/TaskBoard";

export default function HomePage() {
  return (
    <section className="space-y-6">
      <div className="max-w-2xl space-y-2">
        <h1 className="font-display text-3xl text-white md:text-4xl">
          Plan, assign, and ship together
        </h1>
        <p className="text-[var(--muted)]">
          Create and edit tasks, organize them by category, and stay in sync with
          live updates and lightweight collaboration.
        </p>
      </div>
      <TaskBoard />
    </section>
  );
}
