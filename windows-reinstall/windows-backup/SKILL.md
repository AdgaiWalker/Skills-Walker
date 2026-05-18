---
name: windows-backup
description: >
  Windows 重装前的备份扫描向导。自动检测用户类型（普通人/开发者），扫描对应的配置文件、
  个人数据、开发环境，生成 machine-profile.json 环境镜像。
  当用户提到"要重装系统"、"系统备份"、"备份配置"、"重装前备份"、"C盘满了要重装"、
  "帮我找出需要备份的文件"、"换电脑"、"迁移环境"时触发。
  支持任何人使用：不需要懂技术，能看懂中文就行。
---

# Windows 重装前备份向导

帮人类在重装系统前找出所有重要文件。你不知道自己的数据散落在哪 — 这就是你要用这个 skill 的原因。

## 第一步：自动检测用户类型

先安静扫描，判断用户是哪种类型。扫描完成后告诉用户结果。

```powershell
# 检测开发者工具是否存在
$devTools = @(
    @{ Name = "Git"; Test = "git --version" },
    @{ Name = "Node.js"; Test = "node --version" },
    @{ Name = "Python"; Test = "python --version" },
    @{ Name = "VS Code"; Test = "code --version" },
    @{ Name = "Docker"; Test = "docker --version" }
)
$devCount = 0
foreach ($tool in $devTools) {
    try { Invoke-Expression $tool.Test 2>$null | Out-Null; $devCount++ } catch {}
}
```

- `$devCount >= 2` → **开发者模式**：扫描开发工具 + 个人数据
- `$devCount < 2` → **普通人模式**：只扫描个人数据

告知用户检测结果："你电脑上装了 X 个开发工具，我会按 [普通人/开发者] 模式帮你备份。"

---

## 第二步：扫描（所有人都要做的）

### 个人数据扫描（普通人 + 开发者都要）

这些是任何人重装都不想丢的东西：

```powershell
$userHome = $env:USERPROFILE

# 1. 桌面文件
$desktop = "$userHome\Desktop"
$desktopSize = [math]::Round(((Get-ChildItem $desktop -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB), 0)

# 2. 文档
$documents = [Environment]::GetFolderPath("MyDocuments")
$docsSize = [math]::Round(((Get-ChildItem $documents -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB), 0)

# 3. 下载文件夹
$downloads = "$userHome\Downloads"
$dlSize = [math]::Round(((Get-ChildItem $downloads -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB), 0)

# 4. 图片
$pictures = [Environment]::GetFolderPath("MyPictures")
$picSize = [math]::Round(((Get-ChildItem $pictures -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB), 0)

# 5. 微信数据（最大的隐藏数据）
$wechatPath = "$userHome\Documents\WeChat Files"
$wechatExists = Test-Path $wechatPath
if ($wechatExists) {
    $wechatSize = [math]::Round(((Get-ChildItem $wechatPath -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1GB), 1)
}

# 6. QQ 数据
$qqPath = "$userHome\Documents\Tencent Files"
$qqExists = Test-Path $qqPath

# 7. 浏览器书签（Chrome + Edge）
$chromeProfiles = Get-ChildItem "$env:LOCALAPPDATA\Google\Chrome\User Data" -Directory -ErrorAction SilentlyContinue |
    Where-Object { Test-Path "$($_.FullName)\Bookmarks" } | ForEach-Object { $_.Name }
$edgeProfiles = Get-ChildItem "$env:LOCALAPPDATA\Microsoft\Edge\User Data" -Directory -ErrorAction SilentlyContinue |
    Where-Object { Test-Object "$($_.FullName)\Bookmarks" } | ForEach-Object { $_.Name }

# 8. 浏览器密码（提醒用户导出）
# Chrome: 设置 → 密码 → 导出密码
# Edge: 设置 → 密码 → 导出密码
```

向用户展示扫描结果：
```
你的个人数据：
  桌面文件:        XX MB
  文档:           XX MB
  下载文件夹:      XX MB
  图片:           XX MB
  微信聊天记录:    XX GB  ← 最大的，需要特别注意
  浏览器书签:      找到 X 个 Profile

  重要提醒：浏览器保存的密码无法直接复制文件备份，
  需要你手动导出（Chrome → 设置 → 密码 → 导出密码）
```

### 开发者扫描（只有开发者模式才做）

在个人数据扫描基础上，额外扫描：

```powershell
# 开发工具版本
git --version; git config --global user.name; git config --global user.email
node --version; npm --version; pnpm --version; nvm list
python --version
code --list-extensions
npm list -g --depth=0
npm config get prefix; npm config get cache; npm config get registry
pnpm store path
```

配置文件定位：

| 配置 | 路径 | 说明 |
|------|------|------|
| Git 配置 | `~/.gitconfig` | 用户名、邮箱 |
| SSH | `~/.ssh/` | 检查是否有密钥文件 |
| npm 配置 | `~/.npmrc` | prefix、cache |
| VS Code | `AppData\Roaming\Code\User\` | settings.json、snippets |
| VS Code 扩展 | `code --list-extensions` | 扩展列表 |
| Terminal | `AppData\Local\Packages\Microsoft.WindowsTerminal_*\` | 设置 |
| Claude Code | `~/.claude/` | 配置 |

Git 仓库扫描：在工作区找所有 .git 目录，记录 remote 和 status。

### 深度扫描（所有人）

扫描"你可能不知道自己有的重要文件"：

```powershell
# 数据库文件
Get-ChildItem $userHome -Recurse -Depth 4 -Include "*.db","*.sqlite","*.sqlite3" -ErrorAction SilentlyContinue |
    Where-Object { $_.Length -gt 1MB } |
    Select-Object FullName, @{N='SizeMB';E={[math]::Round($_.Length/1MB)}}

# 许可证/密钥文件
Get-ChildItem $userHome -Recurse -Depth 3 -Include "license*","*.key","*.lic" -ErrorAction SilentlyContinue |
    Select-Object FullName

# WSL 发行版
wsl --list --verbose 2>$null

# Docker 数据
docker images 2>$null

# 大文件提示（超过 1GB 的文件）
Get-ChildItem $userHome -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Length -gt 1GB } |
    Select-Object FullName, @{N='SizeGB';E={[math]::Round($_.Length/1GB,1)}}
```

把这些发现汇总成一份"你可能遗漏的文件"列表，交给人类决定。

---

## 第三步：生成 machine-profile.json

```json
{
  "generated_at": "<ISO 8601>",
  "generator": "windows-backup skill",
  "user_type": "<developer|general>",
  "system": {
    "username": "<当前用户名>",
    "os": "<系统版本>",
    "workspace_path": "<工作区路径>"
  },
  "personal_data": {
    "desktop_path": "<路径>",
    "desktop_size_mb": 0,
    "documents_path": "<路径>",
    "documents_size_mb": 0,
    "downloads_path": "<路径>",
    "downloads_size_mb": 0,
    "pictures_path": "<路径>",
    "pictures_size_mb": 0,
    "wechat_path": "<路径或null>",
    "wechat_size_gb": 0,
    "qq_path": "<路径或null>",
    "browser_passwords_exported": false,
    "browser_passwords_note": "需要手动导出：Chrome→设置→密码→导出"
  },
  "browser": {
    "chrome_profiles": ["<列表>"],
    "edge_profiles": ["<列表>"]
  },
  "deep_scan": {
    "large_files": [{"path":"<路径>","size_gb":0}],
    "database_files": [{"path":"<路径>","size_mb":0}],
    "license_files": ["<列表>"],
    "has_wsl": false,
    "has_docker": false
  },
  "git": { "user_name": "", "user_email": "" },
  "ssh": { "has_keys": false, "note": "" },
  "node": { "versions": [], "active_version": "", "npm_prefix": "", "npm_cache": "" },
  "python": { "version": "" },
  "vscode": { "extensions": [], "has_snippets": false },
  "npm_global_packages": [],
  "git_repos": [],
  "backup_meta": {
    "backup_root_path": "<实际路径>",
    "disk_volume_label": "<卷标>",
    "source_paths": { }
  }
}
```

普通人模式下 `git`、`node`、`vscode` 等字段为空/null，restore 自动跳过。
开发者模式下 `personal_data` 也正常填充（开发者也有个人数据）。

**原子写入**（防断电损坏）：
```powershell
$jsonContent | Set-Content "$backupRoot\machine-profile.json.tmp" -Encoding UTF8
try { Get-Content "$backupRoot\machine-profile.json.tmp" -Raw | ConvertFrom-Json | Out-Null } catch { Write-Error "JSON 验证失败" }
Move-Item "$backupRoot\machine-profile.json.tmp" "$backupRoot\machine-profile.json" -Force
```

---

## 第四步：确认备份目标

问人类备份到哪个盘。获取盘符后自动检查：

```powershell
$volume = Get-Volume -DriveLetter $driveLetter -ErrorAction SilentlyContinue
Write-Output "文件系统: $($volume.FileSystemType)"

if ($volume.FileSystemType -eq "FAT32") {
    Write-Output "你的U盘是FAT32格式，单文件不能超过4GB。"
    Write-Output "建议：把U盘格式化为exFAT（右键U盘→格式化→选exFAT）"
}
```

展示预估大小 vs 可用空间，不够时按优先级砍。

---

## 第五步：执行备份

目录结构：
```
<备份目录>\
├── machine-profile.json
├── personal\              ← 所有人都有
│   ├── desktop\
│   ├── documents\
│   ├── downloads\
│   ├── pictures\
│   ├── wechat\            ← 如果有的话
│   ├── qq\                ← 如果有的话
│   └── browser-bookmarks\
├── dotfiles\              ← 开发者才有
├── ssh\
├── vscode\
├── vscode-extensions\
├── terminal\
├── claude\
├── skills\
├── npm-global-list\
└── dev-env-info\
```

**复制前提醒：**
- 如果微信/QQ 在运行 → 提示关闭后再备份（文件被锁定）
- 如果 Chrome 在运行 → 书签文件被锁，提示关闭

**robocopy 命令：**
```powershell
robocopy "$source" "$target" /E /MT:8 /R:1 /W:1 /XD node_modules .git .next .cache .pnpm-store
```

检查退出码：`if ($LASTEXITCODE -ge 8) { 报错 }`（0-7 都是正常的）

---

## 第六步：验证

```powershell
$backupRoot = "<备份目录>"

# 1. 验证 profile JSON
try { $profile = Get-Content "$backupRoot\machine-profile.json" -Raw -Encoding UTF8 | ConvertFrom-Json }
catch { Write-Error "profile 损坏: $($_.Exception.Message)" }

# 2. 逐项检查
foreach ($name in @("personal", "dotfiles", "ssh", "vscode", "vscode-extensions", "claude")) {
    $path = Join-Path $backupRoot $name
    if (Test-Path $path) {
        $count = (Get-ChildItem $path -Recurse -File -ErrorAction SilentlyContinue).Count
        if ($count -eq 0) { Write-Output "${name}: 空目录 — 可能遗漏" }
        else { Write-Output "${name}: $count 个文件" }
    }
}

# 3. 特别检查个人数据
$personalDir = Join-Path $backupRoot "personal"
if (Test-Path $personalDir) {
    $totalMB = [math]::Round(((Get-ChildItem $personalDir -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB), 0)
    Write-Output "个人数据: $totalMB MB"
}
```

---

## 第七步：生成文档

1. **备份清单.md** — 备份了什么，每个目录多大
2. **还原指南.md** — 重装后怎么恢复

## 常见陷阱

1. **微信数据可能十几 GB** — FAT32 放不下，exFAT 或 NTFS 才行
2. **微信/QQ 运行时文件被锁** — 备份前先关闭
3. **浏览器密码不能直接复制文件** — 必须手动导出
4. **FAT32 单文件 4GB 限制** — 建议格式化为 exFAT
5. **robocopy 退出码** — 0-7 正常，8+ 才报错
6. **中文用户名路径** — 所有文件操作用 UTF-8 编码
