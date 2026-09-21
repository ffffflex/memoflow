export type RecurrenceType = "daily" | "interval_days" | "weekly" | "interval_weeks" | "monthly";
export type RecurringCategory = "study" | "work" | "project" | "health" | "life";

export type RecurringPlan = {
  id: string;
  title: string;
  description: string;
  category: RecurringCategory;
  startDate: string;
  recurrenceType: RecurrenceType;
  intervalValue: number;
  weekdays: number[];
  dayOfMonth: number | null;
  endDate: string | null;
  active: boolean;
};

export type NewRecurringPlan = Omit<RecurringPlan, "id">;
export type RecurringPlanCompletion = { id: string; planId: string; occurrenceDate: string; completedAt: string };
export type RecurringPlanAdjustment = {
  id: string;
  planId: string;
  effectiveDate: string;
  shiftDays: number;
  createdAt: string;
};

export function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function daysBetween(a: string, b: string) {
  return Math.round((parseLocalDate(b).getTime() - parseLocalDate(a).getTime()) / 86_400_000);
}

function mondayOf(date: Date) {
  const result = new Date(date);
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
  return result;
}

export function occursOnDate(plan: RecurringPlan, date: string, adjustments: RecurringPlanAdjustment[] = []) {
  const shiftDays = adjustments
    .filter((adjustment) => adjustment.planId === plan.id && adjustment.effectiveDate <= date)
    .reduce((total, adjustment) => total + adjustment.shiftDays, 0);
  const scheduleDate = shiftDate(date, -shiftDays);
  if (scheduleDate < plan.startDate || (plan.endDate && scheduleDate > plan.endDate)) return false;
  const target = parseLocalDate(scheduleDate);
  const interval = Math.max(1, plan.intervalValue);
  if (plan.recurrenceType === "daily") return true;
  if (plan.recurrenceType === "interval_days") return daysBetween(plan.startDate, scheduleDate) % interval === 0;
  if (plan.recurrenceType === "monthly") return target.getDate() === plan.dayOfMonth;
  if (!plan.weekdays.includes(target.getDay())) return false;
  if (plan.recurrenceType === "weekly") return true;
  const startWeek = mondayOf(parseLocalDate(plan.startDate));
  const targetWeek = mondayOf(target);
  const weeks = Math.round((targetWeek.getTime() - startWeek.getTime()) / (7 * 86_400_000));
  return weeks % interval === 0;
}

function shiftDate(value: string, amount: number) {
  const date = parseLocalDate(value);
  date.setDate(date.getDate() + amount);
  return localDateKey(date);
}

export function getNextOccurrence(plan: RecurringPlan, afterDate: string, adjustments: RecurringPlanAdjustment[] = []) {
  let cursor = shiftDate(afterDate < plan.startDate ? shiftDate(plan.startDate, -1) : afterDate, 1);
  for (let i = 0; i < 36600; i += 1, cursor = shiftDate(cursor, 1)) {
    if (occursOnDate(plan, cursor, adjustments)) return cursor;
  }
  return null;
}

export function getPreviousOccurrences(plan: RecurringPlan, beforeDate: string, limit: number, adjustments: RecurringPlanAdjustment[] = []) {
  const result: string[] = [];
  let cursor = beforeDate;
  for (let i = 0; i < 36600 && result.length < limit && cursor >= plan.startDate; i += 1, cursor = shiftDate(cursor, -1)) {
    if (occursOnDate(plan, cursor, adjustments)) result.push(cursor);
  }
  return result;
}
