---
name: windows-backup
description: >
  Windows 重装前的备份扫描向导。帮用户系统性地找出散落在系统各处的配置文件、工具列表、
  项目数据，生成完整备份清单并执行备份。当用户提到"要重装系统"、"系统备份"、"备份配置"、
  "重装前备份"、"C盘满了要重装"、"帮我找出需要备份的文件"时触发。
  也适用于用户说"我要换电脑"、"迁移环境"等场景。
  核心价值：避免遗漏配置文件，避免东找西找的混乱过程。
---

# Windows 重装前备份向导

你的任务是帮人类在重装系统前，系统性地扫描、定位、备份所有重要文件。人类可能觉得"没什么重要的"，但实际上配置文件散落在系统的各个角落，遗漏任何一个都会在恢复时花几倍的时间重新配置。

## 执行流程

### 第一步：环境扫描（自动，不需要人类确认）

先安静地扫描整个系统，收集信息。不要在这一步问人类任何问题。扫描完成后，一次性呈现结果。

扫描这些内容：

**1. 开发工具配置文件**（按优先级排列）

| 配置 | 路径 | 说明 |
|------|------|------|
| Git 配置 | `~/.gitconfig` | 用户名、邮箱、alias、editor |
| SSH 密钥 | `~/.ssh/` | **先检查是否真的有密钥文件**（id_rsa、id_ed25519 等）。有些人只用 HTTPS，目录存在但内容是空的 — 这种情况不需要备份，恢复时注明"无需恢复 SSH" |
| npm 配置 | `~/.npmrc` | prefix、cache、registry |
| pnpm store 路径 | `pnpm store path` | 记录位置，不需要复制 |
| NVM 版本列表 | `nvm list` | 记录安装了哪些版本 |
| Claude Code 配置 | `~/.claude/` | settings、project memories、skills |
| VS Code 配置 | `AppData\Roaming\Code\User\` | settings.json、snippets。**先检查 snippets 目录是否有内容**，空目录不需要备份 |
| VS Code 扩展 | `code --list-extensions` | 记录扩展列表 |
| Windows Terminal | `AppData\Local\Packages\Microsoft.WindowsTerminal_...\LocalState\settings.json` | 终端配置 |
| Python pip 包 | `pip list` | 记录全局包 |

**2. 开发环境版本快照**

自动收集这些版本信息（全部用 `--version` 或等效命令）：
```
node --version
npm --version
pnpm --version
nvm list
git --version
python --version
code --list-extensions
npm list -g --depth=0
npm config ls
pnpm store path
git config --global user.name
git config --global user.email
```

**3. 应用配置文件**（常见位置）

| 应用 | 可能的配置位置 | 扫描技巧 |
|------|------|------|
| Chrome 书签 | `AppData\Local\Google\Chrome\User Data\` | 不要只找 Default，搜索所有 Profile 目录下的 Bookmarks 文件 |
| Obsidian | `%APPDATA%\obsidian\` | 直接复制 |
| Docker | `~/.docker\` | 检查是否存在 |
| FlClash | 安装目录下的配置 | 检查是否存在 |

Chrome 书签的实际路径因人而异 — 有人在 Default Profile，有人有多个 Profile（Profile 7、8、9 等）。正确的扫描方式：
```powershell
Get-ChildItem "$env:LOCALAPPDATA\Google\Chrome\User Data" -Recurse -Filter "Bookmarks" -ErrorAction SilentlyContinue
```
这会找到所有 Profile 的书签文件，避免遗漏

**4. 项目和本地文件**

- 扫描工作区目录（桌面、常用开发目录）
- 识别哪些项目有 Git（已 push 到远程的安全，未 push 的需要备份）
- 识别没有 Git 的本地独有文件

**5. 已安装应用清单**

用 `winget list` 和手动扫描开始菜单，生成分类清单：
- 工作基础（浏览器、VPN、输入法、AI工具、解压工具）
- 开发（IDE、CLI、版本管理、包管理器）
- 部署（Docker、云工具）
- 设计（Adobe、Figma、Blender）
- 自媒体（OBS、剪映、直播工具）
- 办公协作
- 社交生活
- 系统基础

### 第二步：向人类呈现扫描结果

扫描完成后，按这个结构呈现：

```
## 扫描结果

### 必须备份（丢失不可恢复）
- SSH 密钥（~/.ssh/）— 私钥丢失 = 无法连接服务器
- 未 push 的 Git 仓库 — 代码丢失
- 本地独有文件 — 没有远程备份的文件

### 强烈建议备份（重装后需要大量时间重配）
- Git 配置（~/.gitconfig）
- npm 配置（~/.npmrc）
- Claude Code 配置（~/.claude/）
- VS Code 配置和扩展列表
- Windows Terminal 配置

### 建议备份（省去重新安装和配置的时间）
- Chrome 书签
- Obsidian 配置
- 开发环境版本快照

### 不需要备份（可重建）
- node_modules（pnpm install 重建）
- .git 目录（远程已有）
- npm cache（自动重建）
- pnpm store（自动重建）
- 系统临时文件
```

### 第三步：确认备份目标和空间

问人类：
1. 备份到哪个盘？（U盘？移动硬盘？）
2. 备份盘容量多少？（用 `Get-PSDrive` 检查）
3. 预估备份总量 vs 可用空间

如果空间不够，按优先级从"不需要备份"开始砍，然后砍"建议备份"。

注意：
- FAT32 格式的盘单文件上限 4GB，大文件需要用 WinRAR 分卷压缩
- USB 2.0 传输大量小文件极慢（如 node_modules），优先排除可重建的内容

### 第四步：执行备份

创建备份目录结构：
```
<备份盘>:\Windows重装备份\<日期>\
├── dotfiles\          ← .gitconfig, .npmrc 等
├── ssh\               ← SSH 配置和密钥
├── vscode\            ← settings.json, snippets
├── vscode-extensions\ ← extensions.txt
├── terminal\          ← Windows Terminal settings
├── claude\            ← .claude/ 完整目录
├── skills\            ← Claude Skills + 其他 skills
├── chrome\            ← 书签和偏好
├── obsidian\          ← Obsidian 配置
├── npm-global-list\   ← npm 全局包列表
└── dev-env-info\      ← 版本快照
```

桌面完整备份单独一个目录：
```
<备份盘>:\桌面完整备份\
```

复制命令用 robocopy：
```powershell
robocopy <源> <目标> /E /MT:8 /R:1 /W:1
```
- `/MT:8` 多线程加速
- `/R:1 /W:1` 减少重试等待

排除可重建内容：
```powershell
robocopy <源> <目标> /E /MT:8 /XD node_modules .git .next .cache
```

### 第五步：代码安全检查

在备份之前，检查所有 Git 仓库：
```powershell
# 找到所有 Git 仓库
Get-ChildItem -Path <工作区> -Directory -Recurse -Filter ".git" -ErrorAction SilentlyContinue

# 检查每个仓库的状态
cd <仓库路径>
git status
git log --oneline -5
git remote -v
```

如果有未提交或未 push 的变更：
1. 先 `git add` + `git commit`
2. 然后 `git push`
3. 确认远程有最新代码后再继续

### 第六步：验证备份完整性

备份完成后，执行自动审查：

```powershell
# 逐项检查备份目录
$backupRoot = "<备份盘>:\Windows重装备份\<日期>"
$checks = @(
    @{ Name = "dotfiles"; Path = "$backupRoot\dotfiles"; Critical = $true; Files = @(".gitconfig", ".npmrc") }
    @{ Name = "ssh"; Path = "$backupRoot\ssh"; Critical = $false; Note = "可能没有密钥（用 HTTPS）" }
    @{ Name = "vscode"; Path = "$backupRoot\vscode"; Critical = $true; Files = @("settings.json") }
    @{ Name = "vscode-extensions"; Path = "$backupRoot\vscode-extensions"; Critical = $true; Files = @("extensions.txt") }
    @{ Name = "terminal"; Path = "$backupRoot\terminal"; Critical = $false }
    @{ Name = "claude"; Path = "$backupRoot\claude"; Critical = $true }
    @{ Name = "skills"; Path = "$backupRoot\skills"; Critical = $true }
    @{ Name = "chrome"; Path = "$backupRoot\chrome"; Critical = $false; Note = "如果为空，检查是否漏了多 Profile" }
    @{ Name = "npm-global-list"; Path = "$backupRoot\npm-global-list"; Critical = $false }
    @{ Name = "dev-env-info"; Path = "$backupRoot\dev-env-info"; Critical = $false }
)

foreach ($c in $checks) {
    $exists = Test-Path $c.Path
    $hasContent = $exists -and (Get-ChildItem $c.Path -Recurse -File -ErrorAction SilentlyContinue).Count -gt 0
    $status = if (-not $exists) { "缺失" } elseif (-not $hasContent) { "空目录" } else { "完整" }
    Write-Output "$($c.Name): $status"
}
```

重点检查：
1. **chrome 目录是否为空** — 如果为空，说明漏了多 Profile 书签，用 `Get-ChildItem` 搜索所有 Profile 的 Bookmarks 文件补上
2. **ssh 目录是否只有 config 和 known_hosts** — 如果没有 id_rsa/id_ed25519 等密钥文件，标注"此机器未使用 SSH 密钥，恢复时跳过"
3. **关键配置文件可读** — `Get-Content` 抽查 .gitconfig、.npmrc、settings.json
4. **记录备份盘剩余空间**
5. **Git 仓库全部 push 完成** — 所有 repo 的 `git status` 都是 clean

生成一份审查报告，呈现给人类确认。

### 第七步：生成两份文档

1. **应用与工具清单.md** — 人类可读的完整应用分类清单
2. **还原指南.md** — 重装后的恢复步骤

## 常见陷阱（从实际经验总结）

1. **FAT32 的 4GB 限制**：大文件（如 Adobe 安装包）需要用 WinRAR 分卷压缩
2. **USB 传大量小文件极慢**：排除 node_modules 等可重建目录
3. **WinRAR 压缩微信文件失败**：数万个小文件 + 中文文件名，压缩可能不靠谱，单独处理
4. **路径中的用户名**：所有配置文件里的 `C:\Users\Administrator` 在新系统可能不同
5. **盘符变化**：.npmrc 的 prefix、.gitconfig 的 editor 路径中的盘符可能变化
6. **GitHub 凭据**：重装后第一次 push 需要重新登录
7. **备用空间估算要留余量**：实际占用通常比预估多 10-20%
8. **PE 盘不会被格式化**：可以把大文件放到 PE 盘上
