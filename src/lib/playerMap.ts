export const PLAYER_FAMILY_MAP: Record<string, 'back' | 'forward'> = {
  'Facundo Maggi': 'back',
  'Felipe Ortiz': 'back',
  'Juan Pedro Ramognino': 'back',
  'Lucas Cristeff': 'back',
  'Lucas Jeckeln': 'back',
  'Ramiro Waisberg': 'back',
  'Ryan Itzcovitz': 'back',
  'Santino Pantanali': 'back',
  'Felipe Karpowickz': 'forward',
  'Gonzalo Caputo': 'forward',
  'Ian Rodriguez': 'forward',
  'Javier Yaber': 'forward',
  'Juan Ara': 'back',
  'Juan Russo': 'forward',
  'Juan Stratiotis': 'forward',
  'Manuel Ramallo': 'forward',
  'Martin Fiorio': 'forward',
  'Nacho Pussi': 'forward',
  'Nazareno Sanchez': 'forward',
  'Octavio Peyrot': 'forward',
  'Santiago Vera': 'forward',
}

export const PLAYER_SUB_FAMILY_MAP: Record<string, string> = {
  'Javier Yaber': 'Front Row',
  'Martin Fiorio': 'Front Row',
  'Ian Rodriguez': 'Front Row',
  'Nazareno Sanchez': 'Front Row',
  'Nacho Pussi': 'Locks',
  'Santiago Vera': 'Locks',
  'Juan Stratiotis': 'Locks',
  'Juan Russo': 'Locks',
  'Felipe Karpowickz': 'Back Row',
  'Gonzalo Caputo': 'Back Row',
  'Manuel Ramallo': 'Back Row',
  'Octavio Peyrot': 'Back Row',
  'Facundo Maggi': 'Inside Backs',
  'Ramiro Waisberg': 'Inside Backs',
  'Juan Ara': 'Inside Backs',
  'Ryan Itzcovitz': 'Outside Backs',
  'Lucas Jeckeln': 'Outside Backs',
  'Felipe Ortiz': 'Outside Backs',
  'Juan Pedro Ramognino': 'Outside Backs',
  'Lucas Cristeff': 'Outside Backs',
  'Santino Pantanali': 'Outside Backs',
}

export function getPlayerFamily(name: string): 'back' | 'forward' | 'unknown' {
  return PLAYER_FAMILY_MAP[name] ?? 'unknown'
}

export function getPlayerSubFamily(name: string): string | null {
  return PLAYER_SUB_FAMILY_MAP[name] ?? null
}
