"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

type Mode = "login" | "register";

export default function AuthPage() {
  const [mode, setMode] =
    useState<Mode>("login");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("请输入邮箱");
      return;
    }

    if (password.length < 6) {
      setError("密码至少需要 6 位");
      return;
    }

    if (
      mode === "register" &&
      password !== confirmPassword
    ) {
      setError("两次输入的密码不一致");
      return;
    }

    setLoading(true);

    try {
      if (mode === "register") {
        const { error } =
          await supabase.auth.signUp({
            email: email.trim(),
            password,
          });

        if (error) {
          setError(error.message);
          return;
        }

        setMessage(
          "注册成功。现在可以登录。"
        );

        setMode("login");
        setPassword("");
        setConfirmPassword("");
      } else {
        const { error } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (error) {
          setError(error.message);
          return;
        }

        window.location.reload();
      }
    } catch {
      setError("出现错误，请稍后再试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb] p-5 text-slate-900">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-slate-900 text-xl font-bold text-white shadow-lg">
            M
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight">
            MemoFlow
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Plan your days.
          </p>
        </div>

        <section className="rounded-[30px] bg-white p-6 shadow-sm md:p-8">
          <div className="mb-7">
            <h2 className="text-2xl font-bold">
              {mode === "login"
                ? "欢迎回来"
                : "创建账户"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {mode === "login"
                ? "登录后同步你的任务、项目和设置。"
                : "创建 MemoFlow 账户，在不同设备间同步数据。"}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setMessage("");
              }}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                mode === "login"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              登录
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
                setMessage("");
              }}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                mode === "register"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              注册
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">
                邮箱
              </span>

              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="name@example.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition placeholder:text-slate-300 focus:border-slate-400 focus:bg-white"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">
                密码
              </span>

              <input
                type="password"
                autoComplete={
                  mode === "login"
                    ? "current-password"
                    : "new-password"
                }
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="至少 6 位"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition placeholder:text-slate-300 focus:border-slate-400 focus:bg-white"
              />
            </label>

            {mode === "register" && (
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">
                  确认密码
                </span>

                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  placeholder="再次输入密码"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition placeholder:text-slate-300 focus:border-slate-400 focus:bg-white"
                />
              </label>
            )}

            {error && (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "请稍候..."
                : mode === "login"
                  ? "登录"
                  : "创建账户"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}