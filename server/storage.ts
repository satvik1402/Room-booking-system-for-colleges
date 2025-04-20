import { 
  users, rooms, bookings, timetable,
  type User, type InsertUser, 
  type Room, type InsertRoom,
  type Booking, type InsertBooking,
  type Timetable, type InsertTimetable 
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Room operations
  getRoom(id: number): Promise<Room | undefined>;
  getRooms(): Promise<Room[]>;
  getRoomsByType(type: string): Promise<Room[]>;
  getRoomsByAvailability(date: Date, startTime: string, endTime: string): Promise<Room[]>;
  createRoom(room: InsertRoom): Promise<Room>;

  // Booking operations
  getBooking(id: number): Promise<Booking | undefined>;
  getBookings(): Promise<Booking[]>;
  getBookingsByUser(userId: number): Promise<Booking[]>;
  getBookingsByStatus(status: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  checkRoomAvailability(roomId: number, date: Date, startTime: string, endTime: string): Promise<boolean>;

  // Timetable operations
  getTimetable(id: number): Promise<Timetable | undefined>;
  getTimetableByProgram(program: string): Promise<Timetable[]>;
  getTimetableByDay(program: string, day: string): Promise<Timetable[]>;
  createTimetableEntry(entry: InsertTimetable): Promise<Timetable>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private rooms: Map<number, Room>;
  private bookings: Map<number, Booking>;
  private timetableEntries: Map<number, Timetable>;
  private currentUserId: number;
  private currentRoomId: number;
  private currentBookingId: number;
  private currentTimetableId: number;

  constructor() {
    this.users = new Map();
    this.rooms = new Map();
    this.bookings = new Map();
    this.timetableEntries = new Map();
    this.currentUserId = 1;
    this.currentRoomId = 1;
    this.currentBookingId = 1;
    this.currentTimetableId = 1;
    this.seedData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  // Room operations
  async getRoom(id: number): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  async getRooms(): Promise<Room[]> {
    return Array.from(this.rooms.values());
  }

  async getRoomsByType(type: string): Promise<Room[]> {
    return Array.from(this.rooms.values()).filter(
      (room) => room.roomType === type
    );
  }

  async getRoomsByAvailability(date: Date, startTime: string, endTime: string): Promise<Room[]> {
    const availableRooms: Room[] = [];
    for (const room of this.rooms.values()) {
      const isAvailable = await this.checkRoomAvailability(room.id, date, startTime, endTime);
      if (isAvailable) {
        availableRooms.push(room);
      }
    }
    return availableRooms;
  }

  async createRoom(room: InsertRoom): Promise<Room> {
    const id = this.currentRoomId++;
    const newRoom: Room = { ...room, id };
    this.rooms.set(id, newRoom);
    return newRoom;
  }

  // Booking operations
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.userId === userId
    );
  }

  async getBookingsByStatus(status: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.status === status
    );
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;

    // Ensure the dates are Date objects
    const startTime = booking.startTime instanceof Date 
      ? booking.startTime 
      : new Date(booking.startTime);

    const endTime = booking.endTime instanceof Date 
      ? booking.endTime 
      : new Date(booking.endTime);

    const newBooking: Booking = { 
      ...booking,
      startTime,
      endTime,
      status: booking.status || 'pending', // Ensure status has a default value
      id, 
      createdAt: new Date() 
    };

    this.bookings.set(id, newBooking);
    return newBooking;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;

    const updatedBooking: Booking = { ...booking, status: status as any };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async checkRoomAvailability(roomId: number, date: Date, startTime: string, endTime: string): Promise<boolean> {
    const bookingsForRoom = Array.from(this.bookings.values()).filter(
      (booking) => 
        booking.roomId === roomId && 
        booking.status !== 'rejected' &&
        this.isSameDay(booking.startTime, date)
    );

    // Convert time strings to comparable format (minutes since midnight)
    const requestStart = this.timeToMinutes(startTime);
    const requestEnd = this.timeToMinutes(endTime);

    for (const booking of bookingsForRoom) {
      const bookingStart = this.timeToMinutes(this.formatTime(booking.startTime));
      const bookingEnd = this.timeToMinutes(this.formatTime(booking.endTime));

      // Check if there's an overlap
      if (!(requestEnd <= bookingStart || requestStart >= bookingEnd)) {
        return false; // Overlap found
      }
    }

    return true; // No overlaps, room is available
  }

  // Timetable operations
  async getTimetable(id: number): Promise<Timetable | undefined> {
    return this.timetableEntries.get(id);
  }

  async getTimetableByProgram(program: string): Promise<Timetable[]> {
    return Array.from(this.timetableEntries.values()).filter(
      (entry) => entry.program === program
    );
  }

  async getTimetableByDay(program: string, day: string): Promise<Timetable[]> {
    return Array.from(this.timetableEntries.values()).filter(
      (entry) => entry.program === program && entry.dayOfWeek === day
    );
  }

  async createTimetableEntry(entry: InsertTimetable): Promise<Timetable> {
    const id = this.currentTimetableId++;
    const newEntry: Timetable = { ...entry, id };
    this.timetableEntries.set(id, newEntry);
    return newEntry;
  }

  // Helper methods
  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  private timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private formatTime(date: Date): string {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  // Seed initial data
  private seedData() {
    // Seed users
    const defaultUsers: InsertUser[] = [
      // Global Admin
      {
        username: 'admin',
        password: '$2b$10$uAR.y9RoKYPn4lLIlp7Dj.0CSNxjrJgD7Jq1mWcRoJ0EGJgG2nKL2', // admin123
        name: 'Global Admin',
        email: 'admin@manipal.edu',
        role: 'admin',
        department: 'all'
      },
      // Department Admins
      {
        username: 'cse_admin',
        password: '$2b$10$uAR.y9RoKYPn4lLIlp7Dj.0CSNxjrJgD7Jq1mWcRoJ0EGJgG2nKL2', // admin123
        name: 'CSE Department Admin',
        email: 'cse.admin@manipal.edu',
        role: 'department_admin',
        department: 'computer_science'
      },
      {
        username: 'cce_admin',
        password: '$2b$10$uAR.y9RoKYPn4lLIlp7Dj.0CSNxjrJgD7Jq1mWcRoJ0EGJgG2nKL2', // admin123
        name: 'CCE Department Admin',
        email: 'cce.admin@manipal.edu',
        role: 'department_admin',
        department: 'cce'
      },
      {
        username: 'ds_admin',
        password: '$2b$10$uAR.y9RoKYPn4lLIlp7Dj.0CSNxjrJgD7Jq1mWcRoJ0EGJgG2nKL2', // admin123
        name: 'Data Science Department Admin',
        email: 'ds.admin@manipal.edu',
        role: 'department_admin',
        department: 'data_science'
      },
      // Teachers
      {
        username: 'teacher',
        password: '$2b$10$uAR.y9RoKYPn4lLIlp7Dj.0CSNxjrJgD7Jq1mWcRoJ0EGJgG2nKL2', // admin123
        name: 'Teacher User',
        email: 'teacher@manipal.edu',
        role: 'teacher',
        department: 'computer_science'
      },
      {
        username: 'teacher_cce',
        password: '$2b$10$uAR.y9RoKYPn4lLIlp7Dj.0CSNxjrJgD7Jq1mWcRoJ0EGJgG2nKL2', // admin123
        name: 'CCE Teacher',
        email: 'teacher.cce@manipal.edu',
        role: 'teacher',
        department: 'cce'
      },
      {
        username: 'teacher_iot',
        password: '$2b$10$uAR.y9RoKYPn4lLIlp7Dj.0CSNxjrJgD7Jq1mWcRoJ0EGJgG2nKL2', // admin123
        name: 'IoT Teacher',
        email: 'teacher.iot@manipal.edu',
        role: 'teacher',
        department: 'iot'
      },
      // Students
      {
        username: 'student',
        password: '$2b$10$uAR.y9RoKYPn4lLIlp7Dj.0CSNxjrJgD7Jq1mWcRoJ0EGJgG2nKL2', // admin123
        name: 'Student User',
        email: 'student@manipal.edu',
        role: 'student',
        department: 'computer_science'
      },
      {
        username: 'student_cce',
        password: '$2b$10$uAR.y9RoKYPn4lLIlp7Dj.0CSNxjrJgD7Jq1mWcRoJ0EGJgG2nKL2', // admin123
        name: 'CCE Student',
        email: 'student.cce@manipal.edu',
        role: 'student',
        department: 'cce'
      }
    ];

    for (const user of defaultUsers) {
      this.createUser(user);
    }

    // Seed rooms
    const defaultRooms: InsertRoom[] = [
      // AB1 Building Classrooms - Ground Floor
      {
        name: 'AB1-001',
        roomType: 'classroom',
        capacity: 40,
        department: 'computer_science',
        hasProjector: true,
        hasAC: true,
        hasVideoConf: false,
        building: 'AB1'
      },
      {
        name: 'AB1-015',
        roomType: 'classroom',
        capacity: 40,
        department: 'computer_science',
        hasProjector: true,
        hasAC: true,
        hasVideoConf: false,
        building: 'AB1'
      },
      {
        name: 'AB1-033',
        roomType: 'classroom',
        capacity: 40,
        department: 'computer_science',
        hasProjector: true,
        hasAC: true,
        hasVideoConf: false,
        building: 'AB1'
      },
      // AB1 Building Classrooms - First Floor
      {
        name: 'AB1-101',
        roomType: 'classroom',
        capacity: 40,
        department: 'computer_science',
        hasProjector: true,
        hasAC: true,
        hasVideoConf: false,
        building: 'AB1'
      },
      {
        name: 'AB1-115',
        roomType: 'classroom',
        capacity: 40,
        department: 'computer_science',
        hasProjector: true,
        hasAC: true,
        hasVideoConf: false,
        building: 'AB1'
      },
      // AB2 Building Classrooms - Ground Floor
      {
        name: 'AB2-001',
        roomType: 'classroom',
        capacity: 50,
        department: 'data_science',
        hasProjector: true,
        hasAC: true,
        hasVideoConf: false,
        building: 'AB2'
      },
      {
        name: 'AB2-015',
        roomType: 'classroom',
        capacity: 50,
        department: 'aiml',
        hasProjector: true,
        hasAC: true,
        hasVideoConf: false,
        building: 'AB2'
      },
      // AB3 Building Classrooms
      {
        name: 'AB3-101',
        roomType: 'classroom',
        capacity: 60,
        department: 'iot',
        hasProjector: true,
        hasAC: true,
        hasVideoConf: false,
        building: 'AB3'
      },
      {
        name: 'AB3-201',
        roomType: 'classroom',
        capacity: 60,
        department: 'it',
        hasProjector: true,
        hasAC: true,
        hasVideoConf: false,
        building: 'AB3'
      },
      // AB1 Faculty Blocks Meeting Rooms
      {
        name: 'FB1-Meeting Room',
        roomType: 'meeting_hall',
        capacity: 20,
        department: 'computer_science',
        hasProjector: true,
        hasAC: true,
        hasVideoConf: true,
        building: 'AB1'
      },
      {
        name: 'FB2-Meeting Room',
        roomType: 'meeting_hall',
        capacity: 15,
        department: 'cce',
        hasProjector: true,
        hasAC: true,
        hasVideoConf: true,
        building: 'AB1'
      },
      // AB2 Faculty Blocks Meeting Rooms
      {
        name: 'FB3-Meeting Room',
        roomType: 'meeting_hall',
        capacity: 20,
        department: 'data_science',
        hasProjector: true,
        hasAC: true,
        hasVideoConf: true,
        building: 'AB2'
      },
      {
        name: 'FB4-Meeting Room',
        roomType: 'meeting_hall',
        capacity: 15,
        department: 'aiml',
        hasProjector: true,
        hasAC: true,
        hasVideoConf: true,
        building: 'AB2'
      },
      // AB3 Faculty Blocks Meeting Rooms
      {
        name: 'FB5-Meeting Room',
        roomType: 'meeting_hall',
        capacity: 25,
        department: 'iot',
        hasProjector: true,
        hasAC: true,
        hasVideoConf: true,
        building: 'AB3'
      },
      {
        name: 'FB6-Meeting Room',
        roomType: 'meeting_hall',
        capacity: 20,
        department: 'it',
        hasProjector: true,
        hasAC: true,
        hasVideoConf: true,
        building: 'AB3'
      },
      // Auditoriums
      {
        name: 'Sharda Pai Auditorium',
        roomType: 'auditorium',
        capacity: 300,
        department: 'all',
        hasProjector: true,
        hasAC: true,
        hasVideoConf: true,
        building: 'AB2'
      },
      {
        name: 'TMA Pai Auditorium',
        roomType: 'auditorium',
        capacity: 500,
        department: 'all',
        hasProjector: true,
        hasAC: true,
        hasVideoConf: true,
        building: 'AB2'
      },
      {
        name: 'Vasanti Pai Auditorium',
        roomType: 'auditorium',
        capacity: 350,
        department: 'all',
        hasProjector: true,
        hasAC: true,
        hasVideoConf: true,
        building: 'AB3'
      },
      {
        name: "AB1-101",
        roomType: "classroom",
        capacity: 60,
        department: "computer_science",
        hasProjector: true,
        hasAC: true,
        hasVideoConf: false,
        building: "AB1"
      },
      {
        name: "AB1-102",
        roomType: "classroom",
        capacity: 60,
        department: "computer_science",
        hasProjector: true,
        hasAC: true,
        hasVideoConf: false,
        building: "AB1"
      },
      {
        name: "AB3-201",
        roomType: "classroom",
        capacity: 60,
        department: "data_science",
        hasProjector: true,
        hasAC: true,
        hasVideoConf: false,
        building: "AB3"
      },
      {
        name: "Meeting Hall 1",
        roomType: "meeting_hall",
        capacity: 20,
        department: "computer_science",
        hasProjector: true,
        hasAC: true,
        hasVideoConf: true,
        building: "AB1"
      },
      {
        name: "Meeting Hall 2",
        roomType: "meeting_hall",
        capacity: 15,
        department: "data_science",
        hasProjector: true,
        hasAC: true,
        hasVideoConf: true,
        building: "AB3"
      },
      {
        name: "Vasanti Pai Auditorium",
        roomType: "auditorium",
        capacity: 500,
        department: "all",
        hasProjector: true,
        hasAC: true,
        hasVideoConf: true,
        building: "AB3"
      },
      {
        name: "Room 101",
        roomType: "classroom",
        capacity: 30,
        department: "computer_science",
        hasProjector: false,
        hasAC: true,
        hasVideoConf: false,
        building: "AB1"
      },
      {
        name: "ab1",
        roomType: "classroom",
        capacity: 30,
        department: "computer_science",
        hasProjector: false,
        hasAC: true,
        hasVideoConf: false,
        building: "AB1"
      },
      {
        name: "ab3",
        roomType: "classroom",
        capacity: 30,
        department: "computer_science",
        hasProjector: false,
        hasAC: true,
        hasVideoConf: false,
        building: "AB3"
      }
    ];

    for (const room of defaultRooms) {
      this.createRoom(room);
    }

    // Seed timetable entries
    const defaultTimetableEntries: InsertTimetable[] = [
      {
        courseCode: 'MEE2001',
        courseName: 'Engineering Mechanics',
        roomId: 1,
        dayOfWeek: 'Monday',
        startTime: '01:30',
        endTime: '02:15',
        facultyName: 'Mr. Rahul Khatri',
        program: 'CSE-K'
      },
      {
        courseCode: 'CSE2202',
        courseName: 'Data Structures',
        roomId: 1,
        dayOfWeek: 'Monday',
        startTime: '02:15',
        endTime: '03:00',
        facultyName: 'Ms. Sushama Tanwar',
        program: 'CSE-K'
      },
      {
        courseCode: 'CSE2202',
        courseName: 'Data Structures',
        roomId: 1,
        dayOfWeek: 'Monday',
        startTime: '03:00',
        endTime: '03:45',
        facultyName: 'Ms. Sushama Tanwar',
        program: 'CSE-K'
      },
      {
        courseCode: 'CSE2201',
        courseName: 'Computer Organization',
        roomId: 1,
        dayOfWeek: 'Monday',
        startTime: '03:45',
        endTime: '04:30',
        facultyName: 'Deepti Sharma',
        program: 'CSE-K'
      },
      {
        courseCode: 'CSE2221',
        courseName: 'Database Systems',
        roomId: 2,
        dayOfWeek: 'Monday',
        startTime: '04:30',
        endTime: '05:15',
        facultyName: 'Dr. Neetu Gupta',
        program: 'CSE-K'
      }
    ];

    for (const entry of defaultTimetableEntries) {
      this.createTimetableEntry(entry);
    }

    // Create some bookings
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const defaultBookings: InsertBooking[] = [
      {
        userId: 2, // Teacher
        roomId: 3, // Classroom 201
        startTime: new Date(today.setHours(10, 0, 0, 0)),
        endTime: new Date(today.setHours(12, 0, 0, 0)),
        purpose: 'Guest lecture on Advanced Algorithms',
        status: 'approved'
      },
      {
        userId: 3, // Student
        roomId: 4, // Meeting Hall A
        startTime: new Date(tomorrow.setHours(14, 0, 0, 0)),
        endTime: new Date(tomorrow.setHours(16, 0, 0, 0)),
        purpose: 'Student club meeting',
        status: 'pending'
      }
    ];

    for (const booking of defaultBookings) {
      this.createBooking(booking);
    }
  }
}

export const storage = new MemStorage();