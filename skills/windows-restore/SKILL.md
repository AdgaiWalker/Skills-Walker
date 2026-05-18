---
name: windows-restore
description: >
  Windows 全盘重装后的环境恢复向导。当用户刚重装完 Windows 系统，需要恢复开发环境、配置文件、工具链时使用此 skill。
  触发条件：用户提到"重装系统后恢复"、"新系统环境配置"、"还原备份"、"从备份恢复环境"、
  "刚装完系统"、"帮我恢复环境"、"按照备份恢复"等场景。即使用户没有明确说"恢复"，
  只要上下文表明这是全新 Windows 系统需要还原工作环境，就应该触发。
---

# Windows 环境恢复向导

你正在协助人类完成 Windows 全盘重装后的环境恢复。这不是普通的软件安装——这是一次从零到完整工作环境的系统性重建。

## 核心原则

**人类主权**：人类掌握最终决策权。你负责执行技术操作、生成方案、排查问题。人类决定是否执行、安装路径、优先级。不得自行决定安装软件或修改系统配置。

**做减法**：不装暂时不用的工具。能 winget 装的不要手动下载。不恢复可重建的内容（node_modules、.git、pnpm store、npm cache）。

**量变质变**：每完成一层，验证所有工具能正常调用（`--version`），检查配置文件路径正确（旧用户名→新用户名，旧盘符→新盘符），发现问题立刻告知人类。

## 恢复序列

按层级从上到下执行。前一层完成并通过验证后，才进入下一层。每层开始前向人类说明即将做什么，获得确认后执行。

### 第一层：工作基础

目标：让电脑能上网、能用 AI、能输入。

1. 安装浏览器 → Google Chrome
2. 安装 VPN → FlClash
3. 安装输入法 → 微信输入法、智谱AI输入法
4. 安装 AI 基础设施 → CC Switch、AutoGLM
5. 安装解压工具 → WinRAR

验证：浏览器能打开网页、输入法切换正常、AI 工具可启动。

### 第二层：开发环境

目标：能运行代码、能用 AI 编程。

1. **Git**
   - `winget install Git.Git`
   - 还原 .gitconfig（从备份的 dotfiles/ 目录复制到 `~/.gitconfig`）
   - **注意**：检查 .gitconfig 中 editor 路径是否匹配新系统

2. **SSH**
   - 还原 ssh/ 目录到 `~/.ssh/`
   - 确认权限：私钥文件权限应限制

3. **Node.js（NVM for Windows）**
   - 下载安装 NVM for Windows（https://github.com/yuruotong1/nvm-windows/releases）
   - `nvm install 25.2.1`
   - `nvm install 22.22.0`
   - `nvm use 25.2.1`

4. **pnpm**
   - `npm install -g pnpm`

5. **npm 配置**
   - 还原 .npmrc（从备份的 dotfiles/ 目录复制到 `~/.npmrc`）
   - **注意**：检查 prefix 和 cache 路径中的盘符和用户名是否匹配新系统

6. **Python**
   - `winget install Python.Python.3.14`

7. **VS Code**
   - 安装 VS Code
   - 还原 settings.json → `AppData\Roaming\Code\User\`
   - 还原 snippets → `AppData\Roaming\Code\User\snippets\`
   - 批量安装扩展：
     ```powershell
     Get-Content <备份路径>\vscode-extensions\extensions.txt | ForEach-Object { code --install-extension $_ }
     ```

8. **Claude Code**
   - `npm install -g @anthropic-ai/claude-code`
   - 还原 .claude/ 目录（settings.json、settings.local.json、projects/）

9. **Claude Skills**
   - 还原 skills/ 目录到 `~/.claude/skills/`

10. **Windows Terminal**
    - 还原 settings.json 到 `AppData\Local\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\`

验证：`git --version`、`node --version`、`pnpm --version`、`python --version`、`code --version`、`claude --version` 全部通过。

### 第三层：项目恢复

目标：所有代码项目就位。

从 GitHub clone：
```powershell
# 在工作区目录执行
git clone https://github.com/AdgaiWalker/AdgaiWalker.git blog
git clone https://github.com/AdgaiWalker/desk.git "FerrySpec世界自适应提示词工程框架"
git clone https://github.com/AdgaiWalker/set-app.git set-UX
git clone https://github.com/AdgaiWalker/Walker-skills-test.git 转化记录
git clone https://github.com/MiniMax-AI/skills.git skills
```

从备份复制本地独有文件（J 盘桌面完整备份里的非 Git 项目）。

Blog 恢复：在 blog 目录执行 `pnpm install`。

验证：每个 clone 的目录能 `git status`，blog 能 `pnpm dev` 启动。

### 第四层：设计工具（按需）

当人类需要做设计时安装：
- Adobe（PR、AU 从备份直接解压；PS 需先用 WinRAR 合并分卷）
- Figma 中文版、Blender、Pencil（VS Code 扩展）

### 第五层：自媒体工具（按需）

当人类需要做自媒体时安装：
- OBS Studio → `winget install OBSProject.OBSStudio`
- 剪映专业版、必剪 → 官网下载

## 备份文件位置

备份在 J 盘（恢复 U 盘）的 `Windows重装备份\2026-05-18\` 下：

| 目录 | 内容 |
|------|------|
| `dotfiles\` | .gitconfig, .npmrc |
| `ssh\` | SSH 配置和密钥 |
| `vscode\` | settings.json, snippets |
| `vscode-extensions\` | 扩展列表 |
| `terminal\` | Windows Terminal 设置 |
| `claude\` | Claude Code 配置和项目记忆 |
| `skills\` | Claude Skills + Minimax Skills |
| `chrome\` | Chrome 书签和偏好 |
| `obsidian\` | Obsidian 配置 |
| `npm-global-list\` | npm 全局包列表 |
| `dev-env-info\` | 环境版本快照 |

桌面完整备份在 `J:\桌面完整备份\`。

## 蓝图 vs 现实对比

恢复过程中，你的核心职责是对比"蓝图"（重装前的理想状态）和"现实"（当前系统状态），识别偏差并修复。

关键蓝图数据：
- Git 用户：AdgaiWalker / 15328084233@163.com
- Node 版本：25.2.1 / 22.22.0
- Python 版本：3.14.0
- 博客技术栈：Astro 6 + Tailwind v4 + MDX
- VS Code 扩展：16 个（见 extensions.txt）
- npm 全局包：13 个（见 npm-global.txt）

## 注意事项

- 路径中的 `Administrator` 可能需要改为新用户名
- .npmrc 的 prefix/cache 路径需要确认新盘符
- .gitconfig 的 editor 路径需要更新
- GitHub 凭据：重装后第一次 push 需要重新登录
- I 盘是 FAT32 格式，单文件上限 4GB

## npm 全局包参考

关键全局包（按优先级）：
```
@anthropic-ai/claude-code
pnpm
@ast-grep/cli
playwright
serve
openclaw
```

其他按需安装的包见 `npm-global-list\npm-global.txt`。
