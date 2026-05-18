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

这个 skill 不硬编码任何用户信息。所有恢复数据来自备份中的 `machine-profile.json`。

## 核心原则

**人类主权**：人类决定是否执行、安装路径、优先级。不得自行安装软件或修改系统配置，每步确认。

**做减法**：不装暂时不用的工具。不恢复可重建的内容。

**量变质变**：每层完成后验证，发现问题立刻告知人类。

## AI 能力边界

### AI 能自动完成的
- **npm 全局包**：pnpm、claude-code、playwright 等
- **Git 操作**：clone 仓库、恢复配置、push 验证
- **配置文件恢复**：复制并替换路径
- **验证检查**：版本检查、路径审查
- **NVM 版本安装**：人类装好 NVM 后执行 `nvm install`

### 人类自己装的（人人都会，不需要 AI）
- 浏览器、输入法、VPN、聊天工具
- WinRAR、OBS、Adobe、剪映
- 任何需要 GUI 安装器的软件

### 恢复流程
```
人类自己装日常应用 → AI 恢复开发环境和配置 → AI 验证完整性
```

## 恢复前置：定位并读取 profile

### Step 1: 找到备份盘

外接盘的盘符不固定（备份时是 J:，恢复时可能是 E:）。按卷标优先匹配：

```powershell
$profilePath = $null

# 1. 先按卷标匹配（profile 中记录了 disk_volume_label）
$volumeLabel = "<如果已知>"
if ($volumeLabel) {
    $match = Get-Volume | Where-Object { $_.FileSystemLabel -eq $volumeLabel }
    if ($match) {
        $profilePath = Get-ChildItem "$($match.DriveLetter):\" -Recurse -Depth 3 -Filter "machine-profile.json" -ErrorAction SilentlyContinue | Select-Object -First 1
    }
}

# 2. Fallback: 遍历所有盘符搜索（限制深度 3 层，避免大盘搜索过慢）
if (-not $profilePath) {
    $drives = Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Root -match "^[D-Z]:" }
    foreach ($d in $drives) {
        $found = Get-ChildItem "$($d.Root)" -Recurse -Depth 3 -Filter "machine-profile.json" -ErrorAction SilentlyContinue
        if ($found) {
            $profilePath = $found[0]
            break
        }
    }
}

if ($profilePath) {
    Write-Output "找到 profile: $($profilePath.FullName)"
} else {
    Write-Output "未找到 machine-profile.json。请手动指定备份目录路径。"
    return
}
```

### Step 2: 读取 profile（带容错）

```powershell
try {
    $profile = Get-Content $profilePath.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
} catch {
    Write-Error "machine-profile.json 损坏: $($_.Exception.Message)"
    Write-Output "请检查备份文件完整性。如果 JSON 损坏，需要手动恢复配置。"
    Write-Output "备份目录下应该有 dotfiles/、ssh/、vscode/ 等子目录，可以手动复制。"
    return
}

# 确认必要字段存在
if (-not $profile.system -or -not $profile.git) {
    Write-Error "profile 缺少必要字段（system/git）。文件可能不完整。"
    return
}
```

读取成功后，所有后续步骤的数据都从 `$profile` 来。

## 路径替换（最危险的环节）

恢复配置文件时需要把旧机器的路径替换为新机器的路径。这是最容易出错的地方。

### 错误做法
```powershell
# 绝对不要这样做！"Admin" 会把 "Administrator" 替换成 "张三istrator"
$content -replace $oldUser, $newUser
```

### 正确做法：按路径分隔符限定边界

```powershell
function Repair-ConfigPaths {
    param(
        [string]$Content,
        [string]$OldUsername,
        [string]$NewUsername,
        [string]$OldWorkspacePath,
        [string]$NewWorkspacePath
    )

    $result = $Content

    # 1. 替换用户名（限定在路径分隔符之间）
    if ($OldUsername -and $NewUsername -and $OldUsername -ne $NewUsername) {
        # 匹配 :\<username>\ 或 :\<username>（行尾/引号前）
        $result = $result -replace "(?<=[\\/])$([regex]::Escape($OldUsername))(?=[\\/`"']|\s|$)", $NewUsername
    }

    # 2. 替换工作区路径
    if ($OldWorkspacePath -and $NewWorkspacePath -and $OldWorkspacePath -ne $NewWorkspacePath) {
        $result = $result -replace [regex]::Escape($OldWorkspacePath), $NewWorkspacePath
    }

    return $result
}
```

### 更安全的做法：语义路径优先

profile 中同时记录了绝对路径和语义路径（如 `%USERPROFILE%\.gitconfig`）。恢复时优先用语义路径展开：

```powershell
function Expand-SemanticPath {
    param([string]$SemanticPath)
    $expanded = $SemanticPath
    $expanded = $expanded -replace '%USERPROFILE%', $env:USERPROFILE
    $expanded = $expanded -replace '%APPDATA%', $env:APPDATA
    $expanded = $expanded -replace '%LOCALAPPDATA%', $env:LOCALAPPDATA
    return $expanded
}
```

## 恢复序列

按层级执行。前一层完成并通过验证后，才进入下一层。

### 第一层：工作基础

**前提：人类已经自己装好了**浏览器、输入法、VPN 等日常工具。

AI 只做检查：
```powershell
# 确认能联网
try { Test-NetConnection www.baidu.com -WarningAction SilentlyContinue | Out-Null } catch {}
```

### 第二层：开发环境

**1. Git**

确认人类已安装 Git。装好后 AI 恢复配置：
- 读取 profile.backup_meta 中的 gitconfig 路径
- 优先用语义路径展开：`%USERPROFILE%\.gitconfig` → `C:\Users\<新用户名>\.gitconfig`
- 复制备份的 .gitconfig → 目标路径
- 用 `Repair-ConfigPaths` 替换旧路径

**2. SSH**
- profile.ssh.has_keys=true → 还原 ssh/ 目录到 `~/.ssh/`
- profile.ssh.has_keys=false → 跳过

**3. Node.js（需要人类先装 NVM）**

**人类手动操作：**
- 从 https://github.com/yuruotong1/nvm-windows/releases 下载安装
- 告诉 AI "NVM 装好了"

**AI 接管：**
```powershell
foreach ($v in $profile.node.versions) {
    nvm install $v
    if ($LASTEXITCODE -ne 0) {
        Write-Output "警告: Node $v 安装失败（版本可能已下架或网络不通）"
        Write-Output "  尝试安装最新 LTS 版本..."
        # 继续下一个版本
    }
}
nvm use $profile.node.active_version
```

**4. pnpm**
```powershell
npm install -g pnpm
```

**5. npm 配置**

还原 .npmrc → `~/.npmrc`
- 用 `Repair-ConfigPaths` 替换路径
- 确认 prefix 和 cache 的目标目录存在，不存在则创建

**6. Python**

确认人类已安装。版本参考 profile.python.version。

**7. VS Code**

确认人类已安装。AI 恢复配置和扩展：
```powershell
# 逐个安装扩展（不批量，避免一个失败全挂）
$extensions = Get-Content "<备份路径>\vscode-extensions\extensions.txt" -Encoding UTF8
$failed = @()
foreach ($ext in $extensions) {
    code --install-extension $ext 2>$null
    if ($LASTEXITCODE -ne 0) {
        $failed += $ext
    }
}
if ($failed.Count -gt 0) {
    Write-Output "以下扩展安装失败（可能已下架或改名）:"
    $failed | ForEach-Object { Write-Output "  $_" }
}
```

**8. Claude Code**（如果 profile 中有记录）
```powershell
npm install -g @anthropic-ai/claude-code
```
还原 ~/.claude/ 目录。

**9. Windows Terminal / Chrome 书签 / Obsidian** — 如果有备份，按 profile 恢复。

**验证：**
```powershell
git --version; node --version; pnpm --version; python --version; code --version; claude --version
```

### 第三层：项目恢复

从 profile.git_repos 读取仓库信息。**先检查目标工作区空间：**

```powershell
$workspace = "<人类指定的工作区路径>"
$workspaceFree = (Get-PSDrive $workspace.Substring(0,1)).Free

# 粗略估算：每个仓库 clone 后约 100MB-1GB
$estimatedGB = $profile.git_repos.Count * 0.5
Write-Output "预估项目大小: ~$estimatedGB GB"
Write-Output "工作区可用: $([math]::Round($workspaceFree / 1GB)) GB"
```

空间足够后逐个 clone：
```powershell
cd $workspace
foreach ($repo in $profile.git_repos) {
    git clone $repo.remote "$($repo.name)"
    if ($LASTEXITCODE -ne 0) {
        Write-Output "警告: $($repo.name) clone 失败（仓库可能不存在或网络不通）"
    }
}
```

本地独有文件从 workspace-backup 复制。
项目依赖：对有 package.json 的目录执行 `pnpm install`。

### 第四层：全局包恢复

**逐个安装**，不批量：
```powershell
$failed = @()
foreach ($pkg in $profile.npm_global_packages) {
    npm install -g $pkg 2>$null
    if ($LASTEXITCODE -ne 0) {
        $failed += $pkg
    }
}
if ($failed.Count -gt 0) {
    Write-Output "以下包安装失败:"
    $failed | ForEach-Object { Write-Output "  $_" }
}
```

### 第五层：按需工具

根据 profile 中记录的应用，告知人类可以按需安装的（设计工具、自媒体工具等）。

## 恢复后审查

```powershell
# 1. 版本验证
git --version; node --version; pnpm --version; python --version

# 2. 路径检查（用正则，避免子串误匹配）
$oldUser = $profile.system.username
$newUser = $env:USERNAME
$gitconfig = Get-Content ~/.gitconfig -Raw -Encoding UTF8
$npmrc = Get-Content ~/.npmrc -Raw -Encoding UTF8

# 只在路径分隔符之间匹配旧用户名
if ($gitconfig -match "(?<=[\\/])$([regex]::Escape($oldUser))(?=[\\/`"']|\s)") {
    Write-Output "警告: .gitconfig 中仍有旧用户名 $oldUser 的路径引用"
}
if ($npmrc -match "(?<=[\\/])$([regex]::Escape($oldUser))(?=[\\/`"']|\s)") {
    Write-Output "警告: .npmrc 中仍有旧用户名 $oldUser 的路径引用"
}

# 3. VS Code 扩展对比
$installed = (code --list-extensions).Count
$expected = $profile.vscode.extensions.Count
Write-Output "VS Code 扩展: $installed/$expected"

# 4. Git 仓库数量
$repos = $profile.git_repos.Count
$cloned = (Get-ChildItem $workspace -Directory -Depth 1 -Filter ".git" -ErrorAction SilentlyContinue).Count
Write-Output "Git 仓库: $cloned/$repos"

# 5. GitHub 认证测试
git push --dry-run 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Output "注意: GitHub 认证可能需要重新登录（第一次 push 时会弹窗）"
}
```

## 注意事项

- 路径替换是最容易出错的地方 — 用正则边界限定，不要简单字符串替换
- 语义路径优先于绝对路径（环境变量展开更安全）
- 外接盘盘符不固定 — 按卷标匹配，fallback 到深度搜索
- profile JSON 损坏时有 fallback 提示
- npm/扩展安装逐个执行，一个失败不影响其他
- 未安装的工具（null/空数组）自动跳过
