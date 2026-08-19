import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function OrderDetailPage() {
  return (
    <div className="max-w-7xl mx-auto container-padding py-12">
      <h1 className="text-2xl font-bold text-charcoal-900">Order Details</h1>
      <p className="mt-2 text-charcoal-500">Full order tracking timeline coming next.</p>
      <Link to="/orders"><Button className="mt-6" variant="outline">Back to Orders</Button></Link>
    </div>
  )
}
