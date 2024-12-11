"use client";

import { useEffect, useRef } from "react";
import type { Task } from "@/lib/types";

type Handlers = {
  onCreated?: (task: Task) => void;
  onUpdated?: (task: Task) => void;
  onDeleted?: (id: number) => void;
  onStatus?: (connected: boolean) => void;
};

function socketUrl(): string {
  if (typeof window === "undefined") {
    return "ws://127.0.0.1:8000/ws";
  }
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  const host =
    process.env.NEXT_PUBLIC_WS_HOST ||
    (process.env.NODE_ENV === "development"
      ? "127.0.0.1:8000"
      : window.location.host);
  return `${proto}://${host}/ws`;
}

export function useTaskSocket(handlers: Handlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    let closed = false;
    let socket: WebSocket | null = null;
    let retry: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      socket = new WebSocket(socketUrl());
      socket.onopen = () => handlersRef.current.onStatus?.(true);
      socket.onclose = () => {
        handlersRef.current.onStatus?.(false);
        if (!closed) {
          retry = setTimeout(connect, 2000);
        }
      };
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as {
            event: string;
            payload: Task | { id: number };
          };
          if (message.event === "task.created") {
            handlersRef.current.onCreated?.(message.payload as Task);
          } else if (message.event === "task.updated") {
            handlersRef.current.onUpdated?.(message.payload as Task);
          } else if (message.event === "task.deleted") {
            handlersRef.current.onDeleted?.((message.payload as { id: number }).id);
          }
        } catch {
          // Ignore malformed payloads.
        }
      };
    };

    connect();
    return () => {
      closed = true;
      if (retry) clearTimeout(retry);
      socket?.close();
    };
  }, []);
}
