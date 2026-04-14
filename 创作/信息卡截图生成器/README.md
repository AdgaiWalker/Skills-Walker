# 信息卡截图生成器

[![Type](https://img.shields.io/badge/Type-Skill-2563eb?style=for-the-badge)](#)
[![Use](https://img.shields.io/badge/Use-Editorial%20Card-f59e0b?style=for-the-badge)](#)
[![Output](https://img.shields.io/badge/Output-HTML%20%2B%20PNG-111827?style=for-the-badge)](#)
[![Style](https://img.shields.io/badge/Style-Swiss%20Editorial-84cc16?style=for-the-badge)](#)

把一段信息整理成高密度、可截图的编辑部风格信息卡，并导出固定比例的图片。

它不是普通海报生成器，而是更偏：

- 杂志 / 瑞士国际风信息卡
- 分析卡片
- 观点卡
- 小红书 / X / 封面图文首图
- HTML + PNG 一体输出

## 它有什么用

当你已经有一段内容，但还缺一个能直接发出去的图文载体时，它会更有用。

它优先帮你完成这些事：

- 把信息压成高密度的图文卡结构
- 根据比例重排阅读路径，而不是简单缩放
- 生成可截图的完整 HTML
- 输出固定比例 PNG，例如 `3:4`、`4:3`、`1:1`、`16:9`

## 对谁有用

它更适合这些人：

- 做内容卡片、知识图文、封面图的人
- 想把观点、教程、解释做成高密度信息卡的人
- 做小红书、X、封面图、项目说明卡的人
- 已经有核心内容，但不想手工排图的人

## 适用范围

它最适合这些场景：

- 理论 / 方法解释卡
- 教程 / 分析卡
- 项目介绍图
- 图文首图
- 固定比例封面

默认产物是：

- 一句信息密度判断
- 完整 HTML
- 按比例截图的 PNG

## 怎么用

最稳的方式是：

1. 准备标题和核心内容
2. 明确你要的比例，例如 `3:4` 或 `1:1`
3. 把内容和比例交给 AI
4. 让 AI 先出 HTML，再截图出 PNG

## 最短怎么说

```text
帮我把这段内容做成一张 3:4 的高密度信息卡。
风格偏编辑部 / 瑞士国际风。
先给我完整 HTML，再给我 PNG。
```

## 直接入口

- 执行规则：[skill.md](./skill.md)
- 参考比例：[references/ratios.md](./references/ratios.md)
- 推荐骨架：[references/recommended-skeletons.md](./references/recommended-skeletons.md)
- 截图脚本：[scripts/capture_card.sh](./scripts/capture_card.sh)

## 使用要求

这类截图输出依赖本地浏览器环境。

至少需要：

- `google-chrome`
- 或 `chromium`
- 或 `chrome`

如果只要 HTML，不截图，也可以只用前半段能力。

## 参考与来源

这个条目不是从零独立原创的一整套能力，而是基于现有信息卡相关 skill 做的实验区接入。

明确来源：

- 源文件下载位置：[shaom/infocard-skills](https://github.com/shaom/infocard-skills?tab=readme-ov-file)
- 当前接入能力名：`editorial-card-screenshot`
- 当前接入方式：保留原始 `skill.md`、`assets/`、`references/`、`scripts/`
- 本仓库补充内容：人看 README、创作库索引、实验区归档

如果后面继续迭代，这个条目应继续保留来源说明，不应误写成完全独立原创。
