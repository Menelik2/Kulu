import { supabase } from '@/lib/supabase'
import { convertToWebp, webpFileName } from '@/lib/imageWebp'
import type { ProductImage } from '@/types/database'

const BUCKET = 'product-images'

function friendlyStorageError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('bucket') || m.includes('not found')) {
    return 'Storage bucket "product-images" is missing. Create it in Supabase → Storage (public).'
  }
  if (
    m.includes('row-level security') ||
    m.includes('rls') ||
    m.includes('policy') ||
    m.includes('permission') ||
    m.includes('not authorized') ||
    m.includes('403')
  ) {
    return 'Upload blocked by storage permissions. Sign in as admin and run the product-images storage SQL migration.'
  }
  if (m.includes('mime') || m.includes('content type') || m.includes('invalid')) {
    return 'File type not allowed by storage. Prefer WebP/JPEG. Check bucket allowed MIME types.'
  }
  if (m.includes('payload') || m.includes('too large') || m.includes('size')) {
    return 'File too large for storage (max ~5 MB after compression).'
  }
  return message || 'Upload failed'
}

/** Extract storage object path from a public/signed Supabase URL */
export function storagePathFromUrl(url: string): string | null {
  if (!url) return null
  const markers = [`/object/public/${BUCKET}/`, `/object/sign/${BUCKET}/`, `/${BUCKET}/`]
  for (const marker of markers) {
    const idx = url.indexOf(marker)
    if (idx === -1) continue
    let path = url.slice(idx + marker.length)
    path = path.split('?')[0]
    try {
      path = decodeURIComponent(path)
    } catch {
      /* keep */
    }
    if (path) return path
  }
  // Already a relative path like products/uuid/file.webp
  if (url.startsWith('products/')) return url.split('?')[0]
  return null
}

export async function uploadProductImage(
  productId: string,
  file: File,
  options?: { isPrimary?: boolean; sortOrder?: number; altText?: string }
): Promise<ProductImage> {
  if (!productId) {
    throw new Error('Product ID is required before uploading images')
  }

  let converted
  try {
    converted = await convertToWebp(file)
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : 'Could not process image')
  }

  const path = webpFileName(file.name, productId, converted.extension)
  const uploadFile = new File(
    [converted.blob],
    path.split('/').pop() || `image.${converted.extension}`,
    { type: converted.contentType }
  )

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, uploadFile, {
    contentType: converted.contentType,
    cacheControl: '31536000',
    upsert: true,
  })

  if (uploadError) {
    throw new Error(friendlyStorageError(uploadError.message))
  }

  const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path)
  const url = publicData.publicUrl

  if (options?.isPrimary) {
    await supabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_id', productId)
  }

  const { data, error } = await supabase
    .from('product_images')
    .insert({
      product_id: productId,
      url,
      alt_text: options?.altText || file.name.replace(/\.[^.]+$/, '') || 'Product image',
      sort_order: options?.sortOrder ?? 0,
      is_primary: options?.isPrimary ?? false,
    })
    .select()
    .single()

  if (error) {
    await supabase.storage.from(BUCKET).remove([path])
    throw new Error(
      error.message.includes('row-level security')
        ? 'Cannot save image record (RLS). Ensure you are logged in as admin.'
        : error.message || 'Failed to save image record'
    )
  }

  return data as ProductImage
}

/**
 * Fully remove an image:
 * 1) Delete row from product_images (database)
 * 2) Delete file from Storage bucket
 * 3) If it was primary, promote another image
 */
export async function deleteProductImage(image: ProductImage): Promise<void> {
  const productId = image.product_id
  const wasPrimary = image.is_primary

  // 1. Database row — must succeed
  const { error: dbError } = await supabase.from('product_images').delete().eq('id', image.id)

  if (dbError) {
    throw new Error(
      dbError.message.includes('row-level security')
        ? 'Cannot delete image (RLS). Sign in as admin.'
        : dbError.message || 'Failed to delete image from database'
    )
  }

  // 2. Storage file — best effort (row is already gone)
  const path = storagePathFromUrl(image.url)
  if (path) {
    const { error: storageError } = await supabase.storage.from(BUCKET).remove([path])
    if (storageError) {
      console.warn('Storage file delete failed (DB row already removed):', storageError.message)
    }
  }

  // 3. Promote another image if we removed the primary
  if (wasPrimary && productId) {
    const { data: remaining } = await supabase
      .from('product_images')
      .select('id')
      .eq('product_id', productId)
      .order('sort_order', { ascending: true })
      .limit(1)

    if (remaining?.[0]?.id) {
      await supabase
        .from('product_images')
        .update({ is_primary: true })
        .eq('id', remaining[0].id)
    }
  }
}

/** Delete every image for a product (DB + storage). Used when product is deleted. */
export async function deleteAllProductImages(productId: string): Promise<void> {
  const { data: images, error } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', productId)

  if (error) throw new Error(error.message)
  if (!images?.length) return

  const paths: string[] = []
  for (const img of images as ProductImage[]) {
    const p = storagePathFromUrl(img.url)
    if (p) paths.push(p)
  }

  // DB rows (CASCADE may also handle this if product is deleted first)
  const { error: delErr } = await supabase
    .from('product_images')
    .delete()
    .eq('product_id', productId)

  if (delErr) {
    throw new Error(delErr.message || 'Failed to delete image records')
  }

  if (paths.length) {
    await supabase.storage.from(BUCKET).remove(paths)
  }
}

export async function setPrimaryProductImage(
  productId: string,
  imageId: string
): Promise<void> {
  await supabase
    .from('product_images')
    .update({ is_primary: false })
    .eq('product_id', productId)

  const { error } = await supabase
    .from('product_images')
    .update({ is_primary: true })
    .eq('id', imageId)

  if (error) throw new Error(error.message)
}

export async function listProductImages(productId: string): Promise<ProductImage[]> {
  const { data, error } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data || []) as ProductImage[]
}
