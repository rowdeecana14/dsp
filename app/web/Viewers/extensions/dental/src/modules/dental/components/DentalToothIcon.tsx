import React from 'react';

type DentalToothIconProps = {
  className?: string;
};

/** Simple tooth glyph for dental theme toggle and header accents. */
function DentalToothIcon({ className = 'h-4 w-4' }: DentalToothIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 2C9.5 2 7.8 3.2 6.5 5.2 5.2 7.2 4.5 9.8 4.5 12c0 2.5.8 4.5 1.8 6 .5.8 1.1 1.4 1.7 1.8.3.2.6.3 1 .3s.7-.1 1-.3c.6-.4 1.2-1 1.7-1.8 1-1.5 1.8-3.5 1.8-6 0-2.2-.7-4.8-2-6.8C16.2 3.2 14.5 2 12 2zm0 3c1.2 0 2.2.8 3 2.2.7 1.2 1.2 2.8 1.2 4.3 0 1.8-.5 3.2-1.2 4.3-.4.6-.8 1-1.2 1.2-.4-.2-.8-.6-1.2-1.2-.7-1.1-1.2-2.5-1.2-4.3 0-1.5.5-3.1 1.2-4.3.8-1.4 1.8-2.2 3-2.2z" />
    </svg>
  );
}

export default DentalToothIcon;
