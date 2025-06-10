'use client'

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card"
import { 
  Award,
  Loader2,
  Trophy
} from "lucide-react"
import Image from 'next/image'
import { Achievement } from '@/types/Dashboard'
import { useAchievements } from '@/hooks/useAchievements'

export function AchievementsComponent() {
  const { 
    achievements, 
    isLoading, 
    error
  } = useAchievements();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive rounded-xl p-4 text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Trophy className="h-6 w-6 text-primary mr-2" />
        <h1 className="text-2xl font-bold">Achievements</h1>
      </div>

      {achievements.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Award className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No achievements yet</p>
            <p className="text-muted-foreground">Complete tasks to earn achievements</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <AchievementCard 
              key={achievement.id} 
              achievement={achievement} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const { title, description, coin_reward, icon_path } = achievement;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 relative flex-shrink-0 bg-muted rounded-md overflow-hidden">
            {icon_path ? (
              <Image 
                src={`/data/achievements/${icon_path}.svg`}
                alt={title}
                fill
                className="p-2 object-contain"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Award className="h-8 w-8 text-amber-500" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-amber-500 font-medium">
              <Award className="h-4 w-4" />
              <span>{coin_reward.toLocaleString()} coins</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 