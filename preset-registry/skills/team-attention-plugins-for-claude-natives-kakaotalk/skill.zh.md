---
name: kakaotalk
description: This skill should be used when the user asks to "카톡 보내줘", "카카오톡 메시지", "KakaoTalk message", "채팅 읽어줘", "~에게 메시지 보내줘", or needs to send/read messages via KakaoTalk on macOS.
version: 2.0.0
---
# KakaoTalk CLI

在 macOS 上通过 CLI 读取和发送 KakaoTalk 消息的技能。

## 触发词

- “KakaoTalk 消息”、“帮我读一下 KakaoTalk”、“给~发消息”

## 脚本结构

| 文件 | 用途 |
|------|------|
| `kakao_read.py` | 搜索、打开聊天室，读取消息 |
| `kakao_send.py` | 发送消息 |

---

## 消息发送工作流程

### Step 1: 打开聊天室并读取对话记录

使用目标名称打开聊天室并读取对话记录：

```bash
uv run python .claude/skills/kakaotalk/scripts/kakao_read.py "대상이름" --json
```

**输出示例：**
```json
{
  "chat_name": "구봉",
  "messages": [
    {"sender": "나", "text": "오늘 저녁 뭐 먹을까?", "time": "오후 3:24"},
    {"sender": "구봉", "text": "파스타 어때?", "time": "오후 3:45"}
  ]
}
```

**分析消息时的注意事项：**
- 数组末尾是最新消息（越新价值越高）
- 超过一周的内容，情况可能已经发生变化
- 撰写能自然衔接最近对话主题的消息

### Step 2: 掌握上下文后撰写消息

基于读取到的对话记录：
1. 了解最近的对话脉络
2. 撰写符合用户请求的消息草稿
3. 组织自然且贴合上下文的内容

### Step 3: 用户确认（必需）

**先以文本形式展示消息内容**，再用 AskUserQuestion 进行确认：

```
[텍스트 출력]
**최근 대화 요약:**
- {최근 대화 내용 요약}

**보낼 메시지:**
받는 사람: {채팅방}
---
{메시지 내용}

sent with claude code
---

[AskUserQuestion]
질문: "이 메시지를 보낼까요?"
옵션: ["보내기", "수정 필요"]
```

### Step 4: 发送

用户确认后发送消息：

```bash
uv run python .claude/skills/kakaotalk/scripts/kakao_send.py "채팅방이름" "메시지"
```

---

## 仅读取消息的工作流程

只需查看对话记录时：

```bash
uv run python .claude/skills/kakaotalk/scripts/kakao_read.py "대상이름" --json
```

读取后向用户提供摘要：
- 摘要最近 2-3 条对话
- 当前正在进行的对话主题
- 是否有需要回复的内容

---

## CLI 选项参考

### kakao_read.py

```bash
# 기본: 채팅방 열고 메시지 읽기
kakao_read.py "채팅방이름" [--limit N] [--json]

# 채팅 목록
kakao_read.py --list [--json]

# 검색
kakao_read.py --search "검색어" [--json]

# 읽고 창 닫기
kakao_read.py "채팅방이름" --close
```

### kakao_send.py

```bash
# 기본 (서명 포함)
kakao_send.py "채팅방" "메시지"
# → "메시지\n\nsent with claude code"

# 서명 없이
kakao_send.py "채팅방" "메시지" --no-signature

# 보내고 창 닫기
kakao_send.py "채팅방" "메시지" --close
```

---

## 示例场景

### “建议发送给구봉的消息”

```
[Step 1] 채팅방 열고 읽기
uv run python .../kakao_read.py "구봉" --json

[Step 2] 맥락 파악
최근 대화: 저녁 메뉴 논의 중

[Step 3] 메시지 제안
"파스타 좋아! 오늘 7시에 만날까?"

[Step 4] 사용자 확인 후 발송
```

---

## 环境要求

1. **安装 atomacos**：`uv add atomacos`
2. **辅助功能（Accessibility）权限**：在 System Settings > Privacy & Security > Accessibility 中允许 Terminal
3. **KakaoTalk 运行中**：macOS 版 KakaoTalk 应用处于运行状态
