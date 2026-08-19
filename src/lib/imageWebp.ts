/**
 * Client-side image → WebP conversion.
 * Admin can upload JPEG, PNG, GIF, BMP, WebP, etc.
 * We always store as WebP (smaller) in Supabase Storage.
 */

const MAX_EDGE = 1600 // max width or height in pixels
const WEBP_QUALITY = 0.82

export interface WebpResult {
  blob: Blob
  width: number
  height: number
  originalName: string
  originalSize: number
  webpSize: number
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(`Could not read image: ${file.name}`))
    }
    img.src = url
  })
}

function fitSize(w: number, h: number, maxEdge: number) {
  if (w <= maxEdge && h <= maxEdge) return { width: w, height: h }
  if (w >= h) {
    return { width: maxEdge, height: Math.round((h / w) * maxEdge) }
  }
  return { width: Math.round((w / h) * maxEdge), height: maxEdge }
}

/**
 * Convert any browser-decodable image file to WebP.
 * Resizes so the longest side is ≤ MAX_EDGE.
 */
export async function convertToWebp(file: File): Promise<WebpResult> {
  if (!file.type.startsWith('image/')) {
    throw new Error('File is not an image')
  }

  const img = await loadImage(file)
  const { width, height } = fitSize(img.naturalWidth, img.naturalHeight, MAX_EDGE)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')

  // White background (avoids black behind transparent PNGs in some viewers)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(img, 0, 0, width, height)

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('WebP conversion failed'))),
      'image/webp',
      WEBP_QUALITY
    )
  })

  return {
    blob,
    width,
    height,
    originalName: file.name,
    originalSize: file.size,
    webpSize: blob.size,
  }
}

export function webpFileName(originalName: string, productId: string): string {
  const base = originalName
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .slice(0, 40)
  const stamp = Date.now().toString(36)
  return `products/${productId}/${base}-${stamp}.webp`
}

/** Format bytes for UI (e.g. 1.2 MB) */
export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(2)} MB`
}
