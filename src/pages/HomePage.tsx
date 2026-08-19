import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Truck, Shield, Headphones, MapPin } from 'lucide-react'
import { getFeaturedProducts, getCategories, getProducts } from '@/services/products'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const { data: featured } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => getFeaturedProducts(8),
  })

  const { data: newest } = useQuery({
    queryKey: ['products', 'newest'],
    queryFn: () => getProducts({ sort: 'newest', limit: 8 }),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  return (
    <div>
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gold-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto container-padding py-16 sm:py-24 lg:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Shop Smart.
              <br />
              <span className="text-gold-400">Delivered Across Ethiopia.</span>
            </h1>
            <p className="mt-6 text-lg text-primary-100 max-w-xl">
              Discover quality products at fair prices. Fast delivery nationwide with Cash on Delivery.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/shop">
                <Button size="lg" variant="secondary" className="gap-2">
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/shop?sort=newest">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  New Arrivals
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-charcoal-100">
        <div className="max-w-7xl mx-auto container-padding py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Nationwide Delivery', desc: 'All regions of Ethiopia' },
              { icon: Shield, title: 'Secure Shopping', desc: 'Safe & protected' },
              { icon: Headphones, title: 'Customer Support', desc: "We're here to help" },
              { icon: MapPin, title: 'Cash on Delivery', desc: 'Pay when you receive' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-charcoal-900">{item.title}</h3>
                  <p className="text-xs text-charcoal-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {categories && categories.length > 0 && (
        <section className="max-w-7xl mx-auto container-padding py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-charcoal-900">Shop by Category</h2>
            <Link to="/shop" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.slice(0, 10).map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.id}`}
                className="group bg-white rounded-xl border border-charcoal-100 p-4 text-center hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-primary-50 flex items-center justify-center mb-3 group-hover:bg-primary-100 transition-colors">
                  <span className="text-primary-600 font-bold text-lg">{cat.name.charAt(0)}</span>
                </div>
                <h3 className="font-medium text-sm text-charcoal-800 group-hover:text-primary-600">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {featured && featured.products.length > 0 && (
        <section className="max-w-7xl mx-auto container-padding py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-charcoal-900">Featured Products</h2>
            <Link to="/shop" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {newest && newest.products.length > 0 && (
        <section className="bg-white py-12">
          <div className="max-w-7xl mx-auto container-padding">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-charcoal-900">New Arrivals</h2>
              <Link to="/shop?sort=newest" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {newest.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto container-padding py-16">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 sm:p-12 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold">Ready to start shopping?</h2>
          <p className="mt-3 text-primary-100 max-w-lg mx-auto">
            Browse thousands of products with secure Cash on Delivery across Ethiopia.
          </p>
          <Link to="/shop" className="inline-block mt-6">
            <Button size="lg" variant="secondary">
              Explore the Shop
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
