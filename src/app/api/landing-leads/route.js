import { NextResponse } from 'next/server'
import { createLandingLead } from '@/lib/landing-leads'

const PHONE_PATTERN = /^[0-9+().\s-]{8,20}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function readString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function validateLeadInput(body) {
  const payload = {
    name: readString(body?.name),
    learnerName: readString(body?.learnerName),
    phone: readString(body?.phone),
    email: readString(body?.email).toLowerCase(),
    stage: readString(body?.stage),
    message: readString(body?.message),
    website: readString(body?.website),
  }

  if (payload.website) {
    return { error: 'Spam detected' }
  }

  if (!payload.name || payload.name.length < 2) {
    return { error: 'Vui lòng nhập tên người liên hệ' }
  }

  if (!payload.phone || !PHONE_PATTERN.test(payload.phone)) {
    return { error: 'Số điện thoại chưa đúng định dạng' }
  }

  if (!payload.stage) {
    return { error: 'Vui lòng chọn giai đoạn phù hợp' }
  }

  if (payload.email && !EMAIL_PATTERN.test(payload.email)) {
    return { error: 'Email chưa đúng định dạng' }
  }

  if (payload.name.length > 120 || payload.learnerName.length > 120) {
    return { error: 'Tên đang quá dài' }
  }

  if (payload.email.length > 120) {
    return { error: 'Email đang quá dài' }
  }

  if (payload.message.length > 600) {
    return { error: 'Mô tả nhu cầu đang quá dài' }
  }

  return { payload }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const validation = validateLeadInput(body)

    if (validation.error) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const lead = await createLandingLead(validation.payload)

    return NextResponse.json(
      {
        success: true,
        lead: {
          id: lead.id,
          name: lead.name,
          phone: lead.phone,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('landing-leads POST error:', error)
    return NextResponse.json(
      { error: 'Chưa thể gửi thông tin lúc này. Vui lòng thử lại sau.' },
      { status: 500 }
    )
  }
}
