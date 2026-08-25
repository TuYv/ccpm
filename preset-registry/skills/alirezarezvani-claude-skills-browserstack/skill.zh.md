---
name: "browserstack"
description: >-
  Run tests on BrowserStack. Use when user mentions "browserstack",
  "cross-browser", "cloud testing", "browser matrix", "test on safari",
  "test on firefox", or "browser compatibility".
---
# BrowserStack 集成

在 BrowserStack 的云端网格上运行 Playwright 测试，以进行跨浏览器和跨设备测试。

## 前置条件

必须设置环境变量：
- `BROWSERSTACK_USERNAME` — 你的 BrowserStack 用户名
- `BROWSERSTACK_ACCESS_KEY` — 你的访问密钥

如果未设置，请告知用户如何从 [browserstack.com/accounts/settings](https://www.browserstack.com/accounts/settings) 获取这些变量，然后停止。

> **BrowserStack MCP 服务器不会自动注册（问题 #978）。**
> 由于 `pw-browserstack` 对每位用户都连接失败（插件未提供
> `node_modules`），因此已从插件的 `.mcp.json` 中移除。下文使用的
> `browserstack_*` MCP 工具以及 `/pw:browserstack` 命令，在手动启用之前都会失败并显示“找不到工具”——请参阅插件 `CLAUDE.md` 中的 **Integrations** 部分（执行 `cd integrations/browserstack-mcp && npm install`，然后在你自己的用户级/项目级 MCP 配置中注册该服务器）。仅设置环境变量是不够的。

## 功能

### 1. 配置 BrowserStack

```
/pw:browserstack setup
```

步骤：
1. 检查当前的 `playwright.config.ts`
2. 添加 BrowserStack 连接选项：

```typescript
// Add to playwright.config.ts
import { defineConfig } from '@playwright/test';

const isBS = !!process.env.BROWSERSTACK_USERNAME;

export default defineConfig({
  // ... existing config
  projects: isBS ? [
    {
      name: "chromelatestwindows-11",
      use: {
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
            'browser': 'chrome',
            'browser_version': 'latest',
            'os': 'Windows',
            'os_version': '11',
            'browserstack.username': process.env.BROWSERSTACK_USERNAME,
            'browserstack.accessKey': process.env.BROWSERSTACK_ACCESS_KEY,
          }))}`,
        },
      },
    },
    {
      name: "firefoxlatestwindows-11",
      use: {
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
            'browser': 'playwright-firefox',
            'browser_version': 'latest',
            'os': 'Windows',
            'os_version': '11',
            'browserstack.username': process.env.BROWSERSTACK_USERNAME,
            'browserstack.accessKey': process.env.BROWSERSTACK_ACCESS_KEY,
          }))}`,
        },
      },
    },
    {
      name: "webkitlatestos-x-ventura",
      use: {
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify({
            'browser': 'playwright-webkit',
            'browser_version': 'latest',
            'os': 'OS X',
            'os_version': 'Ventura',
            'browserstack.username': process.env.BROWSERSTACK_USERNAME,
            'browserstack.accessKey': process.env.BROWSERSTACK_ACCESS_KEY,
          }))}`,
        },
      },
    },
  ] : [
    // ... local projects fallback
  ],
});
```

3. 添加 npm 脚本：`"test:e2e:cloud": "npx playwright test --project='chrome@*' --project='firefox@*' --project='webkit@*'"`

### 2. 在 BrowserStack 上运行测试

```
/pw:browserstack run
```

步骤：
1. 验证凭据已设置
2. 使用 BrowserStack 项目运行测试：
   ```bash
   BROWSERSTACK_USERNAME=$BROWSERSTACK_USERNAME \
   BROWSERSTACK_ACCESS_KEY=$BROWSERSTACK_ACCESS_KEY \
   npx playwright test --project='chrome@*' --project='firefox@*'
   ```
3. 监控执行过程
4. 按浏览器报告结果

### 3. 获取构建结果

```
/pw:browserstack results
```

步骤：
1. 调用 `browserstack_get_builds` MCP 工具
2. 获取最新构建的会话
3. 对于每个会话：
   - 状态（通过/失败）
   - 浏览器和操作系统
   - 持续时间
   - 视频 URL
   - 日志 URL
4. 格式化为摘要表格

### 4. 检查可用浏览器

```
/pw:browserstack browsers
```

步骤：
1. 调用 `browserstack_get_browsers` MCP 工具
2. 筛选与 Playwright 兼容的浏览器
3. 显示可用的浏览器/操作系统组合

### 5. 本地测试

```
/pw:browserstack local
```

用于测试 localhost 或防火墙后面的 staging 环境：
1. 安装 BrowserStack Local：`npm install -D browserstack-local`
2. 将本地隧道添加到配置中
3. 提供设置说明

## 使用的 MCP 工具

| 工具 | 使用时机 |
|---|---|
| `browserstack_get_plan` | 检查账户限制 |
| `browserstack_get_browsers` | 列出可用浏览器 |
| `browserstack_get_builds` | 列出最近的构建 |
| `browserstack_get_sessions` | 获取构建中的会话 |
| `browserstack_get_session` | 获取会话详情（视频、日志） |
| `browserstack_update_session` | 标记通过/失败 |
| `browserstack_get_logs` | 获取文本/网络日志 |

## 输出

- 跨浏览器测试结果表格
- 每个浏览器的通过/失败状态
- 指向 BrowserStack 控制面板中视频/屏幕截图的链接
- 突出显示任何特定于浏览器的失败原因