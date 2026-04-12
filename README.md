<div align="center">

# Skills-Walker

把可复用的工作方法沉淀成能直接调用的 AI skill。

[![License](https://img.shields.io/badge/License-MIT-84cc16?style=for-the-badge)](LICENSE)
[![Repo Type](https://img.shields.io/badge/Type-AI%20Skills-2563eb?style=for-the-badge)](#技能索引)
[![Workflow](https://img.shields.io/badge/Workflow-Context%20First-111827?style=for-the-badge)](#使用方式)
[![Roadmap](https://img.shields.io/badge/Roadmap-Active-f59e0b?style=for-the-badge)](ROADMAP.md)

秋知的自创自用 AI 技能库。  
按“我要做什么”组织，而不是按零散提示词或工具名堆目录。

[项目门面生成器](创作/项目门面生成器/) · [ROADMAP](ROADMAP.md) · [CHANGELOG](CHANGELOG.md) · [CONTRIBUTING](CONTRIBUTING.md)

</div>

## 使用方式

1. 选择一个 skill 目录。
2. 把对应的 `skill.md` 交给你的 AI，或在支持的代理中显式启用该 skill。
3. 让 AI 先利用已有上下文工作；如果上下文不足，再补关键文件。
4. 让 skill 输出可直接使用的结果，而不只是讨论思路。

如果你第一次进入这个仓库，建议先从 [项目门面生成器](创作/项目门面生成器/) 开始。

## 仓库原则

- 人做决策，AI 做分析与执行
- 先吃上下文，再产出结果
- skill 要能直接用，不做提示词展览
- 输出结果要能直接交付，而不是停在讨论阶段

## 当前推荐

### 项目门面生成器

把项目整理到“能见人、能介绍、能发布”的状态。  
以 `README` 为核心产物，同时补齐安装方式、检查遗漏项，并在最后给出 `LICENSE / Git` 收尾建议。  
[README](创作/项目门面生成器/README.md) · [skill.md](创作/项目门面生成器/skill.md)

## 技能索引

### OpenClaw

> AI 代理专项工具

| Skill | 状态 | 说明 |
|:------|:----:|:-----|
| [管理](OpenClaw/管理/) | ✅ | OpenClaw 安装、配置、卸载全流程 |
| [网关](OpenClaw/网关/) | 🚧 | AI 代理网关架构 |

### 管理

> 我要理一理

| Skill | 状态 | 说明 |
|:------|:----:|:-----|
| [决策框架](管理/决策框架/) | ✅ | 构建结构化价值决策框架 |
| [文件管理](管理/文件管理/) | ✅ | 个人文件管理体系，规划 / 执行 / 复盘 |

### 创作

> 我要写 / 做东西

| Skill | 状态 | 说明 |
|:------|:----:|:-----|
| [项目门面生成器](创作/项目门面生成器/) | ✅ | 整理项目对外展示所需的 README 与收尾材料 |

### 元能力

> 我要变强

| Skill | 状态 | 说明 |
|:------|:----:|:-----|
| [技能生成](元能力/技能生成/) | ✅ | 将对话提炼为可复用 skill |

## 仓库文档

- [ROADMAP.md](ROADMAP.md)：未来扩展方向
- [CHANGELOG.md](CHANGELOG.md)：更新记录
- [CONTRIBUTING.md](CONTRIBUTING.md)：维护规范

## 许可证

[MIT License](LICENSE)
