'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  MapPin, 
  ShoppingCart, 
  Package, 
  Heart, 
  Wallet, 
  Bell,
  Edit,
  Save,
  X,
  Plus,
  Users
} from 'lucide-react'
import { toast } from 'sonner'
import { UserListModal } from '@/components/dashboard/UserListModal'
import { NotificationPanel } from '@/components/dashboard/NotificationPanel'

interface UserProfile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  full_name: string | null
  mobile_no: string | null
}

interface UserAddress {
  id: string
  address_line_1: string | null
  address_line_2: string | null
  address_line_3: string | null
  address_line_4: string | null
  address_line_5: string | null
  flat_building_no: string | null
  nearest_location: string | null
  pincode: string | null
  city: string | null
  state: string | null
  country: string | null
  is_default: boolean
}

interface UserWallet {
  id: string
  wallet_address: string
  blockchain_name: string
  balance: number
  is_primary: boolean
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [wallets, setWallets] = useState<UserWallet[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [cartCount, setCartCount] = useState(0)
  const [orderCount, setOrderCount] = useState(0)
  const [likedCount, setLikedCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)
  const [editingAddress, setEditingAddress] = useState<string | null>(null)
  const [showUserList, setShowUserList] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    mobile_no: ''
  })

  const [addressForm, setAddressForm] = useState({
    address_line_1: '',
    address_line_2: '',
    address_line_3: '',
    address_line_4: '',
    address_line_5: '',
    flat_building_no: '',
    nearest_location: '',
    pincode: '',
    city: '',
    state: '',
    country: ''
  })

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    if (!user) return

    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setProfileForm({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          mobile_no: profileData.mobile_no || ''
        })
      }

      // Fetch addresses
      const { data: addressData } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)

      setAddresses(addressData || [])

      // Fetch wallets
      const { data: walletData } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user.id)

      setWallets(walletData || [])

      // Fetch notifications
      const { data: notificationData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setNotifications(notificationData || [])

      // Fetch cart count
      const { count: cartCountData } = await supabase
        .from('cart_items')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)

      setCartCount(cartCountData || 0)

      // Fetch unpaid orders count
      const { count: orderCountData } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('status', 'pending')

      setOrderCount(orderCountData || 0)

      // Fetch liked items count
      const { count: likedCountData } = await supabase
        .from('liked_items')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)

      setLikedCount(likedCountData || 0)

    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('users')
        .update({
          first_name: profileForm.first_name,
          last_name: profileForm.last_name,
          mobile_no: profileForm.mobile_no,
          full_name: `${profileForm.first_name} ${profileForm.last_name}`.trim()
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Profile updated successfully')
      setEditingProfile(false)
      fetchUserData()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const addAddress = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('user_addresses')
        .insert({
          user_id: user.id,
          ...addressForm
        })

      if (error) throw error

      toast.success('Address added successfully')
      setAddressForm({
        address_line_1: '',
        address_line_2: '',
        address_line_3: '',
        address_line_4: '',
        address_line_5: '',
        flat_building_no: '',
        nearest_location: '',
        pincode: '',
        city: '',
        state: '',
        country: ''
      })
      fetchUserData()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-secondary mb-4">Please sign in</h1>
          <p className="text-muted-foreground">You need to be signed in to access your dashboard.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-secondary mb-2">
              Welcome back, {profile?.first_name || 'User'}! 👋
            </h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNotifications(true)}
              className="relative"
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              {notifications.filter(n => !n.is_read).length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-xs">
                  {notifications.filter(n => !n.is_read).length}
                </Badge>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUserList(true)}
            >
              <Users className="h-4 w-4 mr-2" />
              All Users
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-accent/10 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-brand-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cart Items</p>
                <p className="text-2xl font-bold text-brand-secondary">{cartCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unpaid Orders</p>
                <p className="text-2xl font-bold text-brand-secondary">{orderCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Liked Items</p>
                <p className="text-2xl font-bold text-brand-secondary">{likedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Wallet Balance</p>
                <p className="text-2xl font-bold text-brand-secondary">
                  {wallets.reduce((sum, wallet) => sum + wallet.balance, 0).toFixed(2)} MBONE
                </p>
                <p className="text-xs text-muted-foreground">
                  {wallets.find(w => w.is_primary)?.blockchain_name || 'Polygon'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingProfile(!editingProfile)}
                >
                  {editingProfile ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingProfile ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={profileForm.first_name}
                        onChange={(e) => setProfileForm({...profileForm, first_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={profileForm.last_name}
                        onChange={(e) => setProfileForm({...profileForm, last_name: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="mobile_no">Mobile Number</Label>
                    <Input
                      id="mobile_no"
                      value={profileForm.mobile_no}
                      onChange={(e) => setProfileForm({...profileForm, mobile_no: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={profile?.email || ''} disabled />
                  </div>
                  <Button onClick={updateProfile} className="bg-brand-accent hover:bg-brand-accent/90">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>First Name</Label>
                      <p className="text-sm text-muted-foreground">{profile?.first_name || 'Not set'}</p>
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <p className="text-sm text-muted-foreground">{profile?.last_name || 'Not set'}</p>
                    </div>
                  </div>
                  <div>
                    <Label>Mobile Number</Label>
                    <p className="text-sm text-muted-foreground">{profile?.mobile_no || 'Not set'}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm text-muted-foreground">{profile?.email}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Add New Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="flat_building_no">Flat/Building No.</Label>
                    <Input
                      id="flat_building_no"
                      value={addressForm.flat_building_no}
                      onChange={(e) => setAddressForm({...addressForm, flat_building_no: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nearest_location">Nearest Location</Label>
                    <Input
                      id="nearest_location"
                      value={addressForm.nearest_location}
                      onChange={(e) => setAddressForm({...addressForm, nearest_location: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <div key={num}>
                      <Label htmlFor={`address_line_${num}`}>Address Line {num}</Label>
                      <Input
                        id={`address_line_${num}`}
                        value={addressForm[`address_line_${num}` as keyof typeof addressForm]}
                        onChange={(e) => setAddressForm({
                          ...addressForm, 
                          [`address_line_${num}`]: e.target.value
                        })}
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                    />
                  </div>
                </div>

                <Button onClick={addAddress} className="bg-brand-accent hover:bg-brand-accent/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Address
                </Button>
              </CardContent>
            </Card>

            {/* Existing Addresses */}
            {addresses.map((address) => (
              <Card key={address.id}>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Address {addresses.indexOf(address) + 1}</h4>
                      {address.is_default && (
                        <Badge className="bg-brand-accent text-white">Default</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {address.flat_building_no && <p>Flat/Building: {address.flat_building_no}</p>}
                      {address.address_line_1 && <p>{address.address_line_1}</p>}
                      {address.address_line_2 && <p>{address.address_line_2}</p>}
                      {address.address_line_3 && <p>{address.address_line_3}</p>}
                      {address.address_line_4 && <p>{address.address_line_4}</p>}
                      {address.address_line_5 && <p>{address.address_line_5}</p>}
                      {address.nearest_location && <p>Near: {address.nearest_location}</p>}
                      <p>{address.city}, {address.state} {address.pincode}</p>
                      <p>{address.country}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="wallets">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Connected Wallets
              </CardTitle>
            </CardHeader>
            <CardContent>
              {wallets.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No wallets connected</p>
              ) : (
                <div className="space-y-4">
                  {wallets.map((wallet) => (
                    <div key={wallet.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{wallet.blockchain_name}</p>
                        <p className="text-sm text-muted-foreground font-mono">{wallet.wallet_address}</p>
                        <p className="text-sm text-brand-accent">{wallet.balance.toFixed(2)} MBONE</p>
                      </div>
                      {wallet.is_primary && (
                        <Badge className="bg-brand-accent text-white">Primary</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cart Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-2xl font-bold text-brand-secondary">{cartCount}</p>
                  <p className="text-sm text-muted-foreground">Items in cart</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Unpaid Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-2xl font-bold text-brand-secondary">{orderCount}</p>
                  <p className="text-sm text-muted-foreground">Pending orders</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Liked Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-2xl font-bold text-brand-secondary">{likedCount}</p>
                  <p className="text-sm text-muted-foreground">Favorite products</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <UserListModal open={showUserList} onOpenChange={setShowUserList} />
      <NotificationPanel 
        open={showNotifications} 
        onOpenChange={setShowNotifications}
        notifications={notifications}
        onNotificationUpdate={fetchUserData}
      />
    </div>
  )
}