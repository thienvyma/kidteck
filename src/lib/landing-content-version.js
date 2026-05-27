export const LANDING_CONTENT_VERSION_REQUIRED_MESSAGE =
  'Reload landing content before saving. The editor did not receive a server version.'
export const LANDING_CONTENT_VERSION_REQUIRED_CODE = 'LANDING_CONTENT_VERSION_REQUIRED'

export function assertLandingContentWriteVersion(current, expectedUpdatedAt) {
  if (current?.updatedAt && !expectedUpdatedAt) {
    const error = new Error(LANDING_CONTENT_VERSION_REQUIRED_MESSAGE)
    error.code = LANDING_CONTENT_VERSION_REQUIRED_CODE
    throw error
  }
}
