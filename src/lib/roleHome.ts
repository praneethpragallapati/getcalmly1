/** The dashboard a given role belongs to. Used by the area layouts to send a
 *  signed-in user with the wrong role to their own dashboard (one account = one
 *  dashboard). Anything that isn't ADMIN/THERAPIST is treated as a patient. */
export function roleHome(role?: string | null): string {
  return role === 'ADMIN' ? '/admin' : role === 'THERAPIST' ? '/expert' : '/app'
}
