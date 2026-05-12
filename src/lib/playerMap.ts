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

export function getPlayerFamily(name: string): 'back' | 'forward' | 'unknown' {
  return PLAYER_FAMILY_MAP[name] ?? 'unknown'
}
