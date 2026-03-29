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
      aria-label="KidTech"
    >
      <span className={styles.brandLogo__mark} aria-hidden="true">
        <svg
          className={styles.brandLogo__svg}
          viewBox="0 0 96 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse
            cx="48"
            cy="50"
            rx="35"
            ry="15"
            stroke="rgba(123,240,255,0.55)"
            strokeWidth="3"
          />
          <path
            d="M36 40C36 31.716 42.716 25 51 25C59.284 25 66 31.716 66 40V52C66 63.046 57.046 72 46 72H41C31.059 72 23 63.941 23 54V47.5C23 40.044 29.044 34 36.5 34H38"
            fill="rgba(240,248,255,0.96)"
          />
          <path
            d="M36 40C36 31.716 42.716 25 51 25C59.284 25 66 31.716 66 40V52C66 63.046 57.046 72 46 72H41C31.059 72 23 63.941 23 54V47.5C23 40.044 29.044 34 36.5 34H38"
            stroke="rgba(255,255,255,0.78)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M55.5 20.5L60 12"
            stroke="rgba(123,240,255,0.9)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="62.5" cy="10.5" r="4.5" fill="rgba(123,240,255,0.95)" />
          <rect
            x="33"
            y="39"
            width="29"
            height="14"
            rx="7"
            fill="rgba(18,34,82,0.96)"
          />
          <circle cx="41" cy="46" r="3.4" fill="#7BF0FF" />
          <circle cx="54" cy="46" r="3.4" fill="#7BF0FF" />
          <path
            d="M37 59C40.5 62.2 45 64 49.5 64C54 64 57.2 62.8 60 60.5"
            stroke="rgba(18,34,82,0.92)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M19 58L11 66"
            stroke="rgba(123,240,255,0.78)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M74 33L82 25"
            stroke="rgba(123,240,255,0.64)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </span>

      <span className={styles.brandLogo__text}>
        <span className={styles.brandLogo__wordmark}>
          <span className={styles.brandLogo__word}>Kid</span>
          <span className={styles.brandLogo__accent}>Tech</span>
        </span>
        <span className={styles.brandLogo__subtitle}>{subtitle}</span>
      </span>
    </span>
  )
}
