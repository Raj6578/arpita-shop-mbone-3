'use client'

import { useState } from 'react'
import { SignInModal } from './SignInModal'
import { SignUpModal } from './SignUpModal'
import { ForgotPasswordModal } from './ForgotPasswordModal'

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultView?: 'signin' | 'signup' | 'forgot-password'
}

export function AuthModal({ open, onOpenChange, defaultView = 'signin' }: AuthModalProps) {
  const [currentView, setCurrentView] = useState<'signin' | 'signup' | 'forgot-password'>(defaultView)

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen)
    if (!isOpen) {
      // Reset to default view when modal closes
      setTimeout(() => setCurrentView('signin'), 200)
    }
  }

  return (
    <>
      <SignInModal
        open={open && currentView === 'signin'}
        onOpenChange={handleOpenChange}
        onSwitchToSignUp={() => setCurrentView('signup')}
        onSwitchToForgotPassword={() => setCurrentView('forgot-password')}
      />
      
      <SignUpModal
        open={open && currentView === 'signup'}
        onOpenChange={handleOpenChange}
        onSwitchToSignIn={() => setCurrentView('signin')}
      />
      
      <ForgotPasswordModal
        open={open && currentView === 'forgot-password'}
        onOpenChange={handleOpenChange}
        onSwitchToSignIn={() => setCurrentView('signin')}
      />
    </>
  )
}