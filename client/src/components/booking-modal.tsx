import { useState } from "react";
import { Room } from "@/lib/types";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface BookingModalProps {
  room: Room;
  onClose: () => void;
}

export default function BookingModal({ room, onClose }: BookingModalProps) {
  const { toast } = useToast();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  
  // Update booking mutation to include logic for approvals
  const bookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest('POST', '/api/bookings', bookingData);
      if (!response.ok) throw new Error('Failed to submit booking');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rooms/available'] });
      toast({
        title: "Booking Submitted",
        description: `Your booking for ${room.name} has been submitted and is awaiting approval.`,
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to submit your booking request",
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert selected date and times to Date objects
    const selectedDate = new Date(date);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startDateTime = new Date(selectedDate);
    startDateTime.setHours(startHour, startMinute, 0, 0);
    
    const endDateTime = new Date(selectedDate);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    // Check if booking is for a future date/time
    const now = new Date();
    if (startDateTime <= now) {
      toast({
        title: "Invalid Booking Time",
        description: "Please select a future date and time for your booking.",
        variant: "destructive",
      });
      return;
    }

    // Check if end time is after start time
    if (endDateTime <= startDateTime) {
      toast({
        title: "Invalid Time Range",
        description: "End time must be after start time.",
        variant: "destructive",
      });
      return;
    }

    // Check if the selected time is within working hours (9 AM to 5 PM)
    if (startHour < 9 || endHour > 17) {
      toast({
        title: "Invalid Time",
        description: "Bookings are only allowed between 9 AM and 5 PM.",
        variant: "destructive",
      });
      return;
    }

    const bookingData = {
      roomId: room.id,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      purpose: purpose.trim()
    };

    bookingMutation.mutate(bookingData);
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book {room.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Room Type</Label>
              <div className="h-10 px-3 py-2 border rounded-md border-input bg-background text-muted-foreground flex items-center">
                {room.roomType.replace('_', ' ')}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose of Booking</Label>
            <Textarea
              id="purpose"
              placeholder="Briefly describe why you need this room..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
            />
          </div>
          
          <div className="bg-muted p-3 rounded-md">
            <h4 className="font-medium mb-2">Room Details</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>Capacity: {room.capacity} people</li>
              <li>Building: {room.building}</li>
              <li>
                Amenities: {[
                  room.hasProjector ? 'Projector' : null,
                  room.hasAC ? 'AC' : null,
                  room.hasVideoConf ? 'Video Conferencing' : null
                ].filter(Boolean).join(', ') || 'None'}
              </li>
            </ul>
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={bookingMutation.isPending}
            >
              {bookingMutation.isPending ? "Submitting..." : "Request Booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}