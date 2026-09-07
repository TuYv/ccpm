---
name: chatgpt-search
description: |
  Search ChatGPT and extract the full response + hydration JSON that powers the UI.
  Attaches to a running Chrome instance (port 9222 by default), opens ChatGPT,
  submits a query, waits for the streamed response, and returns structured data:
  messages, product cards, hydration JSON, and API calls.
  Use when asked to "search chatgpt", "ask chatgpt", "chatgpt search",
  "get chatgpt response", or "scrape chatgpt".
allowed-tools: Browser,Bash,Read,Write,Glob,Grep
---
# ChatGPT Search — 提取结构化响应 + hydration JSON

## 前置条件

必须有一个 Chrome 实例以 `--remote-debugging-port=9222` 运行。
如果尚未运行，按以下方式启动：

```bash
# Kill existing Chrome first
pkill -9 -f "Google Chrome" 2>/dev/null; sleep 2

# Launch with debug port + user's real profile copy
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.claude/browser-profiles/chrome-debug-full" \
  --no-first-run &>/dev/null &
```

如果该配置目录尚不存在，通过复制用户真实的 Chrome 配置文件来创建：
```bash
REAL="$HOME/Library/Application Support/Google/Chrome"
COPY="$HOME/.claude/browser-profiles/chrome-debug-full"
mkdir -p "$COPY"
cp "$REAL/Local State" "$COPY/" 2>/dev/null
cp -R "$REAL/Default" "$COPY/Default" 2>/dev/null
rm -rf "$COPY/Default/Cache" "$COPY/Default/Code Cache" 2>/dev/null
```

## 工作流程

用户提供一个搜索查询。执行以下步骤：

### 第 1 步：验证 Chrome 已带调试端口运行

```bash
curl -s http://127.0.0.1:9222/json/version | head -1
```

如果失败，按“前置条件”中描述的方式启动 Chrome。

### 第 2 步：附加 + 启用网络日志 + 打开 ChatGPT

```
Browser { action: "new_session", session_id: "chatgpt", cdp_url: "http://127.0.0.1:9222" }
Browser { action: "enable_network_log", session_id: "chatgpt" }
Browser { action: "new_tab", url: "https://chatgpt.com", session_id: "chatgpt" }
```

等待 5 秒让页面加载。

### 第 3 步：注入 fetch/SSE 拦截器

```
Browser { action: "evaluate", session_id: "chatgpt", value: "window.__sse=[];window.__api=[];const _f=window.fetch;window.fetch=async function(...a){const url=typeof a[0]==='string'?a[0]:a[0]?.url||'?';const m=a[1]?.method||'GET';const rb=a[1]?.body;const resp=await _f.apply(this,a);const ct=resp.headers.get('content-type')||'';const cl=resp.clone();if(ct.includes('event-stream')){const rd=cl.body.getReader();const dc=new TextDecoder();let full='';(async()=>{try{while(true){const{done,value:v}=await rd.read();if(done)break;full+=dc.decode(v,{stream:true});}}catch{}window.__sse.push({url,m,s:resp.status,sz:full.length,body:full,ts:Date.now()});})();}else{cl.text().then(t=>{if(t.length>30)window.__api.push({url,m,s:resp.status,sz:t.length,body:t,ts:Date.now()});}).catch(()=>{});}return resp;};'ok'" }
```

### 第 4 步：输入查询 + 提交

使用真实的 CDP 按键事件以保证 React 兼容性：

```
Browser { action: "click", selector: "#prompt-textarea, textarea", session_id: "chatgpt" }
```

然后使用 `send_keys` 逐个字符输入查询 —— 但对于较长的查询，请配合原生 setter 使用 `evaluate`：

```
Browser { action: "evaluate", session_id: "chatgpt", value: "Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(document.querySelector('#prompt-textarea,textarea'),'THE QUERY HERE');document.querySelector('#prompt-textarea,textarea').dispatchEvent(new Event('input',{bubbles:true}));'typed'" }
```

等待 800 毫秒，然后提交：

```
Browser { action: "evaluate", session_id: "chatgpt", value: "(function(){var btn=document.querySelector('[data-testid=\"send-button\"],button[aria-label*=\"Envoyer\"],button[aria-label*=\"Send\"]');if(btn&&!btn.disabled){btn.click();return 'sent';}var btns=[...document.querySelectorAll('button')];var s=btns.find(function(b){return b.querySelector('svg')&&!b.disabled&&b.closest('[class*=\"composer\"]');});if(s){s.click();return 'sent-svg';}return 'no-btn';})()" }
```

### 第 5 步：等待响应

每 5 秒轮询一次，最长 60 秒，检查消息数量：

```
Browser { action: "evaluate", session_id: "chatgpt", value: "document.querySelectorAll('[data-message-author-role]').length" }
```

当消息数量 >= 2（用户 + 助手）时停止。

### 第 6 步：提取结果

**消息（用户 + 助手完整文本）：**
```
Browser { action: "evaluate", session_id: "chatgpt", value: "(function(){var msgs=document.querySelectorAll('[data-message-author-role]');var r=[];msgs.forEach(function(m){r.push({role:m.getAttribute('data-message-author-role'),text:m.textContent.trim()})});return JSON.stringify(r);})()" }
```

**Hydration JSON（会话、配置、功能开关）：**
```
Browser { action: "evaluate", session_id: "chatgpt", value: "var e=document.querySelector('script[type=\"application/json\"]');e?e.textContent:''" }
```

**拦截到的 SSE 流（对话流 + 搜索产品更新）：**
```
Browser { action: "evaluate", session_id: "chatgpt", value: "JSON.stringify((window.__sse||[]).map(function(s){return{url:s.url,method:s.m,status:s.s,size:s.sz}}))" }
```

要获取某条特定 SSE 的正文（例如索引 0）：
```
Browser { action: "evaluate", session_id: "chatgpt", value: "(window.__sse||[])[0]?.body||''" }
```

**拦截到的 API 调用：**
```
Browser { action: "evaluate", session_id: "chatgpt", value: "JSON.stringify((window.__api||[]).filter(function(a){return a.url.includes('backend')}).map(function(a){return{url:a.url,method:a.m,status:a.s,size:a.sz}}))" }
```

**CDP 网络日志（所有 HTTP 请求/响应）：**
```
Browser { action: "get_network_log", session_id: "chatgpt", filter: "backend" }
```

### 第 7 步：保存到 /tmp

将所有提取的数据保存到 `/tmp/chatgpt-search-*.json`：
- `/tmp/chatgpt-search-messages.json` — 用户 + 助手消息
- `/tmp/chatgpt-search-hydration.json` — UI hydration JSON
- `/tmp/chatgpt-search-sse.json` — SSE 流数据（如已捕获）
- `/tmp/chatgpt-search-api.json` — API 调用响应

### 第 8 步：报告

将助手的回复呈现给用户，并列出已保存的文件及其大小。

## 输出格式

```
## ChatGPT Search: [query]

### Response
[Full assistant message text]

### Files saved
- /tmp/chatgpt-search-messages.json (X KB) — conversation messages
- /tmp/chatgpt-search-hydration.json (X KB) — UI hydration data
- /tmp/chatgpt-search-sse.json (X KB) — SSE streams
- /tmp/chatgpt-search-api.json (X KB) — API responses

### Metadata
- Model: [from hydration or conversation init]
- Session ID: [from hydration]
- Country: [from hydration]
```

## 重要说明

- 对于基本查询，ChatGPT 无需登录即可使用（匿名模式）
- 对于需要登录的查询，用户必须在调试用的 Chrome 中手动登录
- fetch 拦截器会捕获 SSE 流（conversation + search/product_update）
- CDP 网络日志会捕获 JSON API 调用，但不会（NOT）捕获 SSE 流正文
- 完成后务必关闭会话：`Browser { action: "close_session", session_id: "chatgpt" }`
