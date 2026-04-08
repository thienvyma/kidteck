import styles from './BrandLogo.module.css'

function joinClasses(...values) {
  return values.filter(Boolean).join(' ')
}

export default function BrandLogo({
  className = '',
  size = 'md',
  theme = 'light',
  compact = false,
  subtitle = 'AI Project Studio',
}) {
  return (
    <span
      className={joinClasses(
        styles.brandLogo,
        styles[`brandLogo--${size}`],
        styles[`brandLogo--${theme}`],
        compact ? styles['brandLogo--compact'] : '',
        className
      )}
      aria-label="AIgenlabs"
    >
      <img 
        src={theme === 'dark' ? "/AIGen_whitelogo.png" : "/AIGen_blacklogo.png"} 
        alt="AIgenlabs Logo" 
        className={styles.brandLogo__img} 
      />
      
      {(!compact && subtitle) && (
        <span className={styles.brandLogo__text}>
          <span className={styles.brandLogo__subtitle}>{subtitle}</span>
        </span>
      )}
    </span>
  )
}
