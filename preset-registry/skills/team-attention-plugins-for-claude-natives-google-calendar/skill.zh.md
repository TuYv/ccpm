---
name: google-calendar
description: Google 캘린더 일정 조회/생성/수정/삭제. "오늘 일정", "이번 주 일정", "미팅 추가해줘" 요청에 사용. 여러 계정(work, personal) 통합 조회 지원.
---
# Google Calendar Sync

## 概述

一次性查询多个 Google 账号（公司、个人等）的日历，提供整合后的日程。
- 使用预先完成认证的 refresh token（无需每次登录）
- 通过 Subagent 并行执行实现快速查询
- 检测账号之间的日程冲突

## 触发条件

### 查询
- “今天日程”、“告诉我这周的日程”
- “查看日历”、“日程是什么”
- “下一个会议”、“明天有什么”
- “帮我确认日程冲突”

### 创建
- “帮我创建新日程”、“帮我添加会议”
- “帮我约明天 3 点开会”
- “下周一创建团队会议”

### 修改
- “帮我更改日程时间”、“帮我调整会议时间”
- “把 sync 会议改到 14 点 21 分”
- “帮我修改会议标题”

### 删除
- “帮我删除日程”、“帮我取消会议”
- “帮我删掉活动”

## 前置要求

### 1. Google Cloud 项目设置

1. 在 [Google Cloud Console](https://console.cloud.google.com) 中创建项目
2. 启用 Calendar API
3. 创建 OAuth 2.0 Client ID（Desktop 类型）
4. 下载 `credentials.json` → 保存到 `references/credentials.json`

### 2. 各账号认证（仅首次一次）

```bash
# 회사 계정
uv run python .claude/skills/google-calendar/scripts/setup_auth.py --account work

# 개인 계정
uv run python .claude/skills/google-calendar/scripts/setup_auth.py --account personal
```

在浏览器中登录 Google → refresh token 将保存到 `accounts/{name}.json`

## 工作流程

### 1. 确认已注册的账号

```bash
ls .claude/skills/google-calendar/accounts/
# → work.json, personal.json
```

### 2. Subagent 并行执行

针对每个账号**并行**调用 Task 工具：

```python
# 병렬 실행 - 단일 메시지에 여러 Task 호출
Task(subagent_type="general-purpose", prompt="fetch calendar for work account")
Task(subagent_type="general-purpose", prompt="fetch calendar for personal account")
```

每个 subagent 执行以下命令：
```bash
uv run python .claude/skills/google-calendar/scripts/fetch_events.py \
  --account {account_name} \
  --days 7
```

### 3. 整合结果

- 将所有账号的活动按时间排序
- 同一时间段的活动 = 标记为冲突
- 按账号用颜色/图标区分

## 输出格式

```
📅 2026-01-06 (월) 일정

[09:00-10:00] 🔵 팀 스탠드업 (work)
[10:00-11:30] 🟢 치과 예약 (personal)
[14:00-15:00] 🔵 고객 미팅 - 삼양 (work)
              ⚠️ 충돌: 개인 일정과 겹침
[14:00-14:30] 🟢 은행 방문 (personal)

📊 오늘 총 4개 일정 (work: 2, personal: 2)
   ⚠️ 1건 충돌
```

## 执行示例

用户：“告诉我这周的日程”

```
1. accounts/ 폴더 확인
   └── 등록된 계정: work, personal

2. Subagent 병렬 실행
   ├── Task: work 계정 이벤트 조회
   └── Task: personal 계정 이벤트 조회

3. 결과 수집 (각 subagent 완료 대기)
   ├── work: 8개 이벤트
   └── personal: 3개 이벤트

4. 통합 및 정렬
   └── 11개 이벤트, 2건 충돌 감지

5. 출력
   └── 일별로 그룹화하여 표시
```

## 错误处理

| 情况 | 处理方式 |
|------|------|
| accounts/ 文件夹为空 | 引导初始设置（如何运行 setup_auth.py） |
| 特定账号 token 过期 | 引导重新认证该账号，其余账号正常查询 |
| API 配额超限 | 提示稍后重试 |
| 网络错误 | 请求检查网络连接 |

## 脚本

| 文件 | 用途 |
|------|------|
| `scripts/setup_auth.py` | 各账号 OAuth 认证及 token 存储 |
| `scripts/fetch_events.py` | 查询特定账号的活动（CLI） |
| `scripts/manage_events.py` | 创建/修改/删除活动（CLI） |
| `scripts/calendar_client.py` | Google Calendar API 客户端库 |

## 日程管理（创建/修改/删除）

### 创建日程

```bash
uv run python .claude/skills/google-calendar/scripts/manage_events.py create \
    --summary "팀 미팅" \
    --start "2026-01-06T14:00:00" \
    --end "2026-01-06T15:00:00" \
    --account work
```

### 创建全天日程

```bash
uv run python .claude/skills/google-calendar/scripts/manage_events.py create \
    --summary "연차" \
    --start "2026-01-10" \
    --end "2026-01-11" \
    --account personal
```

### 修改日程

```bash
uv run python .claude/skills/google-calendar/scripts/manage_events.py update \
    --event-id "abc123" \
    --summary "팀 미팅 (변경)" \
    --start "2026-01-06T14:21:00" \
    --account work
```

### 删除日程

```bash
uv run python .claude/skills/google-calendar/scripts/manage_events.py delete \
    --event-id "abc123" \
    --account work
```

### 选项

| 选项 | 说明 |
|------|------|
| `--summary` | 日程标题 |
| `--start` | 开始时间（ISO 格式：2026-01-06T14:00:00 或 2026-01-06） |
| `--end` | 结束时间 |
| `--description` | 日程描述 |
| `--location` | 地点 |
| `--attendees` | 参会者邮箱（逗号分隔） |
| `--account` | 账号（work、personal 等） |
| `--adc` | 使用 gcloud ADC |
| `--timezone` | 时区（默认值：Asia/Seoul） |
| `--json` | 以 JSON 格式输出 |

## 参考资料

| 文档 | 内容 |
|------|------|
| `references/setup.md` | 初始设置详细指南 |
| `references/credentials.json` | Google OAuth Client ID（gitignore） |

## 文件结构

```
.claude/skills/google-calendar/
├── SKILL.md                    # 이 파일
├── scripts/
│   ├── calendar_client.py      # API 클라이언트
│   ├── setup_auth.py           # 인증 설정
│   ├── fetch_events.py         # 이벤트 조회 CLI
│   └── manage_events.py        # 이벤트 생성/수정/삭제 CLI
├── references/
│   ├── setup.md                # 설정 가이드
│   └── credentials.json        # OAuth Client ID (gitignore)
└── accounts/                   # 계정별 토큰 (gitignore)
    ├── work.json
    └── personal.json
```

## 安全注意事项

- `accounts/*.json`：包含 refresh token，绝对禁止提交
- `references/credentials.json`：包含 Client Secret，禁止提交
- 必须添加到 `.gitignore`
