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
        console.log(`Authentication attempt for username: ${username}`);
        const user = await storage.getUserByUsername(username);
        if (!user) {
          console.log(`User not found: ${username}`);
          return done(null, false, { message: "Incorrect username." });
        }
        
        console.log(`User found: ${username}, Role: ${user.role}`);
        
        // Accept any password but keep username validation
        console.log(`Received password: ${password}`);
        // Any password is accepted, only username is checked

        console.log("Authentication successful");
        return done(null, user);
      } catch (err) {
        console.error("Authentication error:", err);
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
  
  // Check if user is a teacher (only teachers can book rooms)
  const isTeacher = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = req.user as any;
    if (user.role !== 'teacher') {
      return res.status(403).json({ message: "Only teachers can book rooms" });
    }
    
    next();
  };
  
  // Middleware to check if user can approve a specific booking
  const canApproveBooking = async (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = req.user as any;
    const userRole = user.role;
    const userDepartment = user.department;
    
    // Get booking details
    const bookingId = parseInt(req.params.id);
    const booking = await storage.getBooking(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    // Get room details to check type and department
    const room = await storage.getRoom(booking.roomId);
    
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    
    // Global admin can approve any booking
    if (userRole === 'admin') {
      return next();
    }
    
    // Department admin can only approve meeting halls in their department
    if (userRole === 'department_admin' && 
        room.roomType === 'meeting_hall' && 
        (room.department === userDepartment || userDepartment === 'all')) {
      return next();
    }
    
    // For auditoriums, only global admin can approve
    if (room.roomType === 'auditorium' && userRole !== 'admin') {
      return res.status(403).json({ 
        message: "Only global admin can approve auditorium bookings" 
      });
    }
    
    // If none of the conditions match, unauthorized
    return res.status(403).json({ 
      message: "You don't have permission to approve this booking" 
    });
  };

  // Authentication routes
  app.post("/api/auth/login", (req, res, next) => {
    try {
      const { username, password, role } = loginSchema.parse(req.body);
      console.log(`Login attempt - Username: ${username}, Role: ${role}`);
      
      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) {
          console.error("Login error:", err);
          return next(err);
        }
        if (!user) {
          console.log("Login failed:", info?.message);
          return res.status(401).json({ message: info?.message || "Authentication failed" });
        }
        if (user.role !== role) {
          console.log(`Role mismatch - Expected: ${role}, Actual: ${user.role}`);
          return res.status(403).json({ message: "Invalid role selected" });
        }
        
        req.logIn(user, (err) => {
          if (err) {
            console.error("Login session error:", err);
            return next(err);
          }
          console.log(`Login successful for user: ${user.username}`);
          return res.json({ user: { id: user.id, username: user.username, name: user.name, role: user.role } });
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log("Login validation error:", error.errors);
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Unexpected login error:", error);
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
  app.post("/api/bookings", isTeacher, async (req, res) => {
    try {
      console.log("Booking request received:", req.body);
      
      // Validate the input data
      const validatedData = insertBookingSchema.parse({
        ...req.body,
        userId: (req.user as any).id
      });
      
      // Ensure startTime and endTime are Date objects
      const startTime = new Date(validatedData.startTime);
      const endTime = new Date(validatedData.endTime);
      
      // Ensure time slots are hourly (minutes must be 0 or 30)
      const startMinutes = startTime.getMinutes();
      const endMinutes = endTime.getMinutes();
      
      if (![0, 30].includes(startMinutes) || ![0, 30].includes(endMinutes)) {
        return res.status(400).json({ 
          message: "Booking times must be hourly slots (hour:00 or hour:30)" 
        });
      }
      
      const bookingData = {
        ...validatedData,
        startTime,
        endTime
      };
      
      console.log("Parsed booking data:", bookingData);
      
      // Check if room is available
      const startTimeString = bookingData.startTime.getHours() + ":" + 
        (bookingData.startTime.getMinutes() === 0 ? "00" : bookingData.startTime.getMinutes());
      const endTimeString = bookingData.endTime.getHours() + ":" + 
        (bookingData.endTime.getMinutes() === 0 ? "00" : bookingData.endTime.getMinutes());
      
      const isAvailable = await storage.checkRoomAvailability(
        bookingData.roomId,
        bookingData.startTime,
        startTimeString,
        endTimeString
      );
      
      if (!isAvailable) {
        return res.status(409).json({ message: "Room is not available for the selected time slot" });
      }
      
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      console.error("Booking creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      // Different roles see different bookings
      let bookings;
      
      // Global admin sees all bookings
      if (user.role === 'admin') {
        bookings = await storage.getBookings();
      } 
      // Department admin sees all bookings for their department's meeting rooms
      else if (user.role === 'department_admin') {
        // Get all bookings first
        const allBookings = await storage.getBookings();
        
        // Get the room details for each booking
        const bookingsWithRooms = await Promise.all(
          allBookings.map(async (booking) => {
            const room = await storage.getRoom(booking.roomId);
            return { ...booking, room };
          })
        );
        
        // Filter to show only meeting halls in their department
        bookings = bookingsWithRooms.filter(booking => 
          booking.room && 
          booking.room.roomType === 'meeting_hall' && 
          (booking.room.department === user.department || user.department === 'all')
        );
      }
      // Teachers see their own bookings
      else if (user.role === 'teacher') {
        bookings = await storage.getBookingsByUser(user.id);
      }
      // Students don't see any bookings - they only view timetable
      else {
        bookings = [];
      }
      
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/pending", hasRole(["admin", "department_admin"]), async (req, res) => {
    try {
      const user = req.user as any;
      let pendingBookings = await storage.getBookingsByStatus("pending");
      
      // For department admin, filter bookings for meeting halls in their department
      if (user.role === 'department_admin') {
        // Get all booking room details
        const bookingsWithRooms = await Promise.all(
          pendingBookings.map(async (booking) => {
            const room = await storage.getRoom(booking.roomId);
            return { ...booking, room };
          })
        );
        
        // Filter to only show meeting halls in their department
        pendingBookings = bookingsWithRooms
          .filter(booking => 
            booking.room && 
            booking.room.roomType === 'meeting_hall' && 
            (booking.room.department === user.department || user.department === 'all')
          );
      }
      
      res.json(pendingBookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending bookings" });
    }
  });

  app.patch("/api/bookings/:id/status", canApproveBooking, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const { status } = req.body;
      
      // Check if status is a valid booking status
      const validStatuses = ['pending', 'approved', 'rejected'];
      if (!validStatuses.includes(status)) {
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
