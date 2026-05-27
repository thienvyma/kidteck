import assert from 'node:assert/strict'
import test from 'node:test'

import { requireTargetStudent } from './student-target.js'

function createProfilesClient(result) {
  const calls = []

  return {
    calls,
    from(table) {
      const call = { table }
      calls.push(call)

      return {
        select(columns) {
          call.columns = columns

          return {
            eq(column, value) {
              call.column = column
              call.value = value

              return {
                async maybeSingle() {
                  return result
                },
              }
            },
          }
        },
      }
    },
  }
}

test('requireTargetStudent returns the target profile when role is student', async () => {
  const profile = { id: 'student-1', role: 'student', full_name: 'Student One' }
  const adminClient = createProfilesClient({ data: profile, error: null })

  const result = await requireTargetStudent(adminClient, 'student-1')

  assert.deepEqual(result, { student: profile })
  assert.deepEqual(adminClient.calls, [
    {
      table: 'profiles',
      columns: 'id, role, full_name',
      column: 'id',
      value: 'student-1',
    },
  ])
})

test('requireTargetStudent rejects missing profiles', async () => {
  const adminClient = createProfilesClient({ data: null, error: null })

  const result = await requireTargetStudent(adminClient, 'missing')

  assert.equal(result.status, 404)
  assert.equal(result.error, 'Student profile not found')
})

test('requireTargetStudent rejects non-student profiles', async () => {
  const adminClient = createProfilesClient({
    data: { id: 'admin-1', role: 'admin', full_name: 'Admin One' },
    error: null,
  })

  const result = await requireTargetStudent(adminClient, 'admin-1')

  assert.equal(result.status, 400)
  assert.equal(result.error, 'Only student accounts can be managed from this endpoint')
})

test('requireTargetStudent returns profile lookup errors', async () => {
  const adminClient = createProfilesClient({
    data: null,
    error: { message: 'database unavailable' },
  })

  const result = await requireTargetStudent(adminClient, 'student-1')

  assert.equal(result.status, 400)
  assert.equal(result.error, 'database unavailable')
})
