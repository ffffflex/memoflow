import type { Language } from "./translations";

export type Theme =
  | "default"
  | "white"
  | "warm"
  | "blue"
  | "purple"
  | "dark";

export type Page =
  | "today"
  | "calendar"
  | "projects"
  | "tasks"
  | "clipboard"
  | "settings";

export type CategoryName =
  | "study"
  | "work"
  | "project"
  | "health"
  | "life";

export type Task = {
  id: number;
  title: string;
  description?: string;

  startDate: string;
  endDate: string;

  time?: string;
  allDay: boolean;

  category: CategoryName;

  completed: boolean;

  projectId?: number;
};

export type Project = {
  id: number;

  title: string;
  description?: string;

  startDate: string;
  endDate: string;

  category: CategoryName;

  completed: boolean;

  progress: number;
};

export type UserPreferences = {
  language: Language;
  theme: Theme;
};