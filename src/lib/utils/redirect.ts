/**
 * Secure Redirect Validation Utility
 *
 * Prevents open redirect vulnerabilities by validating redirect URLs.
 * Only allows relative paths within the same origin.
 */

/**
 * Validates that a redirect URL is safe to use.
 * Only allows relative paths that don't contain protocols.
 *
 * @param redirectUrl - The URL to validate
 * @param fallback - Fallback URL if validation fails (default: '/dashboard')
 * @returns A safe redirect URL
 *
 * @example
 * validateRedirectUrl('/admin/casting') // Returns '/admin/casting'
 * validateRedirectUrl('https://evil.com') // Returns '/dashboard'
 * validateRedirectUrl('//evil.com') // Returns '/dashboard'
 */
export function validateRedirectUrl(
  redirectUrl: string | null | undefined,
  fallback: string = '/dashboard'
): string {
  // If no redirect URL provided, use fallback
  if (!redirectUrl || typeof redirectUrl !== 'string') {
    return fallback;
  }

  // Remove any whitespace
  const trimmed = redirectUrl.trim();

  // Check if it's an absolute URL (contains protocol or starts with //)
  if (
    trimmed.includes('://') ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('http:') ||
    trimmed.startsWith('https:') ||
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:')
  ) {
    return fallback;
  }

  // Must start with / to be a relative path
  if (!trimmed.startsWith('/')) {
    return fallback;
  }

  // Additional safety: check for any remaining protocol-like patterns
  if (trimmed.match(/^\/[^\/].*:/)) {
    return fallback;
  }

  return trimmed;
}

/**
 * Get a validated redirect URL from search parameters
 *
 * @param searchParams - URLSearchParams or string
 * @param paramName - Name of the redirect parameter (default: 'redirect')
 * @param fallback - Fallback URL (default: '/dashboard')
 * @returns A safe redirect URL
 *
 * @example
 * getValidatedRedirect(searchParams, 'redirect', '/dashboard')
 */
export function getValidatedRedirect(
  searchParams: URLSearchParams | string | null,
  paramName: string = 'redirect',
  fallback: string = '/dashboard'
): string {
  if (!searchParams) {
    return fallback;
  }

  let redirectUrl: string | null = null;

  if (typeof searchParams === 'string') {
    const params = new URLSearchParams(searchParams);
    redirectUrl = params.get(paramName);
  } else {
    redirectUrl = searchParams.get(paramName);
  }

  return validateRedirectUrl(redirectUrl, fallback);
}
