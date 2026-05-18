---
name: windows-restore
description: >
  Windows 全盘重装后的环境恢复向导。读取备份中的 machine-profile.json 自动适配任何人的环境，
  逐层恢复开发工具、配置文件、项目仓库。当用户提到"重装系统后恢复"、"新系统环境配置"、
  "还原备份"、"从备份恢复环境"、"刚装完系统"、"帮我恢复环境"、"按照备份恢复"时触发。
  即使用户没明确说"恢复"，只要上下文表明是全新 Windows 需要还原环境，就应该触发。
  核心价值：零硬编码，读取 profile 自动适配，任何人都能用。
---

# Windows 环境恢复向导

协助人类完成 Windows 重装后的环境恢复。从零到完整工作环境的系统性重建。

这个 skill 不硬编码任何用户信息。所有恢复数据来自备份中的 `machine-profile.json` — 这个文件是备份 skill 自动生成的环境镜像，包含了重装前的完整系统状态。

## 核心原则

**人类主权**：人类决定是否执行、安装路径、优先级。不得自行安装软件或修改系统配置，每步确认。

**做减法**：不装暂时不用的工具。能 winget 装的不手动下载。不恢复可重建的内容。

**量变质变**：每层完成后验证工具能正常调用，检查路径正确，发现问题立刻告知人类。

## AI 能力边界（诚实说）

AI 不是万能的。恢复过程中有些事 AI 能自动完成，有些必须人类手动。搞清楚分工很重要，避免浪费时间等待一个注定失败的自动安装。

### AI 能自动完成的
- **npm 全局包**：pnpm、claude-code、playwright、ast-grep 等（`npm install -g <pkg>`）
- **Git 操作**：clone 仓库、恢复 .gitconfig、push 验证
- **配置文件恢复**：复制 .npmrc、settings.json、ssh 目录、替换路径
- **验证检查**：--version、路径检查、完整性审查
- **NVM 版本安装**：人类装好 NVM 后，AI 执行 `nvm install <version>`

### 人类自己装的（大多数人都知道怎么装，不需要 AI）
- **浏览器**：Chrome、Edge、Firefox
- **解压工具**：WinRAR、7-Zip
- **输入法**：微信输入法、搜狗等
- **VPN**：FlClash、Clash 等
- **聊天/社交**：微信、QQ、Discord
- **常用应用**：OBS、剪映、直播工具、视频播放器、下载工具
- **设计软件**：Adobe、Figma、Blender
- **AI 桌面应用**：CC Switch、AutoGLM 等
- **任何需要 GUI 安装器的软件**

### 为什么这样分工

浏览器、输入法、聊天工具这些是日常应用，人类自己装反而更快（下载、双击、下一步）。AI 的真正价值在于处理那些**散落各处、容易遗漏、记不住的东西**：配置文件在哪、装了什么版本、哪些全局包、哪些仓库、路径怎么改。这些才是重装后真正花时间的地方。

### 恢复流程的正确模式

```
人类自己装日常应用 → AI 处理开发环境和配置 → AI 验证完整性
```

AI 不生成"人类待办清单"让人类装基础工具，而是假设人类已经装好了日常应用，AI 专注于恢复开发环境。

## 恢复前置：定位并读取 profile

恢复的第一件事是找到备份盘上的 `machine-profile.json`：

```powershell
# 搜索所有可移动盘
$drives = Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Root -match "^[D-Z]:" }
foreach ($d in $drives) {
    $profilePath = Get-ChildItem "$($d.Root)Windows重装备份" -Recurse -Filter "machine-profile.json" -ErrorAction SilentlyContinue
    if ($profilePath) {
        Write-Output "找到: $($profilePath.FullName)"
        break
    }
}
```

读取 profile 后，所有后续步骤的数据都从这里来。如果找不到 profile，告知人类并退回手动模式。

## 恢复序列

按层级执行。前一层完成并通过验证后，才进入下一层。

### 第一层：工作基础

目标：人类已装好日常应用，AI 确认基础条件满足。

**前提：人类已经自己装好了**浏览器、输入法、VPN 等日常工具。这些不需要 AI 介入。

**AI 检查：**
```powershell
# 确认基础条件满足
Test-Path "$env:ProgramFiles\Google\Chrome\Application\chrome.exe"
# 或确认能联网
Test-NetConnection www.baidu.com
```

如果人类还没装好，提醒一下就好，不要试图自动安装。

### 第二层：开发环境

目标：能运行代码、能用 AI 编程。

所有版本号和配置从 profile 读取，不硬编码。

**1. Git**

确认人类已安装 Git，如果没装提示人类装一下。装好后 AI 恢复配置：
- 还原 .gitconfig → `~/.gitconfig`
- 用 profile.backup_meta.source_paths.gitconfig 定位备份文件
- **替换旧用户名**：profile 中的 `system.username`（如 "Administrator"）→ 当前 `$env:USERNAME`
- **替换旧盘符**：如果路径变了，替换 .gitconfig 中的盘符

**2. SSH**
- 检查 profile.ssh.has_keys
- 如果 `true`：还原 ssh/ 目录到 `~/.ssh/`
- 如果 `false`：跳过，告知人类"之前没有使用 SSH 密钥"

**3. Node.js（需要人类先装 NVM）**

这一步是 AI 和人类的交接点：

**人类手动操作：**
- 从 https://github.com/yuruotong1/nvm-windows/releases 下载 NVM for Windows 安装包
- 运行安装器，完成 NVM 安装
- 告诉 AI "NVM 装好了"

**AI 接管（人类装完 NVM 后）：**
```powershell
# 按 profile.node.versions 列表逐个安装
nvm install <version1>
nvm install <version2>
nvm use <profile.node.active_version>
```

**4. pnpm**
```powershell
npm install -g pnpm
```

**5. npm 配置**
还原 .npmrc → `~/.npmrc`
- 替换 profile.system.username → 当前用户名
- 替换旧盘符 → 新盘符
- 确认 prefix 和 cache 路径在新系统上有效

**6. Python**

确认人类已安装 Python，如果没装提示人类装一下。版本参考 profile.python.version。

**7. VS Code**

确认人类已安装 VS Code，如果没装提示人类装一下。装好后 AI 恢复配置：
- 还原 settings.json（从 profile 定位备份路径）
- 如果 profile.vscode.has_snippets=true，还原 snippets
- 批量安装扩展：
```powershell
$extensions = Get-Content <备份路径>\vscode-extensions\extensions.txt
$extensions | ForEach-Object { code --install-extension $_ }
```

**8. Claude Code**（如果 profile 中有记录）
```powershell
npm install -g @anthropic-ai/claude-code
```
还原 ~/.claude/ 目录（settings、projects）。

**9. Claude Skills**（如果有备份）
还原 skills/ 到 `~/.claude/skills/`。

**10. Windows Terminal**（如果有备份）
还原 settings.json 到 Terminal 的 LocalState 目录。

**11. Chrome 书签**（如果有备份）
先安装 Chrome 并让人类登录 Google 账号同步。
如果没有 Google 同步：按 profile.chrome.profiles_with_bookmarks 列表，把每个 Profile 的 Bookmarks 文件复制到对应目录。

**验证：**
```powershell
git --version
node --version
pnpm --version
python --version
code --version
claude --version
```

### 第三层：项目恢复

目标：所有代码项目就位。

**Git 仓库恢复**：从 profile.git_repos 读取所有仓库信息，生成 clone 命令：

```powershell
$workspace = "<人类指定的工作区路径>"
cd $workspace

# 逐个 clone
# profile.git_repos 中每个条目：
#   git clone <remote> "<name>"
```

告知人类哪些仓库会被 clone，确认后执行。

**本地独有文件**：如果有 workspace-backup 目录，复制非 Git 项目到工作区。

**项目依赖安装**：对包含 package.json 的项目执行 `pnpm install`。

**验证：**
- 每个 clone 的目录能 `git status`
- 主要项目能正常启动（如 `pnpm dev`）

### 第四层：全局包恢复

从 profile.npm_global_packages 读取包列表，批量安装：

```powershell
npm install -g <package1> <package2> ...
```

### 第五层：按需工具

根据 profile 中记录的应用，告知人类哪些可以按需安装：
- 设计工具（Adobe、Figma 等）
- 自媒体工具（OBS、剪映等）
- 其他专业工具

不主动安装，等人类需要时再装。

## 恢复后审查

全部完成后，执行最终检查：

```powershell
# 1. 版本验证
Write-Output "git: $(git --version)"
Write-Output "node: $(node --version)"
Write-Output "pnpm: $(pnpm --version)"
Write-Output "python: $(python --version)"

# 2. 配置路径检查 — 确保没有旧用户名/盘符残留
$gitconfig = Get-Content ~/.gitconfig -Raw
$npmrc = Get-Content ~/.npmrc -Raw
$oldUser = "<从 profile.system.username 读取>"
if ($gitconfig -match $oldUser) { Write-Output "警告: .gitconfig 中仍有旧用户名 $oldUser" }
if ($npmrc -match $oldUser) { Write-Output "警告: .npmrc 中仍有旧用户名 $oldUser" }

# 3. SSH 检查
if (<profile.ssh.has_keys>) {
    $keys = Get-ChildItem ~/.ssh -Filter "id_*" -ErrorAction SilentlyContinue
    if ($keys.Count -eq 0) { Write-Output "警告: SSH 密钥未恢复" }
}

# 4. VS Code 扩展数量对比
$installed = (code --list-extensions).Count
$expected = <profile.vscode.extensions 数组长度>
Write-Output "VS Code 扩展: $installed/$expected"

# 5. Git 仓库数量
$repos = <profile.git_repos 数组长度>
$cloned = (Get-ChildItem <workspace> -Directory -Filter ".git" -Recurse -ErrorAction SilentlyContinue).Count
Write-Output "Git 仓库: $cloned/$repos"
```

审查清单：
1. 所有 --version 检查通过
2. 配置文件无旧用户名/旧盘符残留
3. VS Code 扩展数量匹配
4. Git 仓库全部 clone 完成
5. `git push` 测试（第一次需重新登录 GitHub）
6. 主要项目能正常启动

## 注意事项

- profile.system.username → 新系统用户名的替换是恢复中最容易出错的地方
- .npmrc 的 prefix/cache 盘符可能变化
- .gitconfig 的 editor 路径可能变化
- GitHub 凭据：第一次 push 需重新登录
- FAT32 盘单文件上限 4GB
- 有些工具可能没有安装（profile 中对应字段为 null），自动跳过
