/**
 * Optional Cloudflare Web Analytics site token (public, NOT an account API key).
 * Leave blank to disable analytics. Fill from Web Analytics > Manage site >
 * JS snippet, update the privacy notice, then rebuild and deploy.
 * Use manual snippet installation in Cloudflare to avoid duplicate beacons.
 */
export const analyticsConfig = {
  cloudflareWebAnalyticsToken: '',
} as const
