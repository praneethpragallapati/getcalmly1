import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'getCalmly: Mental Healthcare, Powered by Experts, Personalized by AI',
    short_name: 'getCalmly',
    description:
      'Book your first session for ₹999 with licensed therapists and psychiatrists in India. AI-powered insights, daily mood tracking and a supportive community.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFF8F5',
    theme_color: '#C8553D',
    lang: 'en-IN',
    categories: ['health', 'medical', 'lifestyle'],
    icons: [
      { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
    ],
  }
}
