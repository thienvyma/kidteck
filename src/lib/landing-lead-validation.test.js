import assert from 'node:assert/strict'
import test from 'node:test'

import {
  LEARNER_STAGE_OPTIONS,
  isAllowedLearnerStage,
  isValidVietnamMobilePhone,
} from './landing-lead-validation.js'

test('learner stages match the Google Docs landing spec', () => {
  assert.deepEqual(
    LEARNER_STAGE_OPTIONS.map((option) => option.value),
    [
      '12-13 tuoi - moi bat dau',
      '14-15 tuoi - can framework ro hon',
      '16 tuoi - muon build project chi chu',
      '17-18 tuoi - muon di sau product va AI',
    ]
  )
})

test('learner stage validation only accepts Google Docs landing options', () => {
  assert.equal(isAllowedLearnerStage('17-18 tuoi - muon di sau product va AI'), true)
  assert.equal(
    isAllowedLearnerStage('16-17 tuoi - muon di sau product, AI va nang luc trien khai'),
    false
  )
})

test('phone validation accepts common Vietnam mobile formats', () => {
  assert.equal(isValidVietnamMobilePhone('0912 345 678'), true)
  assert.equal(isValidVietnamMobilePhone('+84 912 345 678'), true)
  assert.equal(isValidVietnamMobilePhone('84912345678'), true)
})

test('phone validation rejects broad non-Vietnam or malformed input', () => {
  assert.equal(isValidVietnamMobilePhone('12345678'), false)
  assert.equal(isValidVietnamMobilePhone('+1 555 123 4567'), false)
  assert.equal(isValidVietnamMobilePhone('0912 abc 678'), false)
})
