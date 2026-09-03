---
name: youtube-digest
description: This skill should be used when the user asks to "유튜브 정리", "영상 요약", "transcript 번역", "YouTube digest", "영상 퀴즈", or provides a YouTube URL for analysis. Extracts transcript, generates summary/insights/Korean translation, and tests comprehension with 9 quiz questions across 3 difficulty levels. Optional Deep Research for web-based follow-up.
---
# YouTube Digest

YouTube 视频分析 → 生成摘要/洞察/翻译文档 → 测验测试。

## 工作流程

### 1. 收集元数据

```bash
scripts/extract_metadata.sh "<URL>"
```

提取：title, description, channel, upload_date, duration, tags

### 2. 提取 Transcript

```bash
scripts/extract_transcript.sh "<URL>" [output_dir]
```

优先级：手动字幕(ko→en) > 自动生成字幕(ko→en)

### 3. 了解上下文 (WebSearch)

通过网络搜索收集专有名词的准确写法：
- `"{영상 제목}" {채널명} summary`
- `"{발표자명}" {주제 키워드}`

### 4. Transcript 校正

将自动字幕中误识别的专有名词替换为网络搜索结果：
- Kora → Cora, cloud code → Claude Code, every → Every.to

### 5. 生成文档

```markdown
---
title: {영상 제목}
url: {YouTube URL}
channel: {채널명}
date: {업로드 날짜}
duration: {영상 길이}
processed_at: {처리 일시}
---

# {영상 제목}

## 요약
{3-5문장 요약 + 주요 포인트 3개}

## 인사이트
### 핵심 아이디어
### 적용 가능한 점

## 전체 스크립트 (한글 번역)
[00:00] ...
```

### 6. 文件保存

位置：`research/readings/youtube/{YYYY-MM-DD}-{sanitized-title}.md`

### 7. 学习测验

3 个阶段 × 3 道题 = 共 9 道题。通过 AskUserQuestion 同时出每个阶段的 3 道题。

| 阶段 | 难度 | 出题标准 |
|------|--------|----------|
| 1 | 基础 | 核心洞察、主要概念 |
| 2 | 中级 | 洞察 + 细节内容关联 |
| 3 | 进阶 | 细节内容、应用/分析 |

题目类型详情：`references/quiz-patterns.md`

#### 结果处理

针对答错的题目提供正确答案和解析后，在文档末尾追加测验结果：

```markdown
## 퀴즈 결과

총점: 7/9 (78%) | 1단계 3/3 ✅ | 2단계 2/3 | 3단계 2/3

### 오답 노트

**Q5**: {질문}
- 선택: B → 정답: C
- {1-2문장 해설}
```

### 8. 后续选择

测验完成后使用 AskUserQuestion：
- **再测一次**：用其他题目重新测试
- **Deep Research**：网络深度调研（参见 `references/deep-research.md`）
- **结束**：收尾

## 注意事项

### 字幕语言优先级
1. 韩语手动 → 2. 英语手动 → 3. 韩语自动 → 4. 英语自动

### 不完整字幕的处理
- 专有名词误识别：在第 4 步中批量替换
- 无法理解的部分：标记为 `[불명확]`

### yt-dlp 选项
- `--list-subs`：查看字幕列表
- `--cookies-from-browser chrome`：需要登录时使用

## 资源

- `scripts/extract_metadata.sh` - 提取元数据
- `scripts/extract_transcript.sh` - 提取字幕
- `references/quiz-patterns.md` - 测验题目类型详情
- `references/deep-research.md` - Deep Research 工作流程
