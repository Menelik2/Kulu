import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center container-padding text-center">
      <h1 className="text-6xl font-bold text-charcoal-200">404</h1>
      <p className="text-xl text-charcoal-600 mt-2">Page not found</p>
      <Link to="/"><Button className="mt-6">Go Home</Button></Link>
    </div>
  )
}
