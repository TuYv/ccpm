/**
 * Returns true if the env var key is likely a secret (token / key / password).
 * Used to mask UI inputs.
 */
export function isSecretEnvKey(key: string): boolean {
  // Whole-word boundary to avoid false positives like KEYBOARD_LAYOUT or API_BASE_URL.
  return /\b(TOKEN|KEY|SECRET|PASSWORD|PASSWD|PWD)\b/i.test(key);
}
