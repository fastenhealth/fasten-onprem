export const POSSIBLE_PERMISSIONS = [
  { name: 'Manage Sources', value: 'manage_sources' },
  { name: 'Read', value: 'read' },
]

export class User {
  id?: string
  full_name?: string
  username?: string
  email?: string
  password?: string
  role?: string
  permissions?: {
    [targetUserId: string]: {
      [key in typeof POSSIBLE_PERMISSIONS[number]['value']]: boolean;
    }
  }
}
