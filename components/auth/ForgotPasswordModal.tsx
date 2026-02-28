'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Mail, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Image from 'next/image'

interface ForgotPasswordModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSwitchToSignIn: () => void
}

export function ForgotPasswordModal({ open, onOpenChange, onSwitchToSignIn }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      
      if (error) throw error
      
      setEmailSent(true)
      toast.success('Password reset email sent!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setEmail('')
    setEmailSent(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden">
        <div className="flex h-[500px]">
          {/* Left Side - Image */}
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-purple-100 to-purple-200 relative">
            <div className="absolute inset-0 bg-black/20" />
            <Image
              src="https://images.pexels.com/photos/4553618/pexels-photo-4553618.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Reset Password"
              fill
              className="object-cover"
            />
            <div className="relative z-10 flex flex-col justify-center items-center text-gray-800 p-8">
              <div className="text-center">
                <Mail className="h-16 w-16 mx-auto mb-4 opacity-90" />
                <h2 className="text-3xl font-bold mb-4">Reset Password</h2>
                <p className="text-lg opacity-90">
                  We'll send you a link to reset your password
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
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="flex flex-col justify-center h-full max-w-sm mx-auto">
              {!emailSent ? (
                <>
                  <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-brand-secondary mb-2">Forgot Password?</h1>
                    <p className="text-muted-foreground">
                      Enter your email address and we'll send you a link to reset your password
                    </p>
                  </div>

                  <form onSubmit={handleResetPassword} className="space-y-4">
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

                    <Button type="submit" className="w-full bg-brand-accent hover:bg-brand-accent/90" disabled={loading}>
                      {loading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                  </form>

                  <div className="text-center mt-6">
                    <button
                      type="button"
                      onClick={onSwitchToSignIn}
                      className="inline-flex items-center gap-2 text-sm text-brand-accent hover:underline"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Sign In
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="h-8 w-8 text-green-500" />
                  </div>
                  
                  <div>
                    <h1 className="text-2xl font-bold text-brand-secondary mb-2">Check Your Email</h1>
                    <p className="text-muted-foreground mb-4">
                      We've sent a password reset link to:
                    </p>
                    <p className="font-medium text-brand-accent">{email}</p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Didn't receive the email? Check your spam folder or try again.
                    </p>
                    
                    <Button
                      onClick={() => setEmailSent(false)}
                      variant="outline"
                      className="w-full"
                    >
                      Try Again
                    </Button>

                    <button
                      type="button"
                      onClick={onSwitchToSignIn}
                      className="inline-flex items-center gap-2 text-sm text-brand-accent hover:underline w-full justify-center"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Sign In
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}