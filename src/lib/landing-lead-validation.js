export const LEARNER_STAGE_OPTIONS = [
  {
    value: '12-13 tuoi - moi bat dau',
    label: '12-13 tuổi • mới bắt đầu',
  },
  {
    value: '14-15 tuoi - can framework ro hon',
    label: '14-15 tuổi • cần framework rõ hơn',
  },
  {
    value: '16 tuoi - muon build project chi chu',
    label: '16 tuổi • muốn build project chỉn chu',
  },
  {
    value: '17-18 tuoi - muon di sau product va AI',
    label: '17-18 tuổi • muốn đi sâu product và AI',
  },
]

const LEARNER_STAGE_VALUES = new Set(LEARNER_STAGE_OPTIONS.map((option) => option.value))

export function isAllowedLearnerStage(value) {
  return LEARNER_STAGE_VALUES.has(value)
}

export function normalizeVietnamMobilePhone(value) {
  const compact = String(value || '').replace(/[\s().-]/g, '')

  if (!/^\+?\d+$/.test(compact)) {
    return ''
  }

  if (compact.startsWith('+84')) {
    return `0${compact.slice(3)}`
  }

  if (compact.startsWith('84')) {
    return `0${compact.slice(2)}`
  }

  return compact
}

export function isValidVietnamMobilePhone(value) {
  const phone = normalizeVietnamMobilePhone(value)
  return /^0(3|5|7|8|9)\d{8}$/.test(phone)
}
