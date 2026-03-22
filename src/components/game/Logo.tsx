export const SystemLogo = ({ size = 40, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Top slice — small right triangle, pointy on the right */}
    <polygon points="55,8 80,28 55,28" fill="hsl(var(--primary))" />

    {/* Middle slice — trapezoid, wider on left */}
    <polygon points="38,33 80,33 80,53 38,53" fill="hsl(var(--primary))" />

    {/* Bottom slice — widest trapezoid */}
    <polygon points="20,58 80,58 80,78 16,78" fill="hsl(var(--primary))" />
  </svg>
);
