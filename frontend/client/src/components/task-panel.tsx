import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";  
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskItem } from "./task-item";
import { CategoryManager } from "./category-manager";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { CalendarPlus, Palette, SortAsc } from "lucide-react";
import type { Task, InsertTask, Category } from "@shared/schema";

interface TaskPanelProps {
  selectedDate: Date;
}

export function TaskPanel({ selectedDate }: TaskPanelProps) {
  const [newTaskText, setNewTaskText] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [newTaskCategoryId, setNewTaskCategoryId] = useState<string | null>(null);
  const [filterCategoryId, setFilterCategoryId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"created" | "category" | "completed">("created");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const formattedDate = format(selectedDate, "EEEE, MMMM do");

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks", { date: dateStr }],
    queryFn: async () => {
      console.log("🚀 TASKS: Fetching tasks for", dateStr);
      try {
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks?date=${dateStr}`, {
          credentials: "include",
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        console.log("🚀 TASKS: Response status:", response.status);
        
        if (response.status === 401) {
          console.log("🚀 TASKS: Unauthorized, returning empty tasks");
          return [];
        }
        if (!response.ok) {
          console.log("🚀 TASKS: Backend error, returning empty tasks");
          return [];
        }
        const data = await response.json();
        console.log("🚀 TASKS: Got tasks:", data);
        return data;
      } catch (error) {
        console.log("🚀 TASKS: Error fetching tasks, returning empty array:", error);
        return []; // Return empty array instead of throwing
      }
    },
    retry: false,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      console.log("🚀 CATEGORIES: Fetching categories");
      try {
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categories`, {
          credentials: "include",
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        console.log("🚀 CATEGORIES: Response status:", response.status);
        
        if (!response.ok) {
          console.log("🚀 CATEGORIES: Backend error, returning empty categories");
          return [];
        }
        const data = await response.json();
        console.log("🚀 CATEGORIES: Got categories:", data);
        return data;
      } catch (error) {
        console.log("🚀 CATEGORIES: Error fetching categories, returning empty array:", error);
        return [];
      }
    },
    retry: false,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: InsertTask) => {
      const response = await apiRequest("POST", "/api/tasks", taskData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setNewTaskText("");
      setNewTaskCategoryId(null);
      toast({
        title: "Task created! ✨",
        description: "Your new task has been added successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    createTaskMutation.mutate({
      text: newTaskText.trim(),
      date: dateStr,
      categoryId: newTaskCategoryId || undefined,
      completed: false,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  // Filter and sort tasks
  let filteredTasks = tasks;
  if (filterCategoryId) {
    filteredTasks = tasks.filter(task => task.categoryId === filterCategoryId);
  }

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case "completed":
        return (a.completed ? 1 : 0) - (b.completed ? 1 : 0);
      case "category":
        const aCategoryName = (a as any).category?.name || "";
        const bCategoryName = (b as any).category?.name || "";
        return aCategoryName.localeCompare(bCategoryName);
      default:
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
  });

  const taskCount = tasks.length;
  const completedCount = tasks.filter(task => task.completed).length;

  if (isLoading) {
    return (
      <div className="lg:col-span-2">
        <Card className="bg-white/70 backdrop-blur-md border-purple-100 shadow-lg shadow-purple-100/50 h-full flex items-center justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center animate-pulse">
            <CalendarPlus className="h-8 w-8 text-white" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2">
      <Card className="bg-white/70 backdrop-blur-md border-purple-100 shadow-lg shadow-purple-100/50 h-full flex flex-col">
        {/* Task Panel Header */}
        <div className="p-6 border-b border-purple-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {formattedDate}
              </h2>
              <p className="text-sm text-gray-500" data-testid="text-task-count">
                {taskCount} task{taskCount !== 1 ? 's' : ''} for today
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <CategoryManager />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortBy(sortBy === "created" ? "category" : sortBy === "category" ? "completed" : "created")}
                className="p-2 hover:bg-purple-100 rounded-full transition-colors"
                data-testid="button-sort-tasks"
              >
                <SortAsc className="h-4 w-4 text-purple-600" />
              </Button>
            </div>
          </div>
          
          {/* Add Task Form */}
          <form onSubmit={handleSubmit} className="space-y-3 mb-4">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Add a new task..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="px-4 py-3 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  data-testid="input-new-task"
                />
              </div>
              <Select
                value={newTaskCategoryId || "none"}
                onValueChange={(value) => setNewTaskCategoryId(value === "none" ? null : value)}
              >
                <SelectTrigger className="w-40 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white/50 backdrop-blur-sm" data-testid="select-task-category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <span className={`px-2 py-1 rounded text-xs ${category.color}`}>
                        {category.emoji} {category.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="submit"
                disabled={!newTaskText.trim() || createTaskMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none"
                data-testid="button-add-task"
              >
                {createTaskMutation.isPending ? "Adding..." : "Add Task"}
              </Button>
            </div>
          </form>
          
          {/* Task Filter Categories */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterCategoryId === null ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterCategoryId(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filterCategoryId === null
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                  : "border-purple-200 hover:bg-purple-50"
              }`}
              data-testid="filter-all"
            >
              All ({taskCount})
            </Button>
            {categories.map((category) => {
              const categoryTasks = tasks.filter(task => task.categoryId === category.id);
              return (
                <Button
                  key={category.id}
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterCategoryId(filterCategoryId === category.id ? null : category.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    filterCategoryId === category.id
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                      : category.color
                  }`}
                  data-testid={`filter-${category.id}`}
                >
                  {category.emoji} {category.name} ({categoryTasks.length})
                </Button>
              );
            })}
          </div>
        </div>
        
        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-6">
          {sortedTasks.length > 0 ? (
            <div className="space-y-3">
              {sortedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onTaskUpdate={() => {
                    queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
                  }}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarPlus className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {filterCategoryId ? `No tasks for this category` : "No tasks for this day"}
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                {filterCategoryId 
                  ? `Add your first task for this category to get organized!`
                  : "Add your first task to get started!"
                }
              </p>
              <Button
                onClick={() => document.querySelector<HTMLInputElement>('[data-testid="input-new-task"]')?.focus()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-300 shadow-lg"
                data-testid="button-focus-input"
              >
                Create Task
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
