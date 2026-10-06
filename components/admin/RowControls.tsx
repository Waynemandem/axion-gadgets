"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  table: "products" | "posts";
  id: string;
  published: boolean;
  stock?: number;
};

export default function RowControls({ table, id, published, stock }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function update(values: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from(table).update(values).eq("id", id);
    if (error) setError(error.message);
    setBusy(false);
    router.refresh();
  }

  const small =
    "rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold disabled:opacity-40";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {table === "products" && stock !== undefined && (
        <div className="flex items-center gap-1">
          <button
            className={small}
            disabled={busy || stock <= 0}
            onClick={() => update({ stock: stock - 1 })}
            aria-label="Decrease stock"
          >
            −
          </button>
          <span className="min-w-[4.5rem] text-center text-xs font-semibold">
            Stock {stock}
          </span>
          <button
            className={small}
            disabled={busy}
            onClick={() => update({ stock: stock + 1 })}
            aria-label="Increase stock"
          >
            +
          </button>
        </div>
      )}

      <button
        className={`${small} ${
          published ? "!border-green-200 !bg-green-50 !text-green-700" : ""
        }`}
        disabled={busy}
        onClick={() => update({ published: !published })}
      >
        {published ? "Published · Unpublish" : "Draft · Publish"}
      </button>

      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}