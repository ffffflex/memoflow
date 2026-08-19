"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { User } from "@supabase/supabase-js";

import AuthPage from "@/components/AuthPage";
import { supabase } from "@/lib/supabase";

type Language = "zh" | "en" | "es";

type Theme =
  | "default"
  | "white"
  | "warm"
  | "blue"
  | "purple"
  | "dark";

type Page =
  | "today"
  | "calendar"
  | "projects"
  | "tasks"
  | "clipboard"
  | "trash"
  | "settings";

type CategoryName =
  | "study"
  | "work"
  | "project"
  | "health"
  | "life";

type Task = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  time: string;
  allDay: boolean;
  category: CategoryName;
  completed: boolean;
  projectId: string | null;
};

type Project = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  category: CategoryName;
  completed: boolean;
  progress: number;
};

type NewTask = Omit<Task, "id">;
type NewProject = Omit<Project, "id">;

const TODAY = getLocalDateString(new Date());

const translations = {
  zh: {
    today: "今日",
    calendar: "日历",
    projects: "项目",
    allTasks: "所有任务",
    clipboard: "剪切板",
    trash: "回收站",
    restore: "恢复",
    permanentlyDelete: "永久删除",
    emptyTrash: "回收站为空",
    trashDescription: "删除的任务和项目会暂时保存在这里。",
    deletedItems: "已删除项目",
    taskType: "任务",
    projectType: "项目",
    settings: "设置",

    create: "新建",
    task: "任务",
    project: "项目",

    todaySubtitle: "把今天重要的事情处理掉。",
    todayTasks: "今日待办",
    ongoingProjects: "进行中的项目",
    todayProgress: "今日完成度",

    viewAll: "查看全部",
    viewProjects: "查看项目",

    unfinished: "个未完成",
    completed: "已完成",
    incomplete: "未完成",

    newTask: "新建任务",
    newProject: "新建项目",
    chooseCreateType: "你想创建什么？",

    taskDescription: "创建单日或跨多天的任务",
    projectDescription: "创建有开始和结束日期的长期项目",

    taskName: "任务名称",
    projectName: "项目名称",
    description: "描述",
    optional: "可选",

    singleDay: "单日",
    multiDay: "多日",

    date: "日期",
    startDate: "开始日期",
    endDate: "结束日期",
    time: "时间",
    allDay: "全天任务",

    category: "分类",
    belongProject: "所属项目",
    noProject: "不属于项目",
    subTasks: "子任务",
    noSubTasks: "还没有子任务",

    study: "学习",
    work: "工作",
    health: "健康",
    life: "生活",
    projectCategory: "项目",

    edit: "编辑",
    saveChanges: "保存修改",
    editTask: "编辑任务",
    editProject: "编辑项目",
    delete: "删除",
    cancel: "取消",
    createTask: "创建任务",
    createProject: "创建项目",

    schedule: "日程",
    longTermPlans: "长期计划",

    everything: "全部",
    noTasks: "这里还没有任务",
    noTasksToday: "今天还没有任务",

    quickSpace: "快速空间",
    clipboardDescription: "随手粘贴一些临时需要保存的文字。",
    pasteHere: "在这里粘贴文字...",
    clear: "清空",
    copy: "复制",
    copied: "已复制",

    preferences: "偏好设置",
    language: "语言",
    appearance: "外观",
    background: "背景",

    defaultTheme: "默认",
    whiteTheme: "白色",
    warmTheme: "暖色",
    blueTheme: "蓝色",
    purpleTheme: "紫色",
    darkTheme: "深色",

    account: "账户",
    logout: "退出登录",
  },

  en: {
    today: "Today",
    calendar: "Calendar",
    projects: "Projects",
    allTasks: "All Tasks",
    clipboard: "Clipboard",
    trash: "Trash",
    restore: "Restore",
    permanentlyDelete: "Delete Permanently",
    emptyTrash: "Trash is empty",
    trashDescription: "Deleted tasks and projects are kept here temporarily.",
    deletedItems: "Deleted Items",
    taskType: "Task",
    projectType: "Project",
    settings: "Settings",

    create: "Create",
    task: "Task",
    project: "Project",

    todaySubtitle: "Focus on what matters today.",
    todayTasks: "Today's Tasks",
    ongoingProjects: "Ongoing Projects",
    todayProgress: "Today's Progress",

    viewAll: "View All",
    viewProjects: "View Projects",

    unfinished: "unfinished",
    completed: "Completed",
    incomplete: "Incomplete",

    newTask: "New Task",
    newProject: "New Project",
    chooseCreateType: "What would you like to create?",

    taskDescription: "Create a task for one day or multiple days",
    projectDescription: "Create a long-term project with a date range",

    taskName: "Task Name",
    projectName: "Project Name",
    description: "Description",
    optional: "Optional",

    singleDay: "Single Day",
    multiDay: "Multiple Days",

    date: "Date",
    startDate: "Start Date",
    endDate: "End Date",
    time: "Time",
    allDay: "All-day Task",

    category: "Category",
    belongProject: "Project",
    noProject: "No Project",
    subTasks: "Subtasks",
    noSubTasks: "No subtasks yet",

    study: "Study",
    work: "Work",
    health: "Health",
    life: "Life",
    projectCategory: "Project",

    edit: "Edit",
    saveChanges: "Save Changes",
    editTask: "Edit Task",
    editProject: "Edit Project",
    delete: "Delete",
    cancel: "Cancel",
    createTask: "Create Task",
    createProject: "Create Project",

    schedule: "Schedule",
    longTermPlans: "Long-term Plans",

    everything: "All",
    noTasks: "No tasks here yet",
    noTasksToday: "No tasks today",

    quickSpace: "Quick Space",
    clipboardDescription: "Paste temporary text here for quick access.",
    pasteHere: "Paste text here...",
    clear: "Clear",
    copy: "Copy",
    copied: "Copied",

    preferences: "Preferences",
    language: "Language",
    appearance: "Appearance",
    background: "Background",

    defaultTheme: "Default",
    whiteTheme: "White",
    warmTheme: "Warm",
    blueTheme: "Blue",
    purpleTheme: "Purple",
    darkTheme: "Dark",

    account: "Account",
    logout: "Log Out",
  },

  es: {
    today: "Hoy",
    calendar: "Calendario",
    projects: "Proyectos",
    allTasks: "Todas las tareas",
    clipboard: "Portapapeles",
    trash: "Papelera",
    restore: "Restaurar",
    permanentlyDelete: "Eliminar permanentemente",
    emptyTrash: "La papelera está vacía",
    trashDescription: "Las tareas y proyectos eliminados se guardan aquí temporalmente.",
    deletedItems: "Elementos eliminados",
    taskType: "Tarea",
    projectType: "Proyecto",
    settings: "Ajustes",

    create: "Crear",
    task: "Tarea",
    project: "Proyecto",

    todaySubtitle: "Concéntrate en lo importante de hoy.",
    todayTasks: "Tareas de hoy",
    ongoingProjects: "Proyectos en curso",
    todayProgress: "Progreso de hoy",

    viewAll: "Ver todo",
    viewProjects: "Ver proyectos",

    unfinished: "pendientes",
    completed: "Completado",
    incomplete: "Pendiente",

    newTask: "Nueva tarea",
    newProject: "Nuevo proyecto",
    chooseCreateType: "¿Qué quieres crear?",

    taskDescription: "Crea una tarea para uno o varios días",
    projectDescription:
      "Crea un proyecto a largo plazo con fechas de inicio y fin",

    taskName: "Nombre de la tarea",
    projectName: "Nombre del proyecto",
    description: "Descripción",
    optional: "Opcional",

    singleDay: "Un día",
    multiDay: "Varios días",

    date: "Fecha",
    startDate: "Fecha de inicio",
    endDate: "Fecha de finalización",
    time: "Hora",
    allDay: "Tarea de todo el día",

    category: "Categoría",
    belongProject: "Proyecto",
    noProject: "Sin proyecto",
    subTasks: "Subtareas",
    noSubTasks: "Todavía no hay subtareas",

    study: "Estudio",
    work: "Trabajo",
    health: "Salud",
    life: "Vida",
    projectCategory: "Proyecto",

    edit: "Editar",
    saveChanges: "Guardar cambios",
    editTask: "Editar tarea",
    editProject: "Editar proyecto",
    delete: "Eliminar",
    cancel: "Cancelar",
    createTask: "Crear tarea",
    createProject: "Crear proyecto",

    schedule: "Agenda",
    longTermPlans: "Planes a largo plazo",

    everything: "Todo",
    noTasks: "Todavía no hay tareas",
    noTasksToday: "No hay tareas para hoy",

    quickSpace: "Espacio rápido",
    clipboardDescription:
      "Pega aquí texto temporal para acceder rápidamente.",
    pasteHere: "Pega texto aquí...",
    clear: "Limpiar",
    copy: "Copiar",
    copied: "Copiado",

    preferences: "Preferencias",
    language: "Idioma",
    appearance: "Apariencia",
    background: "Fondo",

    defaultTheme: "Predeterminado",
    whiteTheme: "Blanco",
    warmTheme: "Cálido",
    blueTheme: "Azul",
    purpleTheme: "Morado",
    darkTheme: "Oscuro",

    account: "Cuenta",
    logout: "Cerrar sesión",
  },
} as const;

const categoryStyles: Record<
  CategoryName,
  {
    bg: string;
    text: string;
  }
> = {
  study: {
    bg: "bg-blue-100",
    text: "text-blue-700",
  },
  work: {
    bg: "bg-orange-100",
    text: "text-orange-700",
  },
  project: {
    bg: "bg-purple-100",
    text: "text-purple-700",
  },
  health: {
    bg: "bg-green-100",
    text: "text-green-700",
  },
  life: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
  },
};

export default function Home() {
  const [user, setUser] =
    useState<User | null>(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  const [page, setPage] =
    useState<Page>("today");

  const [language, setLanguage] =
    useState<Language>("zh");

  const [theme, setTheme] =
    useState<Theme>("default");

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [trashedTasks, setTrashedTasks] =
    useState<Task[]>([]);

  const [trashedProjects, setTrashedProjects] =
    useState<Project[]>([]);

  const [clipboardText, setClipboardText] =
    useState("");

  const [cloudDataReady, setCloudDataReady] =
    useState(false);

  const clipboardSaveTimer =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const [createOpen, setCreateOpen] =
    useState(false);

  const [createType, setCreateType] =
    useState<"choose" | "task" | "project">(
      "choose"
    );

  const [editingTask, setEditingTask] =
    useState<Task | null>(null);

  const [editingProject, setEditingProject] =
    useState<Project | null>(null);

  const t = translations[language];

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setAuthLoading(false);
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setAuthLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setProjects([]);
      setTrashedTasks([]);
      setTrashedProjects([]);
      setClipboardText("");
      setLanguage("zh");
      setTheme("default");
      setCloudDataReady(false);
      return;
    }

    let cancelled = false;

    const loadData = async () => {
      setCloudDataReady(false);

      const [
        tasksResult,
        projectsResult,
        preferencesResult,
        clipboardResult,
      ] = await Promise.all([
        supabase
          .from("tasks")
          .select("*")
          .order("created_at", { ascending: false }),

        supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false }),

        supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(),

        supabase
          .from("clipboards")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      if (cancelled) return;

      if (tasksResult.error) {
        console.error("Failed to load tasks:", tasksResult.error);
      } else {
        const mappedTasks = (tasksResult.data ?? []).map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description ?? "",
          startDate: task.start_date,
          endDate: task.end_date,
          time: task.time ?? "",
          allDay: task.all_day ?? false,
          category: task.category as CategoryName,
          completed: task.completed ?? false,
          projectId: task.project_id ?? null,
          deletedAt: task.deleted_at ?? null,
        }));

        setTasks(
          mappedTasks
            .filter((task) => !task.deletedAt)
            .map(({ deletedAt, ...task }) => task)
        );

        setTrashedTasks(
          mappedTasks
            .filter((task) => !!task.deletedAt)
            .map(({ deletedAt, ...task }) => task)
        );
      }

      if (projectsResult.error) {
        console.error("Failed to load projects:", projectsResult.error);
      } else {
        const mappedProjects = (projectsResult.data ?? []).map((project) => ({
          id: project.id,
          title: project.title,
          description: project.description ?? "",
          startDate: project.start_date,
          endDate: project.end_date,
          category: project.category as CategoryName,
          completed: project.completed ?? false,
          progress: project.progress ?? 0,
          deletedAt: project.deleted_at ?? null,
        }));

        setProjects(
          mappedProjects
            .filter((project) => !project.deletedAt)
            .map(({ deletedAt, ...project }) => project)
        );

        setTrashedProjects(
          mappedProjects
            .filter((project) => !!project.deletedAt)
            .map(({ deletedAt, ...project }) => project)
        );
      }

      if (preferencesResult.error) {
        console.error(
          "Failed to load preferences:",
          preferencesResult.error
        );
      } else if (preferencesResult.data) {
        setLanguage(
          (preferencesResult.data.language ?? "zh") as Language
        );
        setTheme(
          (preferencesResult.data.theme ?? "default") as Theme
        );
      } else {
        const { error } = await supabase
          .from("user_preferences")
          .insert({
            user_id: user.id,
            language: "zh",
            theme: "default",
          });

        if (error) {
          console.error(
            "Failed to create preferences:",
            error
          );
        }
      }

      if (clipboardResult.error) {
        console.error(
          "Failed to load clipboard:",
          clipboardResult.error
        );
      } else if (clipboardResult.data) {
        setClipboardText(
          clipboardResult.data.content ?? ""
        );
      } else {
        const { error } = await supabase
          .from("clipboards")
          .insert({
            user_id: user.id,
            content: "",
          });

        if (error) {
          console.error(
            "Failed to create clipboard:",
            error
          );
        }
      }

      if (!cancelled) {
        setCloudDataReady(true);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user || !cloudDataReady) {
      return;
    }

    if (clipboardSaveTimer.current) {
      clearTimeout(clipboardSaveTimer.current);
    }

    clipboardSaveTimer.current = setTimeout(async () => {
      const { error } = await supabase
        .from("clipboards")
        .upsert(
          {
            user_id: user.id,
            content: clipboardText,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          }
        );

      if (error) {
        console.error(
          "Failed to save clipboard:",
          error
        );
      }
    }, 500);

    return () => {
      if (clipboardSaveTimer.current) {
        clearTimeout(clipboardSaveTimer.current);
      }
    };
  }, [clipboardText, user, cloudDataReady]);

  const changeLanguage = async (
    nextLanguage: Language
  ) => {
    setLanguage(nextLanguage);

    if (!user) return;

    const { error } = await supabase
      .from("user_preferences")
      .upsert(
        {
          user_id: user.id,
          language: nextLanguage,
          theme,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

    if (error) {
      console.error(
        "Failed to save language:",
        error
      );
    }
  };

  const changeTheme = async (
    nextTheme: Theme
  ) => {
    setTheme(nextTheme);

    if (!user) return;

    const { error } = await supabase
      .from("user_preferences")
      .upsert(
        {
          user_id: user.id,
          language,
          theme: nextTheme,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

    if (error) {
      console.error(
        "Failed to save theme:",
        error
      );
    }
  };


  useEffect(() => {
    if (!user || !cloudDataReady) {
      return;
    }

    const mapTask = (row: Record<string, any>): Task => ({
      id: row.id,
      title: row.title,
      description: row.description ?? "",
      startDate: row.start_date,
      endDate: row.end_date,
      time: row.time ?? "",
      allDay: row.all_day ?? false,
      category: row.category as CategoryName,
      completed: row.completed ?? false,
      projectId: row.project_id ?? null,
    });

    const mapProject = (row: Record<string, any>): Project => ({
      id: row.id,
      title: row.title,
      description: row.description ?? "",
      startDate: row.start_date,
      endDate: row.end_date,
      category: row.category as CategoryName,
      completed: row.completed ?? false,
      progress: row.progress ?? 0,
    });

    const handleTaskChange = (payload: any) => {
      const row = payload.new as Record<string, any>;
      const task = mapTask(row);
      const deleted = Boolean(row.deleted_at);

      if (deleted) {
        setTasks((current) =>
          current.filter((item) => item.id !== task.id)
        );
        setTrashedTasks((current) => [
          task,
          ...current.filter((item) => item.id !== task.id),
        ]);
      } else {
        setTrashedTasks((current) =>
          current.filter((item) => item.id !== task.id)
        );
        setTasks((current) => [
          task,
          ...current.filter((item) => item.id !== task.id),
        ]);
      }
    };

    const handleProjectChange = (payload: any) => {
      const row = payload.new as Record<string, any>;
      const project = mapProject(row);
      const deleted = Boolean(row.deleted_at);

      if (deleted) {
        setProjects((current) =>
          current.filter((item) => item.id !== project.id)
        );
        setTrashedProjects((current) => [
          project,
          ...current.filter((item) => item.id !== project.id),
        ]);
      } else {
        setTrashedProjects((current) =>
          current.filter((item) => item.id !== project.id)
        );
        setProjects((current) => [
          project,
          ...current.filter((item) => item.id !== project.id),
        ]);
      }
    };

    const handleClipboardChange = (payload: any) => {
      const row = payload.new as Record<string, any>;
      setClipboardText(row.content ?? "");
    };

    const handlePreferencesChange = (payload: any) => {
      const row = payload.new as Record<string, any>;

      if (row.language) {
        setLanguage(row.language as Language);
      }

      if (row.theme) {
        setTheme(row.theme as Theme);
      }
    };

    const channel = supabase
      .channel(`memoflow-sync-${user.id}`)

      // Task INSERT / UPDATE only.
      // DELETE cannot be combined with a column filter in Postgres Changes.
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tasks",
          filter: `user_id=eq.${user.id}`,
        },
        handleTaskChange
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tasks",
          filter: `user_id=eq.${user.id}`,
        },
        handleTaskChange
      )

      // Project INSERT / UPDATE
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "projects",
          filter: `user_id=eq.${user.id}`,
        },
        handleProjectChange
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "projects",
          filter: `user_id=eq.${user.id}`,
        },
        handleProjectChange
      )

      // Clipboard INSERT / UPDATE
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "clipboards",
          filter: `user_id=eq.${user.id}`,
        },
        handleClipboardChange
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "clipboards",
          filter: `user_id=eq.${user.id}`,
        },
        handleClipboardChange
      )

      // Preferences INSERT / UPDATE
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_preferences",
          filter: `user_id=eq.${user.id}`,
        },
        handlePreferencesChange
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "user_preferences",
          filter: `user_id=eq.${user.id}`,
        },
        handlePreferencesChange
      )
      .subscribe((status, err) => {
        if (status === "CHANNEL_ERROR") {
          console.warn(
            "MemoFlow realtime unavailable. Cloud saving still works.",
            err
          );
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, cloudDataReady]);

  const themeClass =
    theme === "default"
      ? "bg-[#f6f7fb]"
      : theme === "white"
        ? "bg-white"
        : theme === "warm"
          ? "bg-[#f8f2e8]"
          : theme === "blue"
            ? "bg-[#edf4ff]"
            : theme === "purple"
              ? "bg-[#f3efff]"
              : "bg-slate-950";

  const isDark = theme === "dark";

  const todayTasks = useMemo(() => {
    return tasks.filter(
      (task) =>
        task.startDate <= TODAY &&
        task.endDate >= TODAY
    );
  }, [tasks]);

  const openCreate = () => {
    setCreateType("choose");
    setCreateOpen(true);
  };

  const closeCreate = () => {
    setCreateOpen(false);
    setCreateType("choose");
  };

  const toggleTask = async (id: string) => {
    if (!user) return;

    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    const completed = !task.completed;

    const { error } = await supabase
      .from("tasks")
      .update({
        completed,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to update task:", error);
      return;
    }

    setTasks((current) =>
      current.map((item) =>
        item.id === id ? { ...item, completed } : item
      )
    );
  };

  const toggleProject = async (id: string) => {
    if (!user) return;

    const project = projects.find((item) => item.id === id);
    if (!project) return;

    const completed = !project.completed;
    const progress = completed ? 100 : 0;

    const { error } = await supabase
      .from("projects")
      .update({
        completed,
        progress,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to update project:", error);
      return;
    }

    setProjects((current) =>
      current.map((item) =>
        item.id === id ? { ...item, completed, progress } : item
      )
    );
  };

  const updateTask = async (
    id: string,
    changes: NewTask
  ) => {
    if (!user) return;

    const { error } = await supabase
      .from("tasks")
      .update({
        title: changes.title,
        description: changes.description,
        start_date: changes.startDate,
        end_date: changes.endDate,
        time: changes.time || null,
        all_day: changes.allDay,
        category: changes.category,
        completed: changes.completed,
        project_id: changes.projectId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to update task:", error);
      return;
    }

    setTasks((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              ...changes,
            }
          : item
      )
    );

    setEditingTask(null);
  };

  const updateProject = async (
    id: string,
    changes: NewProject
  ) => {
    if (!user) return;

    const { error } = await supabase
      .from("projects")
      .update({
        title: changes.title,
        description: changes.description,
        start_date: changes.startDate,
        end_date: changes.endDate,
        category: changes.category,
        completed: changes.completed,
        progress: changes.progress,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to update project:", error);
      return;
    }

    setProjects((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              ...changes,
            }
          : item
      )
    );

    setEditingProject(null);
  };

  const deleteTask = async (id: string) => {
    if (!user) return;

    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    const { error } = await supabase
      .from("tasks")
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to move task to trash:", error);
      return;
    }

    setTasks((current) =>
      current.filter((item) => item.id !== id)
    );
    setTrashedTasks((current) => [task, ...current]);
  };

  const deleteProject = async (id: string) => {
    if (!user) return;

    const project = projects.find((item) => item.id === id);
    if (!project) return;

    const { error } = await supabase
      .from("projects")
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to move project to trash:", error);
      return;
    }

    setProjects((current) =>
      current.filter((item) => item.id !== id)
    );
    setTrashedProjects((current) => [project, ...current]);
  };

  const restoreTask = async (id: string) => {
    if (!user) return;

    const task = trashedTasks.find((item) => item.id === id);
    if (!task) return;

    const { error } = await supabase
      .from("tasks")
      .update({
        deleted_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to restore task:", error);
      return;
    }

    setTrashedTasks((current) =>
      current.filter((item) => item.id !== id)
    );
    setTasks((current) => [task, ...current]);
  };

  const restoreProject = async (id: string) => {
    if (!user) return;

    const project = trashedProjects.find((item) => item.id === id);
    if (!project) return;

    const { error } = await supabase
      .from("projects")
      .update({
        deleted_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to restore project:", error);
      return;
    }

    setTrashedProjects((current) =>
      current.filter((item) => item.id !== id)
    );
    setProjects((current) => [project, ...current]);
  };

  const permanentlyDeleteTask = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to permanently delete task:", error);
      return;
    }

    setTrashedTasks((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  const permanentlyDeleteProject = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to permanently delete project:", error);
      return;
    }

    setTrashedProjects((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f7fb]">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 font-bold text-white">
            M
          </div>

          <p className="mt-4 text-sm text-slate-400">
            Loading MemoFlow...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${themeClass} ${
        isDark
          ? "text-white"
          : "text-slate-900"
      }`}
    >
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside
          className={`hidden w-64 shrink-0 flex-col border-r p-6 lg:flex ${
            isDark
              ? "border-slate-800 bg-slate-900"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="mb-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 font-bold text-white">
                M
              </div>

              <div>
                <h1 className="text-xl font-bold">
                  MemoFlow
                </h1>

                <p className="text-xs text-slate-400">
                  Plan your days.
                </p>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            <SidebarItem
              label={t.today}
              active={page === "today"}
              dark={isDark}
              onClick={() =>
                setPage("today")
              }
            />

            <SidebarItem
              label={t.calendar}
              active={page === "calendar"}
              dark={isDark}
              onClick={() =>
                setPage("calendar")
              }
            />

            <SidebarItem
              label={t.projects}
              active={page === "projects"}
              dark={isDark}
              onClick={() =>
                setPage("projects")
              }
            />

            <SidebarItem
              label={t.allTasks}
              active={page === "tasks"}
              dark={isDark}
              onClick={() =>
                setPage("tasks")
              }
            />

            <SidebarItem
              label={t.clipboard}
              active={page === "clipboard"}
              dark={isDark}
              onClick={() =>
                setPage("clipboard")
              }
            />
          </nav>

          <div className="mt-auto space-y-2">
            <div
              className={`mb-3 border-t ${
                isDark
                  ? "border-slate-800"
                  : "border-slate-100"
              }`}
            />

            <SidebarItem
              label={t.trash}
              active={page === "trash"}
              dark={isDark}
              onClick={() =>
                setPage("trash")
              }
            />

            <SidebarItem
              label={t.settings}
              active={page === "settings"}
              dark={isDark}
              onClick={() =>
                setPage("settings")
              }
            />
          </div>
        </aside>

        <section className="min-w-0 flex-1 p-5 pb-28 md:p-8 md:pb-28 lg:p-10">
          <div className="mx-auto max-w-6xl">
            {page === "today" && (
              <TodayPage
                t={t}
                language={language}
                tasks={todayTasks}
                projects={projects}
                toggleTask={toggleTask}
                deleteTask={deleteTask}
                deleteProject={deleteProject}
                editTask={setEditingTask}
                editProject={setEditingProject}
                onCreate={openCreate}
                onTasks={() =>
                  setPage("tasks")
                }
                onProjects={() =>
                  setPage("projects")
                }
                dark={isDark}
              />
            )}

            {page === "calendar" && (
              <CalendarPage
                t={t}
                language={language}
                tasks={tasks}
                projects={projects}
                onCreate={openCreate}
                dark={isDark}
              />
            )}

            {page === "projects" && (
              <ProjectsPage
                t={t}
                language={language}
                projects={projects}
                tasks={tasks}
                toggleProject={
                  toggleProject
                }
                deleteProject={deleteProject}
                editProject={setEditingProject}
                onCreate={openCreate}
                dark={isDark}
              />
            )}

            {page === "tasks" && (
              <TasksPage
                t={t}
                language={language}
                tasks={tasks}
                toggleTask={toggleTask}
                deleteTask={deleteTask}
                editTask={setEditingTask}
                onCreate={openCreate}
                dark={isDark}
              />
            )}

            {page === "clipboard" && (
              <ClipboardPage
                t={t}
                clipboardText={
                  clipboardText
                }
                setClipboardText={
                  setClipboardText
                }
                dark={isDark}
              />
            )}

            {page === "trash" && (
              <TrashPage
                t={t}
                language={language}
                tasks={trashedTasks}
                projects={trashedProjects}
                restoreTask={restoreTask}
                restoreProject={restoreProject}
                permanentlyDeleteTask={permanentlyDeleteTask}
                permanentlyDeleteProject={permanentlyDeleteProject}
                dark={isDark}
              />
            )}

            {page === "settings" && (
              <SettingsPage
                t={t}
                language={language}
                theme={theme}
                setLanguage={
                  changeLanguage
                }
                setTheme={changeTheme}
                dark={isDark}
                user={user}
                logout={logout}
              />
            )}
          </div>
        </section>
      </div>

      <nav
        className={`fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-[24px] border p-2 shadow-xl backdrop-blur-xl lg:hidden ${
          isDark
            ? "border-slate-700 bg-slate-900/95"
            : "border-slate-200 bg-white/95"
        }`}
      >
        <MobileButton
          label={t.today}
          active={page === "today"}
          onClick={() =>
            setPage("today")
          }
        />

        <MobileButton
          label={t.calendar}
          active={page === "calendar"}
          onClick={() =>
            setPage("calendar")
          }
        />

        <button
          onClick={openCreate}
          className="mx-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900 text-2xl text-white shadow-md"
        >
          +
        </button>

        <MobileButton
          label={t.projects}
          active={page === "projects"}
          onClick={() =>
            setPage("projects")
          }
        />

        <MobileButton
          label={t.settings}
          active={page === "settings"}
          onClick={() =>
            setPage("settings")
          }
        />
      </nav>

      {createOpen && (
        <CreateModal
          t={t}
          projects={projects}
          type={createType}
          setType={setCreateType}
          onClose={closeCreate}
          onCreateTask={async (task) => {
            if (!user) return;

            const { data, error } = await supabase
              .from("tasks")
              .insert({
                user_id: user.id,
                title: task.title,
                description: task.description,
                start_date: task.startDate,
                end_date: task.endDate,
                time: task.time || null,
                all_day: task.allDay,
                category: task.category,
                completed: false,
                project_id: task.projectId,
              })
              .select()
              .single();

            if (error) {
              console.error("Failed to create task:", error);
              return;
            }

            setTasks((current) => [
              {
                id: data.id,
                title: data.title,
                description: data.description ?? "",
                startDate: data.start_date,
                endDate: data.end_date,
                time: data.time ?? "",
                allDay: data.all_day ?? false,
                category: data.category as CategoryName,
                completed: data.completed ?? false,
                projectId: data.project_id ?? null,
              },
              ...current,
            ]);

            closeCreate();
          }}
          onCreateProject={async (project) => {
            if (!user) return;

            const { data, error } = await supabase
              .from("projects")
              .insert({
                user_id: user.id,
                title: project.title,
                description: project.description,
                start_date: project.startDate,
                end_date: project.endDate,
                category: project.category,
                completed: false,
                progress: 0,
              })
              .select()
              .single();

            if (error) {
              console.error("Failed to create project:", error);
              return;
            }

            setProjects((current) => [
              {
                id: data.id,
                title: data.title,
                description: data.description ?? "",
                startDate: data.start_date,
                endDate: data.end_date,
                category: data.category as CategoryName,
                completed: data.completed ?? false,
                progress: data.progress ?? 0,
              },
              ...current,
            ]);

            closeCreate();
          }}
        />
      )}

      {editingTask && (
        <EditTaskModal
          t={t}
          task={editingTask}
          projects={projects}
          onClose={() => setEditingTask(null)}
          onSave={(changes) =>
            updateTask(editingTask.id, changes)
          }
        />
      )}

      {editingProject && (
        <EditProjectModal
          t={t}
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSave={(changes) =>
            updateProject(editingProject.id, changes)
          }
        />
      )}
    </main>
  );
}

function TodayPage({
  t,
  language,
  tasks,
  projects,
  toggleTask,
  deleteTask,
  deleteProject,
  editTask,
  editProject,
  onCreate,
  onTasks,
  onProjects,
  dark,
}: {
  t: (typeof translations)[Language];
  language: Language;
  tasks: Task[];
  projects: Project[];
  toggleTask: (id: string) => void | Promise<void>;
  deleteTask: (id: string) => void | Promise<void>;
  deleteProject: (id: string) => void | Promise<void>;
  editTask: (task: Task) => void;
  editProject: (project: Project) => void;
  onCreate: () => void;
  onTasks: () => void;
  onProjects: () => void;
  dark: boolean;
}) {
  const completed =
    tasks.filter(
      (task) => task.completed
    ).length;

  const unfinished =
    tasks.length - completed;

  const percentage =
    tasks.length === 0
      ? 0
      : Math.round(
          (completed /
            tasks.length) *
            100
        );

  return (
    <>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">
            {formatFullDate(
              TODAY,
              language
            )}
          </p>

          <h2 className="mt-1 text-3xl font-bold md:text-4xl">
            {t.today}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {t.todaySubtitle}
          </p>
        </div>

        <button
          onClick={onCreate}
          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-700"
        >
          + {t.create}
        </button>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.8fr]">
        <div className="space-y-6">
          <Card dark={dark}>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">
                  {t.todayTasks}
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  {unfinished}{" "}
                  {t.unfinished}
                </p>
              </div>

              <button
                onClick={onTasks}
                className="text-sm text-slate-400 hover:text-slate-600"
              >
                {t.viewAll}
              </button>
            </div>

            <div className="space-y-3">
              {tasks.length === 0 ? (
                <EmptyState
                  text={
                    t.noTasksToday
                  }
                />
              ) : (
                tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    t={t}
                    language={
                      language
                    }
                    toggleTask={
                      toggleTask
                    }
                    deleteTask={
                      deleteTask
                    }
                    editTask={
                      editTask
                    }
                    dark={dark}
                  />
                ))
              )}
            </div>
          </Card>

          <Card dark={dark}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">
                  {
                    t.ongoingProjects
                  }
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  {
                    t.longTermPlans
                  }
                </p>
              </div>

              <button
                onClick={onProjects}
                className="text-sm text-slate-400 hover:text-slate-600"
              >
                {t.viewProjects}
              </button>
            </div>

            <div className="space-y-6">
              {projects
                .filter(
                  (project) =>
                    !project.completed
                )
                .map((project) => (
                  <div
                    key={project.id}
                    className="flex items-start gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p
                        className={`mb-2 block text-base font-bold ${
                          dark
                            ? "text-white"
                            : "text-slate-900"
                        }`}
                      >
                        {project.title || "Untitled Project"}
                      </p>

                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-xs text-slate-400">
                          {formatDateRange(
                            project.startDate,
                            project.endDate,
                            language
                          )}
                        </p>

                        <span className="shrink-0 text-sm font-semibold text-slate-500">
                          {project.progress}%
                        </span>
                      </div>

                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-slate-900"
                          style={{
                            width: `${project.progress}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() =>
                          editProject(project)
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-sm text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        title={t.edit}
                      >
                        ✎
                      </button>

                      <button
                        onClick={() =>
                          deleteProject(
                            project.id
                          )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                        title={t.delete}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card dark={dark}>
            <SmallCalendar
              language={language}
            />
          </Card>

          <section className="rounded-[28px] bg-slate-900 p-6 text-white shadow-sm">
            <p className="text-sm text-slate-400">
              {t.todayProgress}
            </p>

            <div className="mt-4 flex items-end justify-between">
              <p className="text-4xl font-bold">
                {percentage}%
              </p>

              <p className="text-sm text-slate-400">
                {completed}/
                {tasks.length}
              </p>
            </div>

            <div className="mt-5 h-2 rounded-full bg-slate-700">
              <div
                className="h-full rounded-full bg-white"
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function TasksPage({
  t,
  language,
  tasks,
  toggleTask,
  deleteTask,
  editTask,
  onCreate,
  dark,
}: {
  t: (typeof translations)[Language];
  language: Language;
  tasks: Task[];
  toggleTask: (id: string) => void | Promise<void>;
  deleteTask: (id: string) => void | Promise<void>;
  editTask: (task: Task) => void;
  onCreate: () => void;
  dark: boolean;
}) {
  return (
    <>
      <PageHeader
        title={t.allTasks}
        subtitle={t.everything}
        action={onCreate}
        actionText={t.create}
      />

      <Card dark={dark}>
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <EmptyState
              text={t.noTasks}
            />
          ) : (
            tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                t={t}
                language={language}
                toggleTask={
                  toggleTask
                }
                deleteTask={
                  deleteTask
                }
                editTask={
                  editTask
                }
                dark={dark}
              />
            ))
          )}
        </div>
      </Card>
    </>
  );
}

function ProjectsPage({
  t,
  language,
  projects,
  tasks,
  toggleProject,
  deleteProject,
  editProject,
  onCreate,
  dark,
}: {
  t: (typeof translations)[Language];
  language: Language;
  projects: Project[];
  tasks: Task[];
  toggleProject: (
    id: string
  ) => void | Promise<void>;
  deleteProject: (
    id: string
  ) => void | Promise<void>;
  editProject: (project: Project) => void;
  onCreate: () => void;
  dark: boolean;
}) {
  return (
    <>
      <PageHeader
        title={t.projects}
        subtitle={
          t.longTermPlans
        }
        action={onCreate}
        actionText={t.create}
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {projects.map(
          (project) => (
            <Card
              dark={dark}
              key={project.id}
            >
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs text-purple-700">
                    {t.project}
                  </span>

                  <h3 className="mt-4 text-lg font-semibold">
                    {project.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      toggleProject(
                        project.id
                      )
                    }
                    className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
                      project.completed
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300"
                    }`}
                    title={t.completed}
                  >
                    {project.completed
                      ? "✓"
                      : ""}
                  </button>

                  <button
                    onClick={() =>
                      deleteProject(
                        project.id
                      )
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                    title={t.delete ?? "Delete"}
                  >
                    ×
                  </button>
                </div>
              </div>

              <ProjectItem
                project={project}
                language={language}
                tasks={tasks.filter(
                  (task) => task.projectId === project.id
                )}
                t={t}
              />
            </Card>
          )
        )}
      </div>
    </>
  );
}

function CalendarPage({
  t,
  language,
  tasks,
  projects,
  onCreate,
  dark,
}: {
  t: (typeof translations)[Language];
  language: Language;
  tasks: Task[];
  projects: Project[];
  onCreate: () => void;
  dark: boolean;
}) {
  return (
    <>
      <PageHeader
        title={t.calendar}
        subtitle={t.schedule}
        action={onCreate}
        actionText={t.create}
      />

      <Card dark={dark}>
        <DynamicCalendar
          tasks={tasks}
          projects={projects}
          language={language}
          dark={dark}
        />
      </Card>
    </>
  );
}

function ClipboardPage({
  t,
  clipboardText,
  setClipboardText,
  dark,
}: {
  t: (typeof translations)[Language];
  clipboardText: string;
  setClipboardText: (
    value: string
  ) => void;
  dark: boolean;
}) {
  const [copied, setCopied] =
    useState(false);

  const copyText = async () => {
    if (!clipboardText.trim()) {
      return;
    }

    await navigator.clipboard.writeText(
      clipboardText
    );

    setCopied(true);

    setTimeout(
      () => setCopied(false),
      1500
    );
  };

  return (
    <>
      <PageHeader
        title={t.clipboard}
        subtitle={
          t.clipboardDescription
        }
      />

      <Card dark={dark}>
        <textarea
          value={clipboardText}
          onChange={(event) =>
            setClipboardText(
              event.target.value
            )
          }
          placeholder={t.pasteHere}
          className={`min-h-[550px] w-full resize-none bg-transparent outline-none ${
            dark
              ? "text-white"
              : "text-slate-700"
          }`}
        />

        <div className="mt-5 flex justify-end gap-2 border-t border-slate-200 pt-5">
          <button
            onClick={() =>
              setClipboardText("")
            }
            className="rounded-xl px-4 py-2 text-sm text-slate-400"
          >
            {t.clear}
          </button>

          <button
            onClick={copyText}
            className="rounded-xl bg-slate-900 px-5 py-2 text-sm text-white"
          >
            {copied
              ? t.copied
              : t.copy}
          </button>
        </div>
      </Card>
    </>
  );
}


function TrashPage({
  t,
  language,
  tasks,
  projects,
  restoreTask,
  restoreProject,
  permanentlyDeleteTask,
  permanentlyDeleteProject,
  dark,
}: {
  t: (typeof translations)[Language];
  language: Language;
  tasks: Task[];
  projects: Project[];
  restoreTask: (id: string) => void | Promise<void>;
  restoreProject: (id: string) => void | Promise<void>;
  permanentlyDeleteTask: (id: string) => void | Promise<void>;
  permanentlyDeleteProject: (id: string) => void | Promise<void>;
  dark: boolean;
}) {
  const empty = tasks.length === 0 && projects.length === 0;

  return (
    <>
      <PageHeader
        title={t.trash}
        subtitle={t.trashDescription}
      />

      {empty ? (
        <Card dark={dark}>
          <EmptyState text={t.emptyTrash} />
        </Card>
      ) : (
        <div className="space-y-6">
          {tasks.length > 0 && (
            <Card dark={dark}>
              <h3 className="mb-5 text-lg font-semibold">
                {t.taskType}
              </h3>

              <div className="space-y-3">
                {tasks.map((task) => {
                  const style = categoryStyles[task.category];

                  return (
                    <div
                      key={task.id}
                      className={`rounded-2xl border p-4 ${
                        dark
                          ? "border-slate-700"
                          : "border-slate-100"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">
                            {task.title}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="text-xs text-slate-400">
                              {formatDateRange(
                                task.startDate,
                                task.endDate,
                                language
                              )}
                            </span>

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs ${style.bg} ${style.text}`}
                            >
                              {getCategoryName(task.category, t)}
                            </span>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap justify-end gap-2">
                          <button
                            onClick={() => restoreTask(task.id)}
                            className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                          >
                            {t.restore}
                          </button>

                          <button
                            onClick={() =>
                              permanentlyDeleteTask(task.id)
                            }
                            className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100"
                          >
                            {t.permanentlyDelete}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {projects.length > 0 && (
            <Card dark={dark}>
              <h3 className="mb-5 text-lg font-semibold">
                {t.projectType}
              </h3>

              <div className="space-y-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={`rounded-2xl border p-4 ${
                      dark
                        ? "border-slate-700"
                        : "border-slate-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">
                          {project.title}
                        </p>

                        <p className="mt-2 text-xs text-slate-400">
                          {formatDateRange(
                            project.startDate,
                            project.endDate,
                            language
                          )}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-wrap justify-end gap-2">
                        <button
                          onClick={() => restoreProject(project.id)}
                          className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                        >
                          {t.restore}
                        </button>

                        <button
                          onClick={() =>
                            permanentlyDeleteProject(project.id)
                          }
                          className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100"
                        >
                          {t.permanentlyDelete}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </>
  );
}

function SettingsPage({
  t,
  language,
  theme,
  setLanguage,
  setTheme,
  dark,
  user,
  logout,
}: {
  t: (typeof translations)[Language];
  language: Language;
  theme: Theme;
  setLanguage: (
    language: Language
  ) => void | Promise<void>;
  setTheme: (
    theme: Theme
  ) => void | Promise<void>;
  dark: boolean;
  user: User;
  logout: () => Promise<void>;
}) {
  const themes: {
    value: Theme;
    label: string;
    preview: string;
  }[] = [
    {
      value: "default",
      label: t.defaultTheme,
      preview: "bg-[#f6f7fb]",
    },
    {
      value: "white",
      label: t.whiteTheme,
      preview: "bg-white",
    },
    {
      value: "warm",
      label: t.warmTheme,
      preview: "bg-[#f8f2e8]",
    },
    {
      value: "blue",
      label: t.blueTheme,
      preview: "bg-[#edf4ff]",
    },
    {
      value: "purple",
      label: t.purpleTheme,
      preview: "bg-[#f3efff]",
    },
    {
      value: "dark",
      label: t.darkTheme,
      preview: "bg-slate-900",
    },
  ];

  return (
    <>
      <PageHeader
        title={t.settings}
        subtitle={t.preferences}
      />

      <div className="space-y-6">
        <Card dark={dark}>
          <h3 className="text-lg font-semibold">
            {t.language}
          </h3>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["zh", "中文"],
              ["en", "English"],
              ["es", "Español"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() =>
                  setLanguage(
                    value as Language
                  )
                }
                className={`rounded-2xl border px-4 py-4 ${
                  language === value
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Card>

        <Card dark={dark}>
          <h3 className="text-lg font-semibold">
            {t.appearance}
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            {t.background}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {themes.map(
              (item) => (
                <button
                  key={item.value}
                  onClick={() =>
                    setTheme(
                      item.value
                    )
                  }
                  className={`flex items-center gap-4 rounded-2xl border p-4 ${
                    theme === item.value
                      ? "border-slate-900"
                      : "border-slate-200"
                  }`}
                >
                  <div
                    className={`h-12 w-12 rounded-2xl border ${item.preview}`}
                  />

                  <span>
                    {item.label}
                  </span>
                </button>
              )
            )}
          </div>
        </Card>

        <Card dark={dark}>
          <h3 className="text-lg font-semibold">
            {t.account}
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            {user.email}
          </p>

          <button
            onClick={logout}
            className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-medium text-red-600 transition hover:bg-red-100"
          >
            {t.logout}
          </button>
        </Card>
      </div>
    </>
  );
}

function CreateModal({
  t,
  projects,
  type,
  setType,
  onClose,
  onCreateTask,
  onCreateProject,
}: {
  t: (typeof translations)[Language];
  projects: Project[];
  type: "choose" | "task" | "project";
  setType: (
    type: "choose" | "task" | "project"
  ) => void;
  onClose: () => void;
  onCreateTask: (
    task: NewTask
  ) => void | Promise<void>;
  onCreateProject: (
    project: NewProject
  ) => void | Promise<void>;
}) {
  return (
    <div
      onMouseDown={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-0 backdrop-blur-sm sm:items-center sm:p-6"
    >
      <div
        onMouseDown={(event) =>
          event.stopPropagation()
        }
        className="w-full rounded-t-[32px] bg-white p-6 text-slate-900 shadow-2xl sm:max-w-lg sm:rounded-[32px]"
      >
        {type === "choose" && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  {t.create}
                </p>

                <h3 className="text-2xl font-bold">
                  {t.chooseCreateType}
                </h3>
              </div>

              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() =>
                  setType("task")
                }
                className="w-full rounded-2xl border border-slate-200 p-5 text-left transition hover:border-slate-400"
              >
                <p className="font-semibold">
                  ✓ {t.newTask}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  {
                    t.taskDescription
                  }
                </p>
              </button>

              <button
                onClick={() =>
                  setType("project")
                }
                className="w-full rounded-2xl border border-slate-200 p-5 text-left transition hover:border-slate-400"
              >
                <p className="font-semibold">
                  ◇ {t.newProject}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  {
                    t.projectDescription
                  }
                </p>
              </button>
            </div>
          </>
        )}

        {type === "task" && (
          <TaskForm
            t={t}
            projects={projects}
            onBack={() =>
              setType("choose")
            }
            onCreate={
              onCreateTask
            }
          />
        )}

        {type === "project" && (
          <ProjectForm
            t={t}
            onBack={() =>
              setType("choose")
            }
            onCreate={
              onCreateProject
            }
          />
        )}
      </div>
    </div>
  );
}

function TaskForm({
  t,
  projects,
  onBack,
  onCreate,
}: {
  t: (typeof translations)[Language];
  projects: Project[];
  onBack: () => void;
  onCreate: (
    task: NewTask
  ) => void | Promise<void>;
}) {
  const [title, setTitle] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [mode, setMode] =
    useState<
      "single" | "multi"
    >("single");

  const [
    startDate,
    setStartDate,
  ] = useState(TODAY);

  const [endDate, setEndDate] =
    useState(TODAY);

  const [time, setTime] =
    useState("");

  const [allDay, setAllDay] =
    useState(false);

  const [category, setCategory] =
    useState<CategoryName>(
      "study"
    );

  const [projectId, setProjectId] =
    useState<string | null>(null);

  const submit = (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    onCreate({
      title: title.trim(),
      description:
        description.trim(),
      startDate,
      endDate:
        mode === "single"
          ? startDate
          : endDate,
      time:
        allDay ? "" : time,
      allDay,
      category,
      completed: false,
      projectId,
    });
  };

  return (
    <form onSubmit={submit}>
      <ModalHeader
        title={t.newTask}
        onBack={onBack}
      />

      <div className="space-y-5">
        <input
          autoFocus
          value={title}
          onChange={(event) =>
            setTitle(
              event.target.value
            )
          }
          placeholder={t.taskName}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
        />

        <textarea
          value={description}
          onChange={(event) =>
            setDescription(
              event.target.value
            )
          }
          placeholder={`${t.description} (${t.optional})`}
          className="min-h-24 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
        />

        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("single");
              setEndDate(
                startDate
              );
            }}
            className={`rounded-xl px-4 py-2 ${
              mode === "single"
                ? "bg-white shadow-sm"
                : ""
            }`}
          >
            {t.singleDay}
          </button>

          <button
            type="button"
            onClick={() =>
              setMode("multi")
            }
            className={`rounded-xl px-4 py-2 ${
              mode === "multi"
                ? "bg-white shadow-sm"
                : ""
            }`}
          >
            {t.multiDay}
          </button>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-500">
            {mode === "single"
              ? t.date
              : t.startDate}
          </span>

          <input
            type="date"
            value={startDate}
            onChange={(event) => {
              setStartDate(
                event.target.value
              );

              if (
                mode ===
                "single"
              ) {
                setEndDate(
                  event.target.value
                );
              }
            }}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
          />
        </label>

        {mode === "multi" && (
          <label className="block">
            <span className="mb-2 block text-sm text-slate-500">
              {t.endDate}
            </span>

            <input
              type="date"
              min={startDate}
              value={endDate}
              onChange={(event) =>
                setEndDate(
                  event.target.value
                )
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
          </label>
        )}

        <label className="block">
          <span className="mb-2 block text-sm text-slate-500">
            {t.time}
          </span>

          <input
            type="time"
            value={time}
            disabled={allDay}
            onChange={(event) =>
              setTime(
                event.target.value
              )
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 disabled:opacity-40"
          />
        </label>

        <label className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
          <span>
            {t.allDay}
          </span>

          <input
            type="checkbox"
            checked={allDay}
            onChange={(event) =>
              setAllDay(
                event.target.checked
              )
            }
          />
        </label>

        <CategoryPicker
          t={t}
          value={category}
          setValue={setCategory}
        />

        <ProjectPicker
          t={t}
          projects={projects}
          value={projectId}
          setValue={setProjectId}
        />
      </div>

      <ModalActions
        cancel={t.cancel}
        submit={
          t.createTask
        }
        onCancel={onBack}
        disabled={
          !title.trim()
        }
      />
    </form>
  );
}

function ProjectForm({
  t,
  onBack,
  onCreate,
}: {
  t: (typeof translations)[Language];
  onBack: () => void;
  onCreate: (
    project: NewProject
  ) => void | Promise<void>;
}) {
  const [title, setTitle] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    startDate,
    setStartDate,
  ] = useState(TODAY);

  const [endDate, setEndDate] =
    useState("2026-08-30");

  const [category, setCategory] =
    useState<CategoryName>(
      "project"
    );

  const submit = (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    onCreate({
      title: title.trim(),
      description:
        description.trim(),
      startDate,
      endDate,
      category,
      completed: false,
      progress: 0,
    });
  };

  return (
    <form onSubmit={submit}>
      <ModalHeader
        title={t.newProject}
        onBack={onBack}
      />

      <div className="space-y-5">
        <input
          autoFocus
          value={title}
          onChange={(event) =>
            setTitle(
              event.target.value
            )
          }
          placeholder={
            t.projectName
          }
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
        />

        <textarea
          value={description}
          onChange={(event) =>
            setDescription(
              event.target.value
            )
          }
          placeholder={`${t.description} (${t.optional})`}
          className="min-h-24 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
        />

        <label className="block">
          <span className="mb-2 block text-sm text-slate-500">
            {t.startDate}
          </span>

          <input
            type="date"
            value={startDate}
            onChange={(event) =>
              setStartDate(
                event.target.value
              )
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-500">
            {t.endDate}
          </span>

          <input
            type="date"
            min={startDate}
            value={endDate}
            onChange={(event) =>
              setEndDate(
                event.target.value
              )
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
          />
        </label>

        <CategoryPicker
          t={t}
          value={category}
          setValue={setCategory}
        />
      </div>

      <ModalActions
        cancel={t.cancel}
        submit={
          t.createProject
        }
        onCancel={onBack}
        disabled={
          !title.trim()
        }
      />
    </form>
  );
}

function EditTaskModal({
  t,
  task,
  projects,
  onClose,
  onSave,
}: {
  t: (typeof translations)[Language];
  task: Task;
  projects: Project[];
  onClose: () => void;
  onSave: (changes: NewTask) => void | Promise<void>;
}) {
  const [title, setTitle] =
    useState(task.title);
  const [description, setDescription] =
    useState(task.description);
  const [mode, setMode] =
    useState<"single" | "multi">(
      task.startDate === task.endDate
        ? "single"
        : "multi"
    );
  const [startDate, setStartDate] =
    useState(task.startDate);
  const [endDate, setEndDate] =
    useState(task.endDate);
  const [time, setTime] =
    useState(task.time);
  const [allDay, setAllDay] =
    useState(task.allDay);
  const [category, setCategory] =
    useState<CategoryName>(task.category);
  const [projectId, setProjectId] =
    useState<string | null>(task.projectId);
  const [saving, setSaving] =
    useState(false);

  const submit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (!title.trim() || saving) {
      return;
    }

    setSaving(true);

    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        startDate,
        endDate:
          mode === "single"
            ? startDate
            : endDate,
        time: allDay ? "" : time,
        allDay,
        category,
        completed: task.completed,
        projectId,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onMouseDown={onClose}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/30 p-0 backdrop-blur-sm sm:items-center sm:p-6"
    >
      <form
        onSubmit={submit}
        onMouseDown={(event) =>
          event.stopPropagation()
        }
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-[32px] bg-white p-6 text-slate-900 shadow-2xl sm:max-w-lg sm:rounded-[32px]"
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold">
            {t.editTask}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-5">
          <input
            autoFocus
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder={t.taskName}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
          />

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder={`${t.description} (${t.optional})`}
            className="min-h-24 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
          />

          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("single");
                setEndDate(startDate);
              }}
              className={`rounded-xl px-4 py-2 ${
                mode === "single"
                  ? "bg-white shadow-sm"
                  : ""
              }`}
            >
              {t.singleDay}
            </button>

            <button
              type="button"
              onClick={() =>
                setMode("multi")
              }
              className={`rounded-xl px-4 py-2 ${
                mode === "multi"
                  ? "bg-white shadow-sm"
                  : ""
              }`}
            >
              {t.multiDay}
            </button>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-500">
              {mode === "single"
                ? t.date
                : t.startDate}
            </span>

            <input
              type="date"
              value={startDate}
              onChange={(event) => {
                const value =
                  event.target.value;
                setStartDate(value);

                if (
                  mode === "single" ||
                  endDate < value
                ) {
                  setEndDate(value);
                }
              }}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
          </label>

          {mode === "multi" && (
            <label className="block">
              <span className="mb-2 block text-sm text-slate-500">
                {t.endDate}
              </span>

              <input
                type="date"
                min={startDate}
                value={endDate}
                onChange={(event) =>
                  setEndDate(event.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              />
            </label>
          )}

          <label className="block">
            <span className="mb-2 block text-sm text-slate-500">
              {t.time}
            </span>

            <input
              type="time"
              value={time}
              disabled={allDay}
              onChange={(event) =>
                setTime(event.target.value)
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 disabled:opacity-40"
            />
          </label>

          <label className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <span>{t.allDay}</span>

            <input
              type="checkbox"
              checked={allDay}
              onChange={(event) =>
                setAllDay(event.target.checked)
              }
            />
          </label>

          <CategoryPicker
            t={t}
            value={category}
            setValue={setCategory}
          />

          <ProjectPicker
            t={t}
            projects={projects}
            value={projectId}
            setValue={setProjectId}
          />
        </div>

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 font-medium"
          >
            {t.cancel}
          </button>

          <button
            type="submit"
            disabled={!title.trim() || saving}
            className="flex-[1.5] rounded-2xl bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-30"
          >
            {t.saveChanges}
          </button>
        </div>
      </form>
    </div>
  );
}

function EditProjectModal({
  t,
  project,
  onClose,
  onSave,
}: {
  t: (typeof translations)[Language];
  project: Project;
  onClose: () => void;
  onSave: (changes: NewProject) => void | Promise<void>;
}) {
  const [title, setTitle] =
    useState(project.title);
  const [description, setDescription] =
    useState(project.description);
  const [startDate, setStartDate] =
    useState(project.startDate);
  const [endDate, setEndDate] =
    useState(project.endDate);
  const [category, setCategory] =
    useState<CategoryName>(project.category);
  const [progress, setProgress] =
    useState(project.progress);
  const [saving, setSaving] =
    useState(false);

  const submit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (!title.trim() || saving) {
      return;
    }

    setSaving(true);

    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        startDate,
        endDate,
        category,
        completed:
          progress === 100
            ? true
            : project.completed && progress === 100,
        progress,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onMouseDown={onClose}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/30 p-0 backdrop-blur-sm sm:items-center sm:p-6"
    >
      <form
        onSubmit={submit}
        onMouseDown={(event) =>
          event.stopPropagation()
        }
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-[32px] bg-white p-6 text-slate-900 shadow-2xl sm:max-w-lg sm:rounded-[32px]"
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold">
            {t.editProject}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-5">
          <input
            autoFocus
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder={t.projectName}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
          />

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder={`${t.description} (${t.optional})`}
            className="min-h-24 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
          />

          <label className="block">
            <span className="mb-2 block text-sm text-slate-500">
              {t.startDate}
            </span>

            <input
              type="date"
              value={startDate}
              onChange={(event) => {
                const value =
                  event.target.value;
                setStartDate(value);

                if (endDate < value) {
                  setEndDate(value);
                }
              }}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-500">
              {t.endDate}
            </span>

            <input
              type="date"
              min={startDate}
              value={endDate}
              onChange={(event) =>
                setEndDate(event.target.value)
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
          </label>

          <CategoryPicker
            t={t}
            value={category}
            setValue={setCategory}
          />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-slate-500">
                {t.todayProgress}
              </span>

              <span className="text-sm font-semibold">
                {progress}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={(event) =>
                setProgress(
                  Number(event.target.value)
                )
              }
              className="w-full accent-slate-900"
            />
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 font-medium"
          >
            {t.cancel}
          </button>

          <button
            type="submit"
            disabled={!title.trim() || saving}
            className="flex-[1.5] rounded-2xl bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-30"
          >
            {t.saveChanges}
          </button>
        </div>
      </form>
    </div>
  );
}

function ProjectPicker({
  t,
  projects,
  value,
  setValue,
}: {
  t: (typeof translations)[Language];
  projects: Project[];
  value: string | null;
  setValue: (value: string | null) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-500">
        {t.belongProject}
      </span>

      <select
        value={value ?? ""}
        onChange={(event) =>
          setValue(
            event.target.value
              ? event.target.value
              : null
          )
        }
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
      >
        <option value="">
          {t.noProject}
        </option>

        {projects
          .filter((project) => !project.completed)
          .map((project) => (
            <option
              key={project.id}
              value={project.id}
            >
              {project.title}
            </option>
          ))}
      </select>
    </label>
  );
}

function CategoryPicker({
  t,
  value,
  setValue,
}: {
  t: (typeof translations)[Language];
  value: CategoryName;
  setValue: (
    value: CategoryName
  ) => void;
}) {
  const items: {
    value: CategoryName;
    label: string;
  }[] = [
    {
      value: "study",
      label: t.study,
    },
    {
      value: "work",
      label: t.work,
    },
    {
      value: "project",
      label:
        t.projectCategory,
    },
    {
      value: "health",
      label: t.health,
    },
    {
      value: "life",
      label: t.life,
    },
  ];

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        {t.category}
      </p>

      <div className="flex flex-wrap gap-2">
        {items.map(
          (item) => {
            const style =
              categoryStyles[
                item.value
              ];

            return (
              <button
                type="button"
                key={item.value}
                onClick={() =>
                  setValue(
                    item.value
                  )
                }
                className={`rounded-full px-4 py-2 text-sm ${
                  value ===
                  item.value
                    ? `${style.bg} ${style.text}`
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {item.label}
              </button>
            );
          }
        )}
      </div>
    </div>
  );
}

function TaskItem({
  task,
  t,
  language,
  toggleTask,
  deleteTask,
  editTask,
  dark,
}: {
  task: Task;
  t: (typeof translations)[Language];
  language: Language;
  toggleTask: (
    id: string
  ) => void | Promise<void>;
  deleteTask: (
    id: string
  ) => void | Promise<void>;
  editTask: (task: Task) => void;
  dark: boolean;
}) {
  const style =
    categoryStyles[
      task.category
    ];

  return (
    <div
      className={`flex w-full items-center gap-2 rounded-2xl border p-2 transition ${
        dark
          ? "border-slate-700 hover:bg-slate-800"
          : "border-slate-100 hover:bg-slate-50"
      }`}
    >
      <button
        onClick={() =>
          toggleTask(task.id)
        }
        className="flex min-w-0 flex-1 items-center gap-4 p-2 text-left"
      >
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
            task.completed
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-300"
          }`}
        >
          {task.completed
            ? "✓"
            : ""}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`font-medium ${
              task.completed
                ? "text-slate-400 line-through"
                : ""
            }`}
          >
            {task.title}
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            <span className="text-xs text-slate-400">
              {formatDateRange(
                task.startDate,
                task.endDate,
                language
              )}
            </span>

            {task.time && (
              <span className="text-xs text-slate-400">
                {task.time}
              </span>
            )}

            <span
              className={`rounded-full px-2.5 py-1 text-xs ${style.bg} ${style.text}`}
            >
              {getCategoryName(
                task.category,
                t
              )}
            </span>
          </div>
        </div>
      </button>

      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={() =>
            editTask(task)
          }
          className="flex h-9 w-9 items-center justify-center rounded-xl text-sm text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          title={t.edit}
        >
          ✎
        </button>

        <button
          onClick={() =>
            deleteTask(task.id)
          }
          className="flex h-9 w-9 items-center justify-center rounded-xl text-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
          title={t.delete}
        >
          ×
        </button>
      </div>
    </div>
  );
}

function ProjectItem({
  project,
  language,
  tasks = [],
  t,
}: {
  project: Project;
  language: Language;
  tasks?: Task[];
  t?: (typeof translations)[Language];
}) {
  const completedTasks =
    tasks.filter((task) => task.completed).length;

  const automaticProgress =
    tasks.length > 0
      ? Math.round(
          (completedTasks / tasks.length) * 100
        )
      : project.progress;

  return (
    <div>
      <div className="mb-3 flex justify-between">
        <p className="text-xs text-slate-400">
          {formatDateRange(
            project.startDate,
            project.endDate,
            language
          )}
        </p>

        <span className="text-sm font-semibold text-slate-500">
          {automaticProgress}%
        </span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-900"
          style={{
            width: `${automaticProgress}%`,
          }}
        />
      </div>

      {t && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-medium text-slate-400">
            {t.subTasks}
          </p>

          {tasks.length === 0 ? (
            <p className="text-xs text-slate-400">
              {t.noSubTasks}
            </p>
          ) : (
            <div className="space-y-2">
              {tasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                      task.completed
                        ? "border-slate-900 bg-slate-900 text-[10px] text-white"
                        : "border-slate-300"
                    }`}
                  >
                    {task.completed ? "✓" : ""}
                  </span>

                  <span
                    className={
                      task.completed
                        ? "text-slate-400 line-through"
                        : ""
                    }
                  >
                    {task.title}
                  </span>
                </div>
              ))}

              {tasks.length > 5 && (
                <p className="text-xs text-slate-400">
                  +{tasks.length - 5}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SmallCalendar({
  language,
}: {
  language: Language;
}) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const days = createMonthCalendar(month);
  const today = TODAY;

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={() =>
            setMonth((current) =>
              addMonths(current, -1)
            )
          }
          className="flex h-9 w-9 items-center justify-center rounded-xl text-xl text-slate-400 transition hover:bg-slate-100"
        >
          ‹
        </button>

        <p className="font-semibold">
          {formatMonthTitle(month, language)}
        </p>

        <button
          onClick={() =>
            setMonth((current) =>
              addMonths(current, 1)
            )
          }
          className="flex h-9 w-9 items-center justify-center rounded-xl text-xl text-slate-400 transition hover:bg-slate-100"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs text-slate-400">
        {getWeekdayLabels(language, true).map((day, index) => (
          <div
            key={`${day}-${index}`}
            className="py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((dayInfo, index) => {
          const isToday =
            dayInfo.dateString === today;

          return (
            <button
              key={index}
              onClick={() => {
                if (dayInfo.currentMonth) return;
                setMonth(startOfMonth(dayInfo.date));
              }}
              className={`flex aspect-square items-center justify-center rounded-xl text-sm transition ${
                isToday
                  ? "bg-slate-900 font-semibold text-white"
                  : dayInfo.currentMonth
                    ? "text-slate-700 hover:bg-slate-100"
                    : "text-slate-300 hover:bg-slate-50"
              }`}
            >
              {dayInfo.day}
            </button>
          );
        })}
      </div>
    </>
  );
}

function DynamicCalendar({
  tasks,
  projects,
  language,
  dark,
}: {
  tasks: Task[];
  projects: Project[];
  language: Language;
  dark: boolean;
}) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const days = createMonthCalendar(month);

  return (
    <>
      <div className="mb-7 flex items-center justify-between">
        <button
          onClick={() =>
            setMonth((current) =>
              addMonths(current, -1)
            )
          }
          className={`rounded-xl px-4 py-2 text-xl transition ${
            dark
              ? "text-slate-400 hover:bg-slate-800"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          ‹
        </button>

        <div className="text-center">
          <h3 className="text-xl font-semibold">
            {formatMonthTitle(month, language)}
          </h3>

          <button
            onClick={() =>
              setMonth(startOfMonth(new Date()))
            }
            className="mt-1 text-xs font-medium text-slate-400 hover:text-slate-600"
          >
            {language === "zh"
              ? "今天"
              : language === "es"
                ? "Hoy"
                : "Today"}
          </button>
        </div>

        <button
          onClick={() =>
            setMonth((current) =>
              addMonths(current, 1)
            )
          }
          className={`rounded-xl px-4 py-2 text-xl transition ${
            dark
              ? "text-slate-400 hover:bg-slate-800"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-100 pb-3 text-center text-xs text-slate-400">
        {getWeekdayLabels(language, false).map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((dayInfo, index) => {
          const date = dayInfo.dateString;

          const dayTasks = tasks.filter(
            (task) =>
              task.startDate <= date &&
              task.endDate >= date
          );

          const dayProjects = projects.filter(
            (project) =>
              project.startDate <= date &&
              project.endDate >= date
          );

          const isToday = date === TODAY;

          return (
            <div
              key={index}
              className={`min-h-[110px] border-b border-r p-2 md:min-h-[140px] ${
                dark
                  ? "border-slate-800"
                  : "border-slate-100"
              } ${
                dayInfo.currentMonth
                  ? ""
                  : dark
                    ? "bg-slate-950/30"
                    : "bg-slate-50/60"
              }`}
            >
              <div
                className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                  isToday
                    ? "bg-slate-900 font-semibold text-white"
                    : dayInfo.currentMonth
                      ? ""
                      : "text-slate-300"
                }`}
              >
                {dayInfo.day}
              </div>

              <div className="space-y-1">
                {dayProjects
                  .slice(0, 2)
                  .map((project) => (
                    <div
                      key={`project-${project.id}`}
                      className="truncate rounded-md bg-purple-100 px-2 py-1 text-[10px] font-medium text-purple-700"
                      title={project.title}
                    >
                      {project.title}
                    </div>
                  ))}

                {dayTasks
                  .slice(0, 3)
                  .map((task) => {
                    const style =
                      categoryStyles[
                        task.category
                      ];

                    return (
                      <div
                        key={`task-${task.id}`}
                        className={`truncate rounded-md px-2 py-1 text-[10px] ${style.bg} ${style.text}`}
                        title={task.title}
                      >
                        {task.completed ? "✓ " : ""}
                        {task.title}
                      </div>
                    );
                  })}

                {dayProjects.length + dayTasks.length > 5 && (
                  <p className="px-1 text-[10px] text-slate-400">
                    +{dayProjects.length + dayTasks.length - 5}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function SidebarItem({
  label,
  active = false,
  onClick,
  dark,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  dark: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium ${
        active
          ? "bg-slate-900 text-white"
          : dark
            ? "text-slate-400 hover:bg-slate-800"
            : "text-slate-500 hover:bg-slate-100"
      }`}
    >
      {label}
    </button>
  );
}

function MobileButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-2 text-xs ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-500"
      }`}
    >
      {label}
    </button>
  );
}

function Card({
  children,
  dark,
}: {
  children: React.ReactNode;
  dark: boolean;
}) {
  return (
    <section
      className={`rounded-[28px] p-5 shadow-sm md:p-6 ${
        dark
          ? "bg-slate-900"
          : "bg-white"
      }`}
    >
      {children}
    </section>
  );
}

function PageHeader({
  title,
  subtitle,
  action,
  actionText,
}: {
  title: string;
  subtitle?: string;
  action?: () => void;
  actionText?: string;
}) {
  return (
    <header className="mb-8 flex items-center justify-between">
      <div>
        {subtitle && (
          <p className="text-sm text-slate-400">
            {subtitle}
          </p>
        )}

        <h2 className="mt-1 text-3xl font-bold md:text-4xl">
          {title}
        </h2>
      </div>

      {action && (
        <button
          onClick={action}
          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
        >
          + {actionText}
        </button>
      )}
    </header>
  );
}

function ModalHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <button
        type="button"
        onClick={onBack}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100"
      >
        ‹
      </button>

      <h3 className="text-2xl font-bold">
        {title}
      </h3>
    </div>
  );
}

function ModalActions({
  cancel,
  submit,
  onCancel,
  disabled,
}: {
  cancel: string;
  submit: string;
  onCancel: () => void;
  disabled: boolean;
}) {
  return (
    <div className="mt-8 flex gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 font-medium"
      >
        {cancel}
      </button>

      <button
        type="submit"
        disabled={disabled}
        className="flex-[1.5] rounded-2xl bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-30"
      >
        {submit}
      </button>
    </div>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
      {text}
    </div>
  );
}

function getCategoryName(
  category: CategoryName,
  t: (typeof translations)[Language]
) {
  if (category === "study") {
    return t.study;
  }

  if (category === "work") {
    return t.work;
  }

  if (category === "project") {
    return t.projectCategory;
  }

  if (category === "health") {
    return t.health;
  }

  return t.life;
}

function getLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function startOfMonth(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1,
    12,
    0,
    0
  );
}

function addMonths(date: Date, amount: number) {
  return new Date(
    date.getFullYear(),
    date.getMonth() + amount,
    1,
    12,
    0,
    0
  );
}

function createMonthCalendar(month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  // Monday-first calendar.
  const firstWeekday =
    (new Date(year, monthIndex, 1, 12).getDay() + 6) % 7;

  const startDate = new Date(
    year,
    monthIndex,
    1 - firstWeekday,
    12
  );

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    return {
      date,
      dateString: getLocalDateString(date),
      day: date.getDate(),
      currentMonth: date.getMonth() === monthIndex,
    };
  });
}

function formatMonthTitle(
  date: Date,
  language: Language
) {
  const locale =
    language === "zh"
      ? "zh-CN"
      : language === "es"
        ? "es-ES"
        : "en-US";

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
  }).format(date);
}

function getWeekdayLabels(
  language: Language,
  short: boolean
) {
  if (short) {
    if (language === "zh") {
      return ["一", "二", "三", "四", "五", "六", "日"];
    }

    if (language === "es") {
      return ["L", "M", "X", "J", "V", "S", "D"];
    }

    return ["M", "T", "W", "T", "F", "S", "S"];
  }

  if (language === "zh") {
    return ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  }

  if (language === "es") {
    return ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  }

  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
}

function formatDateRange(
  start: string,
  end: string,
  language: Language
) {
  if (start === end) {
    return formatShortDate(
      start,
      language
    );
  }

  return `${formatShortDate(
    start,
    language
  )} → ${formatShortDate(
    end,
    language
  )}`;
}

function formatShortDate(
  date: string,
  language: Language
) {
  const locale =
    language === "zh"
      ? "zh-CN"
      : language === "es"
        ? "es-ES"
        : "en-US";

  return new Intl.DateTimeFormat(
    locale,
    {
      month: "short",
      day: "numeric",
    }
  ).format(
    new Date(
      `${date}T12:00:00`
    )
  );
}

function formatFullDate(
  date: string,
  language: Language
) {
  const locale =
    language === "zh"
      ? "zh-CN"
      : language === "es"
        ? "es-ES"
        : "en-US";

  return new Intl.DateTimeFormat(
    locale,
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  ).format(
    new Date(
      `${date}T12:00:00`
    )
  );
}