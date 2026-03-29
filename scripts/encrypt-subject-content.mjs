import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import {
  encryptSubjectContent,
  isEncryptedSubjectContent,
} from '../src/lib/subject-content-crypto.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

function loadLocalEnv() {
  const envPath = path.join(rootDir, '.env.local')
  const contents = fs.readFileSync(envPath, 'utf8')

  for (const line of contents.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) {
      continue
    }

    const separatorIndex = line.indexOf('=')
    if (separatorIndex === -1) {
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    let value = line.slice(separatorIndex + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    process.env[key] = value
  }
}

loadLocalEnv()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const { data: subjects, error } = await supabase
  .from('subjects')
  .select('id, name, content')
  .order('id', { ascending: true })

if (error) {
  throw new Error(`Failed to load subjects: ${error.message}`)
}

let updatedCount = 0

for (const subject of subjects || []) {
  if (isEncryptedSubjectContent(subject.content)) {
    continue
  }

  const encryptedContent = encryptSubjectContent(subject.content || {})
  const { error: updateError } = await supabase
    .from('subjects')
    .update({ content: encryptedContent })
    .eq('id', subject.id)

  if (updateError) {
    throw new Error(`Failed to encrypt subject ${subject.id}: ${updateError.message}`)
  }

  updatedCount += 1
  console.log(`Encrypted subject ${subject.id}: ${subject.name}`)
}

console.log(`Done. ${updatedCount} subject(s) encrypted.`)
