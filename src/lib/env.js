export function cleanEnvValue(value) {
  if (typeof value !== 'string') {
    return ''
  }

  return value.trim().replace(/^\uFEFF/, '')
}

export function getRequiredEnv(name) {
  const value = cleanEnvValue(process.env[name])

  if (!value) {
    throw new Error(`${name} is not configured.`)
  }

  return value
}
