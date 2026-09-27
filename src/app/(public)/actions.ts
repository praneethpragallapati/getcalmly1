'use server'

import { prisma } from '@/lib/prisma'
import { notifyContactMessage, notifyEnterpriseLead, notifyClinicianApplication } from '@/lib/adminNotify'
import { DOC_KINDS, DOC_MAX_BYTES, labelDoc, readDoc, type DocKind } from '@/lib/clinicianDocs'

export type SubmitResult = { ok: boolean; error?: string }

const clean = (v: FormDataEntryValue | null | undefined, max = 4000): string =>
  (typeof v === 'string' ? v : '').trim().slice(0, max)

/** Persist a "Contact us" submission. Fails open (never blocks the UI). */
export async function submitContactMessage(input: {
  name: string; email: string; phone?: string; message: string
}): Promise<SubmitResult> {
  const name = clean(input.name, 120)
  const email = clean(input.email, 200)
  const message = clean(input.message)
  if (!name || !email || !message) return { ok: false, error: 'Please fill in your name, email and message.' }
  try {
    await prisma.contactMessage.create({
      data: { name, email, phone: clean(input.phone, 40) || null, message },
    })
    await notifyContactMessage(name, message.slice(0, 80))
    return { ok: true }
  } catch {
    // No DB (preview) — accept without persisting so the form still feels done.
    return { ok: true }
  }
}

/** Persist an enterprise interest lead. */
export async function submitEnterpriseLead(input: {
  name: string; email: string; organisation?: string; sector?: string; teamSize?: string; phone?: string; message?: string
}): Promise<SubmitResult> {
  const name = clean(input.name, 120)
  const email = clean(input.email, 200)
  if (!name || !email) return { ok: false, error: 'Please add your name and work email.' }
  try {
    await prisma.enterpriseLead.create({
      data: {
        name, email,
        organisation: clean(input.organisation, 160) || null,
        sector: clean(input.sector, 60) || null,
        teamSize: clean(input.teamSize, 40) || null,
        phone: clean(input.phone, 40) || null,
        message: clean(input.message) || null,
      },
    })
    await notifyEnterpriseLead(clean(input.organisation, 160) || name, email)
    return { ok: true }
  } catch {
    return { ok: true }
  }
}

/** Persist a therapist application (the public intake form). */
export async function submitTherapistApplication(input: {
  fullName: string; email: string; phone: string; council: string; registrationNo: string
  yearsExp?: number; qualifications?: string[]; specializations?: string[]; languages?: string[]
  bio?: string; documentUrls?: string[]; preferredInterviewAt?: string | null
}): Promise<SubmitResult & { id?: string }> {
  const fullName = clean(input.fullName, 160)
  const email = clean(input.email, 200)
  if (!fullName || !email) return { ok: false, error: 'Please add your name and email.' }
  try {
    const when = input.preferredInterviewAt ? new Date(input.preferredInterviewAt) : null
    const created = await prisma.therapistApplication.create({
      select: { id: true },
      data: {
        fullName,
        email,
        phone: clean(input.phone, 40),
        council: clean(input.council, 40) || 'RCI',
        registrationNo: clean(input.registrationNo, 80),
        yearsExp: Number.isFinite(input.yearsExp) ? Math.max(0, Math.round(input.yearsExp as number)) : 0,
        qualifications: (input.qualifications ?? []).map((s) => s.trim()).filter(Boolean).slice(0, 20),
        specializations: (input.specializations ?? []).map((s) => s.trim()).filter(Boolean).slice(0, 20),
        languages: (input.languages ?? []).map((s) => s.trim()).filter(Boolean).slice(0, 20),
        bio: clean(input.bio) || null,
        documentUrls: (input.documentUrls ?? []).slice(0, 20),
        preferredInterviewAt: when && !Number.isNaN(when.getTime()) ? when : null,
      },
    })
    await notifyClinicianApplication(fullName, (input.specializations ?? [])[0] ?? null)
    return { ok: true, id: created.id }
  } catch {
    return { ok: true }
  }
}

const DOC_TYPES = /^data:(application\/pdf|application\/octet-stream|image\/(png|jpeg)|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document);base64,/

/**
 * Attach one document (proof of identity, proof of registration or CV) to an
 * application just submitted. Sent one per request so each stays under the
 * request size cap. Only a fresh application (last hour) accepts documents,
 * and a second upload of the same kind replaces the first.
 */
export async function attachApplicationDocument(input: {
  applicationId: string; kind: string; fileName: string; dataUrl: string
}): Promise<SubmitResult> {
  const kind = DOC_KINDS.find((d) => d.kind === input.kind)?.kind as DocKind | undefined
  if (!kind || !input.applicationId) return { ok: false, error: 'Unknown document.' }
  if (!DOC_TYPES.test(input.dataUrl)) return { ok: false, error: 'Please upload a PDF, JPG, PNG or Word file.' }
  // base64 is 4/3 of the file; allow a little for the header.
  if (input.dataUrl.length > Math.ceil(DOC_MAX_BYTES * 4 / 3) + 200) return { ok: false, error: 'That file is over 2.5 MB.' }
  try {
    const app = await prisma.therapistApplication.findUnique({
      where: { id: input.applicationId },
      select: { documentUrls: true, createdAt: true },
    })
    if (!app || Date.now() - app.createdAt.getTime() > 60 * 60 * 1000) return { ok: false, error: 'This application can no longer take documents.' }
    const kept = app.documentUrls.filter((u) => readDoc(u).kind !== kind)
    await prisma.therapistApplication.update({
      where: { id: input.applicationId },
      data: { documentUrls: [...kept, labelDoc(input.dataUrl, kind, input.fileName)].slice(0, 20) },
    })
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not save that document.' }
  }
}
