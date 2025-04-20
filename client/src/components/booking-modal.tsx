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
  
  const bookingMutation = useMutation({
    mutationFn: (bookingData: any) => apiRequest('POST', '/api/bookings', bookingData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rooms/available'] });
      toast({
        title: "Booking Submitted",
        description: "Your booking has been submitted for approval",
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !startTime || !endTime || !purpose) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);
    
    if (endDateTime <= startDateTime) {
      toast({
        title: "Time Error",
        description: "End time must be after start time",
        variant: "destructive",
      });
      return;
    }
    
    bookingMutation.mutate({
      roomId: room.id,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      purpose,
    });
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
