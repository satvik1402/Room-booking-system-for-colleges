import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Booking, Room } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { AlertCircle, Calendar, Clock, MapPin } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function MyBookings() {
  const [activeTab, setActiveTab] = useState("all");
  
  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ['/api/bookings'],
  });
  
  const { data: rooms } = useQuery<Room[]>({
    queryKey: ['/api/rooms'],
  });
  
  // Helper to get room details
  const getRoomDetails = (roomId: number) => {
    return rooms?.find(room => room.id === roomId);
  };
  
  // Filter bookings based on active tab
  const filteredBookings = bookings?.filter(booking => {
    if (!booking) return false;
    if (activeTab === "all") return true;
    return booking.status === activeTab;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Sort bookings by date (most recent first)
  const sortedBookings = filteredBookings?.sort((a, b) => {
    return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
  });
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMMM d, yyyy");
  };
  
  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "h:mm a");
  };
  
  return (
    <div className="flex flex-col p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">My Bookings</h1>
        <p className="text-muted-foreground">Manage your room booking requests</p>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Bookings</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <p>Loading bookings...</p>
        </div>
      ) : !sortedBookings || sortedBookings.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No bookings found</AlertTitle>
          <AlertDescription>
            You don't have any {activeTab !== "all" ? activeTab : ""} bookings yet. 
            Visit the "Available Rooms" section to make a booking.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedBookings.map((booking) => {
            const room = getRoomDetails(booking.roomId);
            return (
              <Card key={booking.id}>
                <CardHeader className="pb-2 flex flex-row items-start justify-between">
                  <div>
                    <CardTitle>{room?.name || `Room #${booking.roomId}`}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Booking #{booking.id}
                    </p>
                  </div>
                  <Badge variant={booking.status as any}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">{formatDate(booking.startTime)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </p>
                      </div>
                    </div>
                    
                    {room && (
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium">{room.building}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {room.department.replace('_', ' ')} Department
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-1">Purpose:</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.purpose}
                      </p>
                    </div>
                    
                    {booking.status === "pending" && (
                      <div className="bg-yellow-50 p-3 rounded-md">
                        <p className="text-xs text-yellow-800">
                          Your booking is pending approval from the admin. You will be notified once it's processed.
                        </p>
                      </div>
                    )}
                    
                    {booking.status === "rejected" && (
                      <div className="bg-red-50 p-3 rounded-md">
                        <p className="text-xs text-red-800">
                          Your booking request was rejected. Please try another time slot or contact the admin for more information.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
