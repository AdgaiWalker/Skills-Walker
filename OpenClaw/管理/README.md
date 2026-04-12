<div align="center">

# OpenClaw 管理助手

把 `OpenClaw` 的安装、配置、模式切换、诊断和卸载，收成一句口令的管理 skill。

[![Type](https://img.shields.io/badge/Type-Skill-2563eb?style=for-the-badge)](#)
[![Domain](https://img.shields.io/badge/Domain-OpenClaw-f59e0b?style=for-the-badge)](#)
[![Workflow](https://img.shields.io/badge/Workflow-Guided%20Ops-111827?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/License-MIT-84cc16?style=for-the-badge)](LICENSE)

[skill.md](skill.md) · [源文档](源文档.md)

</div>

## 这个 skill 解决什么问题

`OpenClaw` 真正麻烦的，不是某一条命令，而是整套安装、向导、密钥配置、模式切换和卸载流程。

这个 skill 的目标是：

- 让 AI 包揽工程型工作
- 让人只处理必须亲手完成的步骤
- 在人必须出手时，给出明确、可执行的引导

它适合：

- 第一次安装 `OpenClaw`
- 补配 `API Key`
- 切换 `安全模式 / 干活模式`
- 跑诊断并读懂结果
- 干净卸载

## 最短怎么用

如果你的代理支持显式 skill 调用：

```text
用 OpenClaw 管理助手帮我安装 OpenClaw。
```

如果你只是直接对 AI 说话：

```text
切到 OpenClaw 管理助手，帮我配置 OpenClaw。
```

常见口令示例：

```text
安装
配置密钥
测试
安全模式
干活
状态
卸载
```

## 人机分工

- AI 包揽工程型工作：检测环境、执行命令、安装、配置、诊断
- 人只处理必须亲手完成的步骤：获取 API Key、点选向导、确认风险
- 当人必须出手时，AI 要明确告诉“去哪、做什么、做完回来说什么”

## 支持的口令

| 口令 | AI 执行 | 人配合 |
|:-----|:--------|:-------|
| 安装 | 检测环境、安装 `OpenClaw`、引导完成初始化 | 安装 Node.js、按提示完成向导 |
| 配置密钥 | 等用户提供 Key 后完成配置 | 去服务商后台获取 API Key |
| 测试 | 运行诊断并解读结果 | 无 |
| 干活 | 解释风险后切到完整功能模式 | 确认风险 |
| 安全模式 | 切回受限模式 | 无 |
| 状态 | 查看版本与当前配置 | 无 |
| 卸载 | 执行卸载流程并做验证 | 确认、勾选向导项 |

## 典型流程

### 安装

1. 先检查当前系统与运行环境
2. 若缺少 `Node.js`，先引导安装稳定版
3. 再安装 `OpenClaw`
4. 最后进入初始化向导

### 配置密钥

1. AI 提示用户去对应服务商后台获取 `API Key`
2. 用户把 Key 提供给 AI
3. AI 自动完成配置

### 模式切换

- `安全模式`：切到更受限的执行配置
- `干活模式`：切到完整功能配置，但必须先告知风险再执行

### 卸载

1. 执行卸载流程
2. 引导用户完成必须的人机交互
3. 再验证命令是否已移除

## 前置与建议

- 支持常见终端环境下配合使用
- 推荐 `Node.js v22 LTS`
- 如果是新手用户，优先让 AI 走引导式流程，不要直接丢完整命令

## 参考文档

- [skill.md](skill.md)：执行规则
- [源文档.md](源文档.md)：完整设计说明

## 许可证

[MIT License](LICENSE)
