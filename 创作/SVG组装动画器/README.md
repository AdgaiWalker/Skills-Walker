# SVG 组装动画器

[![Type](https://img.shields.io/badge/Type-Skill-2563eb?style=for-the-badge)](#)
[![Use](https://img.shields.io/badge/Use-SVG%20Assembly-f59e0b?style=for-the-badge)](#)
[![Output](https://img.shields.io/badge/Output-HTML%20%2B%20PNG%20Sequence-111827?style=for-the-badge)](#)
[![Style](https://img.shields.io/badge/Style-Viscous%20Dynamic-84cc16?style=for-the-badge)](#)

把静态 SVG 拆成带力量感和速度感的零件组装动画，并支持透明背景序列帧导出。

它不是普通转场器，而是更偏：

- 标题组装动画
- Logo / 字形装配动画
- 结构件飞入
- 透明背景素材输出

## 它有什么用

当你已经有一张 SVG，但想把它做成可用于视频剪辑或封面动效的“组装动画”时，它会更有用。

它优先帮你完成这些事：

- 分析 SVG 的主体和零件结构
- 生成 HTML 动画预览页
- 给零件加入飞入、回弹、旋转、缩放的组装动效
- 导出 30fps 透明 PNG 序列帧

## 对谁有用

它更适合这些人：

- 做视频动效和包装的人
- 想把标题、Logo、字形做成组装动画的人
- 需要给 AE / PR / 剪映准备透明素材的人
- 已经有 SVG，但不想手写整套组装逻辑的人

## 适用范围

它最适合这些对象：

- 标题字形 SVG
- 图标 / Logo SVG
- 结构件 SVG
- 可以拆成主体 + 细节零件的矢量图

默认产物是：

- 一个可预览的 HTML 动画页
- 一个透明背景的 PNG 序列帧 ZIP

## 怎么用

最稳的方式是：

1. 准备一张可拆件的 SVG
2. 交给 AI 分析主体和零件
3. 生成动画 HTML
4. 在浏览器里预览
5. 按需导出透明序列帧

## 最短怎么说

```text
帮我把这张 SVG 做成有力量感的组装动画。
需要主体先出现，零件后飞入，
最后给我一个可预览的 HTML 和透明序列帧导出。
```

## 直接入口

- 执行规则：[skill.md](./skill.md)
- 工作流总图：[发布工作流总图](../发布工作流总图.md)
- 动画逻辑：[references/animation_logic.md](./references/animation_logic.md)
- HTML 模板：[assets/animation_template.html](./assets/animation_template.html)

## 导出说明

默认建议：

- 1080 x 1080
- 30fps
- 透明 PNG 序列

如果后面要合成视频，可以再用 `ffmpeg` 或视频软件继续处理。

## 参考与来源

这个条目不是从零新写的一套能力，而是把现有已安装 skill 接入到创作库中，方便统一使用和管理。

来源基础：

- 原始 skill 名称：`svg-assembly-animator`
- 当前接入方式：保留原始 `skill.md`、`assets/`、`references/`
- 本仓库补充内容：人看 README、创作库索引、实验区归档

如果后面继续迭代，这个条目应继续保留“引入型 skill”的来源说明，不应误写成完全独立原创。
