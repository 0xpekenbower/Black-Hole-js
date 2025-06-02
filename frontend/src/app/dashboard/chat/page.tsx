'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Send } from "lucide-react"
import { Input } from "@/components/ui/input"

/**
 * Empty page component template
 * @returns Empty UI
 */
export default function ChatPage() {
  const handleSendMessage = () => {
    console.log("Message sent")
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="grid gap-6">
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Chat Room</CardTitle>
            </div>
            <CardDescription>Connect with other players in real-time</CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="h-[400px] border rounded-md p-4 mb-4 overflow-y-auto">
              {/* Chat messages would appear here */}
              <p className="text-muted-foreground text-center mt-20">No messages yet. Start a conversation!</p>
            </div>
          </CardContent>
          
          <CardFooter>
            <div className="flex w-full gap-2">
              <Input placeholder="Type your message..." className="flex-1" />
              <Button onClick={handleSendMessage} className="flex items-center gap-2 " variant="outline">
                <Send className="h-4 w-4" />
                Send
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
