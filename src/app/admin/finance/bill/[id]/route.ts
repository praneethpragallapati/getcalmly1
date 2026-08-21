import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin'
import { canAccess } from '@/lib/adminRoles'
import { getLedgerBill } from '@/lib/ledger'

/**
 * Serve one attached bill.
 *
 * Bills are stored as data URLs (the same store clinician documents use), so
 * this decodes one back into bytes on demand. It is a route rather than an
 * inline link so the file is never carried in the ledger list payload, and so
 * access is checked per request.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession()
  if (!admin || !canAccess(admin.adminType, 'money')) {
    return new NextResponse('Not found', { status: 404 })
  }
  const { id } = await ctx.params
  const bill = await getLedgerBill(id)
  if (!bill) return new NextResponse('Not found', { status: 404 })

  const match = /^data:([^;,]+)?(;base64)?,([^]*)$/.exec(bill.url)
  if (!match) return new NextResponse('Not found', { status: 404 })
  const [, mime = 'application/octet-stream', b64, payload] = match
  const body = b64
    ? Buffer.from(payload, 'base64')
    : Buffer.from(decodeURIComponent(payload), 'utf8')

  return new NextResponse(new Uint8Array(body), {
    headers: {
      'Content-Type': mime || 'application/octet-stream',
      // inline so an image or PDF opens in the tab; the filename is kept for a save.
      'Content-Disposition': `inline; filename="${bill.name.replace(/"/g, '')}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
