'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, ArrowUpDown } from "lucide-react"

/**
 * Empty page component template
 * @returns Empty UI
 */
export default function LeaderboardPage() {
  const handleRefresh = () => {
    console.log("Refreshing leaderboard")
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="grid gap-6">
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Global Leaderboard</CardTitle>
            </div>
            <CardDescription>See who's leading the competition</CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-3 text-left">Rank</th>
                      <th className="p-3 text-left">Player</th>
                      <th className="p-3 text-left">Score</th>
                      <th className="p-3 text-left">Wins</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Leaderboard data would go here */}
                    <tr className="border-t">
                      <td colSpan={4} className="p-8 text-center text-muted-foreground">
                        No leaderboard data available yet
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <p className="text-sm text-muted-foreground">Last updated: Just now</p>
            <Button onClick={handleRefresh} className="flex items-center gap-2" variant="outline">
              <ArrowUpDown className="h-4 w-4" />
              Refresh
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
