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
        processRelationsData(response.data)
      } else {
        console.error("Failed to fetch relationships")
      }
    } catch (error) {
      console.error("Error fetching relationships:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const processRelationsData = (relations: RelationshipsResponse) => {
    // Process friends
    const friendsData: FriendData[] = Array.isArray(relations.friends) 
      ? relations.friends.map(user => ({
        id: user.id || 0,
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        avatar: user.avatar || null,
        is_online: user.is_online || false,
        friendship_status: FriendshipStatus.I_FR
      }))
      : [];
    
    // Process blacklist
    const blockedData: FriendData[] = Array.isArray(relations.blacklist)
      ? relations.blacklist.map(user => ({
        id: user.id || 0,
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        avatar: user.avatar || null,
        is_online: user.is_online || false,
        friendship_status: FriendshipStatus.I_BLK
      }))
      : [];
    
    // Process received requests
    const receivedData: FriendData[] = Array.isArray(relations.receivedReq)
      ? relations.receivedReq.map(user => ({
        id: user.id || 0,
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        avatar: user.avatar || null,
        is_online: false,
        friendship_status: FriendshipStatus.HE_SENT
      }))
      : [];
    
    // Process sent requests
    const sentData: FriendData[] = Array.isArray(relations.sentReq)
      ? relations.sentReq.map(user => ({
        id: user.id || 0,
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        avatar: user.avatar || null,
        is_online: false,
        friendship_status: FriendshipStatus.I_SENT
      }))
      : [];

    setFriends(friendsData)
    setReceivedRequests(receivedData)
    setSentRequests(sentData)
    setBlockedUsers(blockedData)
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
          setFriends(prev => [...prev, { ...acceptedRequest, friendship_status: FriendshipStatus.I_FR }])
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
        await fetchAllRelations()
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
        await fetchAllRelations()
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
    unblockUser
  }
}
