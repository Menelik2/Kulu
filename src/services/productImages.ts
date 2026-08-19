import { supabase } from '@/lib/supabase'
import { convertToWebp, webpFileName } from '@/lib/imageWebp'
import type { ProductImage } from '@/types/database'

const BUCKET = 'product-images'

function friendlyStorageError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('bucket') || m.includes('not found')) {
    return 'Storage bucket "product-images" is missing. Create it in Supabase → Storage (public).'
  }
  if (m.includes('row-level security') || m.includes('rls') || m.includes('policy') || m.includes('permission') || m.includes('not authorized') || m.includes('403')) {
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

/**
 * Convert file → WebP (or JPEG), upload to Supabase Storage, insert product_images row.
 */
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

  // Upload as File for better Content-Type handling in some environments
  const uploadFile = new File([converted.blob], path.split('/').pop() || `image.${converted.extension}`, {
    type: converted.contentType,
  })

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
    const { error: clearErr } = await supabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_id', productId)
    if (clearErr) {
      // non-fatal
      console.warn('clear primary:', clearErr.message)
    }
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

export async function deleteProductImage(image: ProductImage): Promise<void> {
  const markers = [
    `/object/public/${BUCKET}/`,
    `/object/sign/${BUCKET}/`,
  ]
  for (const marker of markers) {
    const idx = image.url.indexOf(marker)
    if (idx !== -1) {
      let path = image.url.slice(idx + marker.length)
      // Strip query string (signed URLs)
      path = path.split('?')[0]
      try {
        path = decodeURIComponent(path)
      } catch {
        /* keep raw */
      }
      await supabase.storage.from(BUCKET).remove([path])
      break
    }
  }

  const { error } = await supabase.from('product_images').delete().eq('id', image.id)
  if (error) throw new Error(error.message)
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
