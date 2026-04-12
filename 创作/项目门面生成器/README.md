# 项目门面生成器

[![Type](https://img.shields.io/badge/Type-Skill-3b82f6?style=for-the-badge)](#)
[![Mode](https://img.shields.io/badge/Context-First-111827?style=for-the-badge)](#)
[![Output](https://img.shields.io/badge/Output-Project%20Front-f59e0b?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/License-MIT-84cc16?style=for-the-badge)](#)

基于充分上下文，生成项目对外展示所需的 README 与收尾材料。  
它的原则很简单：**人只做决策，AI 负责分析、生成、整理与执行。**

## 安装

### 方式 1：命令安装

```bash
npx skills add AdgaiWalker/Skills-Walker --skill project-front-generator
```

这条命令适用于支持 Agent Skills 标准的终端代理。常见场景包括 Claude Code、Codex、Gemini CLI、OpenCode、Command Code、OpenClaw。

### 方式 2：让 AI 帮你安装

把下面这段话直接发给你的 AI 即可：

```text
帮我安装这个 skill：
https://github.com/AdgaiWalker/Skills-Walker

skill 名称：project-front-generator

请帮我用合适的方式完成安装。
如果支持命令安装，优先使用：
npx skills add AdgaiWalker/Skills-Walker --skill project-front-generator

安装完成后，告诉我最短怎么调用它。
```

## 核心特点

- 有上下文就直接生成，不把用户拖进无意义追问
- 按项目类型套用模板，保证结构稳定
- 支持已有 README 的重构与美化
- 标准风格下可优先使用“封面式开头”
- README 完成后，继续给出 `LICENSE / Git` 后续建议
- 目标不是只写文档，而是把项目整理到“能见人、能介绍、能发布”的状态

## 适用前提

调用前，AI 已有足够上下文，例如：

- 已读取项目代码、文档或已有 README
- 已理解项目用途、受众或用户目标

如果上下文已足够，直接生成；只有关键信息缺失时，才用少量选项补问。

## 输出风格

默认支持两档：

- `极简`：少徽章、少装饰、正文优先
- `标准`：适量徽章、清晰分节、表格与引用适度使用

如果项目偏正式发布、品牌展示或社区传播，标准风格可优先使用“封面式开头”。

### 封面式开头

参考类似 `hermes-agent` 这种首页风格，推荐结构：

```md
横幅图或品牌图
H1 标题
按钮式徽章行
1 到 2 段高密度介绍
```

规则：

- 优先使用已有横幅图、Logo、截图或品牌素材
- 没有现成图片时，退化为 `标题 + 徽章 + 简介`
- 徽章优先放 `Docs / 官网 / License / 社区 / 发布方`
- 第一屏先讲项目是什么，再讲为什么值得用

## 项目模板

### 库 / 框架

```text
标题 + 一句话介绍
徽章
安装
快速开始
核心用法
API
许可证
```

### CLI 工具

```text
标题 + 一句话介绍
徽章
安装
用法（命令 + 示例）
许可证
```

### 网站 / 应用

```text
标题 + 一句话介绍
徽章
功能亮点
截图 / 演示
快速开始
常见问题
许可证
```

### Skills

```text
标题 + 一句话介绍
触发词
使用方法
示例
许可证
```

### 理论框架

```text
标题 + 核心理念
简述
核心理念 / 公理
结构设计
使用步骤
应用场景
许可证
```

### 文档 / 教程

```text
标题 + 一句话介绍
适用人群
目录
```

## 使用方式

1. 先让 AI 读取项目、文档或已有 README。
2. 直接说：`生成 README`、`美化 README`、`整理项目门面`、`准备发布材料`。
3. 如果关键信息缺失，AI 再补问少量选项。
4. README 完成后，AI 继续给出 `LICENSE / Git` 后续建议。

### 终端代理里的调用示例

安装完成后，直接在终端代理里这样说：

```text
用项目门面生成器帮我整理这个仓库。
先做一个适合展示的 README，
再补 LICENSE 和发布建议。
```

## README 完成后的后续建议

README 不应生成完就结束。AI 应先检查：

- 是否已有 `LICENSE`
- README 中是否已有许可证说明
- 当前目录是否为 Git 仓库
- 是否已配置远程仓库
- 是否存在可提交改动

然后一次性给出建议，让用户只做决策，例如：

- 两者都处理
- 只处理 `LICENSE`
- 只处理 `Git`
- 都不处理

## LICENSE 规则

如果用户需要处理 `LICENSE`，优先基于上下文推荐，而不是要求用户自行判断。

常见选项：

- `MIT`：宽松，适合大多数项目
- `Apache-2.0`：宽松，含专利授权
- `GPL-3.0`：衍生发布需继续开源
- `暂不添加 LICENSE`：保留版权，不主动授权

确认后：

- 生成或更新 `LICENSE`
- 同步更新 README 中的 License 说明

## Git 规则

如果用户需要处理 Git：

- 检查当前目录是否为 Git 仓库
- 检查是否存在远程仓库
- 检查是否存在可提交改动
- 在用户确认后，再执行提交或推送

## 设计原则

```text
AI 先分析与执行
人只负责决策
少问开放题
少堆无关内容
输出要能直接用
```
