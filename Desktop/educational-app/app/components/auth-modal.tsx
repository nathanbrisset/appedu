"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { X, User, Lock, Mail, Eye, EyeOff } from "lucide-react"
import { supabase } from '../utils/supabaseClient'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthSuccess: (user: any) => void
  deviceProgress: any
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess, deviceProgress }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      if (isSignUp) {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) throw error

        if (data.user) {
          // Merge device progress with new user account
          await mergeDeviceProgress(data.user.id)
          setMessage("Account created successfully! Check your email to verify your account.")
          onAuthSuccess(data.user)
        }
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        if (data.user) {
          // Merge device progress with existing user account
          await mergeDeviceProgress(data.user.id)
          setMessage("Welcome back!")
          onAuthSuccess(data.user)
        }
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const mergeDeviceProgress = async (userId: string) => {
    try {
      // Get device progress
      const deviceId = localStorage.getItem('device_id')
      if (!deviceId) return

      const { data: deviceProgress } = await supabase
        .from('progress')
        .select('*')
        .eq('device_id', deviceId)

      if (deviceProgress && deviceProgress.length > 0) {
        // For each device progress entry, check if user already has progress for that module/exercise
        for (const deviceEntry of deviceProgress) {
          const { data: existingUserProgress } = await supabase
            .from('progress')
            .select('*')
            .eq('user_id', userId)
            .eq('module', deviceEntry.module)
            .eq('exercise_type', deviceEntry.exercise_type)

          if (existingUserProgress && existingUserProgress.length > 0) {
            // User already has progress for this module/exercise
            const existing = existingUserProgress[0]
            // Take the higher value
            const newValue = Math.max(existing.value, deviceEntry.value)
            
            // Update user progress with higher value
            await supabase
              .from('progress')
              .update({ value: newValue })
              .eq('id', existing.id)
          } else {
            // User doesn't have progress for this module/exercise, create new entry
            await supabase
              .from('progress')
              .insert({
                user_id: userId,
                module: deviceEntry.module,
                exercise_type: deviceEntry.exercise_type,
                value: deviceEntry.value
              })
          }
        }

        // Delete device progress after merging
        await supabase
          .from('progress')
          .delete()
          .eq('device_id', deviceId)
      }
    } catch (error) {
      console.error('Error merging progress:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            {message && (
              <div className="text-green-600 text-sm bg-green-50 p-2 rounded">
                {message}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Loading..." : (isSignUp ? "Create Account" : "Sign In")}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-blue-600 hover:underline"
              >
                {isSignUp 
                  ? "Already have an account? Sign in" 
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>

            {deviceProgress && Object.values(deviceProgress).some((module: any) => 
              Object.values(module).some((value: any) => value > 0)
            ) && (
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                <User className="h-4 w-4 inline mr-1" />
                Your progress will be saved to your account when you sign up!
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 