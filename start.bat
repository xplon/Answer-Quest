@echo off
chcp 65001 >nul
echo 📚 通用答题系统 - 快速启动工具
echo.

:menu
echo 请选择操作:
echo 1. 启动答题系统
echo 2. 转换题目文件
echo 3. 管理科目
echo 4. 运行测试
echo 5. 退出
echo.
set /p choice=请输入选项 (1-5): 

if "%choice%"=="1" goto start_app
if "%choice%"=="2" goto convert_questions
if "%choice%"=="3" goto manage_subjects
if "%choice%"=="4" goto run_tests
if "%choice%"=="5" goto exit
goto menu

:start_app
echo.
echo 🚀 正在启动答题系统...
echo 浏览器将自动打开 http://localhost:8080
echo 按 Ctrl+C 停止服务器
echo.
start http://localhost:8080
python -m http.server 8080
goto menu

:convert_questions
echo.
echo 📝 转换题目文件...
node converter.js
echo.
pause
goto menu

:manage_subjects
echo.
echo 📚 科目管理...
echo.
echo 可用命令:
echo - list: 列出所有科目
echo - create [科目名] [文件]: 创建新科目
echo - switch [科目名]: 切换科目
echo - delete [科目名]: 删除科目
echo.
set /p subject_cmd=请输入命令: 
node subject-manager.js %subject_cmd%
echo.
pause
goto menu

:run_tests
echo.
echo 🧪 运行测试...
node test.js
echo.
pause
goto menu

:exit
echo.
echo 👋 再见!
exit /b 0
