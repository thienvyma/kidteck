import styles from './blog.module.css'

export default function ResponsiveBlogCover({
  desktopSrc,
  mobileSrc,
  alt,
  className,
  cover = false,
  eager = false,
}) {
  const fallbackSrc = desktopSrc || mobileSrc
  if (!fallbackSrc) return null

  const imageClassName = [className, cover ? styles.coverImageCropped : '']
    .filter(Boolean)
    .join(' ')

  return (
    <picture className={styles.coverPicture}>
      {mobileSrc && mobileSrc !== fallbackSrc && (
        <source media="(max-width: 768px)" srcSet={mobileSrc} />
      )}
      <img
        src={fallbackSrc}
        alt={alt}
        className={imageClassName}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : undefined}
        decoding={eager ? undefined : 'async'}
        referrerPolicy="no-referrer"
      />
    </picture>
  )
}
