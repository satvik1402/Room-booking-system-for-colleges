import { useAuth } from "@/context/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Booking, Room } from "@/lib/types";
import manipalLogo from "@assets/1_1745169307230.png";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: bookings, isLoading: isLoadingBookings } = useQuery<Booking[]>({
    queryKey: ['/api/bookings'],
  });
  
  const { data: rooms, isLoading: isLoadingRooms } = useQuery<Room[]>({
    queryKey: ['/api/rooms'],
  });
  
  // Calculate statistics
  const pendingBookings = bookings?.filter(b => b.status === 'pending').length || 0;
  const approvedBookings = bookings?.filter(b => b.status === 'approved').length || 0;
  const totalRooms = rooms?.length || 0;
  const classrooms = rooms?.filter(r => r.roomType === 'classroom').length || 0;
  const meetingHalls = rooms?.filter(r => r.roomType === 'meeting_hall').length || 0;
  const auditoriums = rooms?.filter(r => r.roomType === 'auditorium').length || 0;
  
  return (
    <div className="flex flex-col p-6">
      {/* Welcome Banner */}
      <div className="bg-primary text-white p-6 rounded-lg flex justify-between items-center mb-6">
        <div className="flex items-center">
          <img src={manipalLogo} alt="Manipal Logo" className="w-16 h-16 mr-4" />
          <div>
            <h2 className="text-2xl font-bold mb-1">Welcome back, {user?.name.split(' ')[0]}!</h2>
            <p className="text-primary-100">Always stay updated in Room booking portal</p>
          </div>
        </div>
        <div>
          <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="40" r="20" fill="#FFFFFF"/>
            <path d="M30 60H70C70 70 60 80 50 80C40 80 30 70 30 60Z" fill="#FFFFFF"/>
            <path d="M25 90C25 85 35 80 50 80C65 80 75 85 75 90" stroke="#FFFFFF" strokeWidth="2"/>
            <path d="M20 95C20 90 35 85 50 85C65 85 80 90 80 95" stroke="#FFFFFF" strokeWidth="2"/>
            <path d="M15 100C15 95 35 90 50 90C65 90 85 95 85 100" stroke="#FFFFFF" strokeWidth="2"/>
          </svg>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingRooms ? '...' : totalRooms}</div>
            <div className="text-xs text-muted-foreground mt-1">Available in campus</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Classrooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingRooms ? '...' : classrooms}</div>
            <div className="text-xs text-muted-foreground mt-1">Available for booking</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Meeting Halls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingRooms ? '...' : meetingHalls}</div>
            <div className="text-xs text-muted-foreground mt-1">Available for booking</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Auditoriums</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingRooms ? '...' : auditoriums}</div>
            <div className="text-xs text-muted-foreground mt-1">Available for booking</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">Need a room?</p>
            <div className="flex justify-between items-center">
              <div>
                <Badge variant="classroom" className="mr-2">Classrooms</Badge>
                <Badge variant="meeting_hall" className="mr-2">Meeting Halls</Badge>
                <Badge variant="auditorium">Auditoriums</Badge>
              </div>
              <Link href="/available-rooms">
                <Button>View Available Rooms</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        {user?.role === 'student' ? (
          <Card>
            <CardHeader>
              <CardTitle>Daily Notice</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">Check your timetable</p>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  View your class schedule and room assignments
                </div>
                <Link href="/timetable">
                  <Button>View Timetable</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Booking Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                {user?.role === 'admin' ? 'Manage booking requests' : 'Track your booking requests'}
              </p>
              <div className="flex justify-between items-center">
                <div>
                  {user?.role === 'admin' ? (
                    <Badge variant="pending" className="mr-2">{pendingBookings} Pending</Badge>
                  ) : (
                    <>
                      <Badge variant="pending" className="mr-2">Pending</Badge>
                      <Badge variant="approved">Approved</Badge>
                    </>
                  )}
                </div>
                <Link href={user?.role === 'admin' ? '/admin/bookings' : '/my-bookings'}>
                  <Button>
                    {user?.role === 'admin' ? 'Manage Bookings' : 'My Bookings'}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Updates Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Updates</h2>
          <Link href="#">
            <Button variant="ghost" size="sm">See all</Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-amber-50 border-amber-100">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Update Item 1</h3>
              <p className="text-sm text-muted-foreground">New booking system features available</p>
            </CardContent>
          </Card>
          
          <Card className="bg-amber-50 border-amber-100">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Update Item 2</h3>
              <p className="text-sm text-muted-foreground">Maintenance scheduled for next weekend</p>
            </CardContent>
          </Card>
          
          <Card className="bg-amber-50 border-amber-100">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Update Item 3</h3>
              <p className="text-sm text-muted-foreground">New auditorium booking policy</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
