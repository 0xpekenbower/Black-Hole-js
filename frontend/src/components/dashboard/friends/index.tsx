/**
 * Friends component Card 
 */

'use client'

import { useState, useEffect } from 'react'
import { 
  Card, 
  CardContent, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Users, 
  ChevronDown
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useFriends } from '@/hooks/useFriends'
import { FriendsList } from './All'
import { FriendRequestsList } from './Received'
import { SentRequestsList } from './Response'
import { BlockedUsersList } from './Blocked'

export function FriendsComponent() {
  const [activeTab, setActiveTab] = useState("friends")
  const [isMobile, setIsMobile] = useState(false)
  
  const {
    isLoading,
    friends,
    receivedRequests,
    sentRequests,
    blockedUsers,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    removeFriend,
    blockUser,
    unblockUser
  } = useFriends()
  
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }    
    checkIfMobile()    
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  const tabOptions = {
    "friends": "Friends",
    "received": "Received Requests",
    "sent": "Sent Requests",
    "blocked": "Blocked Users"
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  }

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "friends":
        return (
          <FriendsList 
            friends={friends}
            onRemove={removeFriend}
            onBlock={blockUser}
            isLoading={isLoading}
          />
        );
      case "received":
        return (
          <FriendRequestsList
            requests={receivedRequests}
            onAccept={acceptFriendRequest}
            onReject={rejectFriendRequest}
            onBlock={blockUser}
            isLoading={isLoading}
          />
        );
      case "sent":
        return (
          <SentRequestsList
            requests={sentRequests}
            onCancel={cancelFriendRequest}
            isLoading={isLoading}
          />
        );
      case "blocked":
        return (
          <BlockedUsersList 
            users={blockedUsers}
            onUnblock={unblockUser}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="container mt-8 mx-auto w-full h-full">      
      <Card className="w-full h-full p-4 sm:p-6 ">
        <div className="flex items-center justify-between mb-6">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Friends Management
          </CardTitle>
          
          {isMobile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center justify-between">
                  {tabOptions[activeTab as keyof typeof tabOptions]}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleTabChange("friends")}>
                  Friends
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleTabChange("received")}>
                  Received Requests
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleTabChange("sent")}>
                  Sent Requests
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleTabChange("blocked")}>
                  Blocked Users
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="bg-secondary">
                <TabsTrigger value="friends">Friends</TabsTrigger>
                <TabsTrigger value="received">Received</TabsTrigger>
                <TabsTrigger value="sent">Sent</TabsTrigger>
                <TabsTrigger value="blocked">Blocked</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
        
        <CardContent className="p-0">
          {isMobile ? (
            <div className="pt-2">
              {renderActiveTabContent()}
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsContent value="friends">
                <FriendsList 
                  friends={friends}
                  onRemove={removeFriend}
                  onBlock={blockUser}
                  isLoading={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="received">
                <FriendRequestsList
                  requests={receivedRequests}
                  onAccept={acceptFriendRequest}
                  onReject={rejectFriendRequest}
                  onBlock={blockUser}
                  isLoading={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="sent">
                <SentRequestsList
                  requests={sentRequests}
                  onCancel={cancelFriendRequest}
                  isLoading={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="blocked">
                <BlockedUsersList 
                  users={blockedUsers}
                  onUnblock={unblockUser}
                  isLoading={isLoading}
                />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

