export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  department: string;
}

export interface Room {
  id: number;
  name: string;
  roomType: 'classroom' | 'meeting_hall' | 'auditorium';
  capacity: number;
  department: string;
  hasProjector: boolean;
  hasAC: boolean;
  hasVideoConf: boolean;
  building: string;
}

export interface Booking {
  id: number;
  userId: number;
  roomId: number;
  startTime: string;
  endTime: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  room?: Room;
  user?: User;
}

export interface TimetableEntry {
  id: number;
  courseCode: string;
  courseName: string;
  roomId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  facultyName: string;
  program: string;
}
