# 通用答题系统 - PowerShell 启动脚本

param(
    [string]$Action = "menu"
)

function Show-Menu {
    Clear-Host
    Write-Host "📚 通用答题系统 - 快速启动工具" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "请选择操作:" -ForegroundColor Yellow
    Write-Host "1. 启动答题系统" -ForegroundColor White
    Write-Host "2. 转换题目文件" -ForegroundColor White  
    Write-Host "3. 管理科目" -ForegroundColor White
    Write-Host "4. 运行测试" -ForegroundColor White
    Write-Host "5. 退出" -ForegroundColor White
    Write-Host ""
}

function Start-QuizApp {
    Write-Host "🚀 正在启动答题系统..." -ForegroundColor Green
    Write-Host "浏览器将自动打开 http://localhost:8080" -ForegroundColor Yellow
    Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Yellow
    Write-Host ""
    
    # 启动浏览器
    Start-Process "http://localhost:8080"
    
    # 启动HTTP服务器
    try {
        python -m http.server 8080
    }
    catch {
        Write-Host "❌ 启动失败，请确保已安装Python" -ForegroundColor Red
        Read-Host "按任意键继续"
    }
}

function Convert-Questions {
    Write-Host "📝 转换题目文件..." -ForegroundColor Green
    
    try {
        node converter.js
        Write-Host "✅ 转换完成" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ 转换失败，请确保已安装Node.js" -ForegroundColor Red
    }
    
    Read-Host "按任意键继续"
}

function Manage-Subjects {
    Write-Host "📚 科目管理..." -ForegroundColor Green
    Write-Host ""
    Write-Host "可用命令:" -ForegroundColor Yellow
    Write-Host "- list: 列出所有科目" -ForegroundColor White
    Write-Host "- create [科目名] [文件]: 创建新科目" -ForegroundColor White
    Write-Host "- switch [科目名]: 切换科目" -ForegroundColor White
    Write-Host "- delete [科目名]: 删除科目" -ForegroundColor White
    Write-Host ""
    
    $command = Read-Host "请输入命令"
    
    if ($command) {
        try {
            node subject-manager.js $command.Split(' ')
        }
        catch {
            Write-Host "❌ 执行失败，请确保已安装Node.js" -ForegroundColor Red
        }
    }
    
    Read-Host "按任意键继续"
}

function Run-Tests {
    Write-Host "🧪 运行测试..." -ForegroundColor Green
    
    try {
        node -e "
        const { runAllTests } = require('./test.js');
        runAllTests().then(() => {
            console.log('测试完成');
        }).catch(err => {
            console.error('测试失败:', err);
        });
        "
        Write-Host "✅ 测试完成" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ 测试失败，请确保已安装Node.js" -ForegroundColor Red
    }
    
    Read-Host "按任意键继续"
}

# 主程序
if ($Action -eq "start") {
    Start-QuizApp
    return
}

if ($Action -eq "convert") {
    Convert-Questions
    return
}

# 显示菜单循环
while ($true) {
    Show-Menu
    $choice = Read-Host "请输入选项 (1-5)"
    
    switch ($choice) {
        "1" { Start-QuizApp; break }
        "2" { Convert-Questions }
        "3" { Manage-Subjects }
        "4" { Run-Tests }
        "5" { 
            Write-Host ""
            Write-Host "👋 再见!" -ForegroundColor Cyan
            exit 
        }
        default { 
            Write-Host "❌ 无效选项，请重新选择" -ForegroundColor Red
            Start-Sleep -Seconds 1
        }
    }
}
