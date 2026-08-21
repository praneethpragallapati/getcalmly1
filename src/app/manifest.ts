import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'getCalmly: Mental Healthcare, Powered by Experts, Personalized by AI',
    short_name: 'getCalmly',
    description:
      'Book your first session for ₹799 with licensed therapists and psychiatrists in India. AI-powered insights, daily mood tracking and a supportive community.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFF8F5',
    theme_color: '#C8553D',
    lang: 'en-IN',
    categories: ['health', 'medical', 'lifestyle'],
    // An installed app needs real PNGs — a .ico alone left Android scaling a
    // 48px image up to the launcher size. `maskable` is a separate file, not a
    // flag on the others: Android crops maskable icons to the device's shape
    // (often a circle), so its artwork is drawn smaller to survive the crop.
    // Declaring a normal icon as maskable is what clips the edges off a logo.
    icons: [
      { src: '/brand/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/brand/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/brand/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
