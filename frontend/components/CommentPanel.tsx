"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Comment } from "@/lib/types";

type Props = {
  taskId: number;
};

export function CommentPanel({ taskId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState("teammate");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void api
      .listComments(taskId)
      .then(setComments)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load comments")
      );
  }, [taskId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!body.trim()) return;
    try {
      const created = await api.addComment(taskId, author.trim() || "anonymous", body.trim());
      setComments((current) => [...current, created]);
      setBody("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add comment");
    }
  }

  return (
    <div className="mt-4 space-y-3 border-t border-[var(--line)] pt-4">
      <p className="text-sm font-medium text-white">Collaboration</p>
      <ul className="space-y-2">
        {comments.map((comment) => (
          <li
            key={comment.id}
            className="rounded-lg bg-slate-900/60 px-3 py-2 text-sm text-[var(--muted)]"
          >
            <span className="font-medium text-teal-200">@{comment.author}</span>
            <span className="mx-2 text-slate-600">·</span>
            {comment.body}
          </li>
        ))}
        {comments.length === 0 ? (
          <li className="text-xs text-[var(--muted)]">No comments yet.</li>
        ) : null}
      </ul>
      <form onSubmit={handleSubmit} className="grid gap-2 md:grid-cols-[140px_1fr_auto]">
        <input
          className="rounded-lg border border-[var(--line)] bg-slate-900/70 px-3 py-2 text-sm"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Your name"
        />
        <input
          className="rounded-lg border border-[var(--line)] bg-slate-900/70 px-3 py-2 text-sm"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Leave a comment"
        />
        <button
          type="submit"
          className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900"
        >
          Comment
        </button>
      </form>
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
