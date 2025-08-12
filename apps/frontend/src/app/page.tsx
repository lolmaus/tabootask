"use client";

import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@tabootask/backend/convex/_generated/api";

export default function Home() {
  const tasks = useQuery(api.tasks.get);
  return (
    <main className="flex min-h-screen p-24">
      {(() => {
        if (tasks === undefined) {
          return <div data-test-loading>Loading...</div>;
        }

        if (!tasks.length) {
          return <div data-test-enpty>No tasks</div>;
        }
        
        return <div className="flex-col items-center justify-between" data-test-tasklist>
          {tasks.map(({ _id, text }) => <div key={_id} data-test-task={_id}>{text}</div>)}
        </div>;
      })()}
    </main>
  );
}