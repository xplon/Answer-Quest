/**
 * 题目文件转换工具
 * 将文本格式的题目文件转换为JSON格式
 */

const fs = require('fs');
const path = require('path');

class QuestionConverter {
    constructor() {
        this.questions = [];
        this.currentChapter = '';
        this.currentType = '';
        this.currentQuestions = [];
    }

    /**
     * 解析题目文件
     * @param {string} filePath 文件路径
     */
    parseFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.split('\n').map(line => line.trim()).filter(line => line);

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                // 检测章节标题
                if (this.isChapterTitle(line)) {
                    this.saveCurrentSection();
                    this.currentChapter = this.extractChapterName(line);
                    this.currentType = '';
                    continue;
                }

                // 检测题型
                if (this.isQuestionType(line)) {
                    this.saveCurrentSection();
                    this.currentType = this.getQuestionType(line);
                    continue;
                }

                // 解析题目
                if (this.currentChapter && this.currentType) {
                    const question = this.parseQuestion(line, lines, i);
                    if (question) {
                        this.currentQuestions.push(question);
                        // 跳过已处理的行
                        i = question.endIndex || i;
                    }
                }
            }

            // 保存最后一个章节
            this.saveCurrentSection();
            
            return this.questions;
        } catch (error) {
            console.error('解析文件时出错:', error);
            throw error;
        }
    }

    /**
     * 检测是否是章节标题
     */
    isChapterTitle(line) {
        return line.includes('练习题') || line.includes('第') && line.includes('章');
    }

    /**
     * 提取章节名称
     */
    extractChapterName(line) {
        if (line.includes('导论')) {
            return '导论';
        }
        
        const chapterMatch = line.match(/第([一二三四五六七八九十\d]+)章/);
        if (chapterMatch) {
            return `第${chapterMatch[1]}章`;
        }
        
        // 处理其他格式
        if (line.includes('第五章')) return '第五章';
        if (line.includes('第六章')) return '第六章';
        if (line.includes('第七章')) return '第七章';
        
        return line.replace(/《.*》/, '').replace(/练习题/, '').trim();
    }

    /**
     * 检测是否是题型标识
     */
    isQuestionType(line) {
        return line.match(/^[一二三四五六七八九十]、/) || 
               line.includes('单选') || 
               line.includes('多选') || 
               line.includes('判断');
    }

    /**
     * 获取题型
     */
    getQuestionType(line) {
        if (line.includes('单选')) return 'single_choice';
        if (line.includes('多选')) return 'multiple_choice';
        if (line.includes('判断')) return 'true_false';
        
        // 根据序号推断（基于常见模式）
        if (line.includes('一、')) return 'single_choice';
        if (line.includes('二、')) return 'multiple_choice';
        if (line.includes('三、')) return 'true_false';
        
        return 'single_choice'; // 默认
    }

    /**
     * 解析单个题目
     */
    parseQuestion(line, lines, startIndex) {
        if (!line || line.length < 10) return null;

        const question = {
            id: this.generateId(),
            chapter: this.currentChapter,
            type: this.currentType,
            stem: '',
            options: [],
            correctAnswer: '',
            explanation: ''
        };

        // 单选题和多选题格式：题目内容 (答案)
        if (this.currentType === 'single_choice' || this.currentType === 'multiple_choice') {
            const match = line.match(/^(.+)\s*\(([A-Z]+)\)$/);
            if (match) {
                question.stem = match[1].trim();
                question.correctAnswer = match[2];
                
                // 查找选项
                let optionIndex = startIndex + 1;
                const optionPattern = /^([A-Z])\.\s*(.+)$/;
                
                while (optionIndex < lines.length) {
                    const optionLine = lines[optionIndex];
                    const optionMatch = optionLine.match(optionPattern);
                    
                    if (optionMatch) {
                        question.options.push({
                            value: optionMatch[1],
                            text: optionMatch[2].trim()
                        });
                        optionIndex++;
                    } else {
                        break;
                    }
                }
                
                question.endIndex = optionIndex - 1;
                return question.options.length > 0 ? question : null;
            }
        }

        // 判断题格式：题目内容。(答案)
        if (this.currentType === 'true_false') {
            const match = line.match(/^(.+)[。．]\s*\(([√×✓✗对错])\)$/);
            if (match) {
                question.stem = match[1].trim();
                const answer = match[2];
                question.correctAnswer = (answer === '√' || answer === '✓' || answer === '对') ? 'true' : 'false';
                question.options = [
                    { value: 'true', text: '正确' },
                    { value: 'false', text: '错误' }
                ];
                return question;
            }
        }

        return null;
    }

    /**
     * 保存当前章节的题目
     */
    saveCurrentSection() {
        if (this.currentQuestions.length > 0) {
            this.questions.push(...this.currentQuestions);
            this.currentQuestions = [];
        }
    }

    /**
     * 生成唯一ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 保存为JSON文件
     */
    saveToJson(questions, outputPath) {
        const jsonData = {
            title: "通用答题系统题库",
            description: "自动转换生成的题库数据",
            version: "1.0.0",
            createdAt: new Date().toISOString(),
            totalQuestions: questions.length,
            chapters: this.getChapterStats(questions),
            questions: questions
        };

        fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2), 'utf-8');
        console.log(`✅ 成功转换 ${questions.length} 道题目到 ${outputPath}`);
        return jsonData;
    }

    /**
     * 获取章节统计信息
     */
    getChapterStats(questions) {
        const stats = {};
        questions.forEach(q => {
            if (!stats[q.chapter]) {
                stats[q.chapter] = {
                    name: q.chapter,
                    total: 0,
                    single_choice: 0,
                    multiple_choice: 0,
                    true_false: 0
                };
            }
            stats[q.chapter].total++;
            stats[q.chapter][q.type]++;
        });
        return Object.values(stats);
    }
}

// 主程序
function main() {
    const converter = new QuestionConverter();
    const inputFile = path.join(__dirname, 'Questions.txt');
    const outputFile = path.join(__dirname, 'questions.json');

    console.log('🚀 开始转换题目文件...');
    console.log(`📖 输入文件: ${inputFile}`);
    console.log(`💾 输出文件: ${outputFile}`);

    try {
        const questions = converter.parseFile(inputFile);
        const result = converter.saveToJson(questions, outputFile);
        
        console.log('\n📊 转换统计:');
        console.log(`总题目数: ${result.totalQuestions}`);
        console.log('章节分布:');
        result.chapters.forEach(chapter => {
            console.log(`  ${chapter.name}: ${chapter.total}题 (单选:${chapter.single_choice}, 多选:${chapter.multiple_choice}, 判断:${chapter.true_false})`);
        });
        
    } catch (error) {
        console.error('❌ 转换失败:', error.message);
        process.exit(1);
    }
}

// 如果直接运行此文件
if (require.main === module) {
    main();
}

module.exports = QuestionConverter;
