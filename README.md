<div align="center">

# Skills-Walker

把可复用的工作方法沉淀成能直接调用的 AI skill 与工作流。

[![License](https://img.shields.io/badge/License-MIT-84cc16?style=for-the-badge)](LICENSE)
[![Repo Type](https://img.shields.io/badge/Type-AI%20Skills-2563eb?style=for-the-badge)](#技能索引)
[![Workflow](https://img.shields.io/badge/Workflow-Context%20First-111827?style=for-the-badge)](#如何使用)
[![Roadmap](https://img.shields.io/badge/Roadmap-Active-f59e0b?style=for-the-badge)](ROADMAP.md)

秋知的自创自用 AI 技能仓库。
按“我要做什么”组织，不按零散提示词或工具名堆目录。

[项目门面生成器](创作/项目门面生成器/README.md) · [OpenClaw 管理助手](OpenClaw/管理/README.md) · [个人文件管理体系](管理/文件管理/README.md)

</div>

## 这是什么

`Skills-Walker` 不是提示词展览页，而是一组可以直接工作的技能与方法体系。

这里的内容大致分成三层：

- `README.md`：给人看，说明这个项目 / skill 解决什么问题、怎么使用
- `skill.md`：给 AI 执行，定义边界、流程和默认行为
- `docs / templates / 源文档`：补充上下文，帮助技能稳定输出

## 如何使用

1. 先从技能索引里选择一个目录。
2. 先读对应的 `README.md`，确认它解决的问题和适用场景。
3. 如果目录里有 `skill.md`，把它交给你的 AI，或在支持的代理中显式启用。
4. 让 AI 先吃上下文，再产出结果；上下文不足时，再补关键文件。
5. 需要对外交付时，再让 AI 继续整理 `README / LICENSE / Git` 收尾。

如果你第一次进入这个仓库，建议先从 [项目门面生成器](创作/项目门面生成器/README.md) 开始。

## 当前推荐

### 项目门面生成器

把项目整理到“能见人、能介绍、能移交”的状态。
它先调查当前仓库状态并推荐执行模式，再以 `README` 为核心产物整理项目门面，并按策略处理安装方式、遗漏检查、`LICENSE / Git` 收尾。
[README](创作/项目门面生成器/README.md) · [skill.md](创作/项目门面生成器/skill.md)

### OpenClaw 管理助手

把 `OpenClaw` 的安装、配置、模式切换、诊断和卸载收成一句口令。
AI 包揽工程型工作，人只处理必须亲手完成的步骤。
[README](OpenClaw/管理/README.md) · [skill.md](OpenClaw/管理/skill.md)

### 个人文件管理体系

把规划、执行、复盘放进一套稳定的目录结构与日常动作里。
适合需要同时管理知识库、代码项目、自媒体素材和 Git 备份的人。
[README](管理/文件管理/README.md) · [快速开始](管理/文件管理/docs/快速开始.md)

## 技能索引

| 分类 | 项目 | 类型 | 状态 | 说明 |
|:-----|:-----|:----:|:----:|:-----|
| 创作 | [项目门面生成器](创作/项目门面生成器/README.md) | Skill | ✅ | 生成或重构项目门面，以 README 为核心并处理收尾 |
| OpenClaw | [管理助手](OpenClaw/管理/README.md) | Skill | ✅ | OpenClaw 安装、配置、模式切换、诊断、卸载 |
| OpenClaw | [网关](OpenClaw/网关/work/skill.md) | Skill | 🚧 | AI 代理网关，已有串行版本，仍在迭代 |
| 管理 | [决策框架](管理/决策框架/skill.md) | Skill | ✅ | 构建结构化价值决策框架 |
| 管理 | [文件管理](管理/文件管理/README.md) | System | ✅ | 个人文件管理体系，覆盖规划 / 执行 / 复盘 / 备份 |
| 元能力 | [技能生成](元能力/技能生成/skill.md) | Skill | ✅ | 将对话提炼为可复用 skill |

## 仓库原则

- 人做决策，AI 做分析与执行
- 先吃上下文，再产出结果
- skill 要能直接用，不做提示词展览
- 输出结果要能直接交付，而不是停在讨论阶段

## 仓库文档

- [ROADMAP.md](ROADMAP.md)：未来扩展方向
- [CHANGELOG.md](CHANGELOG.md)：更新记录
- [CONTRIBUTING.md](CONTRIBUTING.md)：维护规范

## 许可证

[MIT License](LICENSE)
