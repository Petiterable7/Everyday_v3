import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { eq } from "drizzle-orm";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, hashPassword } from "./auth";
import { db } from "./db";
import { users } from "../shared/schema";
import { 
  insertTaskSchema, 
  updateTaskSchema, 
  insertCategorySchema, 
  updateCategorySchema,
  registerUserSchema,
  loginUserSchema
} from "../shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Debug endpoint to check database connection
  app.get('/api/debug/db', async (req, res) => {
    try {
      // Check if users table exists and has password column
      const result = await db.select().from(users).limit(1);
      res.json({ 
        status: "Database connection OK", 
        tableExists: true,
        sampleQuery: "Success",
        userCount: result.length 
      });
    } catch (error) {
      console.error("Database debug error:", error);
      res.status(500).json({ 
        status: "Database error", 
        error: error.message 
      });
    }
  });

  // Auth routes
  app.post('/api/register', async (req, res) => {
    try {
      console.log("Registration attempt:", req.body);
      
      const validationResult = registerUserSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        console.log("Validation failed:", validationResult.error);
        return res.status(400).json({
          message: "Invalid registration data",
          error: fromZodError(validationResult.error).toString()
        });
      }

      const { email, password, firstName, lastName } = validationResult.data;
      console.log("Validation passed for email:", email);

      // Check if user already exists
      console.log("Checking if user exists...");
      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
      console.log("Existing user check result:", existingUser.length);
      
      if (existingUser.length > 0) {
        return res.status(409).json({ message: "User with this email already exists" });
      }

      // Hash password
      console.log("Hashing password...");
      const hashedPassword = await hashPassword(password);
      console.log("Password hashed successfully");

      // Create user
      console.log("Creating user in database...");
      const newUser = await db.insert(users).values({
        email,
        password: hashedPassword,
        firstName,
        lastName,
      }).returning();
      console.log("User created successfully:", newUser[0].id);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = newUser[0];
      
      res.status(201).json({ message: "User created successfully", user: userWithoutPassword });
    } catch (error) {
      console.error("Error registering user:", error);
      console.error("Error details:", error.message, error.stack);
      res.status(500).json({ 
        message: "Failed to register user", 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
    }
  });

  app.post('/api/login', async (req, res, next) => {
    const validationResult = loginUserSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Invalid login data",
        error: fromZodError(validationResult.error).toString()
      });
    }

    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Authentication error" });
      }
      
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }

      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login error" });
        }
        return res.json({ message: "Login successful", user });
      });
    })(req, res, next);
  });

  app.post('/api/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout error" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Category routes
  app.get('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const categories = await storage.getCategories(userId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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

  app.patch('/api/categories/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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

  app.delete('/api/categories/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
  app.get('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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

  app.post('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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

  app.patch('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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

  app.patch('/api/tasks/:id/toggle', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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

  app.delete('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
