---
name: temporal-python-testing
description: Test Temporal workflows with pytest, time-skipping, and mocking strategies. Covers unit testing, integration testing, replay testing, and local development setup. Use when implementing Temporal workflow tests or debugging test failures.
---
# Temporal Python 测试策略

使用 pytest 对 Temporal 工作流进行全面测试的方法，以及针对特定测试场景的渐进式披露资源。

## 何时使用此技能

- **工作流单元测试** - 借助时间跳跃实现快速测试
- **集成测试** - 使用模拟活动的工作流
- **重放测试** - 根据生产历史验证确定性
- **本地开发** - 搭建 Temporal 服务器和 pytest
- **CI/CD 集成** - 自动化测试流水线
- **覆盖率策略** - 实现 ≥80% 的测试覆盖率

## 测试理念

**推荐方法**（来源：docs.temporal.io/develop/python/testing-suite）：

- 大部分写成集成测试
- 使用 pytest 配合异步 fixture
- 时间跳跃可实现快速反馈（长达一个月的工作流 → 数秒完成）
- 模拟活动以隔离工作流逻辑
- 通过重放测试验证确定性

**三种测试类型**：

1. **单元测试**：使用时间跳跃的工作流，使用 ActivityEnvironment 的活动
2. **集成测试**：使用模拟活动的 Worker
3. **端到端测试**：搭配真实活动的完整 Temporal 服务器（慎用）

## 可用资源

此技能通过渐进式披露提供详细指导。请根据你的测试需求加载特定资源：

### 单元测试资源

**文件**：`resources/unit-testing.md`
**加载时机**：隔离测试单个工作流或活动
**包含内容**：

- 带时间跳跃的 WorkflowEnvironment
- 用于活动测试的 ActivityEnvironment
- 长时间运行工作流的快速执行
- 手动推进时间的模式
- pytest fixture 与模式

### 集成测试资源

**文件**：`resources/integration-testing.md`
**加载时机**：使用模拟的外部依赖测试工作流
**包含内容**：

- 活动模拟策略
- 错误注入模式
- 多活动工作流测试
- 信号与查询测试
- 覆盖率策略

### 重放测试资源

**文件**：`resources/replay-testing.md`
**加载时机**：验证确定性或部署工作流变更
**包含内容**：

- 确定性验证
- 生产历史重放
- CI/CD 集成模式
- 版本兼容性测试

### 本地开发资源

**文件**：`resources/local-setup.md`
**加载时机**：搭建开发环境
**包含内容**：

- Docker Compose 配置
- pytest 安装与配置
- 覆盖率工具集成
- 开发工作流

## 快速入门指南

### 基本工作流测试

```python
import pytest
from temporalio.testing import WorkflowEnvironment
from temporalio.worker import Worker

@pytest.fixture
async def workflow_env():
    env = await WorkflowEnvironment.start_time_skipping()
    yield env
    await env.shutdown()

@pytest.mark.asyncio
async def test_workflow(workflow_env):
    async with Worker(
        workflow_env.client,
        task_queue="test-queue",
        workflows=[YourWorkflow],
        activities=[your_activity],
    ):
        result = await workflow_env.client.execute_workflow(
            YourWorkflow.run,
            args,
            id="test-wf-id",
            task_queue="test-queue",
        )
        assert result == expected
```

### 基本活动测试

```python
from temporalio.testing import ActivityEnvironment

async def test_activity():
    env = ActivityEnvironment()
    result = await env.run(your_activity, "test-input")
    assert result == expected_output
```

## 覆盖率目标

**推荐覆盖率**（来源：docs.temporal.io 最佳实践）：

- **工作流**：≥80% 的逻辑覆盖率
- **活动**：≥80% 的逻辑覆盖率
- **集成**：使用模拟活动的关键路径
- **重放**：部署前的所有工作流版本

## 关键测试原则

1. **时间跳跃** - 长达一个月的工作流可在数秒内完成测试
2. **模拟活动** - 将工作流逻辑与外部依赖隔离
3. **重放测试** - 部署前验证确定性
4. **高覆盖率** - 生产工作流的目标为 ≥80%
5. **快速反馈** - 单元测试在毫秒级完成

## 如何使用资源

**按需加载特定资源**：

- “给我看单元测试模式” → 加载 `resources/unit-testing.md`
- “如何模拟活动？” → 加载 `resources/integration-testing.md`
- “搭建本地 Temporal 服务器” → 加载 `resources/local-setup.md`
- “验证确定性” → 加载 `resources/replay-testing.md`

## 其他参考

- Python SDK 测试：docs.temporal.io/develop/python/testing-suite
- 测试模式：github.com/temporalio/temporal/blob/main/docs/development/testing.md
- Python 示例：github.com/temporalio/samples-python
