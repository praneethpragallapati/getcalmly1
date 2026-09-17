import Logo from '@/components/ui/Logo'
import Link from 'next/link'

/**
 * First-time-member flows (details, payment) share the same terracotta photo
 * background as the login page, so signing in, filling in your details and
 * paying all feel like one continuous, calm space. The form sits in a clean
 * card centred on the photo.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="authx">
      <div className="authx-bg" />
      <div className="authx-veil" />
      <div className="authx-inner">
        <Link href="/" className="authx-logo"><Logo size={30} onDark href={null} /></Link>
        <div className="authx-card">{children}</div>
      </div>

      <style>{`
        .authx{position:relative;min-height:100svh;display:grid;place-items:center;
          padding:40px 20px 56px;overflow:hidden;background:#8a4530;}
        .authx-bg{position:absolute;inset:0;z-index:0;background:url('/login-bg.jpg') 32% center/cover;}
        .authx-veil{position:absolute;inset:0;z-index:1;
          background:linear-gradient(180deg,rgba(28,15,8,.52) 0%,rgba(28,15,8,.32) 40%,rgba(28,15,8,.42) 100%);}
        .authx-inner{position:relative;z-index:2;width:100%;max-width:520px;
          display:flex;flex-direction:column;align-items:center;gap:22px;}
        .authx-logo{text-decoration:none;display:inline-block;}
        .authx-card{width:100%;background:rgba(255,255,255,.98);backdrop-filter:blur(8px);
          border-radius:24px;padding:34px 32px;box-shadow:0 34px 90px -24px rgba(40,20,10,.55);}
        @media(max-width:560px){ .authx{padding:28px 16px 40px;} .authx-card{padding:26px 20px;border-radius:20px;} }
      `}</style>
    </div>
  )
}
