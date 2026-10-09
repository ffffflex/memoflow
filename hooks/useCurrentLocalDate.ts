"use client";

import { useEffect, useState } from "react";

export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function millisecondsUntilNextLocalMidnight(now = new Date()) {
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    1,
  );
  return Math.max(0, nextMidnight.getTime() - now.getTime());
}

export default function useCurrentLocalDate() {
  const [currentDate, setCurrentDate] = useState(() => getLocalDateString());

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const syncDate = () => {
      setCurrentDate((previous) => {
        const actualDate = getLocalDateString();
        return previous === actualDate ? previous : actualDate;
      });
    };

    const scheduleNextMidnight = () => {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        syncDate();
        scheduleNextMidnight();
      }, millisecondsUntilNextLocalMidnight());
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncDate();
        scheduleNextMidnight();
      }
    };

    const handleFocus = () => {
      syncDate();
      scheduleNextMidnight();
    };

    handleFocus();
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return currentDate;
}
