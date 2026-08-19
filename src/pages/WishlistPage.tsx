import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function WishlistPage() {
  return (
    <div className="max-w-7xl mx-auto container-padding py-12">
      <h1 className="text-2xl font-bold text-charcoal-900">Wishlist</h1>
      <p className="mt-2 text-charcoal-500">Saved products will appear here.</p>
      <Link to="/shop"><Button className="mt-6" variant="outline">Browse Products</Button></Link>
    </div>
  )
}
