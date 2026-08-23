---
name: codex_e2e_xyz_greet_a3f9c2
description: Test greeter — codex skills e2e. The unique suffix a3f9c2 appears in the skill name so a string match in the agent's output proves codex loaded this skill.
---
# Codex E2E 问候 (a3f9c2)

这是用于 `tests/e2e/test_codex_skills_filter_e2e.py` 的固件 Skill。Skill 正文本身并不重要——该测试会断言 SKILL 名称（`codex_e2e_xyz_greet_a3f9c2`）是否出现在代理的 Skill 枚举响应中。