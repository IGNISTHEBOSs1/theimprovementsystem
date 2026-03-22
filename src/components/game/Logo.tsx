export const SystemLogo = ({ size = 40, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 500 500"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <polygon points="260,40 380,160 260,160" fill="hsl(var(--primary))" />
    <polygon points="200,180 380,180 340,280 200,280" fill="hsl(var(--primary))" />
    <polygon points="160,300 360,300 340,400 140,400" fill="hsl(var(--primary))" />
  </svg>
);
