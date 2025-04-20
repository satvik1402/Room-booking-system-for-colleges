import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TimetableEntry } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function Timetable() {
  const [selectedProgram, setSelectedProgram] = useState("CSE-K");
  const [selectedDay, setSelectedDay] = useState("Monday");
  
  const { data: timetable, isLoading } = useQuery<TimetableEntry[]>({
    queryKey: ['/api/timetable', selectedProgram, selectedDay],
    queryFn: async () => {
      const res = await fetch(`/api/timetable/${selectedProgram}?day=${selectedDay}`);
      if (!res.ok) throw new Error("Failed to fetch timetable");
      return res.json();
    },
  });
  
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  
  return (
    <div className="flex flex-col p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Class Timetable</h1>
        <p className="text-muted-foreground">View your class schedule and room assignments</p>
      </div>
      
      <div className="mb-6">
        <Select value={selectedProgram} onValueChange={setSelectedProgram}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Select Program" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CSE-K">CSE-K</SelectItem>
            <SelectItem value="CSE-A">CSE-A</SelectItem>
            <SelectItem value="ECE-C">ECE-C</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Tabs defaultValue="Monday" value={selectedDay} onValueChange={setSelectedDay}>
        <TabsList className="grid grid-cols-5 mb-6">
          {days.map((day) => (
            <TabsTrigger key={day} value={day}>
              {day}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {days.map((day) => (
          <TabsContent key={day} value={day}>
            <Card>
              <CardHeader>
                <CardTitle>{day} Schedule - {selectedProgram}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center p-6">
                    <p>Loading timetable...</p>
                  </div>
                ) : !timetable || timetable.length === 0 ? (
                  <div className="bg-muted rounded-lg p-8 text-center">
                    <h3 className="text-lg font-medium mb-2">No classes scheduled</h3>
                    <p className="text-muted-foreground">
                      There are no classes scheduled for {selectedProgram} on {day}.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 px-4 text-left">Time</th>
                          <th className="py-3 px-4 text-left">Course</th>
                          <th className="py-3 px-4 text-left">Room</th>
                          <th className="py-3 px-4 text-left">Faculty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {timetable.map((entry) => (
                          <tr key={entry.id} className="border-b">
                            <td className="py-3 px-4">
                              {entry.startTime} - {entry.endTime}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium">{entry.courseCode}</div>
                              <div className="text-sm text-muted-foreground">{entry.courseName}</div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="outline">R{entry.roomId}AB{String(entry.roomId).padStart(4, '0')}</Badge>
                            </td>
                            <td className="py-3 px-4">{entry.facultyName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
