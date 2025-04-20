import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertBookingSchema, 
  loginSchema,
  bookingStatusEnum
} from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";

const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "manipal-university-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 86400000 }, // 24 hours
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  // Setup passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }

        // In a real app, you'd compare hashed passwords
        // For this demo, we're just checking if passwords match
        if (password !== "admin123") {
          return done(null, false, { message: "Incorrect password." });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // Serialize and deserialize user
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Not authenticated" });
  };

  // Check if user has specific role
  const hasRole = (roles: string[]) => {
    return (req: Request, res: Response, next: Function) => {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = req.user as any;
      if (!roles.includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      next();
    };
  };

  // Authentication routes
  app.post("/api/auth/login", (req, res, next) => {
    try {
      const { username, password, role } = loginSchema.parse(req.body);
      
      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).json({ message: info.message });
        }
        if (user.role !== role) {
          return res.status(403).json({ message: "Invalid role selected" });
        }
        
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          return res.json({ user: { id: user.id, username: user.username, name: user.name, role: user.role } });
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      next(error);
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = req.user as any;
    res.json({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  });

  // Room routes
  app.get("/api/rooms", isAuthenticated, async (req, res) => {
    try {
      const rooms = await storage.getRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });

  app.get("/api/rooms/available", isAuthenticated, async (req, res) => {
    try {
      const { date, startTime, endTime } = req.query;
      
      if (!date || !startTime || !endTime) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
      
      const searchDate = new Date(date as string);
      const availableRooms = await storage.getRoomsByAvailability(
        searchDate,
        startTime as string,
        endTime as string
      );
      
      res.json(availableRooms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch available rooms" });
    }
  });

  app.get("/api/rooms/:id", isAuthenticated, async (req, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const room = await storage.getRoom(roomId);
      
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      
      res.json(room);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch room" });
    }
  });

  // Booking routes
  app.post("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        userId: (req.user as any).id
      });
      
      // Check if room is available
      const isAvailable = await storage.checkRoomAvailability(
        bookingData.roomId,
        new Date(bookingData.startTime),
        new Date(bookingData.startTime).getHours() + ":" + new Date(bookingData.startTime).getMinutes(),
        new Date(bookingData.endTime).getHours() + ":" + new Date(bookingData.endTime).getMinutes()
      );
      
      if (!isAvailable) {
        return res.status(409).json({ message: "Room is not available for the selected time slot" });
      }
      
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      // Admin sees all bookings, users see their own
      let bookings;
      if (user.role === 'admin') {
        bookings = await storage.getBookings();
      } else {
        bookings = await storage.getBookingsByUser(user.id);
      }
      
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/pending", hasRole(["admin"]), async (req, res) => {
    try {
      const pendingBookings = await storage.getBookingsByStatus("pending");
      res.json(pendingBookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending bookings" });
    }
  });

  app.patch("/api/bookings/:id/status", hasRole(["admin"]), async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!bookingStatusEnum.enum.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      const updatedBooking = await storage.updateBookingStatus(bookingId, status);
      
      if (!updatedBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json(updatedBooking);
    } catch (error) {
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  // Timetable routes
  app.get("/api/timetable/:program", isAuthenticated, async (req, res) => {
    try {
      const { program } = req.params;
      const { day } = req.query;
      
      let timetableEntries;
      if (day) {
        timetableEntries = await storage.getTimetableByDay(program, day as string);
      } else {
        timetableEntries = await storage.getTimetableByProgram(program);
      }
      
      res.json(timetableEntries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timetable" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
