---
name: windows-backup
description: >
  Windows 重装前的备份扫描向导。自动扫描当前系统所有配置文件、工具版本、Git 仓库、
  应用列表，生成 machine-profile.json 环境镜像文件，然后执行备份。
  当用户提到"要重装系统"、"系统备份"、"备份配置"、"重装前备份"、"C盘满了要重装"、
  "帮我找出需要备份的文件"、"换电脑"、"迁移环境"时触发。
  核心价值：零硬编码，自动适配任何人的环境，生成标准化 profile 供恢复使用。
---

# Windows 重装前备份向导

帮人类在重装系统前，系统性地扫描、定位、备份所有重要文件。配置文件散落在系统各处，遗漏任何一个都会在恢复时花几倍时间重新配置。

这个 skill 不硬编码任何用户信息。所有数据通过自动扫描采集，生成 `machine-profile.json` 作为环境镜像，恢复 skill 读取这个文件就能重建环境。

## 执行流程

### 第一步：环境扫描（自动，不问人类）

安静扫描整个系统，收集信息。扫描完成后一次性呈现结果。

**1. 基础系统信息**

```powershell
# 用户名和系统版本
$env:USERNAME
[System.Environment]::OSVersion
# 或者
(Get-CimInstance Win32_OperatingSystem).Caption
```

**2. 开发工具版本快照**

逐个运行，失败的跳过（说明没装）：

```powershell
git --version
git config --global user.name
git config --global user.email
node --version
npm --version
pnpm --version
nvm list
python --version
pip list 2>$null
code --list-extensions
npm list -g --depth=0
npm config ls
pnpm store path
```

**3. 配置文件定位**

逐项检查是否存在，记录实际路径：

| 配置 | 检查路径 | 检查方式 |
|------|---------|---------|
| Git 配置 | `~/.gitconfig` | `Test-Path` |
| SSH | `~/.ssh/` | 检查目录内容，**确认是否有密钥文件**（id_rsa、id_ed25519、id_ecdsa 等）。如果只有 config/known_hosts，标记 `has_keys: false` |
| npm 配置 | `~/.npmrc` | `Test-Path`，记录 prefix/cache 路径 |
| VS Code | `AppData\Roaming\Code\User\settings.json` | `Test-Path` |
| VS Code snippets | `AppData\Roaming\Code\User\snippets\` | 检查是否有内容 |
| Windows Terminal | `AppData\Local\Packages\Microsoft.WindowsTerminal_*\LocalState\settings.json` | 用通配符搜索 |
| Claude Code | `~/.claude/` | `Test-Path`，记录大小 |
| Docker | `~/.docker/` | `Test-Path` |
| Obsidian | `%APPDATA%\obsidian\` | `Test-Path` |

Chrome 书签需要特殊处理 — 不要只找 Default：
```powershell
Get-ChildItem "$env:LOCALAPPDATA\Google\Chrome\User Data" -Recurse -Filter "Bookmarks" -ErrorAction SilentlyContinue
```
记录找到的所有 Profile 名和对应路径。

**4. Git 仓库扫描**

扫描工作区目录，找到所有 Git 仓库：
```powershell
Get-ChildItem -Path <工作区> -Directory -Recurse -Filter ".git" -ErrorAction SilentlyContinue
```

对每个仓库记录：
- 本地目录名
- `git remote get-url origin`（远程地址）
- `git status` 是否 clean
- `git log --oneline -1`（最新提交）
- 是否有未 push 的 commit

**5. 已安装应用**

```powershell
winget list
```

### 第二步：生成 machine-profile.json

把扫描结果写入一个标准化的 JSON 文件。这个文件是整个 skill 的核心产出 — 它是恢复 skill 的蓝图。

```json
{
  "generated_at": "<ISO 8601 时间戳>",
  "generator": "windows-backup skill",
  "system": {
    "username": "<当前用户名>",
    "os": "<系统版本>",
    "workspace_path": "<工作区路径>"
  },
  "git": {
    "user_name": "<git user.name>",
    "user_email": "<git user.email>"
  },
  "ssh": {
    "has_keys": "<true/false>",
    "note": "<如果有密钥列出文件名，否则说明原因>"
  },
  "node": {
    "versions": ["<从 nvm list 提取>"],
    "active_version": "<当前版本>",
    "npm_version": "<版本号>",
    "pnpm_version": "<版本号>",
    "pnpm_store_path": "<路径>",
    "npm_prefix": "<从 npm config ls 提取>",
    "npm_cache": "<从 npm config ls 提取>",
    "npm_registry": "<从 npm config ls 提取>"
  },
  "python": {
    "version": "<版本号>",
    "packages": ["<pip list 输出>"]
  },
  "vscode": {
    "extensions": ["<code --list-extensions 输出>"],
    "has_snippets": "<true/false>"
  },
  "chrome": {
    "profiles_with_bookmarks": ["<找到的所有 Profile>"]
  },
  "npm_global_packages": ["<从 npm list -g 提取包名>"],
  "git_repos": [
    { "name": "<目录名>", "remote": "<远程地址>", "status": "<clean/dirty>" }
  ],
  "apps": {
    "installed": ["<winget list 分类整理>"]
  },
  "backup_meta": {
    "source_paths": {
      "gitconfig": "<实际路径>",
      "npmrc": "<实际路径>",
      "ssh": "<实际路径>",
      "vscode_settings": "<实际路径>",
      "vscode_snippets": "<实际路径或null>",
      "terminal_settings": "<实际路径或null>",
      "claude_config": "<实际路径>",
      "chrome_bookmarks": ["<各Profile的实际路径>"],
      "obsidian": "<实际路径或null>"
    }
  }
}
```

这个 JSON 的设计原则：
- **restore skill 只需要读这一个文件**就能知道恢复什么、从哪 clone、装什么版本
- `backup_meta.source_paths` 记录了每个配置文件的精确位置，方便复制
- 没有安装的工具对应的字段为空数组或 null，restore 时自动跳过

### 第三步：向人类呈现扫描结果

按优先级分类呈现：

```
## 扫描结果

### 必须备份（丢失不可恢复）
- SSH 密钥（如果 has_keys=true）
- 未 push 的 Git 仓库
- 本地独有文件（没有 Git 的目录）

### 强烈建议备份
- Git 配置、npm 配置
- Claude Code 配置（如果有）
- VS Code 配置和扩展列表
- Windows Terminal 配置

### 建议备份
- Chrome 书签
- Obsidian 配置
- 开发环境版本快照

### 不需要备份
- node_modules、.git、npm cache、pnpm store
```

### 第四步：确认备份目标

问人类：
1. 备份到哪个盘？
2. 备份盘容量（用 `Get-PSDrive` 检查）
3. 预估总量 vs 可用空间

空间不够时按优先级砍。注意 FAT32 单文件上限 4GB。

### 第五步：执行备份

创建目录结构：
```
<备份盘>:\Windows重装备份\<日期>\
├── machine-profile.json   ← 核心：环境镜像
├── dotfiles\              ← .gitconfig, .npmrc 等
├── ssh\                   ← SSH 配置（如果有密钥）
├── vscode\                ← settings.json, snippets（如果有）
├── vscode-extensions\     ← extensions.txt
├── terminal\              ← Windows Terminal settings（如果有）
├── claude\                ← .claude/（如果有）
├── skills\                ← skills 目录（如果有）
├── chrome\                ← 书签（按 Profile 分）
├── obsidian\              ← Obsidian 配置（如果有）
├── npm-global-list\       ← npm-global.txt
├── dev-env-info\          ← env-snapshot.txt
└── apps-list\             ← 应用清单.md
```

工作区备份单独目录（排除可重建内容）：
```
<备份盘>:\workspace-backup\
```

复制用 robocopy（排除可重建内容）：
```powershell
robocopy <源> <目标> /E /MT:8 /R:1 /W:1 /XD node_modules .git .next .cache .pnpm-store
```

**关键：machine-profile.json 放在备份根目录，这是恢复 skill 的入口。**

### 第六步：代码安全检查

检查所有 Git 仓库，确保代码安全：

```powershell
# 对 machine-profile.json 中的每个 git_repos 条目
cd <仓库路径>
git status          # 检查是否有未提交的改动
git log origin/main..HEAD --oneline  # 检查是否有未 push 的 commit
```

如果有未提交或未 push 的变更：
1. `git add` + `git commit`
2. `git push`
3. 确认远程有最新代码

更新 machine-profile.json 中的 repos status 为 "clean"。

### 第七步：验证备份完整性

```powershell
$backupRoot = "<备份盘>:\Windows重装备份\<日期>"

# 1. machine-profile.json 必须存在且是合法 JSON
$profile = Get-Content "$backupRoot\machine-profile.json" | ConvertFrom-Json

# 2. 逐项检查备份目录
$checks = @("dotfiles", "ssh", "vscode", "vscode-extensions", "terminal", "claude", "skills", "chrome", "npm-global-list", "dev-env-info")

foreach ($name in $checks) {
    $path = Join-Path $backupRoot $name
    if (-not (Test-Path $path)) {
        Write-Output "${name}: 目录不存在（可能此机器未安装对应工具）"
        continue
    }
    $fileCount = (Get-ChildItem $path -Recurse -File -ErrorAction SilentlyContinue).Count
    if ($fileCount -eq 0) {
        Write-Output "${name}: 空目录 — 需要检查是否遗漏"
    } else {
        Write-Output "${name}: 完整 ($fileCount 个文件)"
    }
}

# 3. 关键文件抽查
Get-Content "$backupRoot\dotfiles\.gitconfig" | Select-Object -First 3
Get-Content "$backupRoot\dotfiles\.npmrc" | Select-Object -First 3
```

重点排查：
- **chrome 为空** → 漏了多 Profile，用 `Get-ChildItem -Recurse -Filter "Bookmarks"` 搜索补上
- **ssh 只有 config/known_hosts** → 正常，标记 has_keys: false
- **所有仓库 status=clean** → 确认代码安全

### 第八步：生成文档

1. **应用与工具清单.md** — 按 winget list 整理分类
2. **还原指南.md** — 包含恢复步骤概要

## 常见陷阱

1. **FAT32 单文件 4GB 限制** — 大文件用 WinRAR 分卷
2. **USB 传大量小文件极慢** — 排除 node_modules 等
3. **Chrome 书签在多个 Profile** — 不要只找 Default
4. **SSH 可能没有密钥** — 有些人只用 HTTPS
5. **路径用户名会变** — profile 记录了旧路径，恢复时需替换
6. **GitHub 凭据** — 重装后第一次 push 需重新登录
7. **PE 盘不会被格式化** — 大文件可放 PE 盘
