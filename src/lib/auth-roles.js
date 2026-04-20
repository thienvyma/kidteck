export const APP_ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student',
}

export function isAppRole(role) {
  return role === APP_ROLES.ADMIN || role === APP_ROLES.STUDENT
}

export function getDashboardPathForRole(role) {
  return role === APP_ROLES.ADMIN ? '/admin' : '/student'
}
