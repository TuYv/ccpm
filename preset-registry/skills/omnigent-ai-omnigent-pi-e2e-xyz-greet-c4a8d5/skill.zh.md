---
name: pi-e2e-xyz-greet-c4a8d5
description: Test greeter — pi skills e2e. The unique suffix c4a8d5 appears in the skill name so a string match in the agent's output proves Pi loaded this skill.
---
# Pi E2E 问候 (c4a8d5)

这是用于 `tests/e2e/test_pi_skills_filter_e2e.py` 的固定测试 Skill。Skill 正文本身并不重要——该测试会断言 SKILL 名称（`pi-e2e-xyz-greet-c4a8d5`）是否出现在智能体的已枚举 Skill 响应中。