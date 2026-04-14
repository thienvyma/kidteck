import styles from '@/app/admin/admin.module.css'

export default function FieldRenderer({ field, value, onChange }) {
  const inputId = `landing-field-${field.key}`

  return (
    <label className={styles.contentEditorCard} htmlFor={inputId}>
      <span className={styles.formLabel}>{field.label}</span>
      {field.type === 'textarea' || field.type === 'textarea-list' ? (
        <textarea
          id={inputId}
          className={styles.formTextarea}
          rows={field.rows || 4}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          id={inputId}
          className={styles.formInput}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {field.helpText && (
        <span className={styles.contentEditorHint}>{field.helpText}</span>
      )}
    </label>
  )
}
