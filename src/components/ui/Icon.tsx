import type { SVGProps } from "react";

// Stroke icons drawn on a 24px grid; they inherit `currentColor`.
const paths = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h10" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  arrowRight: <path d="M5 12h14m-5-5 5 5-5 5" />,
  sparkles: (
    <path d="M12 3v3m0 12v3M3 12h3m12 0h3M9.5 9.5 12 6l2.5 3.5L18 12l-3.5 2.5L12 18l-2.5-3.5L6 12z" />
  ),
  layers: <path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" />,
  code: <path d="m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16" />,
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" />
    </>
  ),
  rocket: (
    <path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2m-1-4 3 3m-3-3c1-4 4.5-9.5 12-10-.5 7.5-6 11-10 12m-2-2-3-1 3-4h4m1 10 1 3 4-3v-4" />
  ),
  lightbulb: (
    <path d="M9 18h6m-5 3h4m-2-18a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z" />
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.2A6.5 6.5 0 0 1 21.5 20" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  flame: (
    <path d="M12 21a7 7 0 0 0 7-7c0-4-3-6.5-4-10-2 2-2.5 4-2.5 5.5C10.5 8 9 7 8.5 5.5 6.5 8 5 10.5 5 14a7 7 0 0 0 7 7Zm0 0a3 3 0 0 0 3-3c0-2-1.5-3-2-4.5-1 1-1.2 2-1.2 2.8-.8-.4-1.3-1-1.5-1.8C9.5 15.5 9 16.5 9 18a3 3 0 0 0 3 3Z" />
  ),
  chart: <path d="M4 20V10m6 10V4m6 16v-7m4 7H3" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  pen: <path d="M4 20h4L19.5 8.5a2.8 2.8 0 0 0-4-4L4 16v4Zm9.5-13.5 4 4" />,
} as const;

export type IconName = keyof typeof paths;

type IconProps = SVGProps<SVGSVGElement> & { name: IconName };

export function Icon({ name, className = "size-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
