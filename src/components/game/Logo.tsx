export const SystemLogo = ({ size = 40, className = '' }: { size?: number; className?: string }) => (
  <img
    src="/logo.png"
    alt="The System"
    width={size}
    height={size}
    className={className}
    style={{ objectFit: 'contain' }}
  />
);
