import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Star, Eye, EyeOff, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { adminGetReviews, adminSetReviewVisibility, adminDeleteReview } from '@/services/admin'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Review } from '@/types/database'

type Filter = 'all' | 'visible' | 'hidden'

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-3.5 w-3.5',
            i < rating ? 'fill-gold-500 text-gold-500' : 'text-charcoal-200'
          )}
        />
      ))}
    </div>
  )
}

export default function AdminReviews() {
  const qc = useQueryClient()
  const [filter, setFilter] = useState<Filter>('all')

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['admin', 'reviews'],
    queryFn: adminGetReviews,
  })

  const toggleVis = useMutation({
    mutationFn: ({ id, is_visible }: { id: string; is_visible: boolean }) =>
      adminSetReviewVisibility(id, is_visible),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'reviews'] })
      toast.success('Review visibility updated')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteReview(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'reviews'] })
      toast.success('Review deleted')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const filtered =
    reviews?.filter((r) => {
      if (filter === 'visible') return r.is_visible
      if (filter === 'hidden') return !r.is_visible
      return true
    }) ?? []

  const counts = {
    all: reviews?.length ?? 0,
    visible: reviews?.filter((r) => r.is_visible).length ?? 0,
    hidden: reviews?.filter((r) => !r.is_visible).length ?? 0,
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal-900">Reviews</h1>
        <p className="text-sm text-charcoal-500 mt-1">
          Moderate product reviews — hide spam or delete permanently.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'visible', 'hidden'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-sm font-medium capitalize transition-colors',
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-charcoal-200 text-charcoal-700 hover:bg-charcoal-50'
            )}
          >
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-charcoal-500 py-12 justify-center">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading reviews…
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-charcoal-100">
          <Star className="h-10 w-10 text-charcoal-200 mx-auto mb-3" />
          <p className="text-charcoal-500">No reviews in this filter.</p>
        </div>
      )}

      <ul className="space-y-3">
        {filtered.map((r: Review) => (
          <li
            key={r.id}
            className={cn(
              'bg-white rounded-2xl border border-charcoal-100 p-4 sm:p-5 elevation-1',
              !r.is_visible && 'opacity-75 border-dashed'
            )}
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Stars rating={r.rating} />
                  {!r.is_visible && (
                    <span className="text-[10px] font-bold uppercase tracking-wide bg-charcoal-100 text-charcoal-600 px-2 py-0.5 rounded-full">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="font-medium text-charcoal-900 truncate">
                  {(r.product as { name?: string } | undefined)?.name || 'Product'}
                </p>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  {(r.user as { full_name?: string; email?: string } | undefined)?.full_name ||
                    (r.user as { email?: string } | undefined)?.email ||
                    'Customer'}{' '}
                  · {new Date(r.created_at).toLocaleDateString()}
                </p>
                {r.comment ? (
                  <p className="text-sm text-charcoal-700 mt-2 leading-relaxed">{r.comment}</p>
                ) : (
                  <p className="text-sm text-charcoal-400 mt-2 italic">No comment</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={toggleVis.isPending}
                  onClick={() =>
                    toggleVis.mutate({ id: r.id, is_visible: !r.is_visible })
                  }
                  title={r.is_visible ? 'Hide from storefront' : 'Show on storefront'}
                >
                  {r.is_visible ? (
                    <>
                      <EyeOff className="h-4 w-4" /> Hide
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" /> Show
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                  disabled={remove.isPending}
                  onClick={() => {
                    if (window.confirm('Delete this review permanently?')) {
                      remove.mutate(r.id)
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
