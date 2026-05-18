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
$env:USERNAME
(Get-CimInstance Win32_OperatingSystem).Caption
# 检查管理员权限
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
```

**2. 工作区自动发现**

不要假设工作区在桌面。自动搜索含 .git 最多的目录：

```powershell
$candidates = @(
    "$env:USERPROFILE\Desktop",
    "$env:USERPROFILE",
    "D:\", "E:\", "F:\"
)
$bestPath = $null
$bestCount = 0
foreach ($p in $candidates) {
    if (-not (Test-Path $p)) { continue }
    $count = (Get-ChildItem $p -Directory -Depth 2 -Filter ".git" -ErrorAction SilentlyContinue).Count
    if ($count -gt $bestCount) { $bestCount = $count; $bestPath = $p }
}
Write-Output "建议工作区: $bestPath (发现 $bestCount 个 Git 仓库)"
```

让人类确认或指定其他路径。

**3. 开发工具版本快照**

逐个运行，失败跳过（说明没装）。用单独的 `get` 命令获取 npm 配置，不要解析 `npm config ls` 的完整输出：

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
npm config get prefix
npm config get cache
npm config get registry
pnpm store path
```

**4. 配置文件定位**

逐项检查，记录实际路径。用环境变量展开记录语义路径：

| 配置 | 检查方式 | 记录语义路径 |
|------|---------|-------------|
| Git 配置 | `Test-Path ~/.gitconfig` | `%USERPROFILE%\.gitconfig` |
| SSH | 检查目录内容，确认是否有 id_rsa/id_ed25519 等密钥文件 | `%USERPROFILE%\.ssh\` |
| npm 配置 | `Test-Path ~/.npmrc` | `%USERPROFILE%\.npmrc` |
| VS Code | `Test-Path "$env:APPDATA\Code\User\settings.json"` | `%APPDATA%\Code\User\settings.json` |
| VS Code snippets | 检查 snippets 目录是否有文件 | `%APPDATA%\Code\User\snippets\` |
| Windows Terminal | 通配符搜索 `Microsoft.WindowsTerminal_*\LocalState\settings.json` | `%LOCALAPPDATA%\Packages\Microsoft.WindowsTerminal_*\LocalState\settings.json` |
| Claude Code | `Test-Path ~/.claude/` | `%USERPROFILE%\.claude\` |
| Docker | `Test-Path ~/.docker/` | `%USERPROFILE%\.docker\` |
| Obsidian | `Test-Path "$env:APPDATA\obsidian\"` | `%APPDATA%\obsidian\` |

Chrome 书签搜索所有 Profile：
```powershell
Get-ChildItem "$env:LOCALAPPDATA\Google\Chrome\User Data" -Directory -ErrorAction SilentlyContinue |
  Where-Object { Test-Path "$($_.FullName)\Bookmarks" } |
  ForEach-Object { $_.Name }
```

**5. Git 仓库扫描**

在确认的工作区内扫描：
```powershell
Get-ChildItem -Path <工作区> -Directory -Depth 2 -Filter ".git" -ErrorAction SilentlyContinue
```

对每个仓库记录：目录名、remote URL、status、最新 commit、是否有未 push 的 commit。

**6. 已安装应用**

```powershell
winget list
```

如果 winget 不可用（Windows 10 早期版本），fallback 到注册表扫描：
```powershell
Get-ItemProperty "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*" |
  Select-Object DisplayName, DisplayVersion |
  Where-Object { $_.DisplayName }
```

### 第二步：生成 machine-profile.json

核心产出。这个 JSON 是恢复 skill 的蓝图，必须完整且正确。

```json
{
  "generated_at": "<ISO 8601>",
  "generator": "windows-backup skill",
  "system": {
    "username": "<当前用户名>",
    "os": "<系统版本>",
    "workspace_path": "<工作区路径>"
  },
  "git": {
    "user_name": "<值>",
    "user_email": "<值>"
  },
  "ssh": {
    "has_keys": true,
    "key_files": ["id_rsa", "id_ed25519"],
    "note": "<说明>"
  },
  "node": {
    "versions": ["<列表>"],
    "active_version": "<值>",
    "npm_version": "<值>",
    "pnpm_version": "<值>",
    "pnpm_store_path": "<值>",
    "npm_prefix": "<值>",
    "npm_cache": "<值>",
    "npm_registry": "<值>"
  },
  "python": {
    "version": "<值>",
    "packages": ["<列表>"]
  },
  "vscode": {
    "extensions": ["<列表>"],
    "has_snippets": true
  },
  "chrome": {
    "profiles_with_bookmarks": ["<列表>"]
  },
  "npm_global_packages": ["<列表>"],
  "git_repos": [
    { "name": "<目录名>", "remote": "<URL>", "status": "<clean/dirty>", "unpushed": false }
  ],
  "apps": {
    "installed": ["<列表>"]
  },
  "backup_meta": {
    "backup_root_path": "<备份根目录的绝对路径>",
    "disk_volume_label": "<外接盘的卷标>",
    "source_paths": {
      "gitconfig": "<绝对路径>",
      "gitconfig_semantic": "%USERPROFILE%\\.gitconfig",
      "npmrc": "<绝对路径>",
      "npmrc_semantic": "%USERPROFILE%\\.npmrc",
      "ssh": "<绝对路径>",
      "ssh_semantic": "%USERPROFILE%\\.ssh",
      "vscode_settings": "<绝对路径或null>",
      "vscode_settings_semantic": "%APPDATA%\\Code\\User\\settings.json",
      "vscode_snippets": "<绝对路径或null>",
      "terminal_settings": "<绝对路径或null>",
      "claude_config": "<绝对路径或null>",
      "chrome_bookmarks": ["<各Profile的绝对路径>"],
      "obsidian": "<绝对路径或null>"
    }
  }
}
```

**关键设计点：**
- 每个路径同时记录绝对路径和语义路径（用 `%USERPROFILE%`、`%APPDATA%` 等环境变量）
- restore 优先用语义路径（环境变量展开），fallback 到绝对路径
- 未安装的工具对应字段为 `null` 或空数组 `[]`
- `disk_volume_label` 记录外接盘卷标，恢复时按卷标匹配

**原子写入**（防止写入中途断电导致 JSON 损坏）：
```powershell
$tmpFile = "$backupRoot\machine-profile.json.tmp"
$jsonContent | Set-Content -Path $tmpFile -Encoding UTF8
# 验证 JSON 合法性
try { Get-Content $tmpFile -Raw | ConvertFrom-Json | Out-Null } catch {
    Write-Error "JSON 验证失败"; return
}
Move-Item $tmpFile "$backupRoot\machine-profile.json" -Force
```

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

问人类备份到哪个盘。获取盘符后，**自动检查**：

```powershell
$targetDrive = "<人类指定的盘符，如 E:>"
$drive = Get-PSDrive -Name $targetDrive.Substring(0,1)

# 1. 检查文件系统格式
$volume = Get-Volume -DriveLetter $targetDrive.Substring(0,1) -ErrorAction SilentlyContinue
Write-Output "文件系统: $($volume.FileSystemType)"

if ($volume.FileSystemType -eq "FAT32") {
    Write-Output "警告: FAT32 格式，单文件上限 4GB。建议格式化为 exFAT 或 NTFS。"
    Write-Output "  如果有大文件（Adobe 安装包等），需要用 WinRAR 分卷压缩。"
}
if ($volume.FileSystemType -eq "exFAT") {
    Write-Output "注意: exFAT 没有日志，传输中断可能损坏文件。备份完成后务必验证。"
}

# 2. 检查可用空间 vs 预估大小
# 逐个估算需要备份的目录大小
$dirs = @(
    @{ Name = "dotfiles"; Path = "$env:USERPROFILE\.gitconfig" },
    @{ Name = "claude"; Path = "$env:USERPROFILE\.claude" },
    @{ Name = "skills"; Path = "$env:USERPROFILE\.claude\skills" }
)
$totalMB = 0
foreach ($d in $dirs) {
    if (Test-Path $d.Path) {
        $size = (Get-ChildItem $d.Path -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
        $totalMB += $size
    }
}
Write-Output "预估配置文件备份: $([math]::Round($totalMB)) MB"
Write-Output "外接盘可用: $([math]::Round($drive.Free / 1GB)) GB"

if ($totalMB * 1MB -gt $drive.Free * 0.9) {
    Write-Output "警告: 空间可能不够（预留 10% 余量）"
}

# 3. 记录卷标
Write-Output "盘卷标: $($volume.FileSystemLabel)"
```

### 第五步：执行备份

**让人类确认备份目录名**（不硬编码 `Windows重装备份`）：
```
默认: <盘>:\system-backup\<日期>\
人类可以自定义目录名
```

创建目录结构，目录名由人类决定：
```
<备份目录>\
├── machine-profile.json   ← 核心：环境镜像
├── dotfiles\
├── ssh\
├── vscode\
├── vscode-extensions\
├── terminal\
├── claude\
├── skills\
├── chrome\
├── obsidian\
├── npm-global-list\
├── dev-env-info\
└── apps-list\
```

工作区备份单独目录（排除可重建内容）：
```
<备份目录>\..\workspace-backup\
```

**复制前检查 Chrome 是否运行**（书签文件被锁定时 robocopy 会静默跳过）：
```powershell
if (Get-Process chrome -ErrorAction SilentlyContinue) {
    Write-Output "Chrome 正在运行，书签文件可能被锁定。建议关闭 Chrome 后再备份书签。"
    # 不强制关闭，让人类决定
}
```

**robocopy 命令**（路径用引号包裹，支持空格和中文）：
```powershell
robocopy "$source" "$target" /E /MT:8 /R:1 /W:1 /XD node_modules .git .next .cache .pnpm-store
```

**检查 robocopy 退出码**（0-7 都正常，8+ 才是错误）：
```powershell
$exitCode = $LASTEXITCODE
if ($exitCode -ge 8) {
    Write-Error "复制失败！退出码: $exitCode（8=部分失败，16=严重错误）"
} else {
    Write-Output "复制完成，退出码: $exitCode"
}
```

**关键：machine-profile.json 放在备份根目录，这是恢复 skill 的入口。**

### 第六步：代码安全检查

```powershell
foreach ($repo in profile.git_repos) {
    cd "<工作区>\$($repo.name)"
    $status = git status --porcelain
    if ($status) {
        Write-Output "$($repo.name): 有未提交的改动"
        # 人类确认后 commit + push
    }
    $unpushed = git log "$($repo.remote)/main..HEAD" --oneline 2>$null
    if ($unpushed) {
        Write-Output "$($repo.name): 有 $($unpushed.Count) 个未 push 的 commit"
        # push 失败不阻断流程，标记 unpushed=true
    }
}
```

push 失败时在 profile 中标记 `"unpushed": true`，不阻断。已 commit 的代码本地是安全的。

### 第七步：验证备份完整性

```powershell
$backupRoot = "<备份目录>"

# 1. 验证 profile JSON 完整性
try {
    $profile = Get-Content "$backupRoot\machine-profile.json" -Raw -Encoding UTF8 | ConvertFrom-Json
} catch {
    Write-Error "machine-profile.json 损坏: $($_.Exception.Message)"
    Write-Output "尝试手动检查备份文件..."
    return
}

# 2. 逐项检查（不存在=未安装对应工具，空目录=可能遗漏）
foreach ($name in @("dotfiles", "ssh", "vscode", "vscode-extensions", "terminal", "claude", "skills", "chrome", "npm-global-list", "dev-env-info")) {
    $path = Join-Path $backupRoot $name
    if (-not (Test-Path $path)) {
        Write-Output "${name}: 不存在（可能未安装对应工具）"
        continue
    }
    $fileCount = (Get-ChildItem $path -Recurse -File -ErrorAction SilentlyContinue).Count
    if ($fileCount -eq 0) {
        Write-Output "${name}: 空目录 — 检查是否遗漏"
    } else {
        Write-Output "${name}: $fileCount 个文件"
    }
}

# 3. 抽查关键文件
$keyFiles = @(
    "$backupRoot\dotfiles\.gitconfig",
    "$backupRoot\dotfiles\.npmrc",
    "$backupRoot\vscode-extensions\extensions.txt"
)
foreach ($f in $keyFiles) {
    if (Test-Path $f) {
        $content = Get-Content $f -Encoding UTF8 -First 2
        Write-Output "$f -> 可读"
    }
}
```

### 第八步：生成文档

1. **应用与工具清单.md** — 按已安装应用分类整理
2. **还原指南.md** — 包含恢复步骤概要

## 常见陷阱

1. **FAT32 单文件 4GB 限制** — 大文件用 WinRAR 分卷
2. **USB 传大量小文件极慢** — 排除 node_modules 等
3. **Chrome 书签在多个 Profile** — 搜索所有 Profile，不限于 Default
4. **SSH 可能没有密钥** — 检查后再决定是否备份
5. **路径用户名会变** — profile 同时记录绝对路径和语义路径
6. **GitHub 凭据** — 重装后第一次 push 需重新登录
7. **robocopy 退出码** — 0-7 正常，8+ 才是错误
8. **Chrome 运行时书签被锁** — 备份前提示关闭 Chrome
9. **中文用户名/路径编码** — 所有文件操作用 UTF-8
10. **exFAT 无日志** — 传输中断可能损坏，备份后必须验证
