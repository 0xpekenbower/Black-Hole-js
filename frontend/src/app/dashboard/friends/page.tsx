'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserPlus } from "lucide-react"
import { Input } from "@/components/ui/input"

/**
 * Friends page component
 * @returns Friends page UI
 */
export default function FriendsPage() {
  const handleAddFriend = () => {
    console.log("Add friend")
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="grid gap-6">
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Friends List</CardTitle>
            </div>
            <CardDescription>Manage your connections and find new friends</CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Input placeholder="Search friends..." className="flex-1" />
                <Button variant="outline">Search</Button>
              </div>
              
              <div className="border rounded-md p-4">
                {/* Friends list would appear here */}
                <p className="text-muted-foreground text-center py-8">No friends added yet. Add some friends to get started!</p>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <p className="text-sm text-muted-foreground">Total friends: 0</p>
            <Button onClick={handleAddFriend} className="flex items-center gap-2" variant="outline">
              <UserPlus className="h-4 w-4" />
              Add Friend
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
