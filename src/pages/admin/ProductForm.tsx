import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ImagePlus, Star, Trash2, Loader2 } from 'lucide-react'
import {
  adminGetProduct,
  adminCreateProduct,
  adminUpdateProduct,
  adminGetCategories,
} from '@/services/admin'
import {
  uploadProductImage,
  deleteProductImage,
  setPrimaryProductImage,
} from '@/services/productImages'
import { formatBytes } from '@/lib/imageWebp'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ProductImage } from '@/types/database'

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
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadHint, setUploadHint] = useState<string | null>(null)
  const [images, setImages] = useState<ProductImage[]>([])

  const { data: categories } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: adminGetCategories,
  })
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['admin', 'product', id],
    queryFn: () => adminGetProduct(id!),
    enabled: isEdit,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      discount_price: null,
      sku: '',
      stock_quantity: 0,
      category_id: '',
      brand: '',
      is_active: true,
      is_featured: false,
    },
  })

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description || '',
        price: Number(product.price),
        discount_price: product.discount_price ? Number(product.discount_price) : null,
        sku: product.sku,
        stock_quantity: product.stock_quantity,
        category_id: product.category_id || '',
        brand: product.brand || '',
        is_active: product.is_active,
        is_featured: product.is_featured,
      })
      setImages(
        [...(product.images || [])].sort(
          (a, b) => a.sort_order - b.sort_order || (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0)
        )
      )
    }
  }, [product, reset])

  const save = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        ...data,
        category_id: data.category_id || null,
        discount_price: data.discount_price || null,
      }
      if (isEdit) return adminUpdateProduct(id!, payload)
      return adminCreateProduct(payload)
    },
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
      toast.success(isEdit ? 'Product updated' : 'Product created')
      if (!isEdit && created?.id) {
        navigate(`/admin/products/${created.id}/edit`, { replace: true })
      } else {
        navigate('/admin/products')
      }
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return
    if (!isEdit || !id) {
      toast.error('Save the product first, then upload images')
      return
    }

    setUploading(true)
    setUploadHint(null)
    try {
      let primarySet = images.some((i) => i.is_primary)
      const added: ProductImage[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const isImage =
          file.type.startsWith('image/') ||
          /\.(jpe?g|png|gif|webp|bmp|heic|heif)$/i.test(file.name)
        if (!isImage) {
          toast.error(`${file.name}: not an image`)
          continue
        }
        if (file.size > 12 * 1024 * 1024) {
          toast.error(`${file.name}: max 12 MB`)
          continue
        }

        setUploadHint(`Processing ${file.name}…`)
        const makePrimary = !primarySet && added.length === 0 && images.length === 0
        const img = await uploadProductImage(id, file, {
          isPrimary: makePrimary,
          sortOrder: images.length + added.length,
        })
        if (makePrimary) primarySet = true
        added.push(img)
        setUploadHint(`${file.name} uploaded (${formatBytes(file.size)} → compressed)`)
      }

      if (added.length) {
        setImages((prev) => [...prev, ...added])
        qc.invalidateQueries({ queryKey: ['admin', 'product', id] })
        toast.success(`${added.length} image(s) uploaded`)
      }
    } catch (e) {
      console.error('Image upload error:', e)
      toast.error(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
      setUploadHint(null)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleDelete = async (img: ProductImage) => {
    try {
      await deleteProductImage(img)
      setImages((prev) => prev.filter((i) => i.id !== img.id))
      toast.success('Image removed')
      qc.invalidateQueries({ queryKey: ['admin', 'product', id] })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  const handleSetPrimary = async (img: ProductImage) => {
    if (!id) return
    try {
      await setPrimaryProductImage(id, img.id)
      setImages((prev) => prev.map((i) => ({ ...i, is_primary: i.id === img.id })))
      toast.success('Primary image set')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    }
  }

  if (isEdit && productLoading) {
    return (
      <div className="p-6 flex items-center gap-2 text-charcoal-500">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading product…
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-charcoal-900 mb-6">
        {isEdit ? 'Edit Product' : 'Add Product'}
      </h1>

      <form
        onSubmit={handleSubmit((d) => save.mutate(d))}
        className="space-y-4 bg-white rounded-xl border border-charcoal-100 p-6"
      >
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" {...register('name')} />
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            rows={3}
            {...register('description')}
            className="flex w-full rounded-lg border border-charcoal-200 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price (ETB) *</Label>
            <Input id="price" type="number" step="0.01" {...register('price')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount_price">Discount Price</Label>
            <Input id="discount_price" type="number" step="0.01" {...register('discount_price')} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sku">SKU *</Label>
            <Input id="sku" {...register('sku')} />
            {errors.sku && <p className="text-sm text-red-600">{errors.sku.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock_quantity">Stock *</Label>
            <Input id="stock_quantity" type="number" {...register('stock_quantity')} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category_id">Category</Label>
            <select
              id="category_id"
              {...register('category_id')}
              className="flex h-10 w-full rounded-lg border border-charcoal-200 bg-white px-3 text-sm"
            >
              <option value="">None</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input id="brand" {...register('brand')} />
          </div>
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('is_active')} className="rounded" /> Active
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('is_featured')} className="rounded" /> Featured
          </label>
        </div>

        <div className="border-t border-charcoal-100 pt-5 mt-2">
          <div className="mb-2">
            <Label>Product images</Label>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Upload JPG, PNG, GIF, WebP… Files are compressed and stored as WebP (or JPEG) to save space.
            </p>
          </div>

          {!isEdit ? (
            <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
              Create the product first, then upload images on the edit page.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-square rounded-xl overflow-hidden border border-charcoal-100 bg-charcoal-50 group"
                  >
                    <img
                      src={img.url}
                      alt={img.alt_text || ''}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {img.is_primary && (
                      <span className="absolute top-1 left-1 bg-primary-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        Primary
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      {!img.is_primary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(img)}
                          className="p-1.5 rounded-full bg-white text-amber-600"
                          title="Set as primary"
                        >
                          <Star className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(img)}
                        className="p-1.5 rounded-full bg-white text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-charcoal-200 hover:border-primary-400 hover:bg-primary-50/50 flex flex-col items-center justify-center gap-1 text-charcoal-500 disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                  ) : (
                    <>
                      <ImagePlus className="h-6 w-6" />
                      <span className="text-[11px] font-medium">Add</span>
                    </>
                  )}
                </button>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*,.jpg,.jpeg,.png,.gif,.webp,.bmp"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />

              {uploadHint && <p className="text-xs text-primary-600 mt-1">{uploadHint}</p>}
            </>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" loading={save.isPending}>
            {isEdit ? 'Update' : 'Create'}
          </Button>
          <Link to="/admin/products">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
