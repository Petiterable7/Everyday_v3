import {
  tasks,
  users,
  categories,
  type User,
  type UpsertUser,
  type InsertTask,
  type UpdateTask,
  type Task,
  type InsertCategory,
  type UpdateCategory,
  type Category,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Category operations
  getCategories(userId: string): Promise<Category[]>;
  createCategory(userId: string, category: InsertCategory): Promise<Category>;
  updateCategory(categoryId: string, userId: string, updates: UpdateCategory): Promise<Category | undefined>;
  deleteCategory(categoryId: string, userId: string): Promise<boolean>;
  
  // Task operations
  getTasksByUserAndDate(userId: string, date: string): Promise<Task[]>;
  getTasksByUser(userId: string): Promise<Task[]>;
  createTask(userId: string, task: InsertTask): Promise<Task>;
  updateTask(taskId: string, userId: string, updates: UpdateTask): Promise<Task | undefined>;
  deleteTask(taskId: string, userId: string): Promise<boolean>;
  toggleTaskComplete(taskId: string, userId: string): Promise<Task | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    
    // Initialize default categories for new users
    const existingCategories = await this.getCategories(user.id);
    if (existingCategories.length === 0) {
      await this.initializeDefaultCategories(user.id);
    }
    
    return user;
  }

  // Category operations
  async getCategories(userId: string): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(desc(categories.createdAt));
  }

  async createCategory(userId: string, category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values({ ...category, userId })
      .returning();
    return newCategory;
  }

  async updateCategory(categoryId: string, userId: string, updates: UpdateCategory): Promise<Category | undefined> {
    const [updatedCategory] = await db
      .update(categories)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(categoryId: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  async initializeDefaultCategories(userId: string): Promise<Category[]> {
    const defaultCategories = [
      { name: "work", emoji: "💼", color: "bg-blue-100 text-blue-700" },
      { name: "personal", emoji: "🏠", color: "bg-green-100 text-green-700" },
      { name: "health", emoji: "💪", color: "bg-purple-100 text-purple-700" },
      { name: "urgent", emoji: "🔥", color: "bg-red-100 text-red-700" },
    ];

    const createdCategories = [];
    for (const category of defaultCategories) {
      const [newCategory] = await db
        .insert(categories)
        .values({ ...category, userId })
        .returning();
      createdCategories.push(newCategory);
    }
    return createdCategories;
  }

  // Task operations
  async getTasksByUserAndDate(userId: string, date: string): Promise<Task[]> {
    return await db
      .select({
        id: tasks.id,
        userId: tasks.userId,
        date: tasks.date,
        text: tasks.text,
        completed: tasks.completed,
        categoryId: tasks.categoryId,
        dueTime: tasks.dueTime,
        notes: tasks.notes,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          emoji: categories.emoji,
          color: categories.color,
        }
      })
      .from(tasks)
      .leftJoin(categories, eq(tasks.categoryId, categories.id))
      .where(and(eq(tasks.userId, userId), eq(tasks.date, date)))
      .orderBy(desc(tasks.createdAt));
  }

  async getTasksByUser(userId: string): Promise<Task[]> {
    return await db
      .select({
        id: tasks.id,
        userId: tasks.userId,
        date: tasks.date,
        text: tasks.text,
        completed: tasks.completed,
        categoryId: tasks.categoryId,
        dueTime: tasks.dueTime,
        notes: tasks.notes,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          emoji: categories.emoji,
          color: categories.color,
        }
      })
      .from(tasks)
      .leftJoin(categories, eq(tasks.categoryId, categories.id))
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async createTask(userId: string, task: InsertTask): Promise<Task> {
    const [newTask] = await db
      .insert(tasks)
      .values({ ...task, userId })
      .returning();
    return newTask;
  }

  async updateTask(taskId: string, userId: string, updates: UpdateTask): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();
    return updatedTask;
  }

  async deleteTask(taskId: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  async toggleTaskComplete(taskId: string, userId: string): Promise<Task | undefined> {
    // First get the current task
    const [currentTask] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
    
    if (!currentTask) return undefined;

    // Toggle the completed status
    const [updatedTask] = await db
      .update(tasks)
      .set({ 
        completed: !currentTask.completed,
        updatedAt: new Date()
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();
    
    return updatedTask;
  }
}

export const storage = new DatabaseStorage();
