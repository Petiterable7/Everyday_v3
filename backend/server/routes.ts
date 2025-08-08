import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
// import { setupAuth, mockAuth } from "./replitAuth";
import { insertTaskSchema, updateTaskSchema, insertCategorySchema, updateCategorySchema } from "../shared/schema";
import { fromZodError } from "zod-validation-error";

// Temporary mock authentication for testing
const mockAuth = async (req: any, res: any, next: any) => {
  // Create a mock user for testing
  req.user = {
    claims: {
      sub: "test-user-123",
      email: "test@example.com",
      first_name: "Test",
      last_name: "User"
    }
  };
  
  // Ensure user exists in database
  try {
    await storage.upsertUser({
      id: "test-user-123",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      profileImageUrl: null
    });
  } catch (error) {
    console.log("User already exists or created successfully");
  }
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Temporarily disable auth setup for testing
  // await setupAuth(app);
  
  // Add simple login endpoint for testing
  app.get('/api/login', (req, res) => {
    // Redirect back to frontend after "login"
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
  });

  // Auth routes
  app.get('/api/auth/user', mockAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Category routes
  app.get('/api/categories', mockAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const categories = await storage.getCategories(userId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', mockAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validationResult = insertCategorySchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid category data",
          error: fromZodError(validationResult.error).toString()
        });
      }

      const category = await storage.createCategory(userId, validationResult.data);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.patch('/api/categories/:id', mockAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const categoryId = req.params.id;
      const validationResult = updateCategorySchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid category data",
          error: fromZodError(validationResult.error).toString()
        });
      }

      const category = await storage.updateCategory(categoryId, userId, validationResult.data);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete('/api/categories/:id', mockAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const categoryId = req.params.id;
      const deleted = await storage.deleteCategory(categoryId, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Task routes
  app.get('/api/tasks', mockAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const date = req.query.date as string;
      
      let tasks;
      if (date) {
        tasks = await storage.getTasksByUserAndDate(userId, date);
      } else {
        tasks = await storage.getTasksByUser(userId);
      }
      
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post('/api/tasks', mockAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validationResult = insertTaskSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid task data",
          error: fromZodError(validationResult.error).toString()
        });
      }

      const task = await storage.createTask(userId, validationResult.data);
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.patch('/api/tasks/:id', mockAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const taskId = req.params.id;
      const validationResult = updateTaskSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid task data",
          error: fromZodError(validationResult.error).toString()
        });
      }

      const task = await storage.updateTask(taskId, userId, validationResult.data);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.patch('/api/tasks/:id/toggle', mockAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const taskId = req.params.id;

      const task = await storage.toggleTaskComplete(taskId, userId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Error toggling task:", error);
      res.status(500).json({ message: "Failed to toggle task" });
    }
  });

  app.delete('/api/tasks/:id', mockAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const taskId = req.params.id;

      const deleted = await storage.deleteTask(taskId, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });



  const httpServer = createServer(app);
  return httpServer;
}
