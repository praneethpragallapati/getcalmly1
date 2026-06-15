import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Safety & Ethics | GetCalmly',
  description:
    'Our ethical standards, confidentiality policy, online therapy disclaimer, and emergency protocol.',
}

const helplines = [
  ['iCall (TISS)', '9152987821'],
  ['Asra (24/7)', '+91-22-27546669'],
  ['One Life (24/7)', '78930-78930'],
  ['CHILDLINE (children)', '1098'],
  ["Women's Helpline", '1091'],
]

export default function SafetyPage() {
  return (
    <div className="bg-[#F9F5F0]">
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1
            style={{ fontFamily: "'Big Shoulders Display',sans-serif" }}
            className="text-4xl md:text-5xl font-black text-[#1a1a2e] mb-4"
          >
            Safety & Ethics
          </h1>
          <p className="text-gray-600 mb-10">
            We take the ethical and legal responsibilities of providing mental health services
            seriously. This page outlines how we protect you.
          </p>

          <div className="bg-[#fdecec] border border-[#f5c6cb] rounded-2xl p-6 mb-10">
            <h2 className="text-xl font-bold text-[#c0392b] mb-3">In a Crisis? Get Help Now</h2>
            <p className="text-sm text-[#7a2820] mb-4">
              If you are experiencing a crisis or contemplating suicide, please contact a helpline
              below or proceed to the nearest emergency centre.{' '}
              <strong>This website is not intended for emergency intervention.</strong>
            </p>
            <div className="space-y-1">
              {helplines.map(([name, num]) => (
                <div key={name} className="flex justify-between text-sm">
                  <span className="text-[#7a2820]">{name}</span>
                  <a href={`tel:${num.replace(/[^+\d]/g, '')}`} className="font-bold text-[#c0392b]">
                    {num}
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <Block title="Ethical Standards for Mental Health Professionals">
              Every professional on GetCalmly is bound by the ethical codes of their regulating
              body — the Rehabilitation Council of India (RCI) for clinical psychologists and the
              National Medical Commission (NMC) for psychiatrists. They practise within their scope:
              counsellors do not diagnose or treat severe disorders reserved for clinical
              psychologists and psychiatrists under the Mental Healthcare Act (MHCA) 2017.
            </Block>

            <Block title="Confidentiality and Its Limits">
              Your sessions and records are confidential and encrypted. As a Data Fiduciary under
              the DPDP Act 2023, we store your data securely and only share it with your consent.
              Confidentiality may be limited by law where there is a serious risk of harm to you or
              others, or where disclosure is legally mandated.
            </Block>

            <Block title="Online Therapy Disclaimer">
              Online therapy is effective for many concerns but is not suitable for medical
              emergencies, acute psychiatric crises, or severe conditions requiring in-person or
              inpatient care. Pre-assessments and self-help tools are screening aids, not clinical
              diagnoses. Our first session is conducted via video, in line with the Telemedicine
              Practice Guidelines (2020).
            </Block>

            <Block title="Emergency Protocol">
              We maintain a documented emergency plan. If risk is detected, we provide immediate
              crisis resources, can prioritise urgent professional support, and work toward local
              hospital coordination. We keep your local emergency contact and nearest hospital
              details on file where you provide them.
            </Block>

            <Block title="Complaints & Grievances">
              We are committed to a fair and prompt grievance process. To raise a concern about a
              professional or your experience, contact us at{' '}
              <a href="mailto:getcalmly@gmail.com" className="text-[#0D5C63] font-medium">
                getcalmly@gmail.com
              </a>{' '}
              and our team will respond confidentially.
            </Block>

            <Block title="Regulatory Compliance">
              GetCalmly operates in line with the Mental Healthcare Act 2017, the Telemedicine
              Practice Guidelines 2020, the DPDP Act 2023, and the evolving NCAHP framework. We
              appoint a Data Protection Officer and store health data securely.
            </Block>
          </div>
        </div>
      </section>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-[#0D5C63] mb-2">{title}</h2>
      <p className="text-gray-600 text-sm leading-relaxed">{children}</p>
    </div>
  )
}
