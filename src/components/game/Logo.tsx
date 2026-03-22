export const SystemLogo = ({ size = 40, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 260"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Top slice — small triangle, right edge vertical */}
    <polygon points="115,0 200,0 200,75 55,75" fill="hsl(var(--primary))" />

    {/* Middle slice — trapezoid */}
    <polygon points="30,88 200,88 200,163 -30,163" fill="hsl(var(--primary))" />

    {/* Bottom slice — widest trapezoid */}
    <polygon points="-50,176 200,176 200,255 -110,255" fill="hsl(var(--primary))" />
  </svg>
);
