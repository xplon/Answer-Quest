# 通用答题系统

这是一个可配置的web答题应用系统，支持单选题、多选题和判断题。系统设计为通用架构，可以轻松适配不同学科的题库。

## 功能特点

- ✅ 支持三种题型：单选题、多选题、判断题
- ✅ 章节筛选功能
- ✅ 题型筛选功能  
- ✅ 进度跟踪和实时评分
- ✅ 错题复习功能
- ✅ 响应式设计，支持移动端
- ✅ 通用配置架构，易于扩展

## 项目结构

```
Answer-Quest/
├── index.html          # 主页面
├── styles.css          # 样式文件
├── app.js              # 核心应用逻辑
├── config.json         # 系统配置文件
├── questions.json      # 题目数据文件
├── converter.js        # 题目转换工具
├── Questions.txt       # 原始题目文本
└── README.md          # 使用说明
```

## 配置说明

### config.json 配置文件

```json
{
  "app": {
    "title": "通用答题系统",
    "description": "支持多种题型的在线答题平台",
    "version": "1.0.0"
  },
  "currentSubject": {
    "name": "科目名称",
    "dataFile": "questions.json",
    "description": "科目描述"
  },
  "questionTypes": {
    "single_choice": {
      "name": "单选题",
      "description": "从多个选项中选择一个正确答案"
    },
    "multiple_choice": {
      "name": "多选题", 
      "description": "从多个选项中选择多个正确答案"
    },
    "true_false": {
      "name": "判断题",
      "description": "判断题目描述是否正确"
    }
  },
  "scoring": {
    "singleChoicePoints": 2,
    "multipleChoicePoints": 3,
    "trueFalsePoints": 1
  }
}
```

### questions.json 数据结构

```json
{
  "title": "题库标题",
  "description": "题库描述",
  "version": "1.0.0",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "totalQuestions": 100,
  "chapters": [
    {
      "name": "章节名称",
      "total": 30,
      "single_choice": 20,
      "multiple_choice": 5,
      "true_false": 5
    }
  ],
  "questions": [
    {
      "id": "unique_id",
      "chapter": "章节名称",
      "type": "single_choice",
      "stem": "题目内容",
      "options": [
        {"value": "A", "text": "选项A"},
        {"value": "B", "text": "选项B"}
      ],
      "correctAnswer": "A",
      "explanation": "解释说明（可选）"
    }
  ]
}
```

## 题目格式要求

### 原始文本格式

#### 单选题格式
```
题目内容 (正确答案)
A. 选项A内容
B. 选项B内容
C. 选项C内容
D. 选项D内容
```

#### 多选题格式
```
题目内容 (正确答案组合，如CD)
A. 选项A内容
B. 选项B内容
C. 选项C内容
D. 选项D内容
E. 选项E内容
```

#### 判断题格式
```
题目内容。(√) 或 题目内容。(×)
```

## 使用方法

### 1. 转换题目文件

将题目文本文件转换为JSON格式：

```bash
node converter.js
```

转换工具会自动：
- 解析文本文件中的章节和题型
- 识别不同格式的题目
- 生成标准JSON格式数据
- 统计各章节题目数量

### 2. 配置系统

编辑 `config.json` 文件：
- 修改 `currentSubject.name` 为您的科目名称
- 调整 `scoring` 分值设置
- 根据需要修改题型名称

### 3. 启动应用

可以通过以下几种方式启动本地服务器并运行项目：

1. 使用 npm 脚本（需先安装 Node.js）

   ```bash
   npm install     # 安装依赖（如果有）
   npm start       # 启动本地服务器，默认监听 8080 端口
   ```

2. 使用项目自带脚本

   - PowerShell:

     ```powershell
     .\start.ps1
     ```

   - CMD:

     ```bat
     .\start.bat
     ```

3. 使用任意静态服务器（如 Live Server、http-server 等）

   ```bash
   http-server . -p 8080
   ```

4. 在浏览器中访问 <http://localhost:8080> 或直接打开 `index.html`。

5. 选择章节和题型开始答题。

## 适配新科目

要将系统适配到新的科目，只需：

1. **准备题目文件**：按照格式要求准备题目文本文件
2. **转换数据**：运行 `node converter.js` 转换为JSON
3. **更新配置**：修改 `config.json` 中的科目信息
4. **自定义样式**（可选）：根据需要调整 CSS 样式

## 部署说明

### 本地部署
1. 下载所有文件到本地目录
2. 使用任意Web服务器（如Live Server、http-server等）启动
3. 访问 index.html 即可使用

### 在线部署
1. 将文件上传到Web服务器
2. 确保服务器支持静态文件访问
3. 访问域名即可使用

## 开发与扩展

### 添加新题型

1. 在 `config.json` 的 `questionTypes` 中添加新题型配置
2. 在 `converter.js` 中添加对应的解析逻辑
3. 在 `app.js` 中添加显示和判分逻辑
4. 在 `styles.css` 中添加样式

### 自定义功能

系统采用模块化设计，可以轻松：
- 修改评分规则
- 添加时间限制
- 集成后端数据库
- 添加用户系统
- 统计分析功能

## 技术栈

- **前端**：HTML5, CSS3, JavaScript (ES6+)
- **数据格式**：JSON
- **转换工具**：Node.js
- **兼容性**：现代浏览器（Chrome, Firefox, Safari, Edge）

## 版本历史

- **v1.0.0**：基础功能实现，支持马克思主义基本原理题库
- 自动题目转换功能
- 通用配置架构
- 完整的答题和复习功能

## 联系与支持

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发送邮件
- 项目贡献

---

*本项目遵循 MIT 开源协议*
