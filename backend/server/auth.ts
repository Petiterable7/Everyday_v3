import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import { eq } from "drizzle-orm";

import { db } from "./db";
import { users } from "../shared/schema";
import type { User } from "../shared/schema";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Generate a random session secret if not provided
  const sessionSecret = process.env.SESSION_SECRET || 'dev-secret-' + Math.random().toString(36).substring(2, 15);
  
  return session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

export function setupAuth(app: Express) {
  // Configure Passport Local Strategy
  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        // Find user by email
        const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
        
        if (!user.length) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user[0].password);
        
        if (!isValidPassword) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        // Return user without password
        const { password: _, ...userWithoutPassword } = user[0];
        return done(null, userWithoutPassword);
      } catch (error) {
        return done(error);
      }
    }
  ));

  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
      
      if (!user.length) {
        return done(null, false);
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user[0];
      done(null, userWithoutPassword);
    } catch (error) {
      done(error);
    }
  });

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Not authenticated" });
};

// Hash password utility
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Verify password utility
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
