ClassRoom Booking System for colleges

A modern web application for managing room bookings in an educational institution. The system supports different types of rooms (classrooms, auditoriums, and meeting halls) with role-based access control.

## Features

- **User Roles**:
  - Global Admin: Manages classroom and auditorium bookings
  - Department Admin: Manages meeting hall bookings for their department
  - Teachers: Can request room bookings
  - Students: Can view timetables for all sections,branches, available rooms in college.

- **Room Types**:
  - Classrooms
  - Auditoriums
  - Meeting Halls
  - management rooms

- **Booking Management**:
  - Request room bookings
  - Approve/reject booking requests
  - View booking history
  - Filter bookings by status
  - Check room availability

## Tech Stack

- **Frontend**:
  - React with TypeScript
  - Vite for build tooling
  - TanStack Query for data fetching
  - Tailwind CSS for styling
    

- **Backend**:
  - Node.js with Express
  - TypeScript
  - Mongodb and local storage

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── lib/          # Utilities and types
│   │   ├── hooks/        # Custom React hooks
│   │   ├── context/      # React context providers
│   │   └── assets/       # Static assets
│
├── server/                # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data storage implementation
│   └── vite.ts          # Vite configuration
│
└── shared/               # Shared code between client and server
    └── schema.ts         # Data schemas and types
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

## Development

- Frontend development server runs on port 5173
- Backend API server runs on port 3000
- API endpoints are proxied from frontend to backend during development

## API Endpoints

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/available` - Get available rooms
- `GET /api/rooms/:id` - Get room details

### Bookings
- `POST /api/bookings` - Create a booking request
- `GET /api/bookings` - Get user's bookings
- `GET /api/bookings/pending` - Get pending bookings (admin only)
- `PATCH /api/bookings/:id/status` - Update booking status (admin only)
