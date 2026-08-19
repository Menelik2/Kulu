import { useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminGetProduct, adminCreateProduct, adminUpdateProduct, adminGetCategories } from '@/services/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  discount_price: z.coerce.number().min(0).optional().nullable(),
  sku: z.string().min(1, 'SKU required'),
  stock_quantity: z.coerce.number().int().min(0),
  category_id: z.string().optional().nullable(),
  brand: z.string().optional(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
})

type FormData = z.infer<typeof schema>

export default function AdminProductForm() {
  const { id } = useParams()
  const isEdit = !!id && id !== 'new'
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: categories } = useQuery({ queryKey: ['admin', 'categories'], queryFn: adminGetCategories })
  const { data: product } = useQuery({ queryKey: ['admin', 'product', id], queryFn: () => adminGetProduct(id!), enabled: isEdit })
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', price: 0, discount_price: null, sku: '', stock_quantity: 0, category_id: '', brand: '', is_active: true, is_featured: false },
  })

  useEffect(() => {
    if (product) {
      reset({
        name: product.name, description: product.description || '', price: Number(product.price),
        discount_price: product.discount_price ? Number(product.discount_price) : null,
        sku: product.sku, stock_quantity: product.stock_quantity, category_id: product.category_id || '',
        brand: product.brand || '', is_active: product.is_active, is_featured: product.is_featured,
      })
    }
  }, [product, reset])

  const save = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = { ...data, category_id: data.category_id || null, discount_price: data.discount_price || null }
      if (isEdit) return adminUpdateProduct(id!, payload)
      return adminCreateProduct(payload)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'products'] }); toast.success(isEdit ? 'Product updated' : 'Product created'); navigate('/admin/products') },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="p-4 sm:p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-charcoal-900 mb-6">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
      <form onSubmit={handleSubmit((d) => save.mutate(d))} className="space-y-4 bg-white rounded-xl border border-charcoal-100 p-6">
        <div className="space-y-2"><Label htmlFor="name">Name *</Label><Input id="name" {...register('name')} />{errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}</div>
        <div className="space-y-2"><Label htmlFor="description">Description</Label><textarea id="description" rows={3} {...register('description')} className="flex w-full rounded-lg border border-charcoal-200 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600" /></div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label htmlFor="price">Price (ETB) *</Label><Input id="price" type="number" step="0.01" {...register('price')} /></div>
          <div className="space-y-2"><Label htmlFor="discount_price">Discount Price</Label><Input id="discount_price" type="number" step="0.01" {...register('discount_price')} /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label htmlFor="sku">SKU *</Label><Input id="sku" {...register('sku')} />{errors.sku && <p className="text-sm text-red-600">{errors.sku.message}</p>}</div>
          <div className="space-y-2"><Label htmlFor="stock_quantity">Stock *</Label><Input id="stock_quantity" type="number" {...register('stock_quantity')} /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label htmlFor="category_id">Category</Label>
            <select id="category_id" {...register('category_id')} className="flex h-10 w-full rounded-lg border border-charcoal-200 bg-white px-3 text-sm">
              <option value="">None</option>
              {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-2"><Label htmlFor="brand">Brand</Label><Input id="brand" {...register('brand')} /></div>
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('is_active')} className="rounded" /> Active</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('is_featured')} className="rounded" /> Featured</label>
        </div>
        <div className="flex gap-3 pt-4">
          <Button type="submit" loading={save.isPending}>{isEdit ? 'Update' : 'Create'}</Button>
          <Link to="/admin/products"><Button type="button" variant="outline">Cancel</Button></Link>
        </div>
      </form>
    </div>
  )
}
