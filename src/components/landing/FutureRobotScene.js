import Image from 'next/image'

import styles from '@/app/page.module.css'

const HERO_BUBBLES = [
  {
    className: styles.futureSceneTreeBubbleTop,
    title: 'Mindset first',
    detail: 'Ask before you prompt',
  },
  {
    className: styles.futureSceneTreeBubbleLeft,
    title: 'Problem framing',
    detail: 'Understand the problem before using AI',
  },
  {
    className: styles.futureSceneTreeBubbleRight,
    title: 'System thinking',
    detail: 'Turn prompts into repeatable systems',
  },
]

const HERO_LEAVES = ['Mindset', 'Systems', 'Execution']

export default function FutureRobotScene() {
  return (
    <div className={styles.futureScene}>
      <div className={styles.futureSceneMinimalCanvas}>
        <div className={styles.futureSceneMinimalGlow} />

        <svg
          className={styles.futureSceneTreeLines}
          viewBox="0 0 640 420"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="future-scene-tree-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#73f7ff" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#8a7fff" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#6c5ce7" stopOpacity="0.55" />
            </linearGradient>
          </defs>

          <path className={styles.futureSceneTreePath} d="M320 214 C320 178 320 150 320 126" />
          <path className={styles.futureSceneTreePath} d="M296 220 C250 218 214 206 178 184" />
          <path className={styles.futureSceneTreePath} d="M344 220 C390 218 430 204 472 178" />
          <path className={styles.futureSceneTreePath} d="M320 244 C320 270 320 292 320 310" />
          <path className={styles.futureSceneTreePath} d="M320 310 C290 312 258 318 226 332" />
          <path className={styles.futureSceneTreePath} d="M320 310 C320 316 320 322 320 332" />
          <path className={styles.futureSceneTreePath} d="M320 310 C350 312 382 318 414 332" />

          <circle className={styles.futureSceneTreeNode} cx="320" cy="126" r="6" />
          <circle className={styles.futureSceneTreeNode} cx="178" cy="184" r="6" />
          <circle className={styles.futureSceneTreeNode} cx="472" cy="178" r="6" />
          <circle className={styles.futureSceneTreeNode} cx="320" cy="310" r="6" />
          <circle className={styles.futureSceneTreeLeafNode} cx="226" cy="332" r="5" />
          <circle className={styles.futureSceneTreeLeafNode} cx="320" cy="332" r="5" />
          <circle className={styles.futureSceneTreeLeafNode} cx="414" cy="332" r="5" />
        </svg>

        {HERO_BUBBLES.map((bubble) => (
          <div key={bubble.title} className={`${styles.futureSceneTreeBubble} ${bubble.className}`}>
            <strong>{bubble.title}</strong>
            <span>{bubble.detail}</span>
          </div>
        ))}

        <div className={styles.futureSceneTreeRoot}>
          <div className={styles.futureSceneTreeRootAura} />
          <div className={styles.futureSceneTreeRootCard}>
            <Image
              src="/AIGen_blacklogo.png"
              alt="AIgenlabs logo"
              className={styles.futureSceneMinimalLogo}
              width={865}
              height={288}
              sizes="(max-width: 480px) 11rem, (max-width: 968px) 13rem, 15rem"
              quality={100}
              priority
            />
          </div>
        </div>

        <div className={styles.futureSceneTreeLeafRow}>
          {HERO_LEAVES.map((item) => (
            <span key={item} className={styles.futureSceneTreeLeaf}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
