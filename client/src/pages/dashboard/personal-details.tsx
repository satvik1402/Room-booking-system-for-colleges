import { useAuth } from "@/context/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function PersonalDetails() {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="flex justify-center items-center p-12">
        <p>Loading user details...</p>
      </div>
    );
  }
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <div className="flex flex-col p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Personal Details</h1>
        <p className="text-muted-foreground">View and manage your account information</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold mb-1">{user.name}</h2>
            <p className="text-muted-foreground mb-3">{user.email}</p>
            <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'teacher' ? 'default' : 'secondary'} className="mb-6 capitalize">
              {user.role}
            </Badge>
            <Button className="w-full">Edit Profile</Button>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Your account information and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Name</h3>
                <p>{user.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Username</h3>
                <p>{user.username}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
                <p>{user.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Department</h3>
                <p className="capitalize">{user.department.replace('_', ' ')}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Role</h3>
                <p className="capitalize">{user.role}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Account ID</h3>
                <p>{user.id}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-3">Account Management</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline">Change Password</Button>
                <Button variant="outline">Update Email</Button>
                <Button variant="destructive">Deactivate Account</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 md:col-span-3">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your account settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium mb-3">Notifications</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage your email and system notification preferences
                </p>
                <Button>Manage Notifications</Button>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Privacy</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Control your privacy settings and data sharing
                </p>
                <Button>Privacy Settings</Button>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Accessibility</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Customize your experience with accessibility options
                </p>
                <Button>Accessibility Options</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
