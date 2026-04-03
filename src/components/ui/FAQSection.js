'use client'

import { useState } from 'react'
import styles from '@/app/page.module.css'

const defaultFaqData = [
  {
    q: 'Con chưa biết gì về lập trình, có học được không?',
    a: 'Hoàn toàn được! AIgenlabs dùng AI làm trợ lý — con chỉ cần mô tả ý tưởng bằng tiếng Việt, AI sẽ hỗ trợ phần kỹ thuật. Điều quan trọng là học tư duy, không phải syntax.'
  },
  {
    q: 'Con cần máy tính như thế nào?',
    a: 'Laptop phổ thông là đủ (Windows/Mac, RAM 8GB). Không cần máy gaming hay cấu hình cao. Nếu gia đình chưa có laptop, AIgenlabs có thể hỗ trợ tư vấn.'
  },
  {
    q: 'Lịch học như thế nào? Có ảnh hưởng đến việc học trường không?',
    a: 'Lịch học cuối tuần (Thứ 7 hoặc Chủ nhật), mỗi buổi 2 tiếng. Được thiết kế để không xung đột với lịch học chính khóa. Ngoài ra, mọi buổi đều được recording để xem lại.'
  },
  {
    q: 'Giáo viên là ai?',
    a: 'Giảng viên AIgenlabs là các developer, engineer có kinh nghiệm thực tế trong ngành tech và đam mê giáo dục. Được đào tạo phương pháp dạy cho lứa tuổi teen.'
  },
  {
    q: 'Học Vibe Coding có khác gì học lập trình truyền thống?',
    a: 'Lập trình truyền thống: mất 6-12 tháng học syntax, rất nhàm chán, dễ bỏ cuộc. Vibe Coding: dùng AI viết code, con tập trung vào tư duy & sáng tạo. Tuần đầu tiên đã có sản phẩm chạy thật. Thú vị hơn rất nhiều!'
  },
  {
    q: 'Nếu con không thích thì sao?',
    a: 'AIgenlabs cam kết hoàn tiền 100% sau buổi học đầu tiên nếu con không thích. Không câu hỏi, không điều kiện. Phụ huynh hoàn toàn yên tâm.'
  }
]

export default function FAQSection({ items }) {
  const [openIndex, setOpenIndex] = useState(null)
  const faqData =
    Array.isArray(items) && items.length > 0
      ? items.map((item) => ({
          q: item.question,
          a: item.answer,
        }))
      : defaultFaqData

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i)
  }

  return (
    <div className={styles.faq__list}>
      {faqData.map((item, i) => (
        <div key={i} className={styles.faq__item}>
          <button
            className={styles.faq__question}
            onClick={() => toggle(i)}
            aria-expanded={openIndex === i}
            type="button"
          >
            {item.q}
            <span
              className={styles.faq__toggle}
              style={{
                transform: openIndex === i ? 'rotate(45deg)' : 'rotate(0)',
                display: 'inline-block'
              }}
            >
              +
            </span>
          </button>
          <div
            className={styles.faq__answer}
            style={{
              maxHeight: openIndex === i ? '300px' : '0',
              padding: openIndex === i ? undefined : '0 var(--space-xl)',
              overflow: 'hidden',
              transition: 'max-height 0.35s ease, padding 0.35s ease'
            }}
          >
            {item.a}
          </div>
        </div>
      ))}
    </div>
  )
}
