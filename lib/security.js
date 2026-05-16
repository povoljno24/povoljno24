/**
 * Safely stringifies and escapes JSON for inclusion in a <script> tag.
 * Prevents XSS by escaping </script> and other sensitive characters.
 */
export function safeJsonStringify(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
}

/**
 * Checks if a user is an administrator based on their email.
 * This should be used as a client-side convenience only; 
 * server-side RLS is the ultimate source of truth.
 */
export function isUserAdmin(user) {
  if (!user || !user.email) return false;
  const adminEmails = ['alex@pixelsurgestudio.dev', 'admin@povoljno24.com'];
  return adminEmails.includes(user.email);
}
