"use client";

import { FormEvent, useMemo, useState } from "react";

export type LeetCodeProblem = {
  id: string;
  problemNumber: number;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  plannedDate: string;
  completed: boolean;
  completedAt: string | null;
};

type Labels = {
  todaysLeetCode: string;
  addProblem: string;
  viewProgress: string;
  problemNumber: string;
  title: string;
  difficulty: string;
  topic: string;
  plannedDate: string;
  easy: string;
  medium: string;
  hard: string;
  cancel: string;
  save: string;
  todayCompleted: string;
  weekCompleted: string;
  totalCompleted: string;
  streak: string;
  days: string;
  topicBreakdown: string;
  noProblemsToday: string;
};

export default function LeetCodeCard({ problems, labels, today, dark, onCreate, onToggle }: {
  problems: LeetCodeProblem[];
  labels: Labels;
  today: string;
  dark: boolean;
  onCreate: (problem: Omit<LeetCodeProblem, "id" | "completed" | "completedAt">) => Promise<boolean>;
  onToggle: (problem: LeetCodeProblem) => Promise<void>;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [saving, setSaving] = useState(false);
  const [number, setNumber] = useState("");
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<LeetCodeProblem["difficulty"]>("easy");
  const [topic, setTopic] = useState("");
  const [plannedDate, setPlannedDate] = useState(today);

  const todaysProblems = problems.filter((problem) => problem.plannedDate === today);
  const completedToday = todaysProblems.filter((problem) => problem.completed).length;
  const percentage = todaysProblems.length ? Math.round((completedToday / todaysProblems.length) * 100) : 0;

  const stats = useMemo(() => {
    const completed = problems.filter((problem) => problem.completed && problem.completedAt);
    const todayStart = new Date(`${today}T00:00:00`);
    const weekStart = new Date(todayStart);
    weekStart.setDate(todayStart.getDate() - ((todayStart.getDay() + 6) % 7));
    const week = completed.filter((problem) => new Date(problem.completedAt!) >= weekStart).length;
    const topics = completed.reduce<Record<string, number>>((result, problem) => {
      const key = problem.topic.trim() || "—";
      result[key] = (result[key] ?? 0) + 1;
      return result;
    }, {});
    const completedDays = new Set(completed.map((problem) => problem.completedAt!.slice(0, 10)));
    let streak = 0;
    const cursor = new Date(todayStart);
    while (completedDays.has(cursor.toLocaleDateString("en-CA"))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return { total: completed.length, week, streak, topics: Object.entries(topics).sort((a, b) => b[1] - a[1]) };
  }, [problems, today]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const saved = await onCreate({ problemNumber: Number(number), title: title.trim(), difficulty, topic: topic.trim(), plannedDate });
    setSaving(false);
    if (saved) {
      setShowAdd(false);
      setNumber(""); setTitle(""); setDifficulty("easy"); setTopic(""); setPlannedDate(today);
    }
  };

  return (
    <>
      <section className={`rounded-[28px] p-5 shadow-sm md:p-6 ${dark ? "bg-slate-900" : "bg-white"}`}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-semibold">{labels.todaysLeetCode}</h3>
          <button onClick={() => setShowProgress(true)} className="text-sm text-slate-400 hover:text-slate-600">{labels.viewProgress}</button>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm font-semibold"><span>{completedToday} / {todaysProblems.length}</span><span>{percentage}%</span></div>
        <div className={`mt-2 h-2.5 overflow-hidden rounded-full ${dark ? "bg-slate-700" : "bg-slate-100"}`}><div className="h-full rounded-full bg-slate-900 transition-all" style={{ width: `${percentage}%` }} /></div>
        <div className="mt-5 space-y-2">
          {todaysProblems.length === 0 && <p className="py-4 text-center text-sm text-slate-400">{labels.noProblemsToday}</p>}
          {todaysProblems.map((problem) => (
            <label key={problem.id} className={`flex cursor-pointer items-start gap-3 rounded-2xl px-3 py-2.5 ${dark ? "hover:bg-slate-800" : "hover:bg-slate-50"}`}>
              <input type="checkbox" checked={problem.completed} onChange={() => onToggle(problem)} className="mt-1 h-4 w-4 accent-slate-900" />
              <span className="min-w-0 flex-1"><span className={problem.completed ? "text-slate-400 line-through" : ""}>{problem.problemNumber}. {problem.title}</span><span className="ml-2 text-xs capitalize text-slate-400">{problem.difficulty}{problem.topic ? ` · ${problem.topic}` : ""}</span></span>
            </label>
          ))}
        </div>
        <button onClick={() => setShowAdd(true)} className="mt-4 text-sm font-semibold text-slate-500 hover:text-slate-800">+ {labels.addProblem}</button>
      </section>

      {showAdd && <Modal dark={dark} title={labels.addProblem} close={() => setShowAdd(false)}>
        <form onSubmit={submit} className="space-y-4">
          <Field label={labels.problemNumber} dark={dark}><input required min="1" type="number" value={number} onChange={(e) => setNumber(e.target.value)} className={inputClass(dark)} /></Field>
          <Field label={labels.title} dark={dark}><input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass(dark)} /></Field>
          <Field label={labels.difficulty} dark={dark}><select value={difficulty} onChange={(e) => setDifficulty(e.target.value as LeetCodeProblem["difficulty"])} className={inputClass(dark)}><option value="easy">{labels.easy}</option><option value="medium">{labels.medium}</option><option value="hard">{labels.hard}</option></select></Field>
          <Field label={labels.topic} dark={dark}><input value={topic} onChange={(e) => setTopic(e.target.value)} className={inputClass(dark)} /></Field>
          <Field label={labels.plannedDate} dark={dark}><input required type="date" value={plannedDate} onChange={(e) => setPlannedDate(e.target.value)} className={inputClass(dark)} /></Field>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setShowAdd(false)} className="rounded-xl px-4 py-2 text-sm text-slate-400">{labels.cancel}</button><button disabled={saving} className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">{labels.save}</button></div>
        </form>
      </Modal>}

      {showProgress && <Modal dark={dark} title={labels.viewProgress} close={() => setShowProgress(false)}>
        <div className="grid grid-cols-2 gap-3">
          {[[labels.todayCompleted, completedToday], [labels.weekCompleted, stats.week], [labels.totalCompleted, stats.total], [labels.streak, `${stats.streak} ${labels.days}`]].map(([label, value]) => <div key={label} className={`rounded-2xl p-4 ${dark ? "bg-slate-800" : "bg-slate-50"}`}><p className="text-xs text-slate-400">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div>)}
        </div>
        <h4 className="mt-6 font-semibold">{labels.topicBreakdown}</h4>
        <div className="mt-3 space-y-2">{stats.topics.map(([name, count]) => <div key={name} className="flex justify-between text-sm"><span>{name}</span><span className="font-semibold">{count}</span></div>)}</div>
      </Modal>}
    </>
  );
}

function Modal({ dark, title, close, children }: { dark: boolean; title: string; close: () => void; children: React.ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={close}><div onMouseDown={(e) => e.stopPropagation()} className={`max-h-[92dvh] w-full overflow-y-auto rounded-t-[30px] p-6 shadow-2xl sm:max-w-lg sm:rounded-[30px] ${dark ? "bg-slate-900 text-white" : "bg-white text-slate-900"}`}><div className="mb-6 flex items-center justify-between"><h3 className="text-2xl font-bold">{title}</h3><button onClick={close} className={`flex h-9 w-9 items-center justify-center rounded-full text-lg ${dark ? "bg-slate-800" : "bg-slate-100"}`}>×</button></div>{children}</div></div>;
}

function Field({ label, children }: { label: string; dark: boolean; children: React.ReactNode }) { return <label className="block text-sm font-semibold">{label}{children}</label>; }
function inputClass(dark: boolean) { return `mt-2 w-full rounded-2xl border px-4 py-3 outline-none focus:border-slate-400 ${dark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`; }
