/**
 * Client-side image conversion for product uploads.
 * Prefers WebP; falls back to JPEG if the browser cannot encode WebP.
 */

const MAX_EDGE = 1600
const WEBP_QUALITY = 0.82
const JPEG_QUALITY = 0.85

export interface WebpResult {
  blob: Blob
  contentType: 'image/webp' | 'image/jpeg'
  extension: 'webp' | 'jpg'
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

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), type, quality)
  })
}

/** Convert any browser-decodable image to WebP (or JPEG fallback). */
export async function convertToWebp(file: File): Promise<WebpResult> {
  const type = (file.type || '').toLowerCase()
  if (type && !type.startsWith('image/')) {
    throw new Error('File is not an image')
  }
  // Reject empty files
  if (file.size === 0) {
    throw new Error('Empty file')
  }

  const img = await loadImage(file)
  if (!img.naturalWidth || !img.naturalHeight) {
    throw new Error('Invalid image dimensions')
  }

  const { width, height } = fitSize(img.naturalWidth, img.naturalHeight, MAX_EDGE)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported in this browser')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(img, 0, 0, width, height)

  // Prefer WebP
  let blob = await canvasToBlob(canvas, 'image/webp', WEBP_QUALITY)
  let contentType: 'image/webp' | 'image/jpeg' = 'image/webp'
  let extension: 'webp' | 'jpg' = 'webp'

  // Safari / older browsers may return null for WebP
  if (!blob || blob.size === 0) {
    blob = await canvasToBlob(canvas, 'image/jpeg', JPEG_QUALITY)
    contentType = 'image/jpeg'
    extension = 'jpg'
  }

  if (!blob || blob.size === 0) {
    throw new Error('Image conversion failed. Try another file or browser.')
  }

  return {
    blob,
    contentType,
    extension,
    width,
    height,
    originalName: file.name,
    originalSize: file.size,
    webpSize: blob.size,
  }
}

export function webpFileName(
  originalName: string,
  productId: string,
  extension: 'webp' | 'jpg' = 'webp'
): string {
  const base = originalName
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'image'
  const stamp = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
  return `products/${productId}/${base}-${stamp}.${extension}`
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(2)} MB`
}
