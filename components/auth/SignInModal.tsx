'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Image from 'next/image'

interface SignInModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSwitchToSignUp: () => void
  onSwitchToForgotPassword: () => void
}

export function SignInModal({ open, onOpenChange, onSwitchToSignUp, onSwitchToForgotPassword }: SignInModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      toast.success('Signed in successfully!')
      onOpenChange(false)
      setEmail('')
      setPassword('')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden">
        <div className="flex h-[600px]">
          {/* Left Side - Image */}
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-100 to-blue-200 relative">
            <div className="absolute inset-0 bg-black/20" />
            <Image
              src="https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Sign In"
              fill
              className="object-cover"
            />
            <div className="relative z-10 flex flex-col justify-center items-center text-gray-800 p-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
                <p className="text-lg opacity-90">
                  Sign in to access your account and continue shopping
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full md:w-1/2 p-8 relative">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 p-2"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="flex flex-col justify-center h-full max-w-sm mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-brand-secondary mb-2">Sign In</h1>
                <p className="text-muted-foreground">Enter your credentials to access your account</p>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-brand-accent hover:bg-brand-accent/90" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={onSwitchToForgotPassword}
                  className="text-sm text-brand-accent hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button variant="outline" onClick={handleGoogleAuth} className="w-full">
                Sign in with Google
              </Button>

              <div className="text-center text-sm mt-6">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToSignUp}
                  className="text-brand-accent hover:underline font-medium"
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}