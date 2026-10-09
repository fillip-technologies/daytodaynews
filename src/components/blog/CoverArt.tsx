import { useId, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { toneColor } from "@/lib/tones";
import type { CoverPattern, CoverSpec } from "@/types/article";

// Generated editorial cover: a two-tone gradient, a topic pattern and the topic
// icon on a white tile. Colors come only from master tokens.

const W = 400;
const H = 250;
const CX = W / 2;
const CY = H / 2;

const white = (opacity = 1) =>
  opacity === 1
    ? "var(--color-surface-elevated)"
    : `color-mix(in srgb, var(--color-surface-elevated) ${opacity * 100}%, transparent)`;

type PatternProps = { accent: string };

const patterns: Record<CoverPattern, (p: PatternProps) => ReactNode> = {
  orbit: ({ accent }) => (
    <>
      <g fill="none" transform={`rotate(-12 ${CX} ${CY})`} style={{ stroke: white(0.5) }}>
        <ellipse cx={CX} cy={CY} rx={92} ry={36} strokeWidth={1.5} />
        <ellipse cx={CX} cy={CY} rx={140} ry={56} strokeWidth={1} />
        <ellipse cx={CX} cy={CY} rx={186} ry={76} strokeWidth={1} strokeDasharray="3 7" />
      </g>
      <circle cx={92} cy={150} r={7} style={{ fill: accent, stroke: white() }} strokeWidth={2} />
      <circle cx={318} cy={84} r={9} style={{ fill: white() }} />
      <circle cx={276} cy={176} r={5} style={{ fill: white(0.9) }} />
      <circle cx={136} cy={78} r={4} style={{ fill: white(0.8) }} />
    </>
  ),
  nodes: ({ accent }) => {
    const pts: Array<[number, number, number]> = [
      [70, 70, 8], [96, 186, 6], [318, 60, 7], [340, 170, 9], [252, 214, 5], [150, 36, 5], [40, 128, 4],
    ];
    return (
      <>
        <g strokeWidth={1.25} style={{ stroke: white(0.55) }}>
          {pts.map(([x, y]) => <line key={`${x}-${y}`} x1={CX} y1={CY} x2={x} y2={y} />)}
          <line x1={70} y1={70} x2={150} y2={36} />
          <line x1={318} y1={60} x2={340} y2={170} />
          <line x1={96} y1={186} x2={40} y2={128} />
        </g>
        {pts.map(([x, y, r], i) => (
          <circle
            key={`${x}-${y}`}
            cx={x}
            cy={y}
            r={r}
            strokeWidth={2}
            style={{ fill: i % 3 === 0 ? accent : white(), stroke: white() }}
          />
        ))}
      </>
    );
  },
  bars: ({ accent }) => {
    const bars = [44, 70, 58, 96, 88, 124, 150];
    return (
      <>
        {bars.map((h, i) => (
          <rect
            key={i}
            x={46 + i * 46}
            y={228 - h}
            width={28}
            height={h}
            rx={8}
            style={{ fill: white(0.18 + i * 0.06) }}
          />
        ))}
        <polyline
          points="60,172 106,150 152,160 198,118 244,126 290,86 336,58"
          fill="none"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ stroke: white() }}
        />
        <circle cx={336} cy={58} r={7} strokeWidth={2.5} style={{ fill: accent, stroke: white() }} />
      </>
    );
  },
  stack: ({ accent }) => (
    <>
      {[0, 1, 2].map((i) => {
        const y = 170 - i * 34;
        return (
          <path
            key={i}
            d={`M${CX} ${y - 34} L${CX + 110} ${y} L${CX} ${y + 34} L${CX - 110} ${y} Z`}
            strokeWidth={1.5}
            style={{
              fill: i === 2 ? white(0.35) : white(0.12 + i * 0.08),
              stroke: white(0.6),
            }}
          />
        );
      })}
      <circle cx={CX + 110} cy={102} r={6} style={{ fill: accent, stroke: white() }} strokeWidth={2} />
      <circle cx={CX - 110} cy={170} r={5} style={{ fill: white() }} />
    </>
  ),
  code: ({ accent }) => {
    const lines: Array<Array<[number, number]>> = [
      [[40, 0.9], [64, 0.5]],
      [[18, 0.35], [80, 0.75], [30, 0.5]],
      [[18, 0.35], [18, 0.35], [96, 0.6]],
      [[18, 0.35], [54, 0.85], [40, 0.45]],
      [[34, 0.7]],
    ];
    return (
      <>
        <rect x={56} y={34} width={288} height={182} rx={16} strokeWidth={1.5} style={{ fill: white(0.16), stroke: white(0.5) }} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={76 + i * 13} cy={54} r={4} style={{ fill: i === 0 ? accent : white(0.7) }} />
        ))}
        {lines.map((line, row) => {
          let x = 76;
          return line.map(([w, o], j) => {
            const el = <rect key={`${row}-${j}`} x={x} y={76 + row * 26} width={w} height={9} rx={4.5} style={{ fill: white(o) }} />;
            x += w + 8;
            return el;
          });
        })}
      </>
    );
  },
  waves: ({ accent }) => (
    <>
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          d={`M-10 ${150 + i * 18} C 70 ${90 + i * 18}, 130 ${210 + i * 18}, 210 ${150 + i * 18} S 350 ${90 + i * 18}, 420 ${150 + i * 18}`}
          fill="none"
          strokeWidth={2 + (3 - i) * 0.5}
          style={{ stroke: white(0.2 + i * 0.15) }}
        />
      ))}
      <circle cx={318} cy={114} r={7} strokeWidth={2} style={{ fill: accent, stroke: white() }} />
      <circle cx={82} cy={132} r={5} style={{ fill: white() }} />
    </>
  ),
  people: ({ accent }) => {
    const seats: Array<[number, number]> = [[76, 96], [120, 190], [324, 96], [280, 190], [200, 36]];
    return (
      <>
        <g strokeDasharray="3 5" strokeWidth={1.5} style={{ stroke: white(0.6) }}>
          {seats.map(([x, y]) => <line key={`${x}-${y}`} x1={CX} y1={CY} x2={x} y2={y} />)}
        </g>
        {seats.map(([x, y], i) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r={24} strokeWidth={1.5} style={{ fill: white(0.22), stroke: white(0.7) }} />
            <circle cx={x} cy={y - 5} r={7} style={{ fill: i % 2 ? accent : white() }} />
            <path d={`M${x - 12} ${y + 14} a12 10 0 0 1 24 0`} style={{ fill: i % 2 ? accent : white() }} />
          </g>
        ))}
      </>
    );
  },
  grid: ({ accent }) => (
    <>
      <g style={{ stroke: white(0.3) }} strokeWidth={1}>
        {Array.from({ length: 11 }, (_, i) => -200 + i * 80).map((x) => (
          <line key={x} x1={CX + (x - CX) * 0.2} y1={150} x2={x} y2={H} />
        ))}
        {[160, 176, 200, 232].map((y) => <line key={y} x1={0} y1={y} x2={W} y2={y} />)}
      </g>
      <rect x={58} y={48} width={70} height={52} rx={12} strokeWidth={1.5} style={{ fill: white(0.22), stroke: white(0.6) }} />
      <rect x={280} y={40} width={80} height={60} rx={12} strokeWidth={1.5} style={{ fill: white(0.3), stroke: white(0.7) }} />
      <rect x={292} y={56} width={40} height={7} rx={3.5} style={{ fill: accent }} />
      <rect x={292} y={72} width={56} height={7} rx={3.5} style={{ fill: white(0.8) }} />
      <rect x={70} y={62} width={34} height={7} rx={3.5} style={{ fill: white(0.9) }} />
    </>
  ),
};

type CoverArtProps = {
  cover: CoverSpec;
  className?: string;
  /** Hide the pattern for tiny thumbnails where it would be noise. */
  compact?: boolean;
};

export function CoverArt({ cover, className, compact }: CoverArtProps) {
  const id = `c${useId().replace(/:/g, "")}`;
  const [from, to] = cover.tones;
  const Pattern = patterns[cover.pattern];
  const tile = compact ? 112 : 68;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" style={{ stopColor: toneColor[from] }} />
          <stop offset="100%" style={{ stopColor: toneColor[to] }} />
        </linearGradient>
        <radialGradient id={`${id}-light`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" style={{ stopColor: white(0.6) }} />
          <stop offset="100%" style={{ stopColor: white(0) }} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}-bg)`} />
      <circle cx={W * 0.3} cy={H * 0.2} r={200} fill={`url(#${id}-light)`} />
      {!compact && <Pattern accent={toneColor[to]} />}

      {/* Topic glyph */}
      <circle cx={CX} cy={CY} r={tile * 0.9} style={{ fill: white(0.35) }} />
      <rect
        x={CX - tile / 2}
        y={CY - tile / 2}
        width={tile}
        height={tile}
        rx={tile * 0.3}
        style={{ fill: white() }}
      />
      <Icon
        name={cover.icon}
        x={CX - tile * 0.25}
        y={CY - tile * 0.25}
        width={tile * 0.5}
        height={tile * 0.5}
        className=""
        style={{ color: toneColor[from] }}
      />
    </svg>
  );
}
