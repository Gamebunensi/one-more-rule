const paths = {
  arrow: <><path d="M5 12h14" /><path d="m14 7 5 5-5 5" /></>,
  back: <><path d="M19 12H5" /><path d="m10 17-5-5 5-5" /></>,
  check: <path d="m6 12 4 4 8-9" />,
  close: <><path d="m6 6 12 12" /><path d="M18 6 6 18" /></>,
  copy: <><rect x="8" y="8" width="11" height="11" rx="1.5" /><path d="M16 8V5H5v11h3" /></>,
  external: <><path d="M14 5h5v5" /><path d="m12 12 7-7" /><path d="M19 13v6H5V5h6" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.6 9a2.5 2.5 0 0 1 4.8.9c0 2.1-2.4 2.2-2.4 4.1" /><path d="M12 18h.01" /></>,
  lock: <><rect x="6" y="10" width="12" height="10" rx="1.5" /><path d="M9 10V7a3 3 0 0 1 6 0v3" /></>,
  reset: <><path d="M20 11a8 8 0 1 0-2.3 5.7" /><path d="M20 5v6h-6" /></>,
};

export function Icon({ name, size = 24, className = "", strokeWidth = 1.8 }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
    >
      {paths[name]}
    </svg>
  );
}

export function GameIcon({ name }) {
  if (name === "clipboard") {
    return (
      <svg aria-hidden="true" className="game-icon" viewBox="0 0 72 72">
        <path d="M22 15h28v45H22z" />
        <path d="M29 15v-4h14v4M29 27h14M29 38h14M29 49h14" />
        <path className="icon-accent" d="m14 29 3 3 5-6m-8 17 3 3 5-6m-8 17 3 3 5-6" />
      </svg>
    );
  }

  if (name === "users") {
    return (
      <svg aria-hidden="true" className="game-icon" viewBox="0 0 72 72">
        <circle cx="28" cy="28" r="8" />
        <circle cx="48" cy="31" r="6" />
        <path d="M13 59c1-12 7-18 15-18s14 6 15 18H13Zm31-14c8 0 13 5 14 14H45" />
        <path className="icon-accent" d="M14 18h13m-13 0 5-5m-5 5 5 5" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="game-icon" viewBox="0 0 72 72">
      <path d="M20 9h25l11 11v43H20z" />
      <path d="M45 9v12h11M28 31h19M28 40h19M28 49h12" />
      <path className="icon-accent" d="M38 53c6-7 11-8 18-4m-17 4c5 5 11 4 17-4" />
    </svg>
  );
}
