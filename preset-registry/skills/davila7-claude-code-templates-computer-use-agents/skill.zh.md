---
name: computer-use-agents
description: "Build AI agents that interact with computers like humans do - viewing screens, moving cursors, clicking buttons, and typing text. Covers Anthropic's Computer Use, OpenAI's Operator/CUA, and open-source alternatives. Critical focus on sandboxing, security, and handling the unique challenges of vision-based control. Use when: computer use, desktop automation agent, screen control AI, vision-based agent, GUI automation."
source: vibeship-spawner-skills (Apache 2.0)
---
# 计算机使用智能体

## 模式

### 感知-推理-行动循环

计算机使用智能体的基础架构：观察屏幕、推理下一步行动、执行行动，然后重复。该循环通过迭代式流水线将视觉模型与行动执行相结合。

关键组成部分：
1. 感知：截取屏幕截图以捕获当前屏幕状态
2. 推理：视觉语言模型进行分析和规划
3. 行动：执行鼠标/键盘操作
4. 反馈：观察结果，继续执行或进行纠正

关键洞察：视觉智能体在“思考”阶段（1-5 秒）会完全静止，从而形成可检测的暂停模式。


**适用场景**：['从零开始构建任何计算机使用智能体', '将视觉模型与桌面控制集成', '理解智能体的行为模式']

```python
from anthropic import Anthropic
from PIL import Image
import base64
import pyautogui
import time

class ComputerUseAgent:
    """
    Perception-Reasoning-Action loop implementation.
    Based on Anthropic Computer Use patterns.
    """

    def __init__(self, client: Anthropic, model: str = "claude-sonnet-4-20250514"):
        self.client = client
        self.model = model
        self.max_steps = 50  # Prevent runaway loops
        self.action_delay = 0.5  # Seconds between actions

    def capture_screenshot(self) -> str:
        """Capture screen and return base64 encoded image."""
        screenshot = pyautogui.screenshot()
        # Resize for token efficiency (1280x800 is good balance)
        screenshot = screenshot.resize((1280, 800), Image.LANCZOS)

        import io
        buffer = io.BytesIO()
        screenshot.save(buffer, format="PNG")
        return base64.b64encode(buffer.getvalue()).decode()

    def execute_action(self, action: dict) -> dict:
        """Execute mouse/keyboard action on the computer."""
        action_type = action.get("type")

        if action_type == "click":
            x, y = action["x"], action["y"]
            button = action.get("button", "left")
            pyautogui.click(x, y, button=button)
            return {"success": True, "action": f"clicked at ({x}, {y})"}

        elif action_type == "type":
            text = action["text"]
            pyautogui.typewrite(text, interval=0.02)
            return {"success": True, "action": f"typed {len(text)} chars"}

        elif action_type == "key":
            key = action["key"]
            pyautogui.press(key)
            return {"success": True, "action": f"pressed {key}"}

        elif action_type == "scroll":
            direction = action.get("direction", "down")
            amount = action.get("amount", 3)
            scroll = -amount if direction == "down" else amount
            pyautogui.scroll(scroll)
            return {"success": True, "action": f"scrolled {dir
```

### 沙箱环境模式

计算机使用智能体必须在隔离的沙箱环境中运行。切勿让智能体直接访问你的主系统——这样做的安全风险过高。请使用带有虚拟桌面的 Docker 容器。

关键隔离要求：
1. 网络：仅允许访问必要的端点
2. 文件系统：只读或仅限于临时目录
3. 凭据：不得访问主机凭据
4. 系统调用：过滤危险的系统调用
5. 资源：限制 CPU、内存和运行时间

目标是“最小化爆炸半径”——如果智能体出现问题，
造成的损害会被限制在沙箱内。


**何时使用**：['部署任何计算机使用智能体', '安全地测试智能体行为', '运行不受信任的自动化任务']

```python
# Dockerfile for sandboxed computer use environment
# Based on Anthropic's reference implementation pattern

FROM ubuntu:22.04

# Install desktop environment
RUN apt-get update && apt-get install -y \
    xvfb \
    x11vnc \
    fluxbox \
    xterm \
    firefox \
    python3 \
    python3-pip \
    supervisor

# Security: Create non-root user
RUN useradd -m -s /bin/bash agent && \
    mkdir -p /home/agent/.vnc

# Install Python dependencies
COPY requirements.txt /tmp/
RUN pip3 install -r /tmp/requirements.txt

# Security: Drop capabilities
RUN apt-get install -y --no-install-recommends libcap2-bin && \
    setcap -r /usr/bin/python3 || true

# Copy agent code
COPY --chown=agent:agent . /app
WORKDIR /app

# Supervisor config for virtual display + VNC
COPY supervisord.conf /etc/supervisor/conf.d/

# Expose VNC port only (not desktop directly)
EXPOSE 5900

# Run as non-root
USER agent

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

---

# docker-compose.yml with security constraints
version: '3.8'

services:
  computer-use-agent:
    build: .
    ports:
      - "5900:5900"  # VNC for observation
      - "8080:8080"  # API for control

    # Security constraints
    security_opt:
      - no-new-privileges:true
      - seccomp:seccomp-profile.json

    # Resource limits
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '0.5'
          memory: 1G

    # Network isolation
    networks:
      - agent-network

    # No access to host filesystem
    volumes:
      - agent-tmp:/tmp

    # Read-only root filesystem
    read_only: true
    tmpfs:
      - /run
      - /var/run

    # Environment
    environment:
      - DISPLAY=:99
      - NO_PROXY=localhost

networks:
  agent-network:
    driver: bridge
    internal: true  # No internet by default

volumes:
  agent-tmp:

---

# Python wrapper with additional runtime sandboxing
import subprocess
import os
from dataclasses im
```

### Anthropic 计算机使用实现

使用 Claude 计算机使用能力的官方实现模式。
Claude 3.5 Sonnet 是首个提供计算机使用能力的前沿模型。
Claude Opus 4.5 现在是“全球最擅长计算机使用的模型”。

关键能力：
- screenshot：捕获当前屏幕状态
- mouse：执行点击、移动和拖拽操作
- keyboard：输入文本、按下按键
- bash：运行 shell 命令
- text_editor：查看和编辑文件

工具版本：
- computer_20251124（Opus 4.5）：新增缩放操作，以便进行详细检查
- computer_20250124（所有其他模型）：标准能力

关键限制：“某些 UI 元素（例如下拉菜单和滚动条）可能难以由 Claude 操作”——Anthropic 文档


**适用场景**：['构建生产级计算机使用智能体', '需要最高质量的视觉理解能力', '需要完整的桌面控制（而不仅仅是浏览器）']

```python
from anthropic import Anthropic
from anthropic.types.beta import (
    BetaToolComputerUse20241022,
    BetaToolBash20241022,
    BetaToolTextEditor20241022,
)
import subprocess
import base64
from PIL import Image
import io

class AnthropicComputerUse:
    """
    Official Anthropic Computer Use implementation.

    Requires:
    - Docker container with virtual display
    - VNC for viewing agent actions
    - Proper tool implementations
    """

    def __init__(self):
        self.client = Anthropic()
        self.model = "claude-sonnet-4-6"  # Best for computer use
        self.screen_size = (1280, 800)

    def get_tools(self) -> list:
        """Define computer use tools."""
        return [
            BetaToolComputerUse20241022(
                type="computer_20241022",
                name="computer",
                display_width_px=self.screen_size[0],
                display_height_px=self.screen_size[1],
            ),
            BetaToolBash20241022(
                type="bash_20241022",
                name="bash",
            ),
            BetaToolTextEditor20241022(
                type="text_editor_20241022",
                name="str_replace_editor",
            ),
        ]

    def execute_tool(self, name: str, input: dict) -> dict:
        """Execute a tool and return result."""

        if name == "computer":
            return self._handle_computer_action(input)
        elif name == "bash":
            return self._handle_bash(input)
        elif name == "str_replace_editor":
            return self._handle_editor(input)
        else:
            return {"error": f"Unknown tool: {name}"}

    def _handle_computer_action(self, input: dict) -> dict:
        """Handle computer control actions."""
        action = input.get("action")

        if action == "screenshot":
            # Capture via xdotool/scrot
            subprocess.run(["scrot", "/tmp/screenshot.png"])

            with open("/tmp/screenshot.png", "rb") as f:
            
```

## ⚠️ 易踩坑点

| 问题 | 严重程度 | 解决方案 |
|-------|----------|----------|
| 问题 | 严重 | ## 纵深防御——不存在单一有效的解决方案 |
| 问题 | 中等 | ## 为操作增加类似人类行为的变化 |
| 问题 | 高 | ## 尽可能使用键盘替代方案 |
| 问题 | 中等 | ## 接受这种权衡 |
| 问题 | 高 | ## 实现上下文管理 |
| 问题 | 高 | ## 监控并限制成本 |
| 问题 | 严重 | ## 始终使用沙箱 |