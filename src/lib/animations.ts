// Shared animation presets — use these everywhere instead of ad-hoc values
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

export const slideUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
};

export const slideDown = {
  initial: { opacity: 0, y: -12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
};

export const slideInRight = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.94 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
  transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const },
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.07 } },
};

export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
};

// Button / card micro-interactions
export const buttonHover = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.97 },
};

export const cardHover = {
  whileHover: { y: -2 },
  transition: { type: 'spring', stiffness: 400, damping: 30 },
};

export const iconHover = {
  whileHover: { scale: 1.1, rotate: 5 },
  whileTap: { scale: 0.9 },
};

// Page section transition
export const sectionTransition = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const },
};
