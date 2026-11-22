/**
 * passwordGenerator.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Cryptographically secure password generator for Kinetic.
 *
 * Generates high-entropy, diverse passwords using window.crypto.getRandomValues.
 * Avoids ambiguous/confusing characters (O/0, I/l) for high legibility.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const UPPERCASE = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // Excludes I, O
const LOWERCASE = "abcdefghijkmnpqrstuvwxyz"; // Excludes l, o
const NUMBERS = "23456789";                   // Excludes 0, 1
const SYMBOLS = "!@#$%^&*_-+=?";
const ALL_CHARS = UPPERCASE + LOWERCASE + NUMBERS + SYMBOLS;

/**
 * Generates a cryptographically strong, random password.
 * @param length Desired password length (default: 16, min: 10, max: 64)
 */
export function generateSecurePassword(length = 16): string {
  const safeLength = Math.max(10, Math.min(64, length));
  const chars: string[] = [];
  const randomBytes = new Uint32Array(safeLength + 8);
  window.crypto.getRandomValues(randomBytes);

  let byteIdx = 0;

  // Guarantee at least 2 characters from each category
  for (let i = 0; i < 2; i++) {
    chars.push(UPPERCASE[randomBytes[byteIdx++] % UPPERCASE.length]);
    chars.push(LOWERCASE[randomBytes[byteIdx++] % LOWERCASE.length]);
    chars.push(NUMBERS[randomBytes[byteIdx++] % NUMBERS.length]);
    chars.push(SYMBOLS[randomBytes[byteIdx++] % SYMBOLS.length]);
  }

  // Fill remaining slots from the full character pool
  while (chars.length < safeLength) {
    chars.push(ALL_CHARS[randomBytes[byteIdx++] % ALL_CHARS.length]);
  }

  // Cryptographic Fisher-Yates shuffle
  const shuffleBytes = new Uint32Array(chars.length);
  window.crypto.getRandomValues(shuffleBytes);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = shuffleBytes[i] % (i + 1);
    const temp = chars[i];
    chars[i] = chars[j];
    chars[j] = temp;
  }

  return chars.join("");
}
