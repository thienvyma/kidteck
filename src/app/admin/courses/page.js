/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import EditSubjectModal from '@/components/admin/EditSubjectModal'
import styles from '../admin.module.css'

const emptyLevelForm = {
  name: '',
  description: '',
  price: '',
  durationWeeks: '',
  isActive: true,
}

const emptySubjectForm = {
  name: '',
  description: '',
}

export default function CoursesPage() {
  const [supabase] = useState(() => createClient())
  const [levels, setLevels] = useState([])
  const [selectedLevelId, setSelectedLevelId] = useState(null)
  const [levelForm, setLevelForm] = useState(emptyLevelForm)
  const [newLevelForm, setNewLevelForm] = useState(emptyLevelForm)
  const [subjectForm, setSubjectForm] = useState(emptySubjectForm)
  const [showCreateLevel, setShowCreateLevel] = useState(false)
  const [loading, setLoading] = useState(true)
  const [savingLevel, setSavingLevel] = useState(false)
  const [creatingLevel, setCreatingLevel] = useState(false)
  const [creatingSubject, setCreatingSubject] = useState(false)
  const [message, setMessage] = useState(null)
  const [confirmDeleteLevel, setConfirmDeleteLevel] = useState(null)
  const [deletingLevel, setDeletingLevel] = useState(false)
  const [editingSubjectId, setEditingSubjectId] = useState(null)
  const [confirmDeleteSubject, setConfirmDeleteSubject] = useState(null)
  const [deletingSubject, setDeletingSubject] = useState(false)

  const fetchLevels = useCallback(async (preferredLevelId) => {
    const { data, error } = await supabase
      .from('levels')
      .select(`
        id,
        name,
        description,
        price,
        duration_weeks,
        sort_order,
        subject_count,
        is_active,
        subjects (
          id,
          name,
          description,
          sort_order
        )
      `)
      .order('sort_order', { ascending: true })

    if (error) {
      setMessage({ type: 'error', text: `Không thể tải gói học: ${error.message}` })
      setLoading(false)
      return
    }

    const normalizedLevels = (data || []).map((level) => ({
      ...level,
      subjects: [...(level.subjects || [])].sort(
        (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
      ),
    }))

    setLevels(normalizedLevels)
    setSelectedLevelId((current) => {
      if (preferredLevelId && normalizedLevels.some((level) => level.id === preferredLevelId)) {
        return preferredLevelId
      }

      if (current && normalizedLevels.some((level) => level.id === current)) {
        return current
      }

      return normalizedLevels[0]?.id || null
    })
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchLevels()
  }, [fetchLevels])

  const selectedLevel = levels.find((level) => level.id === selectedLevelId) || null
  const selectedSubjects = selectedLevel?.subjects || []

  useEffect(() => {
    if (!selectedLevel) {
      setLevelForm(emptyLevelForm)
      return
    }

    setLevelForm({
      name: selectedLevel.name || '',
      description: selectedLevel.description || '',
      price: selectedLevel.price || '',
      durationWeeks: selectedLevel.duration_weeks || '',
      isActive: selectedLevel.is_active !== false,
    })
  }, [selectedLevel])

  const totalSubjects = levels.reduce(
    (sum, level) => sum + (level.subjects?.length || 0),
    0
  )
  const activePackages = levels.filter((level) => level.is_active !== false).length

  const formatVND = (amount) =>
    new Intl.NumberFormat('vi-VN').format(amount || 0) + 'đ'

  const showFeedback = (type, text) => {
    setMessage({ type, text })
  }

  const handleNewLevelChange = (key, value) => {
    setNewLevelForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const handleLevelFormChange = (key, value) => {
    setLevelForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const handleSubjectFormChange = (key, value) => {
    setSubjectForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const handleCreateLevel = async (event) => {
    event.preventDefault()
    setCreatingLevel(true)
    setMessage(null)

    const response = await fetch('/api/admin/curriculum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'createLevel',
        name: newLevelForm.name,
        description: newLevelForm.description,
        price: newLevelForm.price,
        durationWeeks: newLevelForm.durationWeeks,
        isActive: newLevelForm.isActive,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      showFeedback('error', result.error || 'Không thể tạo gói học mới')
      setCreatingLevel(false)
      return
    }

    setNewLevelForm(emptyLevelForm)
    setShowCreateLevel(false)
    showFeedback('success', `Đã tạo gói học "${result.level.name}"`)
    await fetchLevels(result.level.id)
    setCreatingLevel(false)
  }

  const handleSaveLevel = async (event) => {
    event.preventDefault()
    if (!selectedLevel) {
      return
    }

    setSavingLevel(true)
    setMessage(null)

    const response = await fetch('/api/admin/curriculum', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateLevel',
        levelId: selectedLevel.id,
        name: levelForm.name,
        description: levelForm.description,
        price: levelForm.price,
        durationWeeks: levelForm.durationWeeks,
        isActive: levelForm.isActive,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      showFeedback('error', result.error || 'Không thể cập nhật gói học')
      setSavingLevel(false)
      return
    }

    showFeedback('success', `Đã cập nhật gói học "${levelForm.name}"`)
    await fetchLevels(selectedLevel.id)
    setSavingLevel(false)
  }

  const handleDeleteLevel = async () => {
    if (!confirmDeleteLevel?.id) {
      return
    }

    setDeletingLevel(true)
    setMessage(null)

    const response = await fetch('/api/admin/curriculum', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'deleteLevel',
        levelId: confirmDeleteLevel.id,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      showFeedback('error', result.error || 'Không thể xóa gói học')
      setDeletingLevel(false)
      return
    }

    showFeedback('success', `Đã xóa gói học "${confirmDeleteLevel.name}"`)
    setConfirmDeleteLevel(null)
    await fetchLevels()
    setDeletingLevel(false)
  }

  const handleDeleteSubject = async () => {
    if (!confirmDeleteSubject?.id) return

    setDeletingSubject(true)
    setMessage(null)

    const response = await fetch('/api/admin/curriculum', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'deleteSubject',
        subjectId: confirmDeleteSubject.id,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      showFeedback('error', result.error || 'Không thể xóa môn học')
      setDeletingSubject(false)
      return
    }

    showFeedback('success', `Đã xóa môn "${confirmDeleteSubject.name}" khỏi hệ thống.`)
    setConfirmDeleteSubject(null)
    await fetchLevels(selectedLevel.id)
    setDeletingSubject(false)
  }

  const handleCreateSubject = async (event) => {
    event.preventDefault()
    if (!selectedLevel) {
      return
    }

    setCreatingSubject(true)
    setMessage(null)

    const response = await fetch('/api/admin/curriculum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'createSubject',
        levelId: selectedLevel.id,
        name: subjectForm.name,
        description: subjectForm.description,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      showFeedback('error', result.error || 'Không thể thêm môn học')
      setCreatingSubject(false)
      return
    }

    setSubjectForm(emptySubjectForm)
    showFeedback('success', `Đã thêm môn "${result.subject.name}" vào ${selectedLevel.name}`)
    await fetchLevels(selectedLevel.id)
    setCreatingSubject(false)
  }

  if (loading) {
    return (
      <>
        <div className={styles.pageHeader}>
          <div>
            <h2 className={styles.pageTitle}>Quản lý gói học</h2>
            <p className={styles.curriculumLead}>Đang tải chương trình học...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Quản lý gói học & môn học</h2>
          <p className={styles.curriculumLead}>
            Chọn một gói học để chỉnh thông tin, thêm môn mới, và quản lý nội dung
            theo từng gói rõ ràng hơn.
          </p>
        </div>

        <button
          className={`${styles.quickActionBtn} ${styles['quickActionBtn--primary']}`}
          onClick={() => setShowCreateLevel((current) => !current)}
        >
          {showCreateLevel ? 'Đóng trình tạo gói' : '+ Tạo gói học mới'}
        </button>
      </div>

      <div className={styles.curriculumStats}>
        <div className={styles.curriculumStatCard}>
          <span className={styles.curriculumStatLabel}>Tổng gói học</span>
          <strong className={styles.curriculumStatValue}>{levels.length}</strong>
        </div>
        <div className={styles.curriculumStatCard}>
          <span className={styles.curriculumStatLabel}>Tổng môn học</span>
          <strong className={styles.curriculumStatValue}>{totalSubjects}</strong>
        </div>
        <div className={styles.curriculumStatCard}>
          <span className={styles.curriculumStatLabel}>Gói đang mở bán</span>
          <strong className={styles.curriculumStatValue}>{activePackages}</strong>
        </div>
      </div>

      {message && (
        <div
          className={`${styles.feedbackBanner} ${
            message.type === 'error'
              ? styles.feedbackBannerError
              : styles.feedbackBannerSuccess
          }`}
        >
          {message.text}
        </div>
      )}

      {showCreateLevel && (
        <section className={styles.curriculumComposer}>
          <div className={styles.curriculumPanelHeader}>
            <div>
              <h3>Tạo gói học mới</h3>
              <p>Tạo một gói học trước, sau đó thêm môn vào đúng gói ở panel bên phải.</p>
            </div>
          </div>

          <form className={styles.curriculumForm} onSubmit={handleCreateLevel}>
            <div className={styles.curriculumFormGrid}>
              <label className={styles.formField}>
                <span className={styles.formLabel}>Tên gói học</span>
                <input
                  className={styles.formInput}
                  value={newLevelForm.name}
                  onChange={(event) => handleNewLevelChange('name', event.target.value)}
                  placeholder="Ví dụ: Problem Solver"
                  required
                />
              </label>

              <label className={styles.formField}>
                <span className={styles.formLabel}>Giá bán (VNĐ)</span>
                <input
                  className={styles.formInput}
                  type="number"
                  min="0"
                  value={newLevelForm.price}
                  onChange={(event) => handleNewLevelChange('price', event.target.value)}
                  placeholder="4000000"
                  required
                />
              </label>

              <label className={styles.formField}>
                <span className={styles.formLabel}>Thời lượng (tuần)</span>
                <input
                  className={styles.formInput}
                  type="number"
                  min="0"
                  value={newLevelForm.durationWeeks}
                  onChange={(event) =>
                    handleNewLevelChange('durationWeeks', event.target.value)
                  }
                  placeholder="8"
                />
              </label>

              <label className={styles.formField}>
                <span className={styles.formLabel}>Trạng thái</span>
                <select
                  className={styles.formInput}
                  value={newLevelForm.isActive ? 'active' : 'inactive'}
                  onChange={(event) =>
                    handleNewLevelChange('isActive', event.target.value === 'active')
                  }
                >
                  <option value="active">Đang mở bán</option>
                  <option value="inactive">Tạm ẩn</option>
                </select>
              </label>
            </div>

            <label className={styles.formField}>
              <span className={styles.formLabel}>Mô tả ngắn</span>
              <textarea
                className={styles.formTextarea}
                rows={4}
                value={newLevelForm.description}
                onChange={(event) =>
                  handleNewLevelChange('description', event.target.value)
                }
                placeholder="Mô tả giá trị của gói học này cho phụ huynh và học sinh."
              />
            </label>

            <div className={styles.curriculumFormActions}>
              <button
                type="button"
                className={`${styles.quickActionBtn} ${styles['quickActionBtn--outline']}`}
                onClick={() => {
                  setShowCreateLevel(false)
                  setNewLevelForm(emptyLevelForm)
                }}
              >
                Hủy
              </button>
              <button
                type="submit"
                className={`${styles.quickActionBtn} ${styles['quickActionBtn--primary']}`}
                disabled={creatingLevel}
              >
                {creatingLevel ? 'Đang tạo...' : 'Tạo gói học'}
              </button>
            </div>
          </form>
        </section>
      )}

      <div className={styles.curriculumLayout}>
        <aside className={styles.curriculumSidebar}>
          <div className={styles.curriculumSidebarHeader}>
            <h3>Danh sách gói học</h3>
            <p>Chọn một gói để làm việc tập trung thay vì mở accordion dài.</p>
          </div>

          <div className={styles.packageList}>
            {levels.map((level) => {
              const isSelected = level.id === selectedLevelId
              const subjectCount = level.subjects?.length || 0

              return (
                <button
                  key={level.id}
                  className={`${styles.packageListItem} ${
                    isSelected ? styles.packageListItemActive : ''
                  }`}
                  onClick={() => setSelectedLevelId(level.id)}
                >
                  <div className={styles.packageListHead}>
                    <span className={styles.packageListName}>{level.name}</span>
                    <span
                      className={`${styles.badge} ${
                        level.is_active !== false
                          ? styles['badge--active']
                          : styles['badge--paused']
                      }`}
                    >
                      {level.is_active !== false ? 'Đang mở' : 'Tạm ẩn'}
                    </span>
                  </div>

                  <p className={styles.packageListDescription}>
                    {level.description || 'Chưa có mô tả cho gói học này.'}
                  </p>

                  <div className={styles.packageListMeta}>
                    <span>{subjectCount} môn</span>
                    <span>{formatVND(level.price)}</span>
                    <span>
                      {level.duration_weeks ? `${level.duration_weeks} tuần` : 'Chưa đặt thời lượng'}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        <section className={styles.curriculumDetail}>
          {selectedLevel ? (
            <>
              <div className={styles.packageHero}>
                <div>
                  <span className={styles.packageHeroEyebrow}>Gói học đang chọn</span>
                  <h3 className={styles.packageHeroTitle}>{selectedLevel.name}</h3>
                  <p className={styles.packageHeroDescription}>
                    {selectedLevel.description || 'Chưa có mô tả. Bạn có thể bổ sung ở form bên dưới.'}
                  </p>
                </div>

                <div className={styles.packageHeroMeta}>
                  <div className={styles.packageMetricCard}>
                    <span className={styles.packageMetricLabel}>Giá bán</span>
                    <strong className={styles.packageMetricValue}>
                      {formatVND(selectedLevel.price)}
                    </strong>
                  </div>
                  <div className={styles.packageMetricCard}>
                    <span className={styles.packageMetricLabel}>Thời lượng</span>
                    <strong className={styles.packageMetricValue}>
                      {selectedLevel.duration_weeks
                        ? `${selectedLevel.duration_weeks} tuần`
                        : 'Chưa đặt'}
                    </strong>
                  </div>
                  <div className={styles.packageMetricCard}>
                    <span className={styles.packageMetricLabel}>Số môn</span>
                    <strong className={styles.packageMetricValue}>
                      {selectedSubjects.length}
                    </strong>
                  </div>
                </div>
              </div>

              <div className={styles.curriculumPanelGrid}>
                <section className={styles.curriculumPanel}>
                  <div className={styles.curriculumPanelHeader}>
                    <div>
                      <h3>Thông tin gói học</h3>
                      <p>Chỉnh tên, giá, thời lượng và trạng thái hiển thị của gói.</p>
                    </div>
                  </div>

                  <form className={styles.curriculumForm} onSubmit={handleSaveLevel}>
                    <div className={styles.curriculumFormGrid}>
                      <label className={styles.formField}>
                        <span className={styles.formLabel}>Tên gói học</span>
                        <input
                          className={styles.formInput}
                          value={levelForm.name}
                          onChange={(event) =>
                            handleLevelFormChange('name', event.target.value)
                          }
                          required
                        />
                      </label>

                      <label className={styles.formField}>
                        <span className={styles.formLabel}>Giá bán (VNĐ)</span>
                        <input
                          className={styles.formInput}
                          type="number"
                          min="0"
                          value={levelForm.price}
                          onChange={(event) =>
                            handleLevelFormChange('price', event.target.value)
                          }
                          required
                        />
                      </label>

                      <label className={styles.formField}>
                        <span className={styles.formLabel}>Thời lượng (tuần)</span>
                        <input
                          className={styles.formInput}
                          type="number"
                          min="0"
                          value={levelForm.durationWeeks}
                          onChange={(event) =>
                            handleLevelFormChange('durationWeeks', event.target.value)
                          }
                        />
                      </label>

                      <label className={styles.formField}>
                        <span className={styles.formLabel}>Trạng thái</span>
                        <select
                          className={styles.formInput}
                          value={levelForm.isActive ? 'active' : 'inactive'}
                          onChange={(event) =>
                            handleLevelFormChange(
                              'isActive',
                              event.target.value === 'active'
                            )
                          }
                        >
                          <option value="active">Đang mở bán</option>
                          <option value="inactive">Tạm ẩn</option>
                        </select>
                      </label>
                    </div>

                    <label className={styles.formField}>
                      <span className={styles.formLabel}>Mô tả gói học</span>
                      <textarea
                        className={styles.formTextarea}
                        rows={5}
                        value={levelForm.description}
                        onChange={(event) =>
                          handleLevelFormChange('description', event.target.value)
                        }
                        placeholder="Mô tả ngắn về nội dung, kết quả đầu ra, và đối tượng phù hợp."
                      />
                    </label>

                    <div className={styles.curriculumFormActions}>
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() =>
                          setConfirmDeleteLevel({
                            id: selectedLevel.id,
                            name: selectedLevel.name,
                          })
                        }
                        disabled={savingLevel || deletingLevel}
                      >
                        Xóa gói học
                      </button>
                      <button
                        type="submit"
                        className={`${styles.quickActionBtn} ${styles['quickActionBtn--primary']}`}
                        disabled={savingLevel}
                      >
                        {savingLevel ? 'Đang lưu...' : 'Lưu thông tin gói học'}
                      </button>
                    </div>
                  </form>
                </section>

                <section className={styles.curriculumPanel}>
                  <div className={styles.curriculumPanelHeader}>
                    <div>
                      <h3>Thêm môn vào gói</h3>
                      <p>Tạo môn mới ngay trong gói đang chọn thay vì chèn ở cuối accordion.</p>
                    </div>
                  </div>

                  <form className={styles.curriculumForm} onSubmit={handleCreateSubject}>
                    <label className={styles.formField}>
                      <span className={styles.formLabel}>Tên môn học</span>
                      <input
                        className={styles.formInput}
                        value={subjectForm.name}
                        onChange={(event) =>
                          handleSubjectFormChange('name', event.target.value)
                        }
                        placeholder="Ví dụ: Web App hoàn chỉnh"
                        required
                      />
                    </label>

                    <label className={styles.formField}>
                      <span className={styles.formLabel}>Mô tả ngắn</span>
                      <textarea
                        className={styles.formTextarea}
                        rows={5}
                        value={subjectForm.description}
                        onChange={(event) =>
                          handleSubjectFormChange('description', event.target.value)
                        }
                        placeholder="Môn học này giúp học sinh đạt được gì?"
                      />
                    </label>

                    <div className={styles.curriculumFormActions}>
                      <button
                        type="submit"
                        className={`${styles.quickActionBtn} ${styles['quickActionBtn--primary']}`}
                        disabled={creatingSubject}
                      >
                        {creatingSubject ? 'Đang thêm...' : 'Thêm môn học'}
                      </button>
                    </div>
                  </form>
                </section>
              </div>

              <section className={styles.curriculumPanel}>
                <div className={styles.subjectManagerHeader}>
                  <div>
                    <h3>Danh sách môn trong gói</h3>
                    <p>
                      Từng môn được sắp theo thứ tự học. Mở trình soạn để chỉnh chi tiết
                      nội dung bài học.
                    </p>
                  </div>

                  <span className={styles.subjectCountBadge}>
                    {selectedSubjects.length} môn
                  </span>
                </div>

                {selectedSubjects.length === 0 ? (
                  <div className={styles.subjectManagerEmpty}>
                    Chưa có môn học nào trong gói này. Hãy thêm môn đầu tiên ở panel bên trên.
                  </div>
                ) : (
                  <div className={styles.subjectManagerList}>
                    {selectedSubjects.map((subject, index) => (
                      <div key={subject.id} className={styles.subjectManagerItem}>
                        <div className={styles.subjectOrderBadge}>
                          {String(index + 1).padStart(2, '0')}
                        </div>

                        <div className={styles.subjectManagerContent}>
                          <div className={styles.subjectManagerTitleRow}>
                            <h4>{subject.name}</h4>
                            <span className={styles.subjectSortMeta}>
                              Thứ tự {subject.sort_order || index + 1}
                            </span>
                          </div>
                          <p>
                            {subject.description || 'Chưa có mô tả. Bạn có thể bổ sung khi mở trình soạn bài.'}
                          </p>
                        </div>

                        <div className={styles.subjectManagerActions}>
                          <button
                            type="button"
                            onClick={() => setEditingSubjectId(subject.id)}
                            className={`${styles.quickActionBtn} ${styles['quickActionBtn--primary']}`}
                          >
                            Chỉnh môn học
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteSubject({ id: subject.id, name: subject.name })}
                            className={`${styles.quickActionBtn} ${styles['quickActionBtn--outline']}`}
                            style={{ marginLeft: '8px', color: 'var(--color-error)', borderColor: 'rgba(225, 112, 85, 0.3)', backgroundColor: 'transparent' }}
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : (
            <div className={styles.subjectManagerEmpty}>
              Chưa có gói học nào. Hãy tạo gói đầu tiên để bắt đầu quản lý chương trình.
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        isOpen={Boolean(confirmDeleteLevel)}
        title="Xóa gói học"
        message={
          confirmDeleteLevel
            ? `Bạn có chắc muốn xóa gói học "${confirmDeleteLevel.name}"? Thao tác này chỉ nên dùng khi gói chưa gắn với học sinh hoặc giao dịch.`
            : ''
        }
        confirmText="Xóa gói"
        variant="danger"
        onConfirm={handleDeleteLevel}
        onCancel={() => {
          if (!deletingLevel) {
            setConfirmDeleteLevel(null)
          }
        }}
        loading={deletingLevel}
      />

      <ConfirmDialog
        isOpen={Boolean(confirmDeleteSubject)}
        title="Xóa môn học"
        message={
          confirmDeleteSubject
            ? `Bạn có chắc muốn xóa môn học "${confirmDeleteSubject.name}"? Thao tác này sẽ loại bỏ nội dung vĩnh viễn khỏi gói.`
            : ''
        }
        confirmText="Xóa nhanh"
        variant="danger"
        onConfirm={handleDeleteSubject}
        onCancel={() => {
          if (!deletingSubject) {
            setConfirmDeleteSubject(null)
          }
        }}
        loading={deletingSubject}
      />

      {editingSubjectId && (
        <EditSubjectModal 
          subjectId={editingSubjectId} 
          onClose={() => setEditingSubjectId(null)} 
          onSaveSuccess={() => fetchLevels(selectedLevel.id)}
        />
      )}
    </>
  )
}
