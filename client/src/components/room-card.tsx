import { Room } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import BookingModal from "@/components/booking-modal";

interface RoomCardProps {
  room: Room;
  isAvailable?: boolean;
}

export default function RoomCard({ room, isAvailable = true }: RoomCardProps) {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  
  const openBookingModal = () => {
    setBookingModalOpen(true);
  };
  
  const closeBookingModal = () => {
    setBookingModalOpen(false);
  };
  
  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-semibold text-lg">{room.name}</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant={room.roomType as any}>{room.roomType.replace('_', ' ')}</Badge>
                <Badge variant={isAvailable ? 'available' : 'occupied'}>
                  {isAvailable ? 'Currently Available' : 'Currently Occupied'}
                </Badge>
              </div>
            </div>
            <Badge variant={room.department as any}>{room.department.replace('_', ' ')}</Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Capacity: {room.capacity}</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Building: {room.building}</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="bg-gray-50 p-4 border-t">
          <div className="flex items-center justify-between w-full">
            <div className="flex space-x-2">
              {room.hasProjector && (
                <div className="flex items-center rounded-full bg-gray-200 p-1.5" title="Projector">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              
              {room.hasAC && (
                <div className="flex items-center rounded-full bg-gray-200 p-1.5" title="Air Conditioning">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.412 10.176A4.994 4.994 0 0112 9.5c1.33 0 2.53.52 3.413 1.376M8 13h8m-4-4v8m0-12V5" />
                  </svg>
                </div>
              )}
              
              {room.hasVideoConf && (
                <div className="flex items-center rounded-full bg-gray-200 p-1.5" title="Video Conferencing">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            
            <Button 
              onClick={openBookingModal}
              disabled={!isAvailable}
              variant={isAvailable ? "default" : "outline"}
            >
              {isAvailable ? "Book Now" : "Unavailable"}
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {bookingModalOpen && (
        <BookingModal room={room} onClose={closeBookingModal} />
      )}
    </>
  );
}
