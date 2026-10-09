import styles from "./Hero.module.css";

// Original editorial illustrations for article cards. Every color is a master
// token (or a color-mix of two tokens), so palette changes restyle them.

type Token =
  | "primary"
  | "accent"
  | "accent-secondary"
  | "surface-elevated"
  | "text-primary"
  | "text-muted"
  | "success";

const c = (name: Token, opacity = 1) =>
  opacity === 1
    ? `var(--color-${name})`
    : `color-mix(in srgb, var(--color-${name}) ${opacity * 100}%, transparent)`;

/** Blend of two tokens, e.g. accent + accent-secondary gives the pink. */
const mix = (a: Token, b: Token, aPercent: number) =>
  `color-mix(in srgb, var(--color-${a}) ${aPercent}%, var(--color-${b}))`;

const white = (opacity = 1) => c("surface-elevated", opacity);
const pink = mix("accent", "accent-secondary", 55);

type VisualProps = { id: string; className?: string };

function Glow({ id, cx, cy, r, color }: { id: string; cx: number; cy: number; r: number; color: string }) {
  return (
    <>
      <radialGradient id={id} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" style={{ stopColor: color }} />
        <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
      </radialGradient>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
    </>
  );
}

function Sparkle({ x, y, size, color }: { x: number; y: number; size: number; color: string }) {
  const s = size;
  const k = s * 0.18;
  return (
    <path
      d={`M${x} ${y - s} C${x + k} ${y - k} ${x + k} ${y - k} ${x + s} ${y} C${x + k} ${y + k} ${x + k} ${y + k} ${x} ${y + s} C${x - k} ${y + k} ${x - k} ${y + k} ${x - s} ${y} C${x - k} ${y - k} ${x - k} ${y - k} ${x} ${y - s}Z`}
      style={{ fill: color }}
    />
  );
}

/* ------------------------------------------------------------------------ */
/* Lead story: a person prompting an AI core that runs business workflows.  */
/* ------------------------------------------------------------------------ */

function AiOperations({ id, className }: VisualProps) {
  const core = { x: 720, y: 172 };
  return (
    <svg viewBox="0 0 960 600" preserveAspectRatio="xMaxYMid slice" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="0.9">
          <stop offset="0%" style={{ stopColor: mix("primary", "surface-elevated", 85) }} />
          <stop offset="42%" style={{ stopColor: c("accent-secondary") }} />
          <stop offset="72%" style={{ stopColor: pink }} />
          <stop offset="100%" style={{ stopColor: mix("accent", "surface-elevated", 85) }} />
        </linearGradient>
        <radialGradient id={`${id}-core`} cx="0.36" cy="0.32" r="0.75">
          <stop offset="0%" style={{ stopColor: white() }} />
          <stop offset="40%" style={{ stopColor: white(0.85) }} />
          <stop offset="75%" style={{ stopColor: mix("accent-secondary", "surface-elevated", 70) }} />
          <stop offset="100%" style={{ stopColor: c("primary") }} />
        </radialGradient>
        <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>

      <rect width="960" height="600" fill={`url(#${id}-bg)`} />
      <Glow id={`${id}-g1`} cx={720} cy={170} r={330} color={white(0.55)} />
      <Glow id={`${id}-g2`} cx={930} cy={560} r={260} color={c("accent", 0.55)} />
      <Glow id={`${id}-g3`} cx={80} cy={60} r={280} color={mix("primary", "surface-elevated", 70)} />

      {/* Perspective floor */}
      <g style={{ stroke: white(0.18) }} strokeWidth={1}>
        {Array.from({ length: 17 }, (_, i) => -160 + i * 80).map((x) => (
          <line key={x} x1={700 + (x - 700) * 0.18} y1={400} x2={x} y2={600} />
        ))}
        {[412, 432, 462, 504, 560].map((y) => (
          <line key={y} x1={300} y1={y} x2={960} y2={y} />
        ))}
      </g>

      {/* Orbits + network */}
      <g fill="none" transform={`rotate(-14 ${core.x} ${core.y})`} style={{ stroke: white(0.45) }}>
        <ellipse cx={core.x} cy={core.y} rx={150} ry={54} strokeWidth={1.5} />
        <ellipse cx={core.x} cy={core.y} rx={205} ry={76} strokeWidth={1} />
        <ellipse cx={core.x} cy={core.y} rx={255} ry={96} strokeWidth={1} strokeDasharray="3 8" />
      </g>
      <g style={{ stroke: white(0.4) }} strokeWidth={1}>
        <line x1={548} y1={200} x2={620} y2={120} />
        <line x1={620} y1={120} x2={890} y2={112} />
        <line x1={890} y1={112} x2={912} y2={236} />
      </g>
      {[
        { x: 548, y: 200, r: 7, accent: true },
        { x: 620, y: 120, r: 5, accent: false },
        { x: 890, y: 112, r: 8, accent: true },
        { x: 912, y: 236, r: 5, accent: false },
      ].map((n) => (
        <g key={`${n.x}-${n.y}`}>
          {n.accent && <circle cx={n.x} cy={n.y} r={n.r * 2.8} style={{ fill: c("accent", 0.35) }} />}
          <circle
            cx={n.x}
            cy={n.y}
            r={n.r}
            strokeWidth={2}
            style={{ fill: n.accent ? c("accent") : white(), stroke: white() }}
          />
        </g>
      ))}

      {/* AI core */}
      <circle cx={core.x} cy={core.y} r={100} className={styles.pulse} style={{ fill: white(0.55) }} filter={`url(#${id}-blur)`} />
      <circle cx={core.x} cy={core.y} r={66} fill={`url(#${id}-core)`} />
      <Sparkle x={core.x} y={core.y} size={26} color={c("primary")} />
      <Sparkle x={core.x + 30} y={core.y - 28} size={9} color={c("accent")} />

      {/* Workflow panel */}
      <g className={styles.float}>
        <rect x={360} y={62} width={200} height={150} rx={18} strokeWidth={1} style={{ fill: white(0.2), stroke: white(0.55) }} />
        <text x={380} y={90} fontSize={11} fontWeight={600} letterSpacing={1.3} style={{ fill: white(0.9) }}>
          AUTOMATION FLOW
        </text>
        <line x1={390} y1={114} x2={390} y2={182} strokeDasharray="2 4" style={{ stroke: white(0.6) }} />
        {["New lead captured", "AI agent qualifies", "CRM + team notified"].map((label, i) => {
          const y = 114 + i * 34;
          const done = i < 2;
          return (
            <g key={label}>
              <circle cx={390} cy={y} r={9} style={{ fill: done ? white() : c("accent"), stroke: white() }} />
              {done && (
                <path d={`M386 ${y} l3 3 l5 -6`} fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ stroke: c("primary") }} />
              )}
              <text x={410} y={y + 4} fontSize={12.5} fontWeight={500} style={{ fill: white() }}>
                {label}
              </text>
            </g>
          );
        })}
      </g>

      {/* Efficiency chip */}
      <g className={styles.floatDelayed}>
        <rect x={800} y={40} width={140} height={70} rx={16} style={{ fill: white(0.95) }} />
        <text x={816} y={64} fontSize={11} fontWeight={600} style={{ fill: c("text-muted") }}>
          Ops efficiency
        </text>
        <polyline
          points="816,94 834,88 850,91 868,79 886,82 904,68 922,62"
          fill="none"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ stroke: c("primary") }}
        />
        <circle cx={922} cy={62} r={4} style={{ fill: c("accent") }} />
      </g>

      {/* Human prompt: the person-to-AI interaction */}
      <g className={styles.floatDelayed}>
        <rect x={580} y={206} width={290} height={62} rx={18} style={{ fill: white(0.95) }} />
        <circle cx={612} cy={237} r={17} style={{ fill: mix("accent", "surface-elevated", 30) }} />
        <circle cx={612} cy={231} r={6} style={{ fill: c("accent") }} />
        <path d="M601 246 a11 9 0 0 1 22 0" style={{ fill: c("accent") }} />
        <text x={640} y={233} fontSize={12.5} fontWeight={600} style={{ fill: c("text-primary") }}>
          Automate our invoice approvals
        </text>
        <text x={640} y={252} fontSize={11} style={{ fill: c("accent-secondary") }}>
          ✦ Drafting a 3-step workflow…
        </text>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------------ */
/* AI agents: a team of agents connected to a business hub.                 */
/* ------------------------------------------------------------------------ */

function AiAgents({ id, className }: VisualProps) {
  const hub = { x: 250, y: 104 };
  const agents = [
    { x: 84, y: 54, tone: c("primary") },
    { x: 104, y: 164, tone: c("accent") },
    { x: 416, y: 50, tone: c("accent-secondary") },
    { x: 400, y: 160, tone: c("primary") },
  ];
  return (
    <svg viewBox="0 0 500 360" preserveAspectRatio="xMidYMin slice" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" style={{ stopColor: mix("accent-secondary", "surface-elevated", 80) }} />
          <stop offset="50%" style={{ stopColor: pink }} />
          <stop offset="100%" style={{ stopColor: c("accent") }} />
        </linearGradient>
      </defs>
      <rect width="500" height="360" fill={`url(#${id}-bg)`} />
      <Glow id={`${id}-g1`} cx={250} cy={110} r={210} color={white(0.5)} />
      <Glow id={`${id}-g2`} cx={20} cy={20} r={160} color={mix("primary", "surface-elevated", 55)} />

      <g strokeDasharray="3 5" strokeWidth={1.5} style={{ stroke: white(0.75) }}>
        {agents.map((a) => (
          <line key={`${a.x}-${a.y}`} x1={hub.x} y1={hub.y} x2={a.x} y2={a.y} />
        ))}
      </g>

      {agents.map((a, i) => (
        <g key={`${a.x}-${a.y}`} className={i % 2 ? styles.float : styles.floatDelayed}>
          <circle cx={a.x} cy={a.y} r={30} style={{ fill: white(0.25), stroke: white(0.7) }} strokeWidth={1.5} />
          <rect x={a.x - 15} y={a.y - 12} width={30} height={24} rx={9} style={{ fill: white() }} />
          <circle cx={a.x - 6} cy={a.y} r={3} style={{ fill: a.tone }} />
          <circle cx={a.x + 6} cy={a.y} r={3} style={{ fill: a.tone }} />
          <line x1={a.x} y1={a.y - 12} x2={a.x} y2={a.y - 19} strokeWidth={2} style={{ stroke: white() }} />
          <circle cx={a.x} cy={a.y - 21} r={3} style={{ fill: a.tone, stroke: white() }} />
        </g>
      ))}

      {/* Hub */}
      <rect x={hub.x - 58} y={hub.y - 44} width={116} height={88} rx={20} style={{ fill: white() }} />
      <rect x={hub.x - 18} y={hub.y - 26} width={36} height={28} rx={6} style={{ fill: c("primary") }} />
      <rect x={hub.x - 8} y={hub.y - 32} width={16} height={8} rx={3} fill="none" strokeWidth={2.5} style={{ stroke: c("primary") }} />
      <rect x={hub.x - 18} y={hub.y - 14} width={36} height={3} style={{ fill: white(0.6) }} />
      <text x={hub.x} y={hub.y + 26} textAnchor="middle" fontSize={11.5} fontWeight={600} style={{ fill: c("text-primary") }}>
        Operations
      </text>

      {/* Task chips */}
      <g className={styles.float}>
        <rect x={172} y={166} width={156} height={32} rx={16} style={{ fill: white(0.95) }} />
        <circle cx={190} cy={182} r={8} style={{ fill: c("success") }} />
        <path d="M186.5 182 l2.5 2.5 l4 -5" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ stroke: white() }} />
        <text x={204} y={186} fontSize={11.5} fontWeight={500} style={{ fill: c("text-primary") }}>
          Invoice processed
        </text>
      </g>
      <g className={styles.floatDelayed}>
        <rect x={322} y={92} width={116} height={30} rx={15} style={{ fill: white(0.95) }} />
        <text x={336} y={111} fontSize={11.5} fontWeight={500} style={{ fill: c("text-primary") }}>
          Lead score
        </text>
        <text x={400} y={111} fontSize={11.5} fontWeight={700} style={{ fill: c("accent") }}>
          92
        </text>
      </g>
      <Sparkle x={470} y={112} size={10} color={white()} />
      <Sparkle x={190} y={26} size={7} color={white()} />
    </svg>
  );
}

/* ------------------------------------------------------------------------ */
/* Development: laptop with an editor, CI status and a merged branch.       */
/* ------------------------------------------------------------------------ */

function DevWorkspace({ id, className }: VisualProps) {
  const code: Array<Array<[number, string]>> = [
    [[40, mix("accent-secondary", "surface-elevated", 60)], [70, mix("primary", "surface-elevated", 55)]],
    [[18, white(0.3)], [56, pink], [34, mix("accent", "surface-elevated", 70)]],
    [[18, white(0.3)], [18, white(0.3)], [88, mix("primary", "surface-elevated", 55)]],
    [[18, white(0.3)], [18, white(0.3)], [48, mix("success", "surface-elevated", 70)], [30, white(0.45)]],
    [[18, white(0.3)], [64, mix("accent", "surface-elevated", 70)]],
    [[30, mix("accent-secondary", "surface-elevated", 60)]],
  ];
  return (
    <svg viewBox="0 0 500 360" preserveAspectRatio="xMidYMin slice" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" style={{ stopColor: c("primary") }} />
          <stop offset="55%" style={{ stopColor: c("accent-secondary") }} />
          <stop offset="100%" style={{ stopColor: pink }} />
        </linearGradient>
      </defs>
      <rect width="500" height="360" fill={`url(#${id}-bg)`} />
      <Glow id={`${id}-sun`} cx={360} cy={70} r={170} color={c("accent", 0.85)} />
      <Glow id={`${id}-g1`} cx={250} cy={140} r={220} color={white(0.35)} />

      {/* Laptop */}
      <g transform="translate(37.5 4) scale(0.85)">
        <rect x={130} y={40} width={240} height={156} rx={12} style={{ fill: c("text-primary") }} />
        <rect x={138} y={48} width={224} height={140} rx={6} style={{ fill: mix("text-primary", "primary", 88) }} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={150 + i * 10} cy={60} r={3} style={{ fill: [c("accent"), pink, c("success")][i] }} />
        ))}
        {code.map((line, row) => {
          let x = 152;
          return line.map(([w, color], j) => {
            const rect = <rect key={`${row}-${j}`} x={x} y={76 + row * 17} width={w} height={7} rx={3.5} style={{ fill: color }} />;
            x += w + 6;
            return rect;
          });
        })}
        <rect x={152 + 18 + 6 + 64 + 6} y={76 + 4 * 17} width={2} height={11} style={{ fill: white() }} />
        <path d="M112 196 H388 L404 214 H96 Z" style={{ fill: white(0.92) }} />
        <rect x={226} y={196} width={48} height={5} rx={2.5} style={{ fill: c("text-primary", 0.15) }} />
      </g>

      {/* CI chip */}
      <g className={styles.float}>
        <rect x={26} y={78} width={126} height={36} rx={18} style={{ fill: white(0.95) }} />
        <circle cx={46} cy={96} r={9} style={{ fill: c("success") }} />
        <path d="M42 96 l3 3 l5 -6" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ stroke: white() }} />
        <text x={62} y={100} fontSize={11.5} fontWeight={500} style={{ fill: c("text-primary") }}>
          Tests passed
        </text>
      </g>

      {/* Branch chip */}
      <g className={styles.floatDelayed}>
        <rect x={352} y={110} width={124} height={52} rx={16} style={{ fill: white(0.95) }} />
        <g strokeWidth={2} fill="none" style={{ stroke: c("accent-secondary") }}>
          <path d="M370 126 V148" />
          <path d="M370 136 C370 130 384 132 384 124" />
        </g>
        <circle cx={370} cy={126} r={3.5} style={{ fill: c("primary") }} />
        <circle cx={370} cy={148} r={3.5} style={{ fill: c("primary") }} />
        <circle cx={384} cy={124} r={3.5} style={{ fill: c("accent") }} />
        <text x={396} y={132} fontSize={11} fontWeight={600} style={{ fill: c("text-primary") }}>
          PR merged
        </text>
        <text x={396} y={148} fontSize={10} style={{ fill: c("text-muted") }}>
          main · 2m ago
        </text>
      </g>
      <Sparkle x={70} y={40} size={8} color={white()} />
    </svg>
  );
}

export const articleVisuals = {
  "ai-operations": AiOperations,
  "ai-agents": AiAgents,
  "dev-workspace": DevWorkspace,
} as const;

export type ArticleVisualName = keyof typeof articleVisuals;
