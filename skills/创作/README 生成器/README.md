# 📝 README 生成器

License: MIT

**有上下文，直接出 README。**

---

<div align="left">

<img src="https://img.shields.io/badge/类型-Skills-blue?style=flat-square" alt="Type">
<img src="https://img.shields.io/badge/状态-可用-success?style=flat-square" alt="Status">

</div>

---

## 触发词

| 触发词 | 功能 |
|:-------|:-----|
| `生成 README` / `写 README` | 完整流程 |
| `美化 README` | 只做美化 |
| `优化 README` | 内容生成 + 美化 |

## 使用方法

> **前提**：调用前 AI 已有充分上下文（读过代码、聊过想法、理解产品）

1. 和 AI 聊完想法，或让 AI 读取项目
2. 说「生成 README」
3. 如有关键信息缺失，AI 会用选项引导
4. 输出可直接使用的 README

## 示例

**输入**：
```
用户：我刚写完一个 Python CLI 工具，帮我生成 README
```

**AI 引导**（如有缺失）：
```
目标用户是：
A. 开发者
B. 普通用户

美化风格：
A. 极简
B. 标准
```

**输出**：
```markdown
# 项目名

License: MIT

**一句话介绍。**

## 安装
...

## 用法
...
```

## 支持的项目类型

| 类型 | 包含 |
|:-----|:-----|
| 代码类 | 库/框架、CLI 工具、网站/应用 |
| 内容类 | Skills、理论框架、文档/教程 |

## 设计理念

**课题分离**

```
AI → 包揽工程型工作
人 → 只做决策
AI → 用选项引导人
```

---

<div align="center">

MIT License

</div>