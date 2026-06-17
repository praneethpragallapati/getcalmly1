// Cover photos for blog posts, chosen by the post's primary tag so the mapping
// works for both DB-served and bundled-seed posts (no schema change needed).
// Calming, editorial stock from Unsplash's stable CDN; the BlogCover component
// falls back to a brand gradient if an image ever fails to load.

const U = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=70`

const BY_TAG: Record<string, string> = {
  anxiety: U('1500530855697-b586d89ba3ee'), // calm sky over still water
  postpartum: U('1490730141103-6cac27aaab94'), // soft morning light
  'men-mental-health': U('1441974231531-c6227db76b6e'), // quiet forest
  cbt: U('1518495973542-4542c06a5843'), // sunlight through leaves
  grief: U('1470071459604-3b5ec3a7fe05'), // foggy forest
  depression: U('1499209974431-9dddcece7f88'), // window light
  grief_loss: U('1470071459604-3b5ec3a7fe05'),
}

const DEFAULT = U('1506744038136-46273834b3fb') // open valley landscape

export function blogImage(tags: string[]): string {
  for (const t of tags) {
    if (BY_TAG[t]) return BY_TAG[t]
  }
  return DEFAULT
}
