'use client'

/**
 * Downscale an image File to a small square JPEG data URL, entirely in the
 * browser. Avatars never need the full-resolution upload, and sending a
 * multi-megabyte data URL through a Server Action trips Next's ~1 MB action
 * body limit — the request fails and the page shows a generic error. A 384px
 * square at JPEG q0.82 is ~20–60 KB: reliably under the limit, and it keeps the
 * User.image row small so every page that renders the avatar stays fast.
 */
export async function fileToAvatarDataUrl(file: File, size = 384, quality = 0.82): Promise<string> {
  const bitmap = await loadImage(file)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')

  // Cover-crop to a centered square so portraits and landscapes both look right.
  const scale = Math.max(size / bitmap.width, size / bitmap.height)
  const w = bitmap.width * scale
  const h = bitmap.height * scale
  ctx.drawImage(bitmap, (size - w) / 2, (size - h) / 2, w, h)

  const url = canvas.toDataURL('image/jpeg', quality)
  if ('close' in bitmap && typeof (bitmap as ImageBitmap).close === 'function') {
    (bitmap as ImageBitmap).close()
  }
  return url
}

function loadImage(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    // Fastest path; handles EXIF orientation on modern browsers.
    return createImageBitmap(file).catch(() => loadViaElement(file))
  }
  return loadViaElement(file)
}

function loadViaElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read that image.'))
    }
    img.src = url
  })
}
