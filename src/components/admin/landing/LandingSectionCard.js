import styles from '@/app/admin/admin.module.css'

export default function LandingSectionCard({
  sectionId,
  title,
  lead,
  badge,
  active,
  collapsed,
  dirty,
  onToggle,
  children,
}) {
  return (
    <section
      id={`landing-section-${sectionId}`}
      className={`${styles.sectionCard} ${styles.landingEditorSection} ${
        active ? styles.landingEditorSectionActive : ''
      } ${collapsed ? styles.landingEditorSectionCollapsed : ''}`}
    >
      <div className={styles.landingEditorSectionHead}>
        <div>
          <div className={styles.sectionCardHeader}>{title}</div>
          {lead && <p className={styles.landingEditorSectionLead}>{lead}</p>}
        </div>
        <div className={styles.landingEditorSectionActions}>
          {dirty && <span className={styles.landingEditorSectionDirty}>Đã sửa</span>}
          <span className={styles.landingEditorSectionBadge}>{badge}</span>
          <button
            type="button"
            className={styles.landingEditorSectionToggle}
            onClick={onToggle}
            aria-expanded={!collapsed}
            aria-controls={`landing-section-body-${sectionId}`}
          >
            <span>{collapsed ? 'Mở khối' : 'Thu gọn'}</span>
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
