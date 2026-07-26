import {
  Brain,
  HeartHandshake,
  Sprout,
  Baby,
  ClipboardList,
  HandHeart,
  LifeBuoy,
} from 'lucide-react'

type IconCmp = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>

/** Shared line icons for each service, used in the nav menu and listing cards. */
export const SERVICE_ICONS: Record<string, IconCmp> = {
  therapy: Brain,
  couples: HeartHandshake,
  child: Sprout,
  maternal: Baby,
  addiction: LifeBuoy,
  assessments: ClipboardList,
  specialised: HandHeart,
}
