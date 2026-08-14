---
name: deep-research
description: "Run autonomous research tasks that plan, search, read, and synthesize information into comprehensive reports."
risk: safe
source: "https://github.com/sanjay3290/ai-skills/tree/main/skills/deep-research"
date_added: "2026-02-27"
---
# Gemini 深度研究 Skill

运行自主研究任务，对信息进行规划、搜索、阅读和综合，生成全面的报告。

## 何时使用此 Skill

在以下情况下使用此 Skill：
- 执行市场分析
- 开展竞争格局分析
- 创建文献综述
- 进行技术研究
- 执行尽职调查
- 需要详细且带引用的研究报告

## 要求

- Python 3.8+
- httpx：`pip install -r requirements.txt`
- GEMINI_API_KEY 环境变量

## 设置

1. 从 [Google AI Studio](https://aistudio.google.com/) 获取 Gemini API 密钥
2. 设置环境变量：
   ```bash
   export GEMINI_API_KEY=your-api-key-here
   ```
   或在 Skill 目录中创建 `.env` 文件。

## 用法

### 启动研究任务
```bash
python3 scripts/research.py --query "Research the history of Kubernetes"
```

### 使用结构化输出格式
```bash
python3 scripts/research.py --query "Compare Python web frameworks" \
  --format "1. Executive Summary\n2. Comparison Table\n3. Recommendations"
```

### 实时流式输出进度
```bash
python3 scripts/research.py --query "Analyze EV battery market" --stream
```

### 启动但不等待
```bash
python3 scripts/research.py --query "Research topic" --no-wait
```

### 检查正在运行的研究任务状态
```bash
python3 scripts/research.py --status <interaction_id>
```

### 等待任务完成
```bash
python3 scripts/research.py --wait <interaction_id>
```

### 接续之前的研究
```bash
python3 scripts/research.py --query "Elaborate on point 2" --continue <interaction_id>
```

### 列出最近的研究任务
```bash
python3 scripts/research.py --list
```

## 输出格式

- **默认**：便于阅读的 Markdown 报告
- **JSON**（`--json`）：供程序使用的结构化数据
- **原始格式**（`--raw`）：未经处理的 API 响应

## 成本和时间

| 指标 | 值 |
|--------|-------|
| 时间 | 每项任务 2-10 分钟 |
| 成本 | 每项任务 $2-5（因复杂程度而异） |
| Token 用量 | 输入约 250k-900k，输出约 60k-80k |

## 最佳使用场景

- 市场分析和竞争格局分析
- 技术文献综述
- 尽职调查研究
- 历史研究和时间线梳理
- 比较分析（框架、产品、技术）

## 工作流程

1. 用户提出研究请求 → 运行 `--query "..."`
2. 告知用户预计所需时间（2-10 分钟）
3. 使用 `--stream` 监控，或使用 `--status` 轮询
4. 返回格式化后的结果
5. 使用 `--continue` 处理后续问题

## 退出代码

- **0**：成功
- **1**：错误（API 错误、配置问题、超时）
- **130**：用户取消（Ctrl+C）