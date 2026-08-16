---
name: implement
description: "Implements a piece of work from a spec or ticket set. Use when the user says \"implement this spec\", \"work the tickets\", or wants code written from an existing plan."
disable-model-invocation: true
---
实现用户在规范或工单中描述的工作。

尽可能在预先约定的接缝处使用 /mattpocock:bdd。在自动化阶段，加载 `/mattpocock:tdd`（BDD 驱动），以获取有关测试质量、接缝和模拟的指导。

定期运行类型检查和单个测试文件，并在最后运行一次完整测试套件。

完成后，使用 /mattpocock:code-review 审查相关工作。

## 关键要求：在预先约定的接缝处使用 BDD，并在提交前进行审查

尽可能在预先约定的接缝处使用 `/mattpocock:bdd`，每次完成一个红-绿迭代切片。在自动化阶段加载 `/mattpocock:tdd`（BDD 驱动），以获取有关测试质量、接缝和模拟的指导。工作完成后，对其运行 `/mattpocock:code-review`——未经过双轴审查的提交不算完成。

将你的工作提交到当前分支。