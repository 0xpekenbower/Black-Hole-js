'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Gamepad2, Trophy, MessageSquare, Users, History } from "lucide-react"
import Link from "next/link"

/**
 * Just place holder for now 
 * @returns 
 */
export function DashboardComponent() {
  return (
    <div className="container mt-8 mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/dashboard/game">
              <Button variant="outline" className="w-full">Play Game</Button>
            </Link>
            <Link href="/dashboard/friends">
              <Button variant="outline" className="w-full">Find Friends</Button>
            </Link>
            <Link href="/dashboard/chat">
              <Button variant="outline" className="w-full">Open Chat</Button>
            </Link>
            <Link href="/dashboard/leaderboard">
              <Button variant="outline" className="w-full">View Leaderboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="pb-2 border-b">You won a game against janedoe</div>
            <div className="pb-2 border-b">bobsmith accepted your friend request</div>
            <div className="pb-2 border-b">You earned the "3-Win Streak" achievement</div>
            <div>You lost a game against gamemaster</div>
          </div>
          <Link href="/dashboard/history" className="block mt-4">
            <Button variant="outline" className="w-full">View Full History</Button>
          </Link>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Stats Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="border p-2 text-center">
              <p className="font-bold">75%</p>
              <p className="text-sm">Win Rate</p>
            </div>
            <div className="border p-2 text-center">
              <p className="font-bold">12</p>
              <p className="text-sm">Games</p>
            </div>
            <div className="border p-2 text-center">
              <p className="font-bold">9</p>
              <p className="text-sm">Wins</p>
            </div>
            <div className="border p-2 text-center">
              <p className="font-bold">3</p>
              <p className="text-sm">Losses</p>
            </div>
          </div>
          <Link href="/dashboard/leaderboard" className="block mt-4">
            <Button variant="outline" className="w-full">View Leaderboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
} 