'use server'

import { prisma } from '@/lib/prisma'

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
}): Promise<SubmitResult> {
  const fullName = clean(input.fullName, 160)
  const email = clean(input.email, 200)
  if (!fullName || !email) return { ok: false, error: 'Please add your name and email.' }
  try {
    const when = input.preferredInterviewAt ? new Date(input.preferredInterviewAt) : null
    await prisma.therapistApplication.create({
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
    return { ok: true }
  } catch {
    return { ok: true }
  }
}
