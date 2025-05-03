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
    // Get all approved bookings for this room on the same date
    const bookingsForRoom = Array.from(this.bookings.values()).filter(
      (booking) => 
        booking.roomId === roomId && 
        booking.status === 'approved' &&
        this.isSameDay(booking.startTime, date)
    );

    // If checking for a future date, return true (room is available)
    const today = new Date();
    if (!this.isSameDay(date, today)) {
      return true; // Allow booking for future dates
    }

    // Convert time strings to comparable format (minutes since midnight)
    const requestStart = this.timeToMinutes(startTime);
    const requestEnd = this.timeToMinutes(endTime);

    // Check for overlaps with existing bookings
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
    // Seed users with explicit types
    const defaultUsers: Array<User> = [
      {
        id: 1,
        username: 'admin',
        password: 'admin123',
        name: 'Dr. Rajesh Kumar',
        email: 'admin@manipal.edu',
        role: 'admin' as const,
        department: 'all' as const
      },
      {
        id: 2,
        username: 'hodcse',
        password: 'hod123',
        name: 'Dr. Sunita Singhal',
        email: 'sunita.singhal@manipal.edu',
        role: 'department_admin' as const,
        department: 'computer_science' as const
      },
      {
        id: 3,
        username: 'teacher1',
        password: 'teacher123',
        name: 'Dr. Manohara Pai M.M.',
        email: 'mm.pai@manipal.edu',
        role: 'teacher' as const,
        department: 'computer_science' as const
      },
      {
        id: 4,
        username: 'teacher2',
        password: 'teacher456',
        name: 'Dr. Radhika M. Pai',
        email: 'radhika.pai@manipal.edu',
        role: 'teacher' as const,
        department: 'computer_science' as const
      },
      {
        id: 5,
        username: 'student1',
        password: 'student123',
        name: 'Satvik Sharma',
        email: 'satvik.sharma@learner.manipal.edu',
        role: 'student' as const,
        department: 'computer_science' as const
      },
      {
        id: 6,
        username: 'student2',
        password: 'student456',
        name: 'Ananya Patel',
        email: 'ananya.patel@learner.manipal.edu',
        role: 'student' as const,
        department: 'computer_science' as const
      }
    ];

    // Seed rooms with explicit types
    const defaultRooms: Array<Room> = [
      {
        id: 1,
        name: 'AB1-014',
        department: 'computer_science' as const,
        roomType: 'classroom' as const,
        capacity: 60,
        hasProjector: true,
        hasAC: true,
        hasVideoConf: false,
        building: 'AB-1'
      },
      {
        id: 2,
        name: 'AB1-015',
        department: 'computer_science' as const,
        roomType: 'classroom' as const,
        capacity: 60,
        hasProjector: true,
        hasAC: true,
        hasVideoConf: false,
        building: 'AB-1'
      },
      {
        id: 3,
        name: 'AB1-112',
        department: 'computer_science' as const,
        roomType: 'classroom' as const,
        capacity: 60,
        hasProjector: true,
        hasAC: true,
        hasVideoConf: false,
        building: 'AB-1'
      },
      {
        id: 4,
        name: 'AB1-113',
        department: 'computer_science' as const,
        roomType: 'classroom' as const,
        capacity: 60,
        hasProjector: true,
        hasAC: true,
        hasVideoConf: false,
        building: 'AB-1'
      },
      {
        id: 5,
        name: 'AB1-114',
        department: 'computer_science' as const,
        roomType: 'classroom' as const,
        capacity: 60,
        hasProjector: true,
        hasAC: true,
        hasVideoConf: false,
        building: 'AB-1'
      },
      {
        id: 6,
        name: 'AB1-214',
        department: 'computer_science' as const,
        roomType: 'classroom' as const,
        capacity: 60,
        hasProjector: true,
        hasAC: true,
        hasVideoConf: false,
        building: 'AB-1'
      },
      {
        id: 7,
        name: 'AB1-215',
        department: 'computer_science' as const,
        roomType: 'classroom' as const,
        capacity: 60,
        hasProjector: true,
        hasAC: true,
        hasVideoConf: false,
        building: 'AB-1'
      },
      {
        id: 8,
        name: 'AB2-214',
        department: 'cce' as const,
        roomType: 'classroom' as const,
        capacity: 60,
        hasProjector: true,
        hasAC: true,
        hasVideoConf: false,
        building: 'AB-2'
      },
      {
        id: 9,
        name: 'AB2-215',
        department: 'cce' as const,
        roomType: 'classroom' as const,
        capacity: 60,
        hasProjector: true,
        hasAC: true,
        hasVideoConf: false,
        building: 'AB-2'
      },
      {
        id: 10,
        name: 'AB3-107',
        department: 'iot' as const,
        roomType: 'classroom' as const,
        capacity: 60,
        hasProjector: true,
        hasAC: true,
        hasVideoConf: false,
        building: 'AB-3'
      },
      {
        id: 11,
        name: 'AB3-108',
        department: 'iot' as const,
        roomType: 'classroom' as const,
        capacity: 60,
        hasProjector: true,
        hasAC: true,
        hasVideoConf: false,
        building: 'AB-3'
      },
      {
        id: 12,
        name: 'TMA Pai Auditorium',
        department: 'all' as const,
        roomType: 'auditorium' as const,
        capacity: 1000,
        hasProjector: true,
        hasAC: true,
        hasVideoConf: true,
        building: 'Main Building'
      },
      {
        id: 13,
        name: 'MIT Auditorium',
        department: 'all' as const,
        roomType: 'auditorium' as const,
        capacity: 800,
        hasProjector: true,
        hasAC: true,
        hasVideoConf: true,
        building: 'Main Building'
      },
      {
        id: 14,
        name: 'IoT Faculty Meeting Room',
        department: 'iot' as const,
        roomType: 'meeting_hall' as const,
        capacity: 150,
        hasProjector: true,
        hasAC: true,
        hasVideoConf: true,
        building: 'AB-3'
      },
      {
        id: 15,
        name: 'CSE Faculty Meeting Room',
        department: 'computer_science' as const,
        roomType: 'meeting_hall' as const,
        capacity: 200,
        hasProjector: true,
        hasAC: true,
        hasVideoConf: true,
        building: 'AB-1'
      }
    ];

    // Seed the data using Array.from() for Map iteration
    for (const user of defaultUsers) {
      this.users.set(user.id, user);
    }

    for (const room of defaultRooms) {
      this.rooms.set(room.id, room);
    }

    // Seed timetable entries
    const defaultTimetableEntries: InsertTimetable[] = [
      // Monday - CSE-K
      {
        courseCode: 'MEE2001',
        courseName: 'Engineering Mechanics',
        roomId: 1,
        dayOfWeek: 'Monday',
        startTime: '09:30',
        endTime: '10:15',
        facultyName: 'Dr. Rahul Khatri',
        program: 'CSE-K'
      },
      {
        courseCode: 'CSE2202',
        courseName: 'Data Structures',
        roomId: 1,
        dayOfWeek: 'Monday',
        startTime: '10:15',
        endTime: '11:00',
        facultyName: 'Dr. Sushama Tanwar',
        program: 'CSE-K'
      },
      {
        courseCode: 'CSE2201',
        courseName: 'Computer Organization',
        roomId: 1,
        dayOfWeek: 'Monday',
        startTime: '11:15',
        endTime: '12:00',
        facultyName: 'Dr. Deepti Sharma',
        program: 'CSE-K'
      },
      {
        courseCode: 'CSE2221',
        courseName: 'Database Systems',
        roomId: 2,
        dayOfWeek: 'Monday',
        startTime: '12:00',
        endTime: '12:45',
        facultyName: 'Dr. Neetu Gupta',
        program: 'CSE-K'
      },
      // Tuesday - CSE-K
      {
        courseCode: 'CSE2203',
        courseName: 'Operating Systems',
        roomId: 3,
        dayOfWeek: 'Tuesday',
        startTime: '09:30',
        endTime: '10:15',
        facultyName: 'Dr. Manohara Pai M.M.',
        program: 'CSE-K'
      },
      {
        courseCode: 'CSE2204',
        courseName: 'Computer Networks',
        roomId: 3,
        dayOfWeek: 'Tuesday',
        startTime: '10:15',
        endTime: '11:00',
        facultyName: 'Dr. Radhika M. Pai',
        program: 'CSE-K'
      },
      {
        courseCode: 'CSE2205',
        courseName: 'Software Engineering',
        roomId: 3,
        dayOfWeek: 'Tuesday',
        startTime: '11:15',
        endTime: '12:00',
        facultyName: 'Dr. Sanjay Singh',
        program: 'CSE-K'
      },
      // Wednesday - CSE-K
      {
        courseCode: 'CSE2206',
        courseName: 'Web Technologies',
        roomId: 4,
        dayOfWeek: 'Wednesday',
        startTime: '09:30',
        endTime: '10:15',
        facultyName: 'Dr. Mohit Kumar',
        program: 'CSE-K'
      },
      {
        courseCode: 'CSE2207',
        courseName: 'Artificial Intelligence',
        roomId: 4,
        dayOfWeek: 'Wednesday',
        startTime: '10:15',
        endTime: '11:00',
        facultyName: 'Dr. Priya Sharma',
        program: 'CSE-K'
      },
      {
        courseCode: 'CSE2208',
        courseName: 'Machine Learning Lab',
        roomId: 4,
        dayOfWeek: 'Wednesday',
        startTime: '11:15',
        endTime: '12:45',
        facultyName: 'Dr. Ankit Verma',
        program: 'CSE-K'
      },
      // Thursday - CSE-K
      {
        courseCode: 'CSE2209',
        courseName: 'Cloud Computing',
        roomId: 5,
        dayOfWeek: 'Thursday',
        startTime: '09:30',
        endTime: '10:15',
        facultyName: 'Dr. Rajesh Kumar',
        program: 'CSE-K'
      },
      {
        courseCode: 'CSE2210',
        courseName: 'Cybersecurity',
        roomId: 5,
        dayOfWeek: 'Thursday',
        startTime: '10:15',
        endTime: '11:00',
        facultyName: 'Dr. Amit Singh',
        program: 'CSE-K'
      },
      {
        courseCode: 'CSE2211',
        courseName: 'Network Security Lab',
        roomId: 5,
        dayOfWeek: 'Thursday',
        startTime: '11:15',
        endTime: '12:45',
        facultyName: 'Dr. Suresh Kumar',
        program: 'CSE-K'
      },
      // Friday - CSE-K
      {
        courseCode: 'CSE2212',
        courseName: 'Big Data Analytics',
        roomId: 6,
        dayOfWeek: 'Friday',
        startTime: '09:30',
        endTime: '10:15',
        facultyName: 'Dr. Vinay Kumar',
        program: 'CSE-K'
      },
      {
        courseCode: 'CSE2213',
        courseName: 'IoT Systems',
        roomId: 6,
        dayOfWeek: 'Friday',
        startTime: '10:15',
        endTime: '11:00',
        facultyName: 'Dr. Ravi Shankar',
        program: 'CSE-K'
      },
      {
        courseCode: 'CSE2214',
        courseName: 'Project Work',
        roomId: 6,
        dayOfWeek: 'Friday',
        startTime: '11:15',
        endTime: '12:45',
        facultyName: 'Dr. Manohara Pai M.M.',
        program: 'CSE-K'
      },

      // CSE-A Section Timetable
      // Monday - CSE-A
      {
        courseCode: 'CSE2201',
        courseName: 'Computer Organization',
        roomId: 7,
        dayOfWeek: 'Monday',
        startTime: '09:30',
        endTime: '10:15',
        facultyName: 'Dr. Deepti Sharma',
        program: 'CSE-A'
      },
      {
        courseCode: 'CSE2202',
        courseName: 'Data Structures',
        roomId: 7,
        dayOfWeek: 'Monday',
        startTime: '10:15',
        endTime: '11:00',
        facultyName: 'Dr. Sushama Tanwar',
        program: 'CSE-A'
      },
      // Tuesday - CSE-A
      {
        courseCode: 'CSE2203',
        courseName: 'Operating Systems',
        roomId: 8,
        dayOfWeek: 'Tuesday',
        startTime: '09:30',
        endTime: '10:15',
        facultyName: 'Dr. Radhika M. Pai',
        program: 'CSE-A'
      },
      {
        courseCode: 'CSE2204',
        courseName: 'Computer Networks',
        roomId: 8,
        dayOfWeek: 'Tuesday',
        startTime: '10:15',
        endTime: '11:00',
        facultyName: 'Dr. Mohit Kumar',
        program: 'CSE-A'
      },
      // Wednesday - CSE-A
      {
        courseCode: 'CSE2206',
        courseName: 'Web Technologies',
        roomId: 9,
        dayOfWeek: 'Wednesday',
        startTime: '09:30',
        endTime: '10:15',
        facultyName: 'Dr. Priya Sharma',
        program: 'CSE-A'
      },
      {
        courseCode: 'CSE2207',
        courseName: 'Artificial Intelligence',
        roomId: 9,
        dayOfWeek: 'Wednesday',
        startTime: '10:15',
        endTime: '11:00',
        facultyName: 'Dr. Ankit Verma',
        program: 'CSE-A'
      },
      // Thursday - CSE-A
      {
        courseCode: 'CSE2209',
        courseName: 'Cloud Computing',
        roomId: 10,
        dayOfWeek: 'Thursday',
        startTime: '09:30',
        endTime: '10:15',
        facultyName: 'Dr. Amit Singh',
        program: 'CSE-A'
      },
      {
        courseCode: 'CSE2210',
        courseName: 'Cybersecurity',
        roomId: 10,
        dayOfWeek: 'Thursday',
        startTime: '10:15',
        endTime: '11:00',
        facultyName: 'Dr. Suresh Kumar',
        program: 'CSE-A'
      },
      // Friday - CSE-A
      {
        courseCode: 'CSE2212',
        courseName: 'Big Data Analytics',
        roomId: 11,
        dayOfWeek: 'Friday',
        startTime: '09:30',
        endTime: '10:15',
        facultyName: 'Dr. Ravi Shankar',
        program: 'CSE-A'
      },
      {
        courseCode: 'CSE2213',
        courseName: 'IoT Systems',
        roomId: 11,
        dayOfWeek: 'Friday',
        startTime: '10:15',
        endTime: '11:00',
        facultyName: 'Dr. Vinay Kumar',
        program: 'CSE-A'
      },

      // CSE-B Section Timetable
      // Monday - CSE-B
      {
        courseCode: 'CSE2201',
        courseName: 'Computer Organization',
        roomId: 1,
        dayOfWeek: 'Monday',
        startTime: '02:00',
        endTime: '02:45',
        facultyName: 'Dr. Deepti Sharma',
        program: 'CSE-B'
      },
      {
        courseCode: 'CSE2202',
        courseName: 'Data Structures',
        roomId: 1,
        dayOfWeek: 'Monday',
        startTime: '02:45',
        endTime: '03:30',
        facultyName: 'Dr. Sushama Tanwar',
        program: 'CSE-B'
      },
      // Tuesday - CSE-B
      {
        courseCode: 'CSE2203',
        courseName: 'Operating Systems',
        roomId: 2,
        dayOfWeek: 'Tuesday',
        startTime: '02:00',
        endTime: '02:45',
        facultyName: 'Dr. Manohara Pai M.M.',
        program: 'CSE-B'
      },
      {
        courseCode: 'CSE2204',
        courseName: 'Computer Networks',
        roomId: 2,
        dayOfWeek: 'Tuesday',
        startTime: '02:45',
        endTime: '03:30',
        facultyName: 'Dr. Radhika M. Pai',
        program: 'CSE-B'
      },
      // Wednesday - CSE-B
      {
        courseCode: 'CSE2206',
        courseName: 'Web Technologies',
        roomId: 3,
        dayOfWeek: 'Wednesday',
        startTime: '02:00',
        endTime: '02:45',
        facultyName: 'Dr. Mohit Kumar',
        program: 'CSE-B'
      },
      {
        courseCode: 'CSE2207',
        courseName: 'Artificial Intelligence',
        roomId: 3,
        dayOfWeek: 'Wednesday',
        startTime: '02:45',
        endTime: '03:30',
        facultyName: 'Dr. Priya Sharma',
        program: 'CSE-B'
      },
      // Thursday - CSE-B
      {
        courseCode: 'CSE2209',
        courseName: 'Cloud Computing',
        roomId: 4,
        dayOfWeek: 'Thursday',
        startTime: '02:00',
        endTime: '02:45',
        facultyName: 'Dr. Rajesh Kumar',
        program: 'CSE-B'
      },
      {
        courseCode: 'CSE2210',
        courseName: 'Cybersecurity',
        roomId: 4,
        dayOfWeek: 'Thursday',
        startTime: '02:45',
        endTime: '03:30',
        facultyName: 'Dr. Amit Singh',
        program: 'CSE-B'
      },
      // Friday - CSE-B
      {
        courseCode: 'CSE2212',
        courseName: 'Big Data Analytics',
        roomId: 5,
        dayOfWeek: 'Friday',
        startTime: '02:00',
        endTime: '02:45',
        facultyName: 'Dr. Vinay Kumar',
        program: 'CSE-B'
      },
      {
        courseCode: 'CSE2213',
        courseName: 'IoT Systems',
        roomId: 5,
        dayOfWeek: 'Friday',
        startTime: '02:45',
        endTime: '03:30',
        facultyName: 'Dr. Ravi Shankar',
        program: 'CSE-B'
      }
    ];

    for (const entry of defaultTimetableEntries) {
      this.createTimetableEntry(entry);
    }

    // Create some bookings
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const defaultBookings: {
      userId: number;
      roomId: number;
      startTime: Date;
      endTime: Date;
      purpose: string;
      status: "pending" | "approved" | "rejected";
    }[] = [
      // Current bookings (visible to students as occupied)
      {
        userId: 3, // teacher1
        roomId: 1, // AB1-014
        startTime: new Date(today.setHours(9, 30, 0, 0)),
        endTime: new Date(today.setHours(12, 30, 0, 0)),
        purpose: 'Special Lecture on Advanced Algorithms',
        status: 'approved'
      },
      {
        userId: 4, // teacher2
        roomId: 12, // TMA Pai Auditorium
        startTime: new Date(today.setHours(14, 0, 0, 0)),
        endTime: new Date(today.setHours(17, 0, 0, 0)),
        purpose: 'Department Technical Symposium',
        status: 'approved'
      },
      {
        userId: 2, // hodcse
        roomId: 15, // CSE Faculty Meeting Room
        startTime: new Date(today.setHours(10, 0, 0, 0)),
        endTime: new Date(today.setHours(12, 0, 0, 0)),
        purpose: 'Faculty Meeting',
        status: 'approved'
      },
      // Student bookings (visible on student dashboard)
      {
        userId: 5, // student1
        roomId: 4, // AB1-113
        startTime: new Date(today.setHours(15, 0, 0, 0)),
        endTime: new Date(today.setHours(17, 0, 0, 0)),
        purpose: 'Project Group Discussion',
        status: 'approved'
      },
      {
        userId: 6, // student2
        roomId: 5, // AB1-114
        startTime: new Date(today.setHours(14, 0, 0, 0)),
        endTime: new Date(today.setHours(16, 0, 0, 0)),
        purpose: 'IEEE Student Branch Meeting',
        status: 'approved'
      },
      // Future bookings (next week - allowing teachers to still book)
      {
        userId: 3, // teacher1
        roomId: 1, // AB1-014
        startTime: new Date(nextWeek.setHours(10, 0, 0, 0)),
        endTime: new Date(nextWeek.setHours(12, 0, 0, 0)),
        purpose: 'Guest Lecture on Cloud Computing',
        status: 'approved'
      },
      {
        userId: 4, // teacher2
        roomId: 2, // AB1-015
        startTime: new Date(nextWeek.setHours(14, 0, 0, 0)),
        endTime: new Date(nextWeek.setHours(16, 0, 0, 0)),
        purpose: 'Workshop on Machine Learning',
        status: 'approved'
      },
      // Tomorrow's bookings
      {
        userId: 5, // student1
        roomId: 6, // AB1-214
        startTime: new Date(tomorrow.setHours(9, 0, 0, 0)),
        endTime: new Date(tomorrow.setHours(11, 0, 0, 0)),
        purpose: 'Student Council Meeting',
        status: 'approved'
      },
      {
        userId: 6, // student2
        roomId: 7, // AB1-215
        startTime: new Date(tomorrow.setHours(14, 0, 0, 0)),
        endTime: new Date(tomorrow.setHours(16, 0, 0, 0)),
        purpose: 'Coding Club Session',
        status: 'approved'
      },
      // Some pending bookings
      {
        userId: 5, // student1
        roomId: 8, // AB2-214
        startTime: new Date(tomorrow.setHours(11, 0, 0, 0)),
        endTime: new Date(tomorrow.setHours(13, 0, 0, 0)),
        purpose: 'Technical Paper Discussion',
        status: 'pending'
      },
      {
        userId: 6, // student2
        roomId: 9, // AB2-215
        startTime: new Date(tomorrow.setHours(15, 0, 0, 0)),
        endTime: new Date(tomorrow.setHours(17, 0, 0, 0)),
        purpose: 'Hackathon Planning Meeting',
        status: 'pending'
      }
    ];

    // Seed bookings in constructor
    for (const booking of defaultBookings) {
      this.createBooking(booking);
    }
  }
}

export const storage = new MemStorage();