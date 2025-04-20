import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Booking, Room, User } from "@/lib/types";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { AlertCircle, Calendar, Check, Clock, MapPin, User as UserIcon, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function AdminBookings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  // Fetch all bookings
  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ['/api/bookings'],
  });

  // Fetch rooms to get details for each booking
  const { data: rooms } = useQuery<Room[]>({
    queryKey: ['/api/rooms'],
  });

  // Fetch users to get details for each booking
  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Helper to get room details
  const getRoomDetails = (roomId: number) => {
    return rooms?.find(room => room.id === roomId);
  };

  // Helper to get user details
  const getUserDetails = (userId: number) => {
    return users?.find(user => user.id === userId);
  };

  // Filter bookings based on user role and room type
  const filteredBookings = bookings?.filter(booking => {
    const room = getRoomDetails(booking.roomId);

    // First filter by tab status
    if (activeTab !== "all" && booking.status !== activeTab) {
      return false;
    }

    // Then filter by user role and room type
    if (user?.role === "admin") {
      // Global admin sees classroom and auditorium bookings
      return room?.roomType === "classroom" || room?.roomType === "auditorium";
    } else if (user?.role === "department_admin") {
      // Department admin only sees meeting hall bookings for their department
      return room?.roomType === "meeting_hall" && 
             (room?.department === user.department || user.department === "all");
    }

    return false;
  });

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

  // Approve booking mutation
  const approveMutation = useMutation({
    mutationFn: (bookingId: number) => 
      apiRequest('PATCH', `/api/bookings/${bookingId}/status`, { status: 'approved' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: "Booking Approved",
        description: "The booking request has been approved successfully.",
      });
      setIsApproveDialogOpen(false);
      setSelectedBooking(null);
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve booking",
        variant: "destructive",
      });
    },
  });

  // Reject booking mutation
  const rejectMutation = useMutation({
    mutationFn: (bookingId: number) => 
      apiRequest('PATCH', `/api/bookings/${bookingId}/status`, { status: 'rejected' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: "Booking Rejected",
        description: "The booking request has been rejected.",
      });
      setIsRejectDialogOpen(false);
      setSelectedBooking(null);
    },
    onError: (error: any) => {
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject booking",
        variant: "destructive",
      });
    },
  });

  // Open approve dialog
  const openApproveDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsApproveDialogOpen(true);
  };

  // Open reject dialog
  const openRejectDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsRejectDialogOpen(true);
  };

  // Handle approve confirmation
  const handleApprove = () => {
    if (selectedBooking) {
      approveMutation.mutate(selectedBooking.id);
    }
  };

  // Handle reject confirmation
  const handleReject = () => {
    if (selectedBooking) {
      rejectMutation.mutate(selectedBooking.id);
    }
  };

  return (
    <div className="flex flex-col p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          {user?.role === "admin" ? "Classroom & Auditorium Bookings" : "Meeting Hall Bookings"}
        </h1>
        <p className="text-muted-foreground">
          {user?.role === "admin" 
            ? "Review and manage classroom and auditorium booking requests" 
            : `Review and manage meeting hall booking requests for ${user?.department.replace('_', ' ')} department`}
        </p>
      </div>

      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <p>Loading booking requests...</p>
        </div>
      ) : !sortedBookings || sortedBookings.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No booking requests found</AlertTitle>
          <AlertDescription>
            There are no {activeTab !== "all" ? activeTab : ""} booking requests to review at this time.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedBookings.map((booking) => {
            const room = getRoomDetails(booking.roomId);
            const user = getUserDetails(booking.userId);
            return (
              <Card key={booking.id}>
                <CardHeader className="pb-2 flex flex-row items-start justify-between">
                  <div>
                    <CardTitle>{room?.name || `Room #${booking.roomId}`}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Booking #{booking.id} • Requested on {format(new Date(booking.createdAt), "MMMM d, yyyy")}
                    </p>
                  </div>
                  <Badge variant={booking.status as any}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <UserIcon className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">{user?.name || `User #${booking.userId}`}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {user?.role || "Teacher"} • {user?.department.replace('_', ' ') || "Department"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">{format(new Date(booking.startTime), "MMMM d, yyyy")}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(booking.startTime), "h:mm a")} - {format(new Date(booking.endTime), "h:mm a")}
                        </p>
                      </div>
                    </div>

                    {room && (
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium">{room.building}</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <Badge variant="outline" className="capitalize">{room.roomType.replace('_', ' ')}</Badge>
                            <Badge variant="outline" className="capitalize">{room.department.replace('_', ' ')}</Badge>
                          </div>
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
                      <div className="flex justify-end space-x-3 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openRejectDialog(booking)}
                          className="text-red-500 border-red-200 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => openApproveDialog(booking)}
                          className="text-white bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Booking Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this booking request? This will confirm the room reservation.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="py-4">
              <div className="bg-muted p-4 rounded-md space-y-3 mb-4">
                <div>
                  <p className="text-sm font-medium">Room:</p>
                  <p className="text-sm">{getRoomDetails(selectedBooking.roomId)?.name || `Room #${selectedBooking.roomId}`}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Date & Time:</p>
                  <p className="text-sm">
                    {formatDate(selectedBooking.startTime)} • {formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleApprove} 
              disabled={approveMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {approveMutation.isPending ? "Processing..." : "Confirm Approval"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Booking Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this booking request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="py-4">
              <div className="bg-muted p-4 rounded-md space-y-3 mb-4">
                <div>
                  <p className="text-sm font-medium">Room:</p>
                  <p className="text-sm">{getRoomDetails(selectedBooking.roomId)?.name || `Room #${selectedBooking.roomId}`}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Date & Time:</p>
                  <p className="text-sm">
                    {formatDate(selectedBooking.startTime)} • {formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "Processing..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}