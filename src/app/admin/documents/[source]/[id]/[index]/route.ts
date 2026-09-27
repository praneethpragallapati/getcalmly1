import { getAdminSession } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { readDoc } from '@/lib/clinicianDocs'

/**
 * Serve one stored clinician document (admin only). Documents are kept as data
 * URLs; browsers refuse to open those in a new tab, so they are decoded and
 * sent as a normal file. `source` is "application" or "clinician".
 */
export async function GET(_req: Request, { params }: { params: Promise<{ source: string; id: string; index: string }> }) {
  if (!(await getAdminSession())) return new Response('Not found', { status: 404 })
  const { source, id, index } = await params
  const i = Number(index)
  if (!Number.isInteger(i) || i < 0) return new Response('Not found', { status: 404 })

  let urls: string[] = []
  if (source === 'application') {
    urls = (await prisma.therapistApplication.findUnique({ where: { id }, select: { documentUrls: true } }))?.documentUrls ?? []
  } else if (source === 'clinician') {
    urls = (await prisma.therapistProfile.findUnique({ where: { id }, select: { documentUrls: true } }))?.documentUrls ?? []
  }
  const stored = urls[i]
  if (!stored) return new Response('Not found', { status: 404 })

  const doc = readDoc(stored, i)
  // Older entries may be plain links rather than data URLs: just send them on.
  const m = /^data:([^;,]+)(;base64)?,([\s\S]*)$/.exec(doc.href)
  if (!m) return Response.redirect(doc.href, 302)
  const body = m[2] ? Buffer.from(m[3], 'base64') : Buffer.from(decodeURIComponent(m[3]))
  return new Response(body, {
    headers: {
      'Content-Type': m[1],
      'Content-Disposition': `inline; filename="${doc.fileName.replace(/["\\\r\n]/g, '')}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
