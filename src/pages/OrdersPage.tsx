import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function OrdersPage() {
  return (
    <div className="max-w-7xl mx-auto container-padding py-12">
      <h1 className="text-2xl font-bold text-charcoal-900">My Orders</h1>
      <p className="mt-2 text-charcoal-500">Order history will appear here after you place orders.</p>
      <Link to="/shop"><Button className="mt-6" variant="outline">Continue Shopping</Button></Link>
    </div>
  )
}
