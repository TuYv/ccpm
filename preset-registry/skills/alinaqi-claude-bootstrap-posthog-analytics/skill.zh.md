---
name: posthog-analytics
description: PostHog analytics, event tracking, feature flags, dashboards
when-to-use: When adding analytics, feature flags, or event tracking with PostHog
user-invocable: false
effort: medium
---
# PostHog 分析技能


用于通过 PostHog 实现产品分析——包括事件跟踪、用户识别、功能标志以及项目专属仪表板。

**来源：** [PostHog 文档](https://posthog.com/docs) | [产品分析](https://posthog.com/docs/product-analytics) | [功能标志](https://posthog.com/docs/feature-flags)

---

## 理念

**衡量重要的事物，而非一切。**

分析应当回答具体问题：
- 用户是否获得了价值？（激活、留存）
- 用户在哪里遇到困难？（漏斗、流失）
- 哪些功能促进了参与度？（功能使用情况）
- 产品是否在增长？（获客、推荐）

不要跟踪一切。只跟踪能为决策提供依据的内容。

---

## 安装

### Next.js（App Router）

```bash
npm install posthog-js
```

```typescript
// lib/posthog.ts
import posthog from 'posthog-js';

export function initPostHog() {
  if (typeof window !== 'undefined' && !posthog.__loaded) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      person_profiles: 'identified_only', // Only create profiles for identified users
      capture_pageview: false, // We'll handle this manually for SPA
      capture_pageleave: true,
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          posthog.debug();
        }
      },
    });
  }
  return posthog;
}

export { posthog };
```

```typescript
// app/providers.tsx
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initPostHog, posthog } from '@/lib/posthog';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    initPostHog();
  }, []);

  // Track pageviews
  useEffect(() => {
    if (pathname) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
      posthog.capture('$pageview', { $current_url: url });
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
```

```typescript
// app/layout.tsx
import { PostHogProvider } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
```

### React（Vite/CRA）

```typescript
// src/posthog.ts
import posthog from 'posthog-js';

posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
  person_profiles: 'identified_only',
});

export { posthog };
```

```typescript
// src/main.tsx
import { PostHogProvider } from 'posthog-js/react';
import { posthog } from './posthog';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <PostHogProvider client={posthog}>
    <App />
  </PostHogProvider>
);
```

### Python (FastAPI/Flask)

```bash
pip install posthog
```

```python
# analytics/posthog_client.py
import posthog
from functools import lru_cache

@lru_cache()
def get_posthog():
    posthog.project_api_key = os.environ["POSTHOG_API_KEY"]
    posthog.host = os.environ.get("POSTHOG_HOST", "https://us.i.posthog.com")
    posthog.debug = os.environ.get("ENV") == "development"
    return posthog

# Usage
def track_event(user_id: str, event: str, properties: dict = None):
    ph = get_posthog()
    ph.capture(
        distinct_id=user_id,
        event=event,
        properties=properties or {}
    )

def identify_user(user_id: str, properties: dict):
    ph = get_posthog()
    ph.identify(user_id, properties)
```

### Node.js (Express/Hono)

```bash
npm install posthog-node
```

```typescript
// lib/posthog.ts
import { PostHog } from 'posthog-node';

const posthog = new PostHog(process.env.POSTHOG_API_KEY!, {
  host: process.env.POSTHOG_HOST || 'https://us.i.posthog.com',
});

// Flush on shutdown
process.on('SIGTERM', () => posthog.shutdown());

export { posthog };

// Usage
export function trackEvent(userId: string, event: string, properties?: Record<string, any>) {
  posthog.capture({
    distinctId: userId,
    event,
    properties,
  });
}

export function identifyUser(userId: string, properties: Record<string, any>) {
  posthog.identify({
    distinctId: userId,
    properties,
  });
}
```

---

## 环境变量

```bash
# .env.local (Next.js) - SAFE: These are meant to be public
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# .env (Backend) - Keep private
POSTHOG_API_KEY=phc_xxxxxxxxxxxxxxxxxxxx
POSTHOG_HOST=https://us.i.posthog.com
```

添加到 `credentials.md` 模式中：
```python
'POSTHOG_API_KEY': r'phc_[A-Za-z0-9]+',
```

---

## 用户识别

### 何时识别

```typescript
// Identify on signup
async function handleSignup(email: string, name: string) {
  const user = await createUser(email, name);

  posthog.identify(user.id, {
    email: user.email,
    name: user.name,
    created_at: user.createdAt,
    plan: 'free',
  });

  posthog.capture('user_signed_up', {
    signup_method: 'email',
  });
}

// Identify on login
async function handleLogin(email: string) {
  const user = await authenticateUser(email);

  posthog.identify(user.id, {
    email: user.email,
    name: user.name,
    plan: user.plan,
    last_login: new Date().toISOString(),
  });

  posthog.capture('user_logged_in');
}

// Reset on logout
function handleLogout() {
  posthog.capture('user_logged_out');
  posthog.reset(); // Clears identity
}
```

### 用户属性

```typescript
// Standard properties to track
interface UserProperties {
  // Identity
  email: string;
  name: string;

  // Lifecycle
  created_at: string;
  plan: 'free' | 'pro' | 'enterprise';

  // Engagement
  onboarding_completed: boolean;
  feature_count: number;

  // Business
  company_name?: string;
  company_size?: string;
  industry?: string;
}

// Update properties when they change
posthog.capture('$set', {
  $set: { plan: 'pro' },
});
```

---

## 事件追踪模式

### 事件命名约定

```typescript
// Format: [object]_[action]
// Use snake_case, past tense for actions

// ✅ Good event names
'user_signed_up'
'feature_created'
'subscription_upgraded'
'onboarding_completed'
'invite_sent'
'file_uploaded'
'search_performed'
'checkout_started'
'payment_completed'

// ❌ Bad event names
'click'           // Too vague
'ButtonClick'     // Not snake_case
'user signup'     // Spaces
'creatingFeature' // Not past tense
```

### 按类别划分的核心事件

```typescript
// === AUTHENTICATION ===
posthog.capture('user_signed_up', {
  signup_method: 'google' | 'email' | 'github',
  referral_source: 'organic' | 'paid' | 'referral',
});

posthog.capture('user_logged_in', {
  login_method: 'google' | 'email' | 'magic_link',
});

posthog.capture('user_logged_out');

posthog.capture('password_reset_requested');

// === ONBOARDING ===
posthog.capture('onboarding_started');

posthog.capture('onboarding_step_completed', {
  step_name: 'profile' | 'preferences' | 'first_action',
  step_number: 1,
  total_steps: 3,
});

posthog.capture('onboarding_completed', {
  duration_seconds: 120,
  steps_skipped: 0,
});

posthog.capture('onboarding_skipped', {
  skipped_at_step: 2,
});

// === FEATURE USAGE ===
posthog.capture('feature_used', {
  feature_name: 'export' | 'share' | 'duplicate',
  context: 'dashboard' | 'editor',
});

posthog.capture('[resource]_created', {
  resource_type: 'project' | 'document' | 'team',
  // Resource-specific properties
});

posthog.capture('[resource]_updated', {
  resource_type: 'project',
  fields_changed: ['name', 'description'],
});

posthog.capture('[resource]_deleted', {
  resource_type: 'project',
});

// === BILLING ===
posthog.capture('pricing_page_viewed', {
  current_plan: 'free',
});

posthog.capture('checkout_started', {
  plan: 'pro',
  billing_period: 'monthly' | 'annual',
  price: 29,
});

posthog.capture('subscription_upgraded', {
  from_plan: 'free',
  to_plan: 'pro',
  mrr_change: 29,
});

posthog.capture('subscription_downgraded', {
  from_plan: 'pro',
  to_plan: 'free',
  reason: 'too_expensive' | 'missing_features' | 'not_using',
});

posthog.capture('subscription_cancelled', {
  plan: 'pro',
  reason: 'string',
  feedback: 'string',
});

// === ERRORS ===
posthog.capture('error_occurred', {
  error_type: 'api_error' | 'validation_error' | 'network_error',
  error_message: 'string',
  error_code: 'string',
  page: '/dashboard',
});
```

### 用于追踪的 React Hook

```typescript
// hooks/useTrack.ts
import { useCallback } from 'react';
import { posthog } from '@/lib/posthog';

export function useTrack() {
  const track = useCallback((event: string, properties?: Record<string, any>) => {
    posthog.capture(event, {
      ...properties,
      timestamp: new Date().toISOString(),
    });
  }, []);

  return { track };
}

// Usage
function CreateProjectButton() {
  const { track } = useTrack();

  const handleCreate = async () => {
    track('project_creation_started');

    try {
      const project = await createProject();
      track('project_created', {
        project_id: project.id,
        template_used: project.template,
      });
    } catch (error) {
      track('project_creation_failed', {
        error_message: error.message,
      });
    }
  };

  return <button onClick={handleCreate}>Create Project</button>;
}
```

---

## 功能标志

### 设置

```typescript
// Check feature flag (client-side)
import { useFeatureFlagEnabled } from 'posthog-js/react';

function NewFeature() {
  const showNewUI = useFeatureFlagEnabled('new-dashboard-ui');

  if (showNewUI) {
    return <NewDashboard />;
  }
  return <OldDashboard />;
}

// With payload
import { useFeatureFlagPayload } from 'posthog-js/react';

function PricingPage() {
  const pricingConfig = useFeatureFlagPayload('pricing-experiment');
  // pricingConfig = { price: 29, showAnnual: true }

  return <Pricing config={pricingConfig} />;
}
```

### 服务端（Next.js）

```typescript
// app/dashboard/page.tsx
import { PostHog } from 'posthog-node';
import { cookies } from 'next/headers';

async function getFeatureFlags(userId: string) {
  const posthog = new PostHog(process.env.POSTHOG_API_KEY!);

  const flags = await posthog.getAllFlags(userId);
  await posthog.shutdown();

  return flags;
}

export default async function Dashboard() {
  const cookieStore = cookies();
  const userId = cookieStore.get('user_id')?.value;

  const flags = await getFeatureFlags(userId);

  return (
    <div>
      {flags['new-dashboard'] && <NewFeature />}
    </div>
  );
}
```

### A/B 测试

```typescript
// Track experiment exposure
function ExperimentComponent() {
  const variant = useFeatureFlagEnabled('checkout-experiment');

  useEffect(() => {
    posthog.capture('experiment_viewed', {
      experiment: 'checkout-experiment',
      variant: variant ? 'test' : 'control',
    });
  }, [variant]);

  return variant ? <NewCheckout /> : <OldCheckout />;
}
```

---

## 项目专用仪表板

### SaaS 产品

```markdown
## Essential SaaS Dashboards

### 1. Acquisition Dashboard
**Questions answered:** Where do users come from? What converts?

Insights to create:
- [ ] Signups by source (daily/weekly trend)
- [ ] Signup conversion rate by landing page
- [ ] Time from first visit to signup
- [ ] Signup funnel: Visit → Signup Page → Form Start → Complete

### 2. Activation Dashboard
**Questions answered:** Are new users getting value?

Insights to create:
- [ ] Onboarding completion rate
- [ ] Time to first key action
- [ ] Activation rate (% reaching "aha moment" in first 7 days)
- [ ] Drop-off by onboarding step
- [ ] Feature adoption in first session

### 3. Engagement Dashboard
**Questions answered:** How are users using the product?

Insights to create:
- [ ] DAU/WAU/MAU trends
- [ ] Feature usage heatmap
- [ ] Session duration distribution
- [ ] Actions per session
- [ ] Power users vs casual users

### 4. Retention Dashboard
**Questions answered:** Are users coming back?

Insights to create:
- [ ] Retention cohorts (D1, D7, D30)
- [ ] Churn rate by plan
- [ ] Reactivation rate
- [ ] Last action before churn
- [ ] Features correlated with retention

### 5. Revenue Dashboard
**Questions answered:** Is the business growing?

Insights to create:
- [ ] MRR trend
- [ ] Upgrades vs downgrades
- [ ] Trial to paid conversion
- [ ] Revenue by plan
- [ ] LTV by acquisition source
```

### 电子商务

```markdown
## Essential E-Commerce Dashboards

### 1. Conversion Funnel
Insights to create:
- [ ] Full funnel: Browse → PDP → Add to Cart → Checkout → Purchase
- [ ] Cart abandonment rate
- [ ] Checkout drop-off by step
- [ ] Payment failure rate

### 2. Product Performance
Insights to create:
- [ ] Product views → purchases (by product)
- [ ] Add to cart rate by category
- [ ] Search → purchase correlation
- [ ] Cross-sell effectiveness

### 3. Customer Dashboard
Insights to create:
- [ ] Repeat purchase rate
- [ ] Average order value trend
- [ ] Customer lifetime value
- [ ] Purchase frequency distribution
```

### 内容/媒体

```markdown
## Essential Content Dashboards

### 1. Consumption Dashboard
Insights to create:
- [ ] Content views by type
- [ ] Read/watch completion rate
- [ ] Time on content
- [ ] Scroll depth distribution

### 2. Engagement Dashboard
Insights to create:
- [ ] Shares by content
- [ ] Comments per article
- [ ] Save/bookmark rate
- [ ] Return visits to same content

### 3. Growth Dashboard
Insights to create:
- [ ] New vs returning visitors
- [ ] Email signup rate
- [ ] Referral traffic sources
```

### AI/LLM 应用

```markdown
## Essential AI App Dashboards

### 1. Usage Dashboard
Insights to create:
- [ ] Queries per user per day
- [ ] Token usage distribution
- [ ] Response time p50/p95
- [ ] Error rate by query type

### 2. Quality Dashboard
Insights to create:
- [ ] User feedback (thumbs up/down)
- [ ] Regeneration rate (user asked for new response)
- [ ] Edit rate (user modified AI output)
- [ ] Follow-up query rate

### 3. Cost Dashboard
Insights to create:
- [ ] Token cost per user
- [ ] Cost by model
- [ ] Cost by feature
- [ ] Efficiency trends (value/cost)
```

---

## 创建仪表板

### 使用 PostHog MCP

```markdown
When setting up analytics for a project:

1. First, check existing dashboards:
   - Use `dashboards-get-all` to list current dashboards

2. Create project-appropriate dashboards:
   - Use `dashboard-create` with descriptive name

3. Create insights for each dashboard:
   - Use `query-run` to test queries
   - Use `insight-create-from-query` to save
   - Use `add-insight-to-dashboard` to organize

4. Set up key funnels:
   - Signup funnel
   - Onboarding funnel
   - Purchase/conversion funnel
```

### 仪表板创建工作流

```typescript
// Example: Creating SaaS dashboards via MCP

// 1. Create dashboard
const dashboard = await mcp_posthog_dashboard_create({
  name: "Activation Metrics",
  description: "Track new user activation and onboarding",
  tags: ["saas", "activation"],
});

// 2. Create insights
const signupFunnel = await mcp_posthog_query_run({
  query: {
    kind: "InsightVizNode",
    source: {
      kind: "FunnelsQuery",
      series: [
        { kind: "EventsNode", event: "user_signed_up", name: "Signed Up" },
        { kind: "EventsNode", event: "onboarding_started", name: "Started Onboarding" },
        { kind: "EventsNode", event: "onboarding_completed", name: "Completed Onboarding" },
        { kind: "EventsNode", event: "first_value_action", name: "First Value" },
      ],
      dateRange: { date_from: "-30d" },
    },
  },
});

// 3. Save and add to dashboard
const insight = await mcp_posthog_insight_create_from_query({
  name: "Signup to Activation Funnel",
  query: signupFunnel.query,
  favorited: true,
});

await mcp_posthog_add_insight_to_dashboard({
  insightId: insight.id,
  dashboardId: dashboard.id,
});
```

---

## 隐私与合规

### GDPR 合规

```typescript
// Opt-out handling
export function handleCookieConsent(consent: boolean) {
  if (consent) {
    posthog.opt_in_capturing();
  } else {
    posthog.opt_out_capturing();
  }
}

// Check consent status
const hasConsent = posthog.has_opted_in_capturing();

// Initialize with consent check
posthog.init(key, {
  opt_out_capturing_by_default: true, // Require explicit opt-in
  respect_dnt: true, // Respect Do Not Track
});
```

### 绝不追踪的数据

```typescript
// ❌ NEVER track these
posthog.capture('event', {
  password: '...',           // Credentials
  credit_card: '...',        // Payment info
  ssn: '...',                // Government IDs
  medical_info: '...',       // Health data
  full_address: '...',       // Detailed location
});

// ✅ OK to track
posthog.capture('event', {
  country: 'US',             // General location
  plan: 'pro',               // Product info
  feature_used: 'export',    // Usage
});
```

### 属性清理

```typescript
// lib/analytics.ts
const SENSITIVE_KEYS = ['password', 'token', 'secret', 'credit', 'ssn'];

function sanitizeProperties(props: Record<string, any>): Record<string, any> {
  return Object.fromEntries(
    Object.entries(props).filter(([key]) =>
      !SENSITIVE_KEYS.some(sensitive => key.toLowerCase().includes(sensitive))
    )
  );
}

export function safeCapture(event: string, properties?: Record<string, any>) {
  posthog.capture(event, sanitizeProperties(properties || {}));
}
```

---

## 分析测试

### 开发模式

```typescript
// Disable in development
if (process.env.NODE_ENV === 'development') {
  posthog.opt_out_capturing();
  // Or use debug mode
  posthog.debug();
}
```

### E2E 测试

```typescript
// playwright/fixtures.ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    // Mock PostHog to capture events
    await page.addInitScript(() => {
      window.capturedEvents = [];
      window.posthog = {
        capture: (event, props) => {
          window.capturedEvents.push({ event, props });
        },
        identify: () => {},
        reset: () => {},
      };
    });
    await use(page);
  },
});

// In tests
test('tracks signup event', async ({ page }) => {
  await page.goto('/signup');
  await page.fill('[name=email]', 'test@example.com');
  await page.click('button[type=submit]');

  const events = await page.evaluate(() => window.capturedEvents);
  expect(events).toContainEqual({
    event: 'user_signed_up',
    props: expect.objectContaining({ signup_method: 'email' }),
  });
});
```

---

## 调试

### PostHog 工具栏

```typescript
// Enable toolbar for debugging
posthog.init(key, {
  // ...
  loaded: (posthog) => {
    if (process.env.NODE_ENV === 'development') {
      posthog.debug();
      // Toolbar available via PostHog dashboard
    }
  },
});
```

### 事件调试

```typescript
// Log all events in development
posthog.init(key, {
  _onCapture: (eventName, eventData) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('PostHog Event:', eventName, eventData);
    }
  },
});
```

---

## 快速参考

### 按用户生命周期划分的事件检查清单

```markdown
## Must-Track Events

### Acquisition
- [ ] `page_viewed` (automatic with capture_pageview)
- [ ] `user_signed_up`
- [ ] `user_logged_in`

### Activation
- [ ] `onboarding_started`
- [ ] `onboarding_step_completed`
- [ ] `onboarding_completed`
- [ ] `first_[key_action]` (your "aha moment")

### Engagement
- [ ] `[feature]_used`
- [ ] `[resource]_created`
- [ ] `search_performed`
- [ ] `invite_sent`

### Revenue
- [ ] `pricing_page_viewed`
- [ ] `checkout_started`
- [ ] `subscription_upgraded`
- [ ] `subscription_cancelled`

### Retention
- [ ] `session_started`
- [ ] `feature_[x]_used` (power features)
```

### 仪表板模板

| 项目类型 | 关键仪表板 |
|--------------|----------------|
| **SaaS** | 获客、激活、参与度、留存、收入 |
| **电商** | 转化漏斗、产品表现、客户生命周期价值 |
| **内容** | 内容消费、参与度、增长 |
| **AI/LLM** | 使用情况、质量、成本 |
| **移动应用** | 安装、引导流程、DAU/MAU、崩溃 |

### 始终需要包含的属性

```typescript
// Auto-enriched by PostHog
$current_url
$browser
$device_type
$os

// Add these yourself
user_plan       // 'free' | 'pro' | 'enterprise'
user_role       // 'admin' | 'member'
company_id      // For B2B
feature_context // Where in the app
```