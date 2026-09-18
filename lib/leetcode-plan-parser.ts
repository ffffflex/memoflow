export type ParsedLeetCodeProblem = {
  problemNumber: number;
  title?: string;
  topic?: string;
  plannedDate?: string;
  relativeDay?: number;
  week?: number;
  weekday?: string;
  order: number;
};

export type ParsedLeetCodePlan = {
  problems: ParsedLeetCodeProblem[];
  needsStartDate: boolean;
  needsDistribution: boolean;
  weekCount: number;
};

const WEEKDAYS: Record<string, number> = {
  monday: 0, mon: 0, 星期一: 0, 周一: 0,
  tuesday: 1, tue: 1, tues: 1, 星期二: 1, 周二: 1,
  wednesday: 2, wed: 2, 星期三: 2, 周三: 2,
  thursday: 3, thu: 3, thur: 3, thurs: 3, 星期四: 3, 周四: 3,
  friday: 4, fri: 4, 星期五: 4, 周五: 4,
  saturday: 5, sat: 5, 星期六: 5, 周六: 5,
  sunday: 6, sun: 6, 星期日: 6, 星期天: 6, 周日: 6, 周天: 6,
};

const TOPIC_LINE = /^\s*(?:#{1,6}\s*)?([\p{L}][\p{L}\p{N} &+/#-]{0,50})\s*[：:]\s*(.*)$/u;
const FULL_DATE = /\b(20\d{2})[-/.](0?[1-9]|1[0-2])[-/.](0?[1-9]|[12]\d|3[01])\b/;
const SHORT_DATE = /\b(0?[1-9]|1[0-2])[/.](0?[1-9]|[12]\d|3[01])\b/;

export function parseLeetCodePlan(source: string): ParsedLeetCodePlan {
  const lines = source
    .replace(/\r/g, "")
    .replace(/[，、；]/g, ",")
    .split("\n")
    .map((line) => line.replace(/^\s*[-*+]\s+/, "").trim())
    .filter(Boolean);

  const problems: ParsedLeetCodeProblem[] = [];
  let currentTopic = "";
  let currentWeek: number | undefined;
  let currentWeekday: string | undefined;
  let currentRelativeDay: number | undefined;
  let currentDate: string | undefined;
  let shortDateGroup = -1;
  let order = 0;

  for (const originalLine of lines) {
    let line = originalLine.replace(/^#{1,6}\s*/, "").trim();

    const combinedWeekday = line.match(/^(?:week|第)\s*(\d+)\s*(?:周|週)?\s+(monday|mon|tuesday|tue|wednesday|wed|thursday|thu|friday|fri|saturday|sat|sunday|sun|星期[一二三四五六日天]|周[一二三四五六日天])\s*[：:]?\s*(.*)$/i);
    if (combinedWeekday) {
      currentWeek = Number(combinedWeekday[1]);
      currentWeekday = combinedWeekday[2].toLowerCase();
      currentRelativeDay = Math.max(0, (currentWeek - 1) * 7 + (WEEKDAYS[currentWeekday] ?? 0));
      currentDate = undefined;
      line = combinedWeekday[3].trim();
      if (!line) continue;
    }

    const weekMatch = line.match(/^(?:week|第)\s*(\d+)\s*(?:周|週)?\s*$/i);
    if (weekMatch) {
      currentWeek = Number(weekMatch[1]);
      currentWeekday = undefined;
      currentRelativeDay = undefined;
      currentDate = undefined;
      continue;
    }

    const dayMatch = line.match(/^(?:day|第)\s*(\d+)\s*(?:天|日)?\s*[：:]?\s*(.*)$/i);
    if (dayMatch) {
      currentRelativeDay = Math.max(0, Number(dayMatch[1]) - 1);
      currentWeek = undefined;
      currentWeekday = undefined;
      currentDate = undefined;
      line = dayMatch[2].trim();
      if (!line) continue;
    }

    const weekdayEntry = Object.entries(WEEKDAYS).find(([name]) =>
      new RegExp(`^${escapeRegExp(name)}(?:\\s*[：:]\\s*(.*))?$`, "i").test(line),
    );
    if (weekdayEntry) {
      const match = line.match(new RegExp(`^${escapeRegExp(weekdayEntry[0])}(?:\\s*[：:]\\s*(.*))?$`, "i"));
      currentWeekday = weekdayEntry[0];
      currentRelativeDay = Math.max(0, ((currentWeek ?? 1) - 1) * 7 + weekdayEntry[1]);
      currentDate = undefined;
      line = match?.[1]?.trim() ?? "";
      if (!line) continue;
    }

    const fullDateMatch = line.match(FULL_DATE);
    if (fullDateMatch) {
      currentDate = toIsoDate(Number(fullDateMatch[1]), Number(fullDateMatch[2]), Number(fullDateMatch[3]));
      currentRelativeDay = undefined;
      line = line.replace(fullDateMatch[0], "").replace(/^\s*[：:,|-]\s*/, "");
      if (!line) continue;
    } else {
      const shortDateMatch = line.match(SHORT_DATE);
      if (shortDateMatch) {
        shortDateGroup += 1;
        currentDate = undefined;
        currentRelativeDay = shortDateGroup;
        line = line.replace(shortDateMatch[0], "").replace(/^\s*[：:,|-]\s*/, "");
        if (!line) continue;
      }
    }

    const topicMatch = line.match(TOPIC_LINE);
    if (topicMatch && !/^leetcode|^lc$/i.test(topicMatch[1])) {
      currentTopic = topicMatch[1].trim();
      line = topicMatch[2].trim();
      if (!line) continue;
    }

    const entries = extractProblemEntries(line);
    for (const entry of entries) {
      problems.push({
        problemNumber: entry.problemNumber,
        title: entry.title,
        topic: currentTopic || undefined,
        plannedDate: currentDate,
        relativeDay: currentRelativeDay,
        week: currentWeek,
        weekday: currentWeekday,
        order: order++,
      });
    }
  }

  const needsStartDate = problems.some((problem) => !problem.plannedDate);
  const needsDistribution = problems.some(
    (problem) => !problem.plannedDate && problem.relativeDay === undefined,
  );
  return {
    problems,
    needsStartDate,
    needsDistribution,
    weekCount: new Set(problems.map((problem) => problem.week).filter(Boolean)).size,
  };
}

export function resolvePlanDates(
  problems: ParsedLeetCodeProblem[],
  startDate: string,
  problemsPerDay = 5,
): ParsedLeetCodeProblem[] {
  let undatedIndex = 0;
  return problems.map((problem) => {
    if (problem.plannedDate) return problem;
    const offset = problem.relativeDay ?? Math.floor(undatedIndex++ / Math.max(1, problemsPerDay));
    return { ...problem, plannedDate: addDays(startDate, offset) };
  });
}

function extractProblemEntries(line: string): Array<{ problemNumber: number; title?: string }> {
  const cleaned = line
    .replace(/\b(?:leetcode|lc)\s*#?\s*/gi, "")
    .replace(/^\s*\d+\s*[.)、]\s+(?=\d)/, "")
    .trim();
  if (!cleaned) return [];

  const matches = [...cleaned.matchAll(/(?:^|[\s,:;|#(])#?(\d{1,5})(?=$|[\s,.;:|)])/g)];
  if (matches.length === 0) return [];

  if (matches.length === 1) {
    const match = matches[0];
    const after = cleaned.slice((match.index ?? 0) + match[0].length).replace(/^[\s.)：:,-]+/, "").trim();
    const title = after && !/^\d/.test(after) ? after : undefined;
    return [{ problemNumber: Number(match[1]), title }];
  }

  return matches.map((match) => ({ problemNumber: Number(match[1]) }));
}

function addDays(date: string, amount: number) {
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() + amount);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

function toIsoDate(year: number, month: number, day: number) {
  const date = new Date(year, month - 1, day, 12);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return undefined;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
