import Icon, { type IconName } from '@/components/ui/Icon'

type IconCmp = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>

// Build each service icon from the shared geometric Icon set so the nav
// dropdown and listing cards match the rest of the site's icon language.
function make(name: IconName): IconCmp {
  function ServiceIcon({ size, color, strokeWidth }: { size?: number; color?: string; strokeWidth?: number }) {
    return <Icon name={name} size={size} color={color} strokeWidth={strokeWidth} />
  }
  ServiceIcon.displayName = `ServiceIcon(${name})`
  return ServiceIcon
}

/** Shared line icons for each service, used in the nav menu and listing cards. */
export const SERVICE_ICONS: Record<string, IconCmp> = {
  therapy: make('brain'),
  psychiatry: make('pill'),
  couples: make('couples'),
  child: make('growth'),
  maternal: make('mother'),
  assessments: make('clipboard'),
  specialised: make('hands'),
}
