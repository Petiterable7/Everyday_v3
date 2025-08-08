import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Edit, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task, UpdateTask } from "@shared/schema";

interface TaskItemProps {
  task: Task;
  onTaskUpdate: () => void;
}

const categoryColors = {
  work: "bg-blue-100 text-blue-700",
  personal: "bg-green-100 text-green-700", 
  health: "bg-purple-100 text-purple-700",
  urgent: "bg-red-100 text-red-700"
};

const categoryEmojis = {
  work: "💼",
  personal: "🏠", 
  health: "💪",
  urgent: "🔥"
};

export function TaskItem({ task, onTaskUpdate }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleTaskMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/api/tasks/${task.id}/toggle`);
      return response.json();
    },
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      onTaskUpdate();
      
      if (updatedTask.completed) {
        // Show success toast for completion
        toast({
          title: "Task completed! 🎉",
          description: "Great job staying productive!",
        });
      }
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = `${import.meta.env.VITE_API_URL}/api/login`;
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (updates: UpdateTask) => {
      const response = await apiRequest("PATCH", `/api/tasks/${task.id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      onTaskUpdate();
      setIsEditing(false);
      toast({
        title: "Task updated! ✨",
        description: "Your changes have been saved.",
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
          window.location.href = `${import.meta.env.VITE_API_URL}/api/login`;
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/tasks/${task.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      onTaskUpdate();
      toast({
        title: "Task deleted",
        description: "Task has been removed successfully.",
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
          window.location.href = `${import.meta.env.VITE_API_URL}/api/login`;
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggleComplete = () => {
    toggleTaskMutation.mutate();
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditText(task.text);
  };

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== task.text) {
      updateTaskMutation.mutate({ text: editText.trim() });
    } else {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(task.text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate();
    }
  };

  return (
    <div 
      className={cn(
        "flex items-center space-x-4 p-4 rounded-xl border transition-all duration-300 hover:transform hover:translate-x-1",
        task.completed 
          ? "bg-emerald-50 border-emerald-200 hover:shadow-md hover:shadow-emerald-100" 
          : "bg-white border-gray-200 hover:border-purple-300 hover:shadow-md hover:shadow-purple-100"
      )}
      data-testid={`task-item-${task.id}`}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggleComplete}
        disabled={toggleTaskMutation.isPending}
        className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 hover:scale-110",
          task.completed
            ? "bg-gradient-to-br from-emerald-400 to-green-500 border-emerald-400"
            : "border-gray-300 hover:border-purple-400"
        )}
        data-testid={`checkbox-task-${task.id}`}
      >
        {task.completed && <Check className="h-3 w-3 text-white" />}
      </button>

      {/* Task Content */}
      <div className="flex-1">
        {isEditing ? (
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSaveEdit}
            className="text-gray-800 font-medium border-purple-200 focus:ring-2 focus:ring-purple-500"
            autoFocus
            data-testid={`input-edit-task-${task.id}`}
          />
        ) : (
          <div>
            <div className="flex items-center space-x-2">
              <span 
                className={cn(
                  "font-medium transition-all duration-300",
                  task.completed 
                    ? "text-gray-600 line-through" 
                    : "text-gray-800"
                )}
                data-testid={`text-task-${task.id}`}
              >
                {task.text}
              </span>
              {task.category && (
                <span 
                  className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    categoryColors[task.category as keyof typeof categoryColors] || "bg-gray-100 text-gray-700"
                  )}
                  data-testid={`category-task-${task.id}`}
                >
                  {categoryEmojis[task.category as keyof typeof categoryEmojis]} {task.category}
                </span>
              )}
              {task.category === "urgent" && (
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                  🔥 Urgent
                </span>
              )}
            </div>
            {(task.dueTime || task.notes || task.createdAt) && (
              <div className="text-xs text-gray-500 mt-1 flex items-center space-x-2">
                {task.dueTime && (
                  <>
                    <span data-testid={`due-time-task-${task.id}`}>Due by {task.dueTime}</span>
                    {(task.notes || task.createdAt) && <span className="w-1 h-1 bg-gray-400 rounded-full"></span>}
                  </>
                )}
                {task.notes && (
                  <>
                    <span data-testid={`notes-task-${task.id}`}>{task.notes}</span>
                    {task.createdAt && <span className="w-1 h-1 bg-gray-400 rounded-full"></span>}
                  </>
                )}
                {task.createdAt && !task.dueTime && !task.notes && (
                  <span data-testid={`created-task-${task.id}`}>
                    Added {format(new Date(task.createdAt), "MMM d 'at' h:mm a")}
                  </span>
                )}
                {task.completed && task.updatedAt && (
                  <>
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <span data-testid={`completed-task-${task.id}`}>
                      Completed {format(new Date(task.updatedAt), "MMM d 'at' h:mm a")}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!isEditing && (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              task.completed 
                ? "hover:bg-emerald-200" 
                : "hover:bg-gray-200"
            )}
            data-testid={`button-edit-task-${task.id}`}
          >
            <Edit className={cn(
              "h-4 w-4",
              task.completed ? "text-emerald-600" : "text-gray-600"
            )} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleteTaskMutation.isPending}
            className="p-1.5 hover:bg-red-200 rounded-lg transition-colors"
            data-testid={`button-delete-task-${task.id}`}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      )}
    </div>
  );
}
