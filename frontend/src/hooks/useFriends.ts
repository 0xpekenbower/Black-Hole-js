import { useState, useEffect } from 'react'
import { dashboardService } from '@/lib/api'
import { FriendshipStatus, RelationshipsResponse } from '@/types/Dashboard'
import { FriendData } from '@/types/friends'

export function useFriends() {
  const [isLoading, setIsLoading] = useState(false)
  const [friends, setFriends] = useState<FriendData[]>([])
  const [receivedRequests, setReceivedRequests] = useState<FriendData[]>([])
  const [sentRequests, setSentRequests] = useState<FriendData[]>([])
  const [blockedUsers, setBlockedUsers] = useState<FriendData[]>([])
  const [relationsData, setRelationsData] = useState<RelationshipsResponse | null>(null)

  const fetchAllRelations = async () => {
    setIsLoading(true)
    try {
      const response = await dashboardService.getAllRelations()
      if (response.status.success && response.data) {
        setRelationsData(response.data)
        await fetchUserDetails(response.data)
      } else {
        console.error("Failed to fetch relationships")
      }
    } catch (error) {
      console.error("Error fetching relationships:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserDetails = async (relations: RelationshipsResponse) => {
    const friendIds = Array.isArray(relations.friends) 
      ? relations.friends.map(f => typeof f === 'number' ? f : f.id).filter(Boolean) as number[]
      : []
      
    const blacklistIds = Array.isArray(relations.blacklist)
      ? relations.blacklist.map(b => typeof b === 'number' ? b : b.id).filter(Boolean) as number[]
      : []
      
    const receivedReqIds = Array.isArray(relations.receivedReq)
      ? relations.receivedReq.map(req => req.sender).filter(Boolean) as number[]
      : []
      
    const sentReqIds = Array.isArray(relations.sentReq)
      ? relations.sentReq.map(req => req.receiver).filter(Boolean) as number[]
      : []

    const friendsData: FriendData[] = []
    const receivedData: FriendData[] = []
    const sentData: FriendData[] = []
    const blockedData: FriendData[] = []

    await Promise.all(friendIds.map(async (id) => {
      try {
        const userCard = await fetchUserCard(id)
        if (userCard) {
          friendsData.push({
            ...userCard,
            friendship_status: FriendshipStatus.FRIENDS
          })
        }
      } catch (error) {
        console.error(`Error fetching friend card for user ${id}:`, error)
      }
    }))

    await Promise.all(receivedReqIds.map(async (id) => {
      try {
        const userCard = await fetchUserCard(id)
        if (userCard) {
          receivedData.push({
            ...userCard,
            friendship_status: FriendshipStatus.REQUEST_RECEIVED
          })
        }
      } catch (error) {
        console.error(`Error fetching request card for user ${id}:`, error)
      }
    }))

    await Promise.all(sentReqIds.map(async (id) => {
      try {
        const userCard = await fetchUserCard(id)
        if (userCard) {
          sentData.push({
            ...userCard,
            friendship_status: FriendshipStatus.REQUEST_SENT
          })
        }
      } catch (error) {
        console.error(`Error fetching sent request card for user ${id}:`, error)
      }
    }))

    await Promise.all(blacklistIds.map(async (id) => {
      try {
        const userCard = await fetchUserCard(id)
        if (userCard) {
          blockedData.push({
            ...userCard,
            friendship_status: FriendshipStatus.BLOCKED
          })
        }
      } catch (error) {
        console.error(`Error fetching blocked user card for user ${id}:`, error)
      }
    }))

    setFriends(friendsData)
    setReceivedRequests(receivedData)
    setSentRequests(sentData)
    setBlockedUsers(blockedData)
  }

  const fetchUserCard = async (userId: number): Promise<Omit<FriendData, 'friendship_status'> | null> => {
    try {
      const response = await dashboardService.getCard(userId.toString())
      if (response.status.success && response.data?.User) {
        const userData = response.data.User
        return {
          id: userData.id,
          username: userData.username,
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          avatar: userData.avatar || "",
          is_online: userData.is_online || false
        }
      }
    } catch (error) {
      console.error(`Error fetching user card for ${userId}:`, error)
    }
    return null
  }

  // Friend actions
  const sendFriendRequest = async (userId: number) => {
    setIsLoading(true)
    try {
      const response = await dashboardService.sendFriendRequest(userId.toString())
      if (response.status.success) {
        await fetchAllRelations()
      }
    } catch (error) {
      console.error("Error sending friend request:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const cancelFriendRequest = async (userId: number) => {
    setIsLoading(true)
    try {
      const response = await dashboardService.cancelFriendRequest(userId.toString())
      if (response.status.success) {
        setSentRequests(prev => prev.filter(req => req.id !== userId))
      }
    } catch (error) {
      console.error("Error cancelling friend request:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const acceptFriendRequest = async (userId: number) => {
    setIsLoading(true)
    try {
      const response = await dashboardService.acceptFriendRequest(userId.toString())
      if (response.status.success) {
        const acceptedRequest = receivedRequests.find(req => req.id === userId)
        if (acceptedRequest) {
          setFriends(prev => [...prev, { ...acceptedRequest, friendship_status: FriendshipStatus.FRIENDS }])
          setReceivedRequests(prev => prev.filter(req => req.id !== userId))
        }
      }
    } catch (error) {
      console.error("Error accepting friend request:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const rejectFriendRequest = async (userId: number) => {
    setIsLoading(true)
    try {
      const response = await dashboardService.denyFriendRequest(userId.toString())
      if (response.status.success) {
        setReceivedRequests(prev => prev.filter(req => req.id !== userId))
      }
    } catch (error) {
      console.error("Error rejecting friend request:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const removeFriend = async (userId: number) => {
    setIsLoading(true)
    try {
      const response = await dashboardService.unfriend(userId.toString())
      if (response.status.success) {
        setFriends(prev => prev.filter(friend => friend.id !== userId))
      }
    } catch (error) {
      console.error("Error removing friend:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const blockUser = async (userId: number) => {
    setIsLoading(true)
    try {
      const response = await dashboardService.blockUser(userId.toString())
      if (response.status.success) {
        setReceivedRequests(prev => prev.filter(req => req.id !== userId))
        const userToBlock = receivedRequests.find(req => req.id === userId) || 
                          friends.find(friend => friend.id === userId)
        
        if (userToBlock) {
          setBlockedUsers(prev => [...prev, { ...userToBlock, friendship_status: FriendshipStatus.BLOCKED }])
        }
        
        setFriends(prev => prev.filter(friend => friend.id !== userId))
      }
    } catch (error) {
      console.error("Error blocking user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const unblockUser = async (userId: number) => {
    setIsLoading(true)
    try {
      const response = await dashboardService.unblockUser(userId.toString())
      if (response.status.success) {
        setBlockedUsers(prev => prev.filter(user => user.id !== userId))
      }
    } catch (error) {
      console.error("Error unblocking user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAllRelations()
  }, [])

  return {
    isLoading,
    friends,
    receivedRequests,
    sentRequests,
    blockedUsers,
    sendFriendRequest,
    cancelFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    blockUser,
    unblockUser,
    refreshRelations: fetchAllRelations
  }
}
