'use client'

import { useState, useEffect } from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users,
  Award,
  Star,
  Loader2,
} from "lucide-react"
import Image from 'next/image'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { dashboardService } from '@/lib/api'
import { handleApiError } from '@/utils/errorHandler'
import { UserCard, FriendshipStatus } from '@/types/Dashboard'
import { FriendActions } from './friends/Actions'

export function ProfileComponent({ userId }: { userId?: string }) {
  const [profileData, setProfileData] = useState<UserCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  
  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await dashboardService.getCard(userId);
        
        if (!response.status.success || !response.data) {
          throw new Error(response.status.message);
        }
        
        const cleanedData = {
          ...response.data,
          Friends: response.data.Friends.filter(friend => friend !== undefined)
        };
        
        setProfileData(cleanedData);
      } catch (err) {
        const errorMessage = handleApiError(err, 'Profile');
        setError(errorMessage);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [userId]);

  const refreshProfileData = async () => {
    try {
      const response = await dashboardService.getCard(userId);
      if (response.status.success && response.data) {
        const cleanedData = {
          ...response.data,
          Friends: response.data.Friends.filter(friend => friend !== undefined)
        };
        
        setProfileData(cleanedData);
      }
    } catch (err) {
      console.error(handleApiError(err, 'Profile Refresh'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="bg-destructive/10 border border-destructive rounded-xl p-4 text-destructive">
        {error || 'Failed to load profile data'}
      </div>
    );
  }

  const { User: UserInfo, Level, Rank, is_self, Friendship } = profileData;
  
  console.log('Friendship status:', Friendship);
  console.log('Friendship type:', typeof Friendship);
  console.log('REQUEST_SENT enum value:', FriendshipStatus.I_SENT);
  
  const friendshipValue = Number(Friendship);
  const isRequestSent = friendshipValue === -3;
  console.log('isRequestSent:', isRequestSent);
  
  const displayName = UserInfo.first_name && UserInfo.last_name 
    ? `${UserInfo.first_name} ${UserInfo.last_name}` 
    : UserInfo.username;

  const expProgress = Level ? 
    ((UserInfo.exp - Level.min_exp) / (Level.max_exp - Level.min_exp)) * 100 : 0;

  const getNextRankName = (currentRank: string): string => {
    const ranks = ['Iron', 'Bronze', 'Silver', 'Gold', 'Mythic'];
    const currentIndex = ranks.findIndex(rank => rank === currentRank);
    if (currentIndex === -1 || currentIndex === ranks.length - 1) {
      return currentRank;
    }
    return ranks[currentIndex + 1];
  };

  const nextRank = getNextRankName(Rank.name);
  const rankProgress = ((UserInfo.exp - Rank.min_exp) / (Rank.max_exp - Rank.min_exp)) * 100;

  const validFriends = profileData.Friends.filter(friend => friend !== undefined);

  return (
    <div className="container mx-auto w-full space-y-6 mt-16 items-center justify-center">
      <div className="relative w-full h-48 md:h-64 rounded-t-xl overflow-hidden">
        {UserInfo.background ? (
          <Image 
            src={UserInfo.background} 
            alt="Profile background" 
            fill
            sizes="100vw"
            style={{ objectFit: 'cover' }}
            priority
          />
        ) : (
          <Image 
            src="/data/backgrounds/default.png" 
            alt="Default background" 
            fill
            style={{ objectFit: 'cover' }}
            priority
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/70" />
      </div>

      <Card className="relative -mt-16 mx-4 z-10 border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader className="flex flex-col md:flex-row md:items-center gap-4">
          <Avatar className="h-24 w-24 border-4 border-background">
            {UserInfo.avatar ? (
              <AvatarImage src={UserInfo.avatar} alt={UserInfo.username} />
            ) : (
              <AvatarImage src="/data/avatars/default.png" alt={UserInfo.username} />
            )}
            {UserInfo.is_online && (
              <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background"></span>
            )}
          </Avatar>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <CardTitle className="text-2xl">{displayName}</CardTitle>
                <CardDescription>@{UserInfo.username}</CardDescription>
              </div>
              
              {!is_self && (
                <div className="flex gap-2">
                  <FriendActions
                    userId={UserInfo.id}
                    username={UserInfo.username}
                    friendshipStatus={Friendship}
                    showMessage={Friendship === FriendshipStatus.I_FR || Friendship === FriendshipStatus.HE_FR}
                    onActionComplete={refreshProfileData}
                  />
                </div>
              )}
            </div>
            
            {UserInfo.bio && (
              <p className="mt-2 text-sm text-muted-foreground">{UserInfo.bio}</p>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="profile" className="w-full" onValueChange={setActiveTab} value={activeTab}>
            {!is_self && (
              <TabsList className="mb-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="friends">Friends</TabsTrigger>
                <TabsTrigger value="matches">Matches</TabsTrigger>
              </TabsList>
            )}
            
            <TabsContent value="profile">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Star className="h-4 w-4 text-primary" />
                      Level {UserInfo.level}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>{Level.min_exp} XP</span>
                        <span>{UserInfo.exp} / {Level.max_exp} XP</span>
                      </div>
                      <Progress value={expProgress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      Rank
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center gap-3">
                    {Rank.icon_path && (
                      <div className="h-10 w-10 relative">
                        <Image 
                          src={`/data/ranks/${Rank.name}.svg`}
                          alt={Rank.name} 
                          width={40}
                          height={40}
                          className="object-contain"
                          priority
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold">{Rank.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {Rank.min_exp} - {Rank.max_exp} XP
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Friends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{validFriends.length}</div>
                    {validFriends.length > 0 && (
                      <Button 
                        variant="link" 
                        className="p-0 h-auto"
                        asChild
                      >
                        <Link href="/dashboard/friends">View all friends</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Rank Progress
                  </CardTitle>
                  <CardDescription>
                    Progress towards {nextRank} rank
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{Rank.name}</span>
                      <span className="font-medium">{nextRank}</span>
                    </div>
                    <Progress value={rankProgress} className="h-2" />
                    <div className="text-center text-sm text-muted-foreground">
                      {Math.round(rankProgress)}% complete - {UserInfo.exp} / {Rank.max_exp} XP
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="friends">
              <Card>
                <CardHeader>
                  <CardTitle>Friends</CardTitle>
                  <CardDescription>
                    View {UserInfo.username}'s friends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Friends list will be displayed here
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="matches">
              <Card>
                <CardHeader>
                  <CardTitle>Match History</CardTitle>
                  <CardDescription>
                    View {UserInfo.username}'s match history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Match history will be displayed here
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
