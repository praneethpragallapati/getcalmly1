import Hero from '@/components/landing/Hero'
import Stats from '@/components/landing/Stats'
import HowItWorks from '@/components/landing/HowItWorks'
import Services from '@/components/landing/Services'
import TherapistCards from '@/components/landing/TherapistCards'
import Plans from '@/components/landing/Plans'
import Testimonials from '@/components/landing/Testimonials'
import EmergencyBanner from '@/components/landing/EmergencyBanner'
import BlogPreview from '@/components/landing/BlogPreview'
import CommunityPreview from '@/components/landing/CommunityPreview'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <HowItWorks />
      <Services />
      <TherapistCards />
      <Plans />
      <Testimonials />
      <BlogPreview />
      <CommunityPreview />
      <EmergencyBanner />
    </>
  )
}
