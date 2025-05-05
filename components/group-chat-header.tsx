"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, MoreVertical, UserPlus, Info, Bell, BellOff, LogOut } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"

interface GroupMember {
  id: string
  name: string
  avatar?: string
  isAdmin?: boolean
  isOnline?: boolean
}

interface GroupChatHeaderProps {
  groupId: string
  groupName: string
  groupAvatar?: string
  memberCount: number
  members: GroupMember[]
  onAddMember?: () => void
  onLeaveGroup?: () => void
  onMuteNotifications?: (muted: boolean) => void
  isMuted?: boolean
  className?: string
}

export function GroupChatHeader({
  groupId,
  groupName,
  groupAvatar,
  memberCount,
  members,
  onAddMember,
  onLeaveGroup,
  onMuteNotifications,
  isMuted = false,
  className,
}: GroupChatHeaderProps) {
  const [showGroupInfo, setShowGroupInfo] = useState(false)
  const { toast } = useToast()

  const handleAddMember = () => {
    if (onAddMember) {
      onAddMember()
    } else {
      toast({
        title: "Add member",
        description: "This feature is not implemented yet",
      })
    }
  }

  const handleLeaveGroup = () => {
    if (onLeaveGroup) {
      onLeaveGroup()
    } else {
      toast({
        title: "Leave group",
        description: "This feature is not implemented yet",
      })
    }
  }

  const handleMuteNotifications = () => {
    if (onMuteNotifications) {
      onMuteNotifications(!isMuted)
    } else {
      toast({
        title: isMuted ? "Unmuted" : "Muted",
        description: `Notifications ${isMuted ? "enabled" : "disabled"} for this group`,
      })
    }
  }

  return (
    <div
      className={`flex items-center justify-between p-4 border-b border-violet-200 dark:border-slate-800 ${className}`}
    >
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/chat">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>

        <Dialog open={showGroupInfo} onOpenChange={setShowGroupInfo}>
          <DialogTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 p-2">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-violet-600 text-white">
                  {groupName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
                {groupAvatar && <AvatarImage src={groupAvatar || "/placeholder.svg"} alt={groupName} />}
              </Avatar>
              <div className="text-left">
                <h2 className="text-base font-medium">{groupName}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{memberCount} members</p>
              </div>
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Group Information</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col items-center py-4">
              <Avatar className="h-20 w-20 mb-4">
                <AvatarFallback className="bg-violet-600 text-white text-xl">
                  {groupName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
                {groupAvatar && <AvatarImage src={groupAvatar || "/placeholder.svg"} alt={groupName} />}
              </Avatar>

              <h3 className="text-xl font-semibold">{groupName}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Created on {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="border-t border-b border-slate-200 dark:border-slate-700 py-4 my-2">
              <h4 className="text-sm font-medium mb-3">Members ({memberCount})</h4>
              <ScrollArea className="h-[200px]">
                <div className="space-y-3">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                            {member.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                          {member.avatar && <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />}
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          {member.isAdmin && <p className="text-xs text-violet-600 dark:text-violet-400">Admin</p>}
                        </div>
                      </div>
                      <div
                        className={`w-2 h-2 rounded-full ${member.isOnline ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"}`}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={handleAddMember} className="gap-2">
                <UserPlus className="h-4 w-4" />
                Add Member
              </Button>
              <Button variant="destructive" onClick={handleLeaveGroup} className="gap-2">
                <LogOut className="h-4 w-4" />
                Leave Group
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowGroupInfo(true)}>
            <Info className="h-4 w-4 mr-2" />
            Group Info
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleAddMember}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleMuteNotifications}>
            {isMuted ? (
              <>
                <Bell className="h-4 w-4 mr-2" />
                Unmute Notifications
              </>
            ) : (
              <>
                <BellOff className="h-4 w-4 mr-2" />
                Mute Notifications
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLeaveGroup} className="text-red-600 dark:text-red-400">
            <LogOut className="h-4 w-4 mr-2" />
            Leave Group
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
