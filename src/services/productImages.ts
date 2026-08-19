import { supabase } from '@/lib/supabase'
import { convertToWebp, webpFileName } from '@/lib/imageWebp'
import type { ProductImage } from '@/types/database'

const BUCKET = 'product-images'

/**
 * Convert file → WebP, upload to Supabase Storage, insert product_images row.
 * Accepts any image format the browser can decode (JPEG, PNG, GIF, BMP, WebP…).
 */
export async function uploadProductImage(
  productId: string,
  file: File,
  options?: { isPrimary?: boolean; sortOrder?: number; altText?: string }
): Promise<ProductImage> {
  const webp = await convertToWebp(file)
  const path = webpFileName(file.name, productId)

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, webp.blob, {
      contentType: 'image/webp',
      cacheControl: '31536000',
      upsert: false,
    })

  if (uploadError) {
    throw new Error(uploadError.message || 'Upload failed')
  }

  const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path)
  const url = publicData.publicUrl

  // If this is primary, clear other primaries first
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
      alt_text: options?.altText || file.name.replace(/\.[^.]+$/, ''),
      sort_order: options?.sortOrder ?? 0,
      is_primary: options?.isPrimary ?? false,
    })
    .select()
    .single()

  if (error) {
    // Best-effort cleanup of orphaned file
    await supabase.storage.from(BUCKET).remove([path])
    throw new Error(error.message || 'Failed to save image record')
  }

  return data as ProductImage
}

export async function deleteProductImage(image: ProductImage): Promise<void> {
  // Extract storage path from public URL if possible
  const marker = `/object/public/${BUCKET}/`
  const idx = image.url.indexOf(marker)
  if (idx !== -1) {
    const path = image.url.slice(idx + marker.length)
    await supabase.storage.from(BUCKET).remove([path])
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
