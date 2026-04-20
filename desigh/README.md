# Design Skill

> Claude Code 专业设计技能——用 HTML/React 创建交互原型、演示文稿、动画视频、着陆页和移动端界面。

## 有什么用

把 Claude Code 变成一位专业设计师。你说需求，它输出可在浏览器直接预览的高保真 HTML 设计产物——交互原型可点击、幻灯片可翻页、动画可播放、Tweaks 面板可实时调参。

## 对谁有用

- 需要**快速出设计稿**的开发者——不用打开 Figma，直接在终端里完成
- 想把设计意图**变成可交互原型**的产品经理
- 需要做**演示文稿或动画视频**但不想学专业工具的人
- 在 Claude Code 工作流中需要**设计能力闭环**的团队

## 适用范围

| 能做 | 不做 |
|---|---|
| HTML/React 交互原型 | 原生 iOS/Android 应用 |
| 幻灯片演示（deck） | Figma/Sketch 文件 |
| 时间线动画视频 | 3D 渲染 |
| 线框图探索 | 后端逻辑 |
| Tweaks 实时调参 | CI/CD 部署 |
| 截图捕获（关联 skill） | 数据库设计 |

## 安装

### 方式 1：命令安装

```bash
npx skills add AdgaiWalker/desk --skill design
```

### 方式 2：让 AI 帮你安装

把这段话直接贴给 Claude Code：

```text
帮我安装这个 skill：
https://github.com/AdgaiWalker/desk

skill 名称：design
路径：skills测试台/design/

请帮我用合适的方式完成安装。
如果支持命令安装，优先使用：
npx skills add AdgaiWalker/desk --skill design

安装完成后，告诉我最短怎么调用它。
```

## 使用方法

在 Claude Code 中输入任意触发词即可激活：

```
设计一个登录页面
做一个 10 页的产品介绍 deck
创建外卖 app 的 onboarding 交互原型
做一段 Logo 入场动画
画 3 个首页布局的线框图
```

**触发词：** 设计 / 创建原型 / 交互原型 / 做演示文稿 / 做deck / 做幻灯片 / 做动画 / 着陆页 / landing page / 设计系统 / 线框图 / wireframe / 前端设计 / 移动端设计 / web设计

## 核心能力

### 4 种设计模式

| 模式 | 说明 |
|---|---|
| **幻灯片演示** | 1920x1080 固定画布，键盘导航，localStorage 断点续播，演讲者备注 |
| **交互原型** | React + Babel 高保真原型，真实交互，设备边框包裹 |
| **动画视频** | 时间线引擎（Stage + Sprite + Easing），可播放/拖拽/暂停 |
| **线框图** | 灰度低保真，并排对比多个布局方案 |

### Tweaks 实时调参

每个设计自动嵌入调整面板——颜色、字号、间距、布局变体一键切换，参数自动持久化到 localStorage。

### 7 个启动组件

| 组件 | 用途 |
|---|---|
| `deck_stage.js` | 幻灯片外壳（缩放 + 导航 + 持久化） |
| `design_canvas.jsx` | 多方案并排画布 |
| `ios_frame.jsx` | iPhone 设备边框 |
| `android_frame.jsx` | Android 设备边框 |
| `macos_window.jsx` | macOS 窗口装饰 |
| `browser_window.jsx` | 浏览器窗口装饰 |
| `animations.jsx` | 动画引擎（Stage + Sprite + Easing） |

### 外部关联

| Skill | 用途 |
|---|---|
| **editorial-card-screenshot** | HTML 信息卡截图（headless Chrome，8 种比例） |
| **svg-assembly-animator** | SVG 零件组装动画 + 透明序列帧导出 |

## 文件结构

```
design/
├── README.md                          # 本文件
├── design.md                          # 原始设计系统提示词（归档）
└── skills/design/
    ├── SKILL.md                       # Skill 定义文件
    └── assets/                        # 启动组件模板
        ├── deck_stage.js
        ├── design_canvas.jsx
        ├── ios_frame.jsx
        ├── android_frame.jsx
        ├── macos_window.jsx
        ├── browser_window.jsx
        └── animations.jsx
```

## 技术栈

- **React 18.3.1** + **Babel 7.29.0**（固定版本 + integrity hash）
- 内联 JSX，无需构建工具
- 纯前端实现，浏览器直接打开即可预览

## License

MIT
