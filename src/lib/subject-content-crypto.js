import crypto from 'node:crypto'

const ENCRYPTION_VERSION = 1

function getSecretMaterial() {
  return process.env.LESSON_CONTENT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
}

function getEncryptionKey() {
  const secret = getSecretMaterial()

  if (!secret) {
    throw new Error('Missing secret for lesson content encryption')
  }

  return crypto.createHash('sha256').update(secret).digest()
}

export function isEncryptedSubjectContent(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      value.__encrypted === true &&
      typeof value.iv === 'string' &&
      typeof value.tag === 'string' &&
      typeof value.ciphertext === 'string'
  )
}

export function encryptSubjectContent(value = {}) {
  if (isEncryptedSubjectContent(value)) {
    return value
  }

  const payload =
    value && typeof value === 'object' && !Array.isArray(value) ? value : {}

  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv)
  const plaintext = Buffer.from(JSON.stringify(payload), 'utf8')
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()])
  const tag = cipher.getAuthTag()

  return {
    __encrypted: true,
    v: ENCRYPTION_VERSION,
    alg: 'aes-256-gcm',
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    ciphertext: ciphertext.toString('base64'),
  }
}

export function decryptSubjectContent(value) {
  if (!value) {
    return {}
  }

  if (!isEncryptedSubjectContent(value)) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  }

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    getEncryptionKey(),
    Buffer.from(value.iv, 'base64')
  )

  decipher.setAuthTag(Buffer.from(value.tag, 'base64'))

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(value.ciphertext, 'base64')),
    decipher.final(),
  ])

  const parsed = JSON.parse(decrypted.toString('utf8'))
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
}
