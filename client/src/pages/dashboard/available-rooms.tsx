import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Room } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RoomCard from "@/components/room-card";

export default function AvailableRooms() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedBuilding, setSelectedBuilding] = useState("all");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  
  // Fetch all rooms
  const { data: allRooms, isLoading: isLoadingRooms } = useQuery<Room[]>({
    queryKey: ['/api/rooms'],
  });
  
  // Fetch available rooms based on filters
  const {
    data: availableRooms,
    isLoading: isLoadingAvailable,
    refetch: refetchAvailable,
  } = useQuery<Room[]>({
    queryKey: ['/api/rooms/available', { date, startTime, endTime }],
    enabled: false,
  });
  
  const rooms = availableRooms || allRooms || [];
  const isLoading = isLoadingRooms || isLoadingAvailable;
  
  // Get unique buildings from rooms data
  const buildings = allRooms
    ? Array.from(new Set(allRooms.map((room) => room.building)))
    : [];
  
  // Filter rooms based on search and selected filters
  const filteredRooms = rooms
    ? rooms.filter((room) => {
        const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType === "all" || room.roomType === selectedType;
        const matchesBuilding = selectedBuilding === "all" || room.building === selectedBuilding;
        return matchesSearch && matchesType && matchesBuilding;
      })
    : [];
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetchAvailable();
  };
  
  return (
    <div className="flex flex-col p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Room Availability</h1>
        <p className="text-muted-foreground">Browse available rooms across campus</p>
      </div>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="w-full md:w-1/3 space-y-2">
                <Label htmlFor="search">Search Rooms</Label>
                <Input
                  id="search"
                  placeholder="Search rooms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="w-full md:w-1/3 space-y-2">
                <Label htmlFor="type">Room Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="classroom">Classrooms</SelectItem>
                    <SelectItem value="meeting_hall">Meeting Halls</SelectItem>
                    <SelectItem value="auditorium">Auditoriums</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-1/3 space-y-2">
                <Label htmlFor="building">Building</Label>
                <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                  <SelectTrigger id="building">
                    <SelectValue placeholder="All Buildings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Buildings</SelectItem>
                    {buildings.map((building) => (
                      <SelectItem key={building} value={building}>
                        {building}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="w-full md:w-auto">
                Find Available Rooms
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          variant={selectedType === "all" ? "default" : "outline"}
          onClick={() => setSelectedType("all")}
          className="rounded-full"
          size="sm"
        >
          All ({rooms.length})
        </Button>
        <Button
          variant={selectedType === "classroom" ? "default" : "outline"}
          onClick={() => setSelectedType("classroom")}
          className="rounded-full"
          size="sm"
        >
          Classrooms ({rooms.filter(r => r.roomType === "classroom").length})
        </Button>
        <Button
          variant={selectedType === "meeting_hall" ? "default" : "outline"}
          onClick={() => setSelectedType("meeting_hall")}
          className="rounded-full"
          size="sm"
        >
          Meeting Halls ({rooms.filter(r => r.roomType === "meeting_hall").length})
        </Button>
        <Button
          variant={selectedType === "auditorium" ? "default" : "outline"}
          onClick={() => setSelectedType("auditorium")}
          className="rounded-full"
          size="sm"
        >
          Auditoriums ({rooms.filter(r => r.roomType === "auditorium").length})
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <p>Loading rooms...</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="bg-muted rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No rooms found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or time slot.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <RoomCard key={room.id} room={room} isAvailable={true} />
          ))}
        </div>
      )}
    </div>
  );
}
