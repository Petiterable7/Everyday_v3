import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@shared/schema";

interface CalendarPanelProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

type ViewMode = "month" | "week" | "day";

export function CalendarPanel({ selectedDate, onDateSelect }: CalendarPanelProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");

  const { data: allTasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get tasks count for each day
  const getTasksForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return allTasks.filter(task => task.date === dateStr);
  };

  const getCompletedTasksForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const dayTasks = allTasks.filter(task => task.date === dateStr);
    return dayTasks.filter(task => task.completed).length;
  };

  const getTotalTasksForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return allTasks.filter(task => task.date === dateStr).length;
  };

  // Calculate today's progress
  const todayTasks = getTasksForDate(new Date());
  const completedToday = todayTasks.filter(task => task.completed).length;
  const totalToday = todayTasks.length;
  const progressPercentage = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  // Generate calendar grid with padding days
  const startDate = monthStart;
  const startWeekday = getDay(startDate);
  const calendarDays = [];

  // Add padding days from previous month
  for (let i = 0; i < startWeekday; i++) {
    const paddingDate = new Date(monthStart);
    paddingDate.setDate(paddingDate.getDate() - (startWeekday - i));
    calendarDays.push({ date: paddingDate, isCurrentMonth: false });
  }

  // Add current month days
  monthDays.forEach(date => {
    calendarDays.push({ date, isCurrentMonth: true });
  });

  // Add padding days from next month to complete the grid
  const remainingDays = 42 - calendarDays.length; // 6 weeks * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    const paddingDate = new Date(monthEnd);
    paddingDate.setDate(paddingDate.getDate() + i);
    calendarDays.push({ date: paddingDate, isCurrentMonth: false });
  }

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <div className="lg:col-span-1 space-y-6">
      {/* View Toggle */}
      <Card className="bg-white/70 backdrop-blur-md border-purple-100 shadow-lg shadow-purple-100/50">
        <CardContent className="p-6">
          <div className="flex space-x-2 mb-4">
            <Button
              variant={viewMode === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("month")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                viewMode === "month" 
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-105" 
                  : "border-purple-200 hover:bg-purple-50"
              )}
              data-testid="button-month-view"
            >
              Month
            </Button>
            <Button
              variant={viewMode === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("week")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                viewMode === "week" 
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-105" 
                  : "border-purple-200 hover:bg-purple-50"
              )}
              data-testid="button-week-view"
            >
              Week
            </Button>
            <Button
              variant={viewMode === "day" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("day")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                viewMode === "day" 
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-105" 
                  : "border-purple-200 hover:bg-purple-50"
              )}
              data-testid="button-day-view"
            >
              Day
            </Button>
          </div>
          
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={previousMonth}
              className="p-2 hover:bg-purple-100 rounded-full transition-colors"
              data-testid="button-previous-month"
            >
              <ChevronLeft className="h-4 w-4 text-purple-600" />
            </Button>
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextMonth}
              className="p-2 hover:bg-purple-100 rounded-full transition-colors"
              data-testid="button-next-month"
            >
              <ChevronRight className="h-4 w-4 text-purple-600" />
            </Button>
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(({ date, isCurrentMonth }, index) => {
              const tasksCount = getTotalTasksForDate(date);
              const isSelected = isSameDay(date, selectedDate);
              const isTodayDate = isToday(date);
              
              return (
                <button
                  key={index}
                  onClick={() => onDateSelect(date)}
                  className={cn(
                    "h-10 flex items-center justify-center text-sm rounded-lg cursor-pointer transition-all duration-300 relative",
                    isCurrentMonth 
                      ? "text-gray-700 hover:bg-purple-100" 
                      : "text-gray-300",
                    isSelected && "bg-gradient-to-br from-purple-500 to-blue-500 text-white transform scale-105 shadow-lg",
                    isTodayDate && !isSelected && "bg-purple-100 font-semibold text-purple-800",
                    "hover:transform hover:-translate-y-0.5 hover:shadow-md hover:shadow-purple-200"
                  )}
                  data-testid={`calendar-day-${format(date, "yyyy-MM-dd")}`}
                >
                  {format(date, "d")}
                  {tasksCount > 0 && (
                    <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-gradient-to-r from-amber-400 to-pink-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Stats */}
      <Card className="bg-white/70 backdrop-blur-md border-purple-100 shadow-lg shadow-purple-100/50">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Today's Progress
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="text-sm font-semibold text-emerald-600" data-testid="text-progress-completed">
                {completedToday} of {totalToday}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{totalToday > 0 ? "Keep going! 🎉" : "Add some tasks to get started!"}</span>
              <span data-testid="text-progress-percentage">{Math.round(progressPercentage)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
