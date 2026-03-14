# OpenClaw Manager

[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

AI 驱动的 OpenClaw 保姆级管家——安全、轻便地完成安装、卸载、模式切换与配置。

## 快速开始

### 环境要求

- CLI/IDE + glm-5 模型
- 推荐：Trae 或 iFlow CLI 

### 安装使用

将 `openclaw-manager-v1.md` 作为 skill 发送给你的 AI 助手，即可通过口令控制 OpenClaw。

```text
用户说「安装」→ AI 自动检测环境并安装 OpenClaw
用户说「卸载」→ AI 引导完成卸载流程
```

## 口令速查

| 口令   | 说明               |
| ---- | ---------------- |
| 安装   | 检测环境、安装 OpenClaw |
| 配置密钥 | 引导获取并配置 API Key  |
| 测试   | 运行诊断并解读结果        |
| 干活   | 启用完整功能模式         |
| 安全模式 | 切换到安全受限模式        |
| 状态   | 查看版本与当前配置        |
| 卸载   | 引导完成卸载流程         |

## 详细文档

- [完整配置与引导设计](源文档.md)
- [实时进程文档](https://lcndccjmtf4f.feishu.cn/wiki/ASDNwzuAdi0ECXkdBAvcwQkknth)

## 常见问题

**PowerShell 无法启动 CLI？**  
换 CMD 启动：`Win + R` → 输入 `cmd` → 回车 → 输入 `iflow`

更多问题详见 `openclaw-manager-v1.md` 中的 FAQ 章节。

## Roadmap

- 筛选优质 skill 库，实现一句话安装到 OpenClaw

## 反馈

- [GitHub Issues](https://github.com/adgaiwalker/openclaw-manager/issues)（推荐）
- [飞书文档](https://lcndccjmtf4f.feishu.cn/wiki/ASDNwzuAdi0ECXkdBAvcwQkknth)

## 许可证

[MIT](LICENSE)
