import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { Button } from '@/components/ui/button'

export default function AccountPage() {
  const { profile, isAdmin } = useAuth()
  return (
    <div className="max-w-7xl mx-auto container-padding py-12">
      <h1 className="text-2xl font-bold text-charcoal-900">My Account</h1>
      <p className="mt-2 text-charcoal-500">{profile?.full_name || profile?.email}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/orders"><Button variant="outline">My Orders</Button></Link>
        <Link to="/wishlist"><Button variant="outline">Wishlist</Button></Link>
        {isAdmin && <Link to="/admin"><Button>Admin Dashboard</Button></Link>}
      </div>
    </div>
  )
}
