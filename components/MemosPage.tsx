"use client";

import { FormEvent, useState } from "react";
import PrimaryActionCard, {
  type AccentTone,
} from "@/components/PrimaryActionCard";

export type Memo = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

type Labels = {
  memos: string;
  memosDescription: string;
  newMemo: string;
  memoTitle: string;
  memoContent: string;
  noMemos: string;
  newMemoDescription: string;
  noMemosHint: string;
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  copy: string;
  copied: string;
};

export default function MemosPage({
  labels,
  memos,
  dark,
  locale,
  onCreate,
  onUpdate,
  onDelete,
  accentTone,
}: {
  labels: Labels;
  memos: Memo[];
  dark: boolean;
  locale: string;
  onCreate: (title: string, content: string) => Promise<boolean>;
  onUpdate: (id: string, title: string, content: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<void>;
  accentTone: AccentTone;
}) {
  const [editing, setEditing] = useState<Memo | null | "new">(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const openNew = () => {
    setTitle("");
    setContent("");
    setEditing("new");
  };

  const openEdit = (memo: Memo) => {
    setTitle(memo.title);
    setContent(memo.content);
    setEditing(memo);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editing || !title.trim()) return;
    setSaving(true);
    const saved =
      editing === "new"
        ? await onCreate(title.trim(), content)
        : await onUpdate(editing.id, title.trim(), content);
    setSaving(false);
    if (saved) setEditing(null);
  };

  const copyMemo = async (memo: Memo) => {
    await navigator.clipboard.writeText(memo.content);
    setCopiedId(memo.id);
    window.setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <>
      <header className="mb-6">
        <div>
          <h2 className="text-3xl font-bold md:text-4xl">
            {labels.memos}
          </h2>
          <p className="mt-2 text-sm text-slate-400">{labels.memosDescription}</p>
        </div>
      </header>

      <div className="mb-8">
        <PrimaryActionCard
          icon="＋"
          title={labels.newMemo}
          description={labels.newMemoDescription}
          onClick={openNew}
          tone={accentTone}
          dark={dark}
        />
      </div>

      {memos.length === 0 ? (
        <section
          className={`rounded-[28px] p-10 text-center shadow-sm ${dark ? "bg-slate-900 text-slate-400" : "bg-white text-slate-400"}`}
        >
          <h3 className={`font-semibold ${dark ? "text-slate-200" : "text-slate-700"}`}>
            {labels.noMemos}
          </h3>
          <p className="mt-2 text-sm">{labels.noMemosHint}</p>
        </section>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {memos.map((memo) => (
            <article
              key={memo.id}
              className={`flex min-h-60 flex-col rounded-[28px] p-5 shadow-sm md:p-6 ${dark ? "bg-slate-900" : "bg-white"}`}
            >
              <h3 className="break-words text-lg font-bold">{memo.title}</h3>
              <p
                className={`mt-4 flex-1 whitespace-pre-wrap break-words text-sm leading-6 ${dark ? "text-slate-300" : "text-slate-600"}`}
              >
                {memo.content}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 pt-4 text-xs text-slate-400">
                <time dateTime={memo.updatedAt}>
                  {new Intl.DateTimeFormat(locale).format(
                    new Date(memo.updatedAt),
                  )}
                </time>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => copyMemo(memo)}
                    className="hover:text-slate-700"
                  >
                    {copiedId === memo.id ? labels.copied : labels.copy}
                  </button>
                  <button
                    onClick={() => openEdit(memo)}
                    className="hover:text-slate-700"
                  >
                    {labels.edit}
                  </button>
                  <button
                    onClick={() => onDelete(memo.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    {labels.delete}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          onMouseDown={() => setEditing(null)}
        >
          <form
            onSubmit={submit}
            onMouseDown={(event) => event.stopPropagation()}
            className={`max-h-[92dvh] w-full overflow-y-auto rounded-t-[30px] p-6 shadow-2xl sm:max-w-xl sm:rounded-[30px] ${dark ? "bg-slate-900 text-white" : "bg-white text-slate-900"}`}
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold">
                {editing === "new" ? labels.newMemo : labels.edit}
              </h3>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-500"
              >
                ×
              </button>
            </div>
            <label className="block text-sm font-semibold">
              {labels.memoTitle}
              <input
                autoFocus
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className={`mt-2 w-full rounded-2xl border px-4 py-3 outline-none focus:border-slate-400 ${dark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}
              />
            </label>
            <label className="mt-5 block text-sm font-semibold">
              {labels.memoContent}
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                className={`mt-2 min-h-64 max-h-[45dvh] w-full resize-y overflow-y-auto rounded-2xl border px-4 py-3 leading-6 outline-none focus:border-slate-400 ${dark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}
              />
            </label>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-xl px-4 py-2 text-sm text-slate-400"
              >
                {labels.cancel}
              </button>
              <button
                disabled={saving}
                className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {labels.save}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
