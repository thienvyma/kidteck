'use client'

import { useDeferredValue, useEffect, useMemo, useState, useCallback } from 'react'
import DataTable from '@/components/admin/DataTable'
import styles from '../admin.module.css'

const statusMap = {
  new: { label: 'Mới', tone: 'badge--inactive' },
  contacted: { label: 'Đã liên hệ', tone: 'badge--paused' },
  qualified: { label: 'Tiềm năng', tone: 'badge--completed' },
  enrolled: { label: 'Đã đăng ký', tone: 'badge--active' },
  archived: { label: 'Lưu trữ', tone: 'badge--cancelled' },
}

const filterOptions = ['all', 'new', 'contacted', 'qualified', 'enrolled', 'archived']

function formatDate(value, withTime = false) {
  if (!value) {
    return '—'
  }

  const date = new Date(value)
  return withTime ? date.toLocaleString('vi-VN') : date.toLocaleDateString('vi-VN')
}

function statusBadge(value) {
  const view = statusMap[value] || statusMap.new
  return <span className={`${styles.badge} ${styles[view.tone]}`}>{view.label}</span>
}

export default function LeadsPage() {
  const [leads, setLeads] = useState([])
  const [summary, setSummary] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    enrolled: 0,
    archived: 0,
  })
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedLeadId, setSelectedLeadId] = useState(null)
  const [notesDraft, setNotesDraft] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [sortKey, setSortKey] = useState('createdLabel')
  const [sortDir, setSortDir] = useState('desc')
  const [pagination, setPagination] = useState({
    page: 0,
    perPage: 10,
    totalItems: 0,
    totalPages: 1,
  })
  const deferredSearch = useDeferredValue(search)

  const fetchLeads = useCallback(async () => {
    setLoading(true)

    try {
      const params = new URLSearchParams()
      params.set('status', filter)
      params.set('q', deferredSearch)
      params.set('page', String(page))
      params.set('perPage', '10')
      params.set('sortKey', sortKey)
      params.set('sortDir', sortDir)

      const response = await fetch(`/api/admin/leads?${params.toString()}`, {
        cache: 'no-store',
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Không thể tải danh sách lead')
      }

      const rows = (result.leads || []).map((lead) => ({
        ...lead,
        createdLabel: formatDate(lead.createdAt, true),
        updatedLabel: formatDate(lead.updatedAt, true),
        learnerLabel: lead.learnerName || '—',
        emailLabel: lead.email || '—',
        messageLabel: lead.message || 'Chưa có ghi chú từ form',
        searchText: [lead.name, lead.learnerName, lead.phone, lead.email, lead.stage]
          .filter(Boolean)
          .join(' '),
      }))

      setLeads(rows)
      setSummary(result.summary || {
        total: 0,
        new: 0,
        contacted: 0,
        qualified: 0,
        enrolled: 0,
        archived: 0,
      })
      setPagination(
        result.pagination || {
          page: 0,
          perPage: 10,
          totalItems: 0,
          totalPages: 1,
        }
      )
      setSelectedLeadId((current) => {
        if (rows.some((lead) => lead.id === current)) {
          return current
        }

        return rows[0]?.id || null
      })
    } catch (error) {
      console.error('fetchLeads error:', error)
      setFeedback({
        type: 'error',
        text: error.message || 'Không thể tải danh sách lead',
      })
    } finally {
      setLoading(false)
    }
  }, [deferredSearch, filter, page, sortDir, sortKey])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === selectedLeadId) || null,
    [leads, selectedLeadId]
  )

  useEffect(() => {
    setNotesDraft(selectedLead?.notes || '')
  }, [selectedLead?.id, selectedLead?.notes])

  async function handleSaveLead({ leadId, status, notes, successText }) {
    const targetLead = leads.find((lead) => lead.id === (leadId || selectedLead?.id))

    if (!targetLead) {
      return
    }

    setSaving(true)
    setFeedback(null)

    try {
      const response = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: targetLead.id,
          status,
          notes,
        }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Không thể cập nhật lead')
      }

      setFeedback({ type: 'success', text: successText })
      await fetchLeads()
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error.message || 'Không thể cập nhật lead',
      })
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { key: 'createdLabel', label: 'Nhận lúc' },
    { key: 'name', label: 'Người liên hệ' },
    { key: 'learnerLabel', label: 'Học viên' },
    { key: 'phone', label: 'Điện thoại' },
    { key: 'stage', label: 'Giai đoạn' },
    { key: 'status', label: 'Trạng thái', render: statusBadge },
  ]

  const actions = [
    {
      label: 'Mở',
      onClick: (row) => setSelectedLeadId(row.id),
    },
    {
      label: 'Đã liên hệ',
      hidden: (row) => ['contacted', 'qualified', 'enrolled', 'archived'].includes(row.status),
      onClick: (row) => {
        setSelectedLeadId(row.id)
        handleSaveLead({
          status: 'contacted',
          notes: row.notes || '',
          successText: 'Đã chuyển lead sang trạng thái đã liên hệ.',
          leadId: row.id,
        })
      },
    },
    {
      label: 'Đã đăng ký',
      hidden: (row) => row.status === 'enrolled',
      onClick: (row) => {
        setSelectedLeadId(row.id)
        handleSaveLead({
          status: 'enrolled',
          notes: row.notes || '',
          successText: 'Đã đánh dấu lead này đã đăng ký.',
          leadId: row.id,
        })
      },
    },
  ]

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Lead từ landing</h2>
          <p className={styles.curriculumLead}>
            Mọi form CTA ở landing giờ đổ vào đây để đội ngũ theo dõi, ghi chú, cập nhật trạng thái và biết lead nào đã trở thành học viên thật.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`${styles.feedbackBanner} ${
            feedback.type === 'success'
              ? styles.feedbackBannerSuccess
              : styles.feedbackBannerError
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className={styles.statsGrid} style={{ marginBottom: 'var(--space-xl)' }}>
        <div className={styles.statsCard}>
          <div className={styles.statsContent}>
            <span className={styles.statsTitle}>Tổng lead</span>
            <span className={styles.statsValue}>{summary.total}</span>
          </div>
        </div>
        <div className={`${styles.statsCard} ${styles['statsCard--warning']}`}>
          <div className={styles.statsContent}>
            <span className={styles.statsTitle}>Lead mới</span>
            <span className={styles.statsValue}>{summary.new}</span>
          </div>
        </div>
        <div className={`${styles.statsCard} ${styles['statsCard--accent']}`}>
          <div className={styles.statsContent}>
            <span className={styles.statsTitle}>Tiềm năng</span>
            <span className={styles.statsValue}>{summary.qualified}</span>
          </div>
        </div>
        <div className={`${styles.statsCard} ${styles['statsCard--success']}`}>
          <div className={styles.statsContent}>
            <span className={styles.statsTitle}>Đã đăng ký</span>
            <span className={styles.statsValue}>{summary.enrolled}</span>
          </div>
        </div>
      </div>

      <div className={styles.filterBar}>
        {filterOptions.map((item) => (
          <button
            key={item}
            className={`${styles.filterBtn} ${filter === item ? styles.filterBtnActive : ''}`}
            onClick={() => {
              setFilter(item)
              setPage(0)
            }}
          >
            {item === 'all' ? 'Tất cả' : statusMap[item].label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={leads}
        searchKey="searchText"
        searchValue={search}
        onSearchChange={setSearch}
        sortKey={sortKey}
        sortDir={sortDir}
        onSortChange={(nextSortKey, nextSortDir) => {
          setSortKey(nextSortKey)
          setSortDir(nextSortDir)
        }}
        page={pagination.page}
        onPageChange={setPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        perPage={pagination.perPage}
        loading={loading}
        emptyMessage="Chưa có lead nào từ landing"
        actions={actions}
      />

      <div className={styles.leadManagerGrid}>
        <section className={styles.sectionCard}>
          <div className={styles.sectionCardHeader}>Chi tiết lead</div>
          {!selectedLead ? (
            <div className={styles.accountSection}>
              <p className={styles.accountNote}>
                Chưa có lead nào để hiển thị chi tiết.
              </p>
            </div>
          ) : (
            <div className={styles.accountSection}>
              <div className={styles.accountGrid}>
                <div className={styles.accountField}>
                  <span className={styles.accountLabel}>Người liên hệ</span>
                  <span className={styles.accountValue}>{selectedLead.name}</span>
                </div>
                <div className={styles.accountField}>
                  <span className={styles.accountLabel}>Học viên</span>
                  <span className={styles.accountValue}>{selectedLead.learnerLabel}</span>
                </div>
                <div className={styles.accountField}>
                  <span className={styles.accountLabel}>Điện thoại</span>
                  <span className={styles.accountValue}>{selectedLead.phone}</span>
                </div>
                <div className={styles.accountField}>
                  <span className={styles.accountLabel}>Email</span>
                  <span className={styles.accountValue}>{selectedLead.emailLabel}</span>
                </div>
                <div className={styles.accountField}>
                  <span className={styles.accountLabel}>Nguồn</span>
                  <span className={styles.accountValue}>Landing CTA</span>
                </div>
                <div className={styles.accountField}>
                  <span className={styles.accountLabel}>Nhận lúc</span>
                  <span className={styles.accountValue}>{selectedLead.createdLabel}</span>
                </div>
                <div className={styles.accountField}>
                  <span className={styles.accountLabel}>Giai đoạn</span>
                  <span className={styles.accountValue}>{selectedLead.stage}</span>
                </div>
                <div className={styles.accountField}>
                  <span className={styles.accountLabel}>Trạng thái</span>
                  <span className={styles.accountValue}>{statusBadge(selectedLead.status)}</span>
                </div>
              </div>

              <div className={styles.leadMessageCard}>
                <div className={styles.contentEditorHeader}>Nhu cầu từ form</div>
                <p className={styles.accountNote}>{selectedLead.messageLabel}</p>
              </div>

              <div className={styles.leadStatusGroup}>
                {Object.entries(statusMap).map(([key, value]) => (
                  <button
                    key={key}
                    type="button"
                    className={`${styles.leadStatusBtn} ${
                      selectedLead.status === key ? styles.leadStatusBtnActive : ''
                    }`}
                    onClick={() =>
                      handleSaveLead({
                        leadId: selectedLead.id,
                        status: key,
                        notes: notesDraft,
                        successText: `Đã cập nhật lead sang trạng thái "${value.label}".`,
                      })
                    }
                    disabled={saving}
                  >
                    {value.label}
                  </button>
                ))}
              </div>

              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>Ghi chú nội bộ</span>
                <textarea
                  className={styles.formTextarea}
                  rows={5}
                  value={notesDraft}
                  onChange={(event) => setNotesDraft(event.target.value)}
                  placeholder="Ví dụ: đã gọi, phụ huynh muốn bắt đầu level 2 sau kỳ thi, hẹn lại cuối tuần..."
                />
              </label>

              <div className={styles.accountActions}>
                <button
                  type="button"
                  className={`${styles.quickActionBtn} ${styles['quickActionBtn--primary']}`}
                  onClick={() =>
                    handleSaveLead({
                      leadId: selectedLead.id,
                      status: selectedLead.status,
                      notes: notesDraft,
                      successText: 'Đã lưu ghi chú lead.',
                    })
                  }
                  disabled={saving}
                >
                  {saving ? 'Đang lưu...' : 'Lưu ghi chú'}
                </button>
                <a
                  href={`tel:${selectedLead.phone}`}
                  className={`${styles.quickActionBtn} ${styles['quickActionBtn--outline']}`}
                >
                  Gọi nhanh
                </a>
                {selectedLead.email && (
                  <a
                    href={`mailto:${selectedLead.email}`}
                    className={`${styles.quickActionBtn} ${styles['quickActionBtn--outline']}`}
                  >
                    Gửi email
                  </a>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
