---
name: legacy-modernizer
description: Designs incremental migration strategies, identifies service boundaries, produces dependency maps and migration roadmaps, and generates API facade designs for aging codebases. Use when modernizing legacy systems, implementing strangler fig pattern or branch by abstraction, decomposing monoliths, upgrading frameworks or languages, or reducing technical debt without disrupting business operations.
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: "1.1.0"
  domain: specialized
  triggers: legacy modernization, strangler fig, incremental migration, technical debt, legacy refactoring, system migration, legacy system, modernize codebase
  role: specialist
  scope: architecture
  output-format: code+analysis
  related-skills: test-master, devops-engineer
---
# 旧系统现代化改造

## 核心工作流

1. **评估系统** — 分析代码库、依赖项、风险和业务约束。继续之前，先产出依赖关系图和风险登记表。
   - *验证检查点：* 确认所有外部集成和数据契约均已记录，然后再进入第 2 步。

2. **规划迁移** — 设计一份增量路线图，并为每个阶段制定明确的回滚策略。参考 `references/system-assessment.md` 中的代码分析模板。
   - *验证检查点：* 确认每个阶段都定义了回滚触发条件和负责人。

3. **构建安全网** — 在修改生产代码之前，创建特征测试和监控。现有行为的覆盖率目标为 80% 以上。
   - *验证检查点：* 运行特征测试套件，并确认其在未修改的遗留系统上全部通过后再继续。

4. **增量迁移** — 使用功能开关应用绞杀者无花果模式。通过门面路由流量，并逐步转移负载。
   - *验证检查点：* 在每次增加流量后（例如，5% → 25% → 50% → 100%），验证错误率和延迟指标仍处于基线阈值范围内。

5. **验证与迭代** — 运行完整测试套件，检查监控仪表板，并在淘汰遗留代码之前确认业务行为得到保留。
   - *验证检查点：* 在移除遗留路径之前，必须证明新代码在 100% 流量下至少稳定运行一个发布周期。

## 参考指南

根据上下文加载详细指引：

| 主题 | 参考资料 | 加载时机 |
|-------|-----------|-----------|
| 绞杀者无花果模式 | `references/strangler-fig-pattern.md` | 增量替换、门面层、路由 |
| 重构 | `references/refactoring-patterns.md` | 提取服务、通过抽象分支、适配器 |
| 迁移 | `references/migration-strategies.md` | 数据库、UI、API、框架迁移 |
| 测试 | `references/legacy-testing.md` | 特征测试、黄金大师、审批 |
| 评估 | `references/system-assessment.md` | 代码分析、依赖映射、风险评估 |

## 代码示例

### 绞杀者无花果门面（Python）
```python
# facade.py — routes requests to legacy or new service based on a feature flag
import os
from legacy_service import LegacyOrderService
from new_service import NewOrderService

class OrderServiceFacade:
    def __init__(self):
        self._legacy = LegacyOrderService()
        self._new = NewOrderService()

    def get_order(self, order_id: str):
        if os.getenv("USE_NEW_ORDER_SERVICE", "false").lower() == "true":
            return self._new.fetch(order_id)
        return self._legacy.get(order_id)
```

### 功能开关包装器
```python
# feature_flags.py — thin wrapper around an environment or config-based flag store
import os

def flag_enabled(flag_name: str, default: bool = False) -> bool:
    """Check whether a migration feature flag is active."""
    return os.getenv(flag_name, str(default)).lower() == "true"

# Usage
if flag_enabled("USE_NEW_PAYMENT_GATEWAY"):
    result = new_gateway.charge(order)
else:
    result = legacy_gateway.charge(order)
```

### 特征化测试模板 (pytest)
```python
# test_characterization_orders.py
# Captures existing legacy behavior as a golden-master safety net.
import pytest
from legacy_service import LegacyOrderService

service = LegacyOrderService()

@pytest.mark.parametrize("order_id,expected_status", [
    ("ORD-001", "SHIPPED"),
    ("ORD-002", "PENDING"),
    ("ORD-003", "CANCELLED"),
])
def test_order_status_golden_master(order_id, expected_status):
    """Fail loudly if legacy behavior changes unexpectedly."""
    result = service.get(order_id)
    assert result["status"] == expected_status, (
        f"Characterization broken for {order_id}: "
        f"expected {expected_status}, got {result['status']}"
    )
```

## 约束

### 必须执行
- 在所有迁移期间保持生产环境零中断
- 在重构前创建全面的测试覆盖（目标 80%+）
- 对所有渐进式发布使用功能开关
- 实施监控和回滚流程
- 记录所有迁移决策及其理由
- 保留现有业务逻辑和行为
- 透明地沟通进展和风险

### 禁止执行
- 一次性大规模重写或替换
- 在变更前跳过对遗留行为的测试
- 在不具备回滚能力的情况下部署
- 破坏现有集成或 API
- 在新代码中忽视技术债务
- 未经适当验证就仓促迁移
- 在新代码得到验证前移除遗留代码

## 输出模板

在实施现代化改造时，提供：
1. 评估摘要（风险、依赖项、方法）
2. 迁移计划（阶段、回滚策略、指标）
3. 实现代码（门面、适配器、新服务）
4. 测试覆盖（特征化、集成、端到端）
5. 监控设置（指标、告警、仪表板）

## 知识参考

绞杀榕模式、通过抽象分支、特征化测试、渐进式迁移、功能开关、金丝雀部署、API 版本控制、数据库重构、微服务提取、技术债务削减、零停机部署

[文档](https://jeffallan.github.io/claude-skills/skills/specialized/legacy-modernizer/)