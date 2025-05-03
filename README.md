## Classroom Booking System For college

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


## UI designs
## Student Side-
![image](https://github.com/user-attachments/assets/4d59b706-c328-40bb-a8bc-dd4ec19b4429)
![image](https://github.com/user-attachments/assets/c7262dfe-4c5a-4bba-a81d-a3b89d66eb96)
![image](https://github.com/user-attachments/assets/08dfa7bc-d5a3-424f-97ec-95be68263482)
![image](https://github.com/user-attachments/assets/f53e1422-e32b-446c-8ba9-e313af41fcc2)

## Teacher Side-
![image](https://github.com/user-attachments/assets/467c992b-eb13-45f2-83b2-7a53d3fc6704)
![image](https://github.com/user-attachments/assets/85142770-9bc8-4db8-b8a1-bae78b478c18)
![image](https://github.com/user-attachments/assets/ef3e71ce-bb23-451d-a220-bd010e6da30c)
![image](https://github.com/user-attachments/assets/0d468115-75d1-44b7-a3fa-aa8135c55b68)

Admin-
![image](https://github.com/user-attachments/assets/2a34401a-4038-460d-8e7b-20be56ea999e)
