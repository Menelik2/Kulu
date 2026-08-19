/**
 * Client-side product image compression.
 * - Resize longest side ≤ MAX_EDGE
 * - Prefer WebP, fallback JPEG
 * - Adaptive quality until under TARGET_BYTES (or min quality)
 */

/** Max width/height — enough for product cards + detail, saves storage */
const MAX_EDGE = 1200

/** Aim for ~220 KB compressed (catalog photos) */
const TARGET_BYTES = 220 * 1024

/** Hard ceiling after compression */
const MAX_OUTPUT_BYTES = 450 * 1024

const QUALITY_STEPS_WEBP = [0.78, 0.7, 0.62, 0.55, 0.48]
const QUALITY_STEPS_JPEG = [0.82, 0.74, 0.66, 0.58, 0.5]

export interface WebpResult {
  blob: Blob
  contentType: 'image/webp' | 'image/jpeg'
  extension: 'webp' | 'jpg'
  width: number
  height: number
  originalName: string
  originalSize: number
  webpSize: number
  quality: number
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
    return { width: maxEdge, height: Math.max(1, Math.round((h / w) * maxEdge)) }
  }
  return { width: Math.max(1, Math.round((w / h) * maxEdge)), height: maxEdge }
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

async function encodeWithSteps(
  canvas: HTMLCanvasElement,
  mime: 'image/webp' | 'image/jpeg',
  steps: number[]
): Promise<{ blob: Blob; quality: number } | null> {
  let best: { blob: Blob; quality: number } | null = null

  for (const q of steps) {
    const blob = await canvasToBlob(canvas, mime, q)
    if (!blob || blob.size === 0) continue

    if (!best || blob.size < best.blob.size) {
      best = { blob, quality: q }
    }

    // Good enough
    if (blob.size <= TARGET_BYTES) {
      return { blob, quality: q }
    }
  }

  return best
}

/** Convert + compress any browser-decodable image. */
export async function convertToWebp(file: File): Promise<WebpResult> {
  const type = (file.type || '').toLowerCase()
  if (type && !type.startsWith('image/')) {
    throw new Error('File is not an image')
  }
  if (file.size === 0) {
    throw new Error('Empty file')
  }

  const img = await loadImage(file)
  if (!img.naturalWidth || !img.naturalHeight) {
    throw new Error('Invalid image dimensions')
  }

  // Slightly smaller edge for very large originals to hit target size easier
  let maxEdge = MAX_EDGE
  if (file.size > 4 * 1024 * 1024 || Math.max(img.naturalWidth, img.naturalHeight) > 3000) {
    maxEdge = 1000
  }
  if (file.size > 8 * 1024 * 1024) {
    maxEdge = 900
  }

  let { width, height } = fitSize(img.naturalWidth, img.naturalHeight, maxEdge)

  const draw = (w: number, h: number) => {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas not supported in this browser')
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(img, 0, 0, w, h)
    return canvas
  }

  let canvas = draw(width, height)

  // Try WebP first
  let encoded = await encodeWithSteps(canvas, 'image/webp', QUALITY_STEPS_WEBP)
  let contentType: 'image/webp' | 'image/jpeg' = 'image/webp'
  let extension: 'webp' | 'jpg' = 'webp'

  if (!encoded) {
    encoded = await encodeWithSteps(canvas, 'image/jpeg', QUALITY_STEPS_JPEG)
    contentType = 'image/jpeg'
    extension = 'jpg'
  }

  // Still too large → shrink dimensions and re-encode
  if (encoded && encoded.blob.size > MAX_OUTPUT_BYTES) {
    width = Math.round(width * 0.75)
    height = Math.round(height * 0.75)
    canvas = draw(width, height)
    const again =
      (await encodeWithSteps(canvas, 'image/webp', QUALITY_STEPS_WEBP)) ||
      (await encodeWithSteps(canvas, 'image/jpeg', QUALITY_STEPS_JPEG))
    if (again) {
      encoded = again
      contentType = again.blob.type === 'image/jpeg' ? 'image/jpeg' : contentType
      extension = contentType === 'image/jpeg' ? 'jpg' : 'webp'
      if (again.blob.type === 'image/jpeg') {
        contentType = 'image/jpeg'
        extension = 'jpg'
      }
    }
  }

  if (!encoded || !encoded.blob.size) {
    throw new Error('Image conversion failed. Try another file or browser.')
  }

  // Ensure contentType matches blob
  if (encoded.blob.type === 'image/jpeg') {
    contentType = 'image/jpeg'
    extension = 'jpg'
  } else if (encoded.blob.type === 'image/webp') {
    contentType = 'image/webp'
    extension = 'webp'
  }

  return {
    blob: encoded.blob,
    contentType,
    extension,
    width,
    height,
    originalName: file.name,
    originalSize: file.size,
    webpSize: encoded.blob.size,
    quality: encoded.quality,
  }
}

export function webpFileName(
  originalName: string,
  productId: string,
  extension: 'webp' | 'jpg' = 'webp'
): string {
  const base =
    originalName
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
