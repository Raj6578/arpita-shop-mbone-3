'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, ExternalLink, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Notification {
  id: string
  heading: string
  message: string
  link: string | null
  is_read: boolean
  created_at: string
}

interface NotificationPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  notifications: Notification[]
  onNotificationUpdate: () => void
}

export function NotificationPanel({ 
  open, 
  onOpenChange, 
  notifications, 
  onNotificationUpdate 
}: NotificationPanelProps) {
  
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) throw error
      
      onNotificationUpdate()
      toast.success('Notification marked as read')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false)

      if (error) throw error
      
      onNotificationUpdate()
      toast.success('All notifications marked as read')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleLinkClick = (link: string, notificationId: string) => {
    if (!notifications.find(n => n.id === notificationId)?.is_read) {
      markAsRead(notificationId)
    }
    window.open(link, '_blank')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications ({notifications.length})
            </DialogTitle>
            {notifications.some(n => !n.is_read) && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
              >
                <Check className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 border rounded-lg ${
                  notification.is_read ? 'bg-muted/30' : 'bg-white border-brand-accent/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{notification.heading}</h4>
                      {!notification.is_read && (
                        <Badge className="bg-brand-accent text-white text-xs">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {notification.link && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLinkClick(notification.link!, notification.id)}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}