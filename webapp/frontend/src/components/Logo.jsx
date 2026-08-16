/* The S4Biz mark. An inline SVG, not an <img>, so it inherits the brand gradient from CSS
 * variables and stays crisp at every density with no second asset to keep in sync.
 *
 * The shape is a shield built from four segments, one per registered entity, over a stylised S.
 * It reads at 22px (the header) and at 512px (the installed app icon), which is the only real
 * constraint on a mark that has to work as a favicon.
 */
export default function Logo({ size = 26 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
      className="logo"
    >
      <defs>
        <linearGradient id="s4g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--cyan)" />
          <stop offset="55%" stopColor="var(--violet)" />
          <stop offset="100%" stopColor="var(--indigo)" />
        </linearGradient>
      </defs>
      <path
        d="M24 3 41 9v14.5C41 33.6 33.9 42.4 24 45 14.1 42.4 7 33.6 7 23.5V9L24 3Z"
        fill="none"
        stroke="url(#s4g)"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d="M30 17.5c-1.7-1.9-4-2.8-6.6-2.8-3.6 0-5.9 1.7-5.9 4.2 0 2.3 1.7 3.4 5.6 4.2 4.6 1 7 2.7 7 6.2 0 3.9-3.4 6.5-8.3 6.5-3.2 0-6-1.1-7.8-3.2"
        fill="none"
        stroke="url(#s4g)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
