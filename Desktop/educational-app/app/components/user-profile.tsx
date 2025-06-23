"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { User, LogOut, LogIn, Crown } from "lucide-react"
import { supabase } from '../utils/supabaseClient'

interface UserProfileProps {
  user: any
  onSignOut: () => void
  onOpenAuth: () => void
}

export default function UserProfile({ user, onSignOut, onOpenAuth }: UserProfileProps) {
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await supabase.auth.signOut()
      onSignOut()
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  if (user) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-800">
                  {user.email}
                </div>
                <div className="text-sm text-gray-500">
                  Premium User
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-1" />
              {isSigningOut ? "Signing out..." : "Sign out"}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-medium text-gray-800">
                Guest User
              </div>
              <div className="text-sm text-gray-500">
                Sign up to save your progress
              </div>
            </div>
          </div>
          <Button
            onClick={onOpenAuth}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
          >
            <LogIn className="h-4 w-4 mr-1" />
            Sign up / Sign in
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 