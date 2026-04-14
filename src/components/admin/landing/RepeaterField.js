'use client'

import styles from '@/app/admin/admin.module.css'

function defaultItemTitle(index) {
  return `Item ${index + 1}`
}

export default function RepeaterField({
  title,
  note,
  items,
  minItems = 1,
  maxItems,
  addLabel = 'Them item',
  getItemTitle = (_, index) => defaultItemTitle(index),
  getItemKey,
  onAdd,
  onRemove,
  onMove,
  renderItem,
}) {
  const canAdd = typeof maxItems !== 'number' || items.length < maxItems

  return (
    <div className={styles.landingRepeaterShell}>
      <div className={styles.landingRepeaterHead}>
        <div className={styles.landingRepeaterMeta}>
          <div className={styles.contentEditorHeader}>{title}</div>
          {note && <p className={styles.contentEditorHint}>{note}</p>}
        </div>
        <span className={styles.landingRepeaterCount}>
          {items.length}
          {typeof maxItems === 'number' ? ` / ${maxItems}` : ''} item
        </span>
      </div>

      <div className={styles.contentEditorStack}>
        {items.map((item, index) => (
          <div
            key={
              getItemKey?.(item, index) ||
              `${getItemTitle(item, index)}-${index}`
            }
            className={styles.contentEditorCard}
          >
            <div className={styles.landingRepeaterItemHead}>
              <div className={styles.landingRepeaterItemMeta}>
                <div className={styles.contentEditorHeader}>{getItemTitle(item, index)}</div>
                <span className={styles.contentEditorHint}>Vi tri {index + 1}</span>
              </div>

              <div className={styles.landingRepeaterItemActions}>
                <button
                  type="button"
                  className={styles.landingRepeaterActionButton}
                  onClick={() => onMove(index, -1)}
                  disabled={index === 0}
                  aria-label={`Dua ${getItemTitle(item, index)} len`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className={styles.landingRepeaterActionButton}
                  onClick={() => onMove(index, 1)}
                  disabled={index === items.length - 1}
                  aria-label={`Dua ${getItemTitle(item, index)} xuong`}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className={styles.landingRepeaterActionButton}
                  onClick={() => onRemove(index)}
                  disabled={items.length <= minItems}
                  aria-label={`Xoa ${getItemTitle(item, index)}`}
                >
                  Xoa
                </button>
              </div>
            </div>

            {renderItem({ item, index })}
          </div>
        ))}
      </div>

      <div className={styles.landingRepeaterFooter}>
        <span className={styles.contentEditorHint}>
          Toi thieu {minItems} item
          {typeof maxItems === 'number' ? `, toi da ${maxItems} item.` : '.'}
        </span>
        <button
          type="button"
          className={`${styles.quickActionBtn} ${styles['quickActionBtn--outline']}`}
          onClick={onAdd}
          disabled={!canAdd}
        >
          {addLabel}
        </button>
      </div>
    </div>
  )
}
