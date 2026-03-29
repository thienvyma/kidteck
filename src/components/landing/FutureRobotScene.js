import styles from '@/app/page.module.css'

export default function FutureRobotScene() {
  return (
    <div className={styles.futureScene}>
      <div className={styles.futureSceneAura} />
      <div className={styles.futureSceneStars} />
      <div className={styles.futureSceneFloor} />

      <div className={`${styles.futureScenePanel} ${styles.futureScenePanelLeft}`}>
        <span className={styles.futureScenePanelTag}>Adaptive Tutor</span>
        <strong>Robot mentor theo dõi nhịp học</strong>
        <p>Tập trung, phản hồi, lộ trình hóa từng bước thay vì học rời rạc.</p>
      </div>

      <div className={`${styles.futureScenePanel} ${styles.futureScenePanelRight}`}>
        <span className={styles.futureScenePanelTag}>Problem Lab</span>
        <strong>Biến câu hỏi thành workflow</strong>
        <p>Từ tò mò ban đầu tới task, thử nghiệm, chỉnh sửa và demo.</p>
      </div>

      <div className={`${styles.futureSceneChip} ${styles.futureSceneChipTop}`}>
        Neural feedback loop
      </div>
      <div className={`${styles.futureSceneChip} ${styles.futureSceneChipBottom}`}>
        Search • Solve • Adapt
      </div>

      <div className={styles.futureScenePedestal}>
        <div className={styles.futureScenePedestalGlow} />
      </div>

      <div className={styles.futureSceneRobotShell}>
        <svg
          className={styles.futureSceneRobotSvg}
          viewBox="0 0 560 620"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Future learning robot"
          role="img"
        >
          <defs>
            <linearGradient id="robotShell" x1="180" y1="80" x2="400" y2="520">
              <stop offset="0" stopColor="#EDF7FF" />
              <stop offset="0.45" stopColor="#B6D7FF" />
              <stop offset="1" stopColor="#6F8BFF" />
            </linearGradient>
            <linearGradient id="robotCore" x1="250" y1="240" x2="320" y2="360">
              <stop offset="0" stopColor="#92FFFF" />
              <stop offset="0.52" stopColor="#67C6FF" />
              <stop offset="1" stopColor="#7367FF" />
            </linearGradient>
            <linearGradient id="robotVisor" x1="190" y1="130" x2="375" y2="240">
              <stop offset="0" stopColor="#0D1335" />
              <stop offset="1" stopColor="#273E8C" />
            </linearGradient>
            <radialGradient id="robotGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(278 270) rotate(90) scale(210)">
              <stop offset="0" stopColor="#5BE7FF" stopOpacity="0.7" />
              <stop offset="1" stopColor="#5BE7FF" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="robotHalo" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(279 208) rotate(90) scale(132)">
              <stop offset="0" stopColor="#C6FFFF" stopOpacity="0.55" />
              <stop offset="1" stopColor="#C6FFFF" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g className={styles.futureSceneRobotOrbit}>
            <ellipse cx="280" cy="262" rx="214" ry="94" stroke="rgba(137, 214, 255, 0.42)" strokeWidth="2" />
            <ellipse cx="280" cy="262" rx="184" ry="132" stroke="rgba(111, 139, 255, 0.32)" strokeWidth="1.5" />
            <circle cx="98" cy="248" r="8" fill="#7CF5FF" />
            <circle cx="458" cy="238" r="8" fill="#99B2FF" />
            <circle cx="230" cy="122" r="7" fill="#8BF9FF" />
            <circle cx="356" cy="392" r="7" fill="#85A9FF" />
          </g>

          <ellipse
            className={styles.futureSceneRobotHalo}
            cx="280"
            cy="240"
            rx="146"
            ry="124"
            fill="url(#robotHalo)"
          />

          <ellipse cx="280" cy="524" rx="152" ry="34" fill="rgba(69, 91, 189, 0.32)" />

          <g className={styles.futureSceneRobotFloat}>
            <ellipse cx="280" cy="272" rx="170" ry="196" fill="url(#robotGlow)" />

            <path
              d="M160 340C160 294.19 197.19 257 243 257H317C362.81 257 400 294.19 400 340V377C400 432.78 354.78 478 299 478H261C205.22 478 160 432.78 160 377V340Z"
              fill="url(#robotShell)"
              stroke="rgba(233,245,255,0.72)"
              strokeWidth="3"
            />

            <path
              d="M176 362C176 327.76 203.76 300 238 300H322C356.24 300 384 327.76 384 362V373C384 420.5 345.5 459 298 459H262C214.5 459 176 420.5 176 373V362Z"
              fill="rgba(15, 32, 94, 0.26)"
            />

            <path
              d="M121 334C122.33 310.2 141.14 291 165 291H181V338H150C134.14 338 121.09 349.82 119.14 365.56L115 399H84L90.62 360.72C93.65 343.23 106.74 330.81 121 334Z"
              fill="rgba(168, 224, 255, 0.88)"
              stroke="rgba(238,247,255,0.68)"
              strokeWidth="2"
            />

            <path
              d="M439 334C437.67 310.2 418.86 291 395 291H379V338H410C425.86 338 438.91 349.82 440.86 365.56L445 399H476L469.38 360.72C466.35 343.23 453.26 330.81 439 334Z"
              fill="rgba(168, 224, 255, 0.88)"
              stroke="rgba(238,247,255,0.68)"
              strokeWidth="2"
            />

            <g className={styles.futureSceneRobotHead}>
              <path
                d="M181 122C181 82.79 212.79 51 252 51H308C347.21 51 379 82.79 379 122V220C379 259.21 347.21 291 308 291H252C212.79 291 181 259.21 181 220V122Z"
                fill="url(#robotShell)"
                stroke="rgba(238,247,255,0.72)"
                strokeWidth="3"
              />

              <path
                d="M200 136C200 110.04 221.04 89 247 89H313C338.96 89 360 110.04 360 136V199C360 224.96 338.96 246 313 246H247C221.04 246 200 224.96 200 199V136Z"
                fill="url(#robotVisor)"
              />

              <rect x="213" y="151" width="134" height="44" rx="22" fill="rgba(112, 231, 255, 0.12)" />
              <ellipse cx="246" cy="174" rx="24" ry="16" fill="#7CFBFF" />
              <ellipse cx="314" cy="174" rx="24" ry="16" fill="#AAB8FF" />
              <rect className={styles.futureSceneRobotScan} x="220" y="170" width="120" height="8" rx="4" fill="#E9FFFF" />

              <path
                d="M255 59V28C255 15.85 264.85 6 277 6H283C295.15 6 305 15.85 305 28V59"
                stroke="rgba(198,255,255,0.88)"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <circle cx="280" cy="18" r="15" fill="#82F9FF" />
              <circle cx="280" cy="18" r="8" fill="#F6FFFF" />
            </g>

            <g className={styles.futureSceneRobotCore}>
              <circle cx="280" cy="344" r="46" fill="url(#robotCore)" />
              <circle cx="280" cy="344" r="26" fill="rgba(246,255,255,0.74)" />
              <circle cx="280" cy="344" r="12" fill="#0F2F8A" />
            </g>

            <path
              d="M232 410C246.67 421.33 262.67 427 280 427C297.33 427 313.33 421.33 328 410"
              stroke="rgba(233,245,255,0.9)"
              strokeWidth="8"
              strokeLinecap="round"
            />

            <path
              d="M227 318L252 332"
              stroke="rgba(233,245,255,0.84)"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M333 318L308 332"
              stroke="rgba(233,245,255,0.84)"
              strokeWidth="7"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>

      <div className={`${styles.futureSceneMiniPanel} ${styles.futureSceneMiniPanelLeft}`}>
        <span>Memory scaffold</span>
        <strong>Ôn lại có hệ thống</strong>
      </div>

      <div className={`${styles.futureSceneMiniPanel} ${styles.futureSceneMiniPanelRight}`}>
        <span>AI horizon</span>
        <strong>Hiểu công nghệ để ứng đối</strong>
      </div>
    </div>
  )
}
