import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "teacher", "student"]);
export const roomTypeEnum = pgEnum("room_type", ["classroom", "meeting_hall", "auditorium"]);
export const departmentEnum = pgEnum("department", ["computer_science", "electrical_engineering", "all"]);
export const bookingStatusEnum = pgEnum("booking_status", ["pending", "approved", "rejected"]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: userRoleEnum("role").notNull().default("student"),
  department: departmentEnum("department").notNull().default("computer_science"),
});

// Rooms table
export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  roomType: roomTypeEnum("room_type").notNull(),
  capacity: integer("capacity").notNull(),
  department: departmentEnum("department").notNull(),
  hasProjector: boolean("has_projector").notNull().default(false),
  hasAC: boolean("has_ac").notNull().default(false),
  hasVideoConf: boolean("has_video_conf").notNull().default(false),
  building: text("building").notNull(),
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  roomId: integer("room_id").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  purpose: text("purpose").notNull(),
  status: bookingStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Timetable entries
export const timetable = pgTable("timetable", {
  id: serial("id").primaryKey(),
  courseCode: text("course_code").notNull(),
  courseName: text("course_name").notNull(),
  roomId: integer("room_id").notNull(),
  dayOfWeek: text("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  facultyName: text("faculty_name").notNull(),
  program: text("program").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertRoomSchema = createInsertSchema(rooms).omit({ id: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true });
export const insertTimetableSchema = createInsertSchema(timetable).omit({ id: true });

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  role: userRoleEnum,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Room = typeof rooms.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Timetable = typeof timetable.$inferSelect;
export type InsertTimetable = z.infer<typeof insertTimetableSchema>;
export type Login = z.infer<typeof loginSchema>;
