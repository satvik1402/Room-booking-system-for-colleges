import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  // Function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  // Function to get role display text
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin':
        return 'System Administrator';
      case 'department_admin':
        return 'Department Head';
      case 'teacher':
        return 'Faculty Member';
      case 'student':
        return 'Student';
      default:
        return role;
    }
  };

  // Function to get department display text
  const getDepartmentDisplay = (dept: string) => {
    switch (dept) {
      case 'computer_science':
        return 'Computer Science & Engineering';
      case 'cce':
        return 'Cloud Computing & Engineering';
      case 'iot':
        return 'Internet of Things';
      case 'it':
        return 'Information Technology';
      case 'aiml':
        return 'AI & Machine Learning';
      case 'data_science':
        return 'Data Science';
      case 'all':
        return 'All Departments';
      default:
        return dept;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Personal Details</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">
                {getRoleDisplay(user.role)}
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-muted-foreground">Username</h3>
              <p>{user.username}</p>
            </div>
            <div>
              <h3 className="font-medium text-muted-foreground">Email</h3>
              <p>{user.email}</p>
            </div>
            <div>
              <h3 className="font-medium text-muted-foreground">Department</h3>
              <p>{getDepartmentDisplay(user.department)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information Card */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Additional Information</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.role === 'student' && (
              <>
                <div>
                  <h3 className="font-medium text-muted-foreground">Program</h3>
                  <p>B.Tech Computer Science & Engineering</p>
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground">Semester</h3>
                  <p>6th Semester</p>
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground">Section</h3>
                  <p>CSE-K</p>
                </div>
              </>
            )}
            {(user.role === 'teacher' || user.role === 'department_admin') && (
              <>
                <div>
                  <h3 className="font-medium text-muted-foreground">Designation</h3>
                  <p>{user.role === 'department_admin' ? 'Professor & Head of Department' : 'Professor'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground">Office</h3>
                  <p>AB-1, Room {user.role === 'department_admin' ? '301' : '205'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground">Contact Extension</h3>
                  <p>+91 (824) 2474{Math.floor(Math.random() * 900) + 100}</p>
                </div>
              </>
            )}
            {user.role === 'admin' && (
              <>
                <div>
                  <h3 className="font-medium text-muted-foreground">Designation</h3>
                  <p>System Administrator</p>
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground">Office</h3>
                  <p>Admin Block, Room 101</p>
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground">Contact</h3>
                  <p>+91 (824) 2474000</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile; 