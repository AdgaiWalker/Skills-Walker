---
name: windows-restore
description: >
  Windows 全盘重装后的环境恢复向导。自动检测用户类型（普通人/开发者），从备份恢复个人数据
  和/或开发环境。当用户提到"重装系统后恢复"、"新系统环境配置"、"还原备份"、"从备份恢复"、
  "刚装完系统"、"帮我恢复环境"、"按照备份恢复"时触发。
  即使用户没明确说"恢复"，只要上下文表明是全新 Windows 需要还原环境，就应该触发。
  支持任何人使用：不需要懂技术，能看懂中文就行。
---

# Windows 环境恢复向导

重装完系统了？别慌，你的数据都在备份盘上。我来帮你找回来。

## 核心原则

**人类主权**：人类决定恢复什么、装到哪里。我不自行安装软件或修改系统配置。

**做减法**：只恢复需要的，不装暂时不用的工具。

**量变质变**：每一步完成后验证，发现问题立刻告诉人类。

## AI 能力边界

AI 能做的：复制文件、安装命令行工具、恢复配置、验证完整性。
AI 做不了的：安装需要点击的软件（浏览器、输入法、微信等）。

```
人类自己装日常应用（浏览器、微信、输入法...）
        ↓
AI 恢复个人数据和配置（从备份复制文件、恢复书签...）
        ↓
AI 验证完整性（检查文件数量、路径是否正确）
```

## 恢复前置：找到备份

### 找到 profile

外接盘插上后，盘符可能变了（备份时是 J:，现在可能是 E:）。

```powershell
$profilePath = $null

# 1. 遍历所有盘，限制深度 3 层，搜索 machine-profile.json
$drives = Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Root -match "^[D-Z]:" }
foreach ($d in $drives) {
    $found = Get-ChildItem "$($d.Root)" -Recurse -Depth 3 -Filter "machine-profile.json" -ErrorAction SilentlyContinue
    if ($found) { $profilePath = $found[0]; break }
}

if ($profilePath) { Write-Output "找到备份: $($profilePath.FullName)" }
else { Write-Output "没找到备份文件。请确认外接盘已插入，或告诉我备份在哪个路径。" }
```

### 读取 profile（带容错）

```powershell
try {
    $profile = Get-Content $profilePath.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
} catch {
    Write-Output "备份文件损坏了。但别担心，备份目录下还有 personal/、dotfiles/ 等文件夹。"
    Write-Output "我们可以手动恢复——你告诉我哪些目录有，我来帮你复制。"
    return
}
```

### 确认用户类型

读取 profile.user_type：
- `"general"` → 普通人模式：只恢复个人数据
- `"developer"` → 开发者模式：恢复个人数据 + 开发环境

告知人类："你的备份是 [普通人/开发者] 模式的，我会恢复 [个人数据 / 个人数据+开发环境]。"

---

## 第一层：个人数据恢复（所有人都要做）

这是最重要的。个人数据丢了就真的没了。

**前提：人类已经自己装好了**浏览器、微信等基本应用。

### 1. 桌面文件

```powershell
$source = "<备份目录>\personal\desktop"
$target = "$env:USERPROFILE\Desktop"
robocopy "$source" "$target" /E /MT:8 /R:1 /W:1
```

### 2. 文档

```powershell
$source = "<备份目录>\personal\documents"
$target = [Environment]::GetFolderPath("MyDocuments")
robocopy "$source" "$target" /E /MT:8 /R:1 /W:1
```

### 3. 下载文件夹

```powershell
$source = "<备份目录>\personal\downloads"
$target = "$env:USERPROFILE\Downloads"
robocopy "$source" "$target" /E /MT:8 /R:1 /W:1
```

### 4. 图片

```powershell
$source = "<备份目录>\personal\pictures"
$target = [Environment]::GetFolderPath("MyPictures")
robocopy "$source" "$target" /E /MT:8 /R:1 /W:1
```

### 5. 微信聊天记录（如果有）

微信数据恢复有特殊要求：**必须先登录微信一次再退出**，让微信创建用户文件夹，然后覆盖。

```powershell
if (Test-Path "<备份目录>\personal\wechat") {
    Write-Output "微信聊天记录恢复步骤："
    Write-Output "  1. 先打开微信，登录你的账号"
    Write-Output "  2. 登录后完全退出微信（托盘图标也要关掉）"
    Write-Output "  3. 告诉我'微信退出了'，我来复制数据"
    # 人类确认后：
    $wechatSource = "<备份目录>\personal\wechat\*"
    $wechatTarget = "$env:USERPROFILE\Documents\WeChat Files"
    robocopy "$wechatSource" "$wechatTarget" /E /MT:8 /R:1 /W:1
}
```

### 6. 浏览器书签

```powershell
# Chrome：让人类先登录 Google 账号同步
# 如果没 Google 同步，手动复制 Bookmarks 文件到对应 Profile 目录

# 如果备份了 Chrome 书签文件
if (Test-Path "<备份目录>\personal\browser-bookmarks") {
    Write-Output "浏览器书签恢复："
    Write-Output "  最简单的方法：登录 Google/微软账号自动同步"
    Write-Output "  如果没有账号同步，告诉我，我帮你手动复制书签文件"
}
```

### 7. 浏览器密码提醒

```powershell
if ($profile.personal_data.browser_passwords_exported -eq $false) {
    Write-Output "提醒：浏览器保存的密码在备份时没有导出。"
    Write-Output "  如果你的密码很重要，现在可以在旧备份电脑上导出（如果还没重装的话）。"
    Write-Output "  或者重新登录各个网站时选择'记住密码'。"
}
```

**验证个人数据：**
```powershell
$dirs = @(
    "$env:USERPROFILE\Desktop",
    [Environment]::GetFolderPath("MyDocuments"),
    "$env:USERPROFILE\Downloads",
    [Environment]::GetFolderPath("MyPictures")
)
foreach ($d in $dirs) {
    $count = (Get-ChildItem $d -File -ErrorAction SilentlyContinue).Count
    Write-Output "$d : $count 个文件"
}
```

---

## 第二层：开发环境恢复（只有开发者模式）

只在 `user_type = "developer"` 时执行。普通人直接跳到验证。

### 路径替换（关键环节）

恢复配置文件时需要替换旧机器的路径。用正则边界限定，防止子串误匹配：

```powershell
function Repair-ConfigPaths {
    param([string]$Content, [string]$OldUser, [string]$NewUser)
    if ($OldUser -and $NewUser -and $OldUser -ne $NewUser) {
        $escaped = [regex]::Escape($OldUser)
        $Content = $Content -replace "(?<=[\\/])$escaped(?=[\\/`"']|\s|$)", $NewUser
    }
    return $Content
}
```

语义路径优先：
```powershell
function Expand-SemanticPath {
    param([string]$Path)
    return $Path -replace '%USERPROFILE%', $env:USERPROFILE `
                 -replace '%APPDATA%', $env:APPDATA `
                 -replace '%LOCALAPPDATA%', $env:LOCALAPPDATA
}
```

### Git 配置恢复

```powershell
# 人类确认已安装 Git
$gitconfig = Get-Content "<备份目录>\dotfiles\.gitconfig" -Raw -Encoding UTF8
$gitconfig = Repair-ConfigPaths $gitconfig $profile.system.username $env:USERNAME
Set-Content -Path "$env:USERPROFILE\.gitconfig" -Value $gitconfig -Encoding UTF8
```

### SSH 恢复（如果有密钥）

```powershell
if ($profile.ssh.has_keys -eq $true) {
    Copy-Item "<备份目录>\ssh\*" "$env:USERPROFILE\.ssh\" -Recurse -Force
}
```

### Node.js（需要人类先装 NVM）

```powershell
Write-Output "Node.js 安装步骤："
Write-Output "  1. 打开浏览器访问 https://github.com/yuruotong1/nvm-windows/releases"
Write-Output "  2. 下载最新的 nvm-setup.exe 并安装"
Write-Output "  3. 装好后告诉我'NVM装好了'"
# 人类确认后：
foreach ($v in $profile.node.versions) {
    nvm install $v
    if ($LASTEXITCODE -ne 0) { Write-Output "Node $v 安装失败，跳过" }
}
nvm use $profile.node.active_version
```

### npm 配置 + pnpm + 全局包

```powershell
npm install -g pnpm
# 还原 .npmrc（替换路径）
# 逐个安装全局包（一个失败不影响其他）
foreach ($pkg in $profile.npm_global_packages) {
    npm install -g $pkg 2>$null
}
```

### VS Code 扩展

```powershell
# 人类确认已安装 VS Code
foreach ($ext in $profile.vscode.extensions) {
    code --install-extension $ext 2>$null
}
```

### Claude Code

```powershell
npm install -g @anthropic-ai/claude-code
# 还原 .claude/ 目录
```

---

## 第三层：项目恢复（只有开发者模式）

```powershell
foreach ($repo in $profile.git_repos) {
    git clone $repo.remote "$workspace\$($repo.name)"
    if ($LASTEXITCODE -ne 0) { Write-Output "$($repo.name) clone 失败" }
}
```

---

## 恢复后审查

```powershell
# 个人数据检查（所有人）
Write-Output "=== 个人数据恢复检查 ==="
$checks = @{
    "桌面" = "$env:USERPROFILE\Desktop"
    "文档" = [Environment]::GetFolderPath("MyDocuments")
    "图片" = [Environment]::GetFolderPath("MyPictures")
}
foreach ($name in $checks.Keys) {
    $count = (Get-ChildItem $checks[$name] -File -ErrorAction SilentlyContinue).Count
    Write-Output "$name : $count 个文件"
}

# 开发环境检查（开发者模式）
if ($profile.user_type -eq "developer") {
    Write-Output ""
    Write-Output "=== 开发环境检查 ==="
    git --version; node --version; pnpm --version

    # 路径残留检查
    $gitconfig = Get-Content "$env:USERPROFILE\.gitconfig" -Raw -Encoding UTF8
    $oldUser = $profile.system.username
    $escaped = [regex]::Escape($oldUser)
    if ($gitconfig -match "(?<=[\\/])$escaped(?=[\\/`"']|\s)") {
        Write-Output "警告: .gitconfig 中仍有旧用户名 $oldUser"
    }
}
```

---

## 降级模式（没有 profile 时的 fallback）

如果 machine-profile.json 损坏或不存在，从备份目录结构推断：

```powershell
$backupRoot = "<人类指定的备份路径>"
Write-Output "你的备份目录结构："
Get-ChildItem $backupRoot -Directory | ForEach-Object {
    $count = (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue).Count
    Write-Output "  $($_.Name): $count 个文件"
}
Write-Output ""
Write-Output "我看到以下目录可以恢复："
if (Test-Path "$backupRoot\personal") { Write-Output "  personal/ → 你的个人文件（桌面、文档、图片等）" }
if (Test-Path "$backupRoot\dotfiles") { Write-Output "  dotfiles/ → 开发配置文件" }
if (Test-Path "$backupRoot\ssh") { Write-Output "  ssh/ → SSH 配置" }
if (Test-Path "$backupRoot\vscode") { Write-Output "  vscode/ → VS Code 配置" }
# ... 让人类选择恢复哪些
```

---

## 注意事项

- 路径替换用正则边界，不用简单字符串替换
- 语义路径优先于绝对路径
- npm/扩展安装逐个执行，失败不影响其他
- 微信恢复前必须先登录一次再退出
- 浏览器密码需要手动导出，无法通过文件复制
- 未安装的工具（null/空数组）自动跳过
- 外接盘盘符不固定 — 按深度搜索 profile
