import { analyticsConfig } from '@/lib/analytics'

/** Single analytics insertion point. Empty configuration emits no script. */
export function SiteAnalytics() {
  const token = analyticsConfig.cloudflareWebAnalyticsToken.trim()
  if (!token) return null
  return <script id="site-analytics" defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={JSON.stringify({ token })} />
}
