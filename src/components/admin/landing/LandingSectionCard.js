import styles from '@/app/admin/admin.module.css'

export default function LandingSectionCard({
  sectionId,
  title,
  lead,
  badge,
  active,
  collapsed,
  visible = true,
  dirty,
  onToggle,
  onVisibilityToggle,
  children,
}) {
  return (
    <section
      id={`landing-section-${sectionId}`}
      className={`${styles.sectionCard} ${styles.landingEditorSection} ${
        active ? styles.landingEditorSectionActive : ''
      } ${collapsed ? styles.landingEditorSectionCollapsed : ''} ${
        visible ? '' : styles.landingEditorSectionHidden
      }`}
    >
      <div className={styles.landingEditorSectionHead}>
        <div>
          <div className={styles.sectionCardHeader}>{title}</div>
          {lead && <p className={styles.landingEditorSectionLead}>{lead}</p>}
        </div>
        <div className={styles.landingEditorSectionActions}>
          {dirty && <span className={styles.landingEditorSectionDirty}>Đã sửa</span>}
          <span
            className={`${styles.landingEditorSectionVisibility} ${
              visible
                ? styles.landingEditorSectionVisibilityVisible
                : styles.landingEditorSectionVisibilityHidden
            }`}
          >
            {visible ? 'Đang hiện' : 'Đang ẩn'}
          </span>
          <span className={styles.landingEditorSectionBadge}>{badge}</span>
          {onVisibilityToggle && (
            <button
              type="button"
              className={`${styles.landingEditorSectionVisibilityToggle} ${
                visible
                  ? styles.landingEditorSectionVisibilityToggleWarning
                  : styles.landingEditorSectionVisibilityToggleSuccess
              }`}
              onClick={onVisibilityToggle}
            >
              {visible ? 'Ẩn khỏi landing' : 'Hiện lại landing'}
            </button>
          )}
          <button
            type="button"
            className={styles.landingEditorSectionToggle}
            onClick={onToggle}
            aria-expanded={!collapsed}
            aria-controls={`landing-section-body-${sectionId}`}
          >
            <span>{collapsed ? 'Mở form' : 'Thu gọn form'}</span>
            <span
              className={`${styles.landingEditorSectionToggleChevron} ${
                collapsed ? styles.landingEditorSectionToggleChevronCollapsed : ''
              }`}
              aria-hidden="true"
            >
              ▾
            </span>
          </button>
        </div>
      </div>

      {!collapsed && (
        <div id={`landing-section-body-${sectionId}`} className={styles.accountSection}>
          {children}
        </div>
      )}
    </section>
  )
}
