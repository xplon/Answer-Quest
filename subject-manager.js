/**
 * 科目管理工具
 * 用于快速切换和管理不同科目的题库
 */

const fs = require('fs');
const path = require('path');

class SubjectManager {
    constructor() {
        this.configPath = path.join(__dirname, 'config.json');
        this.subjectsDir = path.join(__dirname, 'subjects');
        this.ensureSubjectsDirectory();
    }

    ensureSubjectsDirectory() {
        if (!fs.existsSync(this.subjectsDir)) {
            fs.mkdirSync(this.subjectsDir);
            console.log('📁 创建 subjects 目录');
        }
    }

    /**
     * 创建新科目
     * @param {string} subjectName 科目名称
     * @param {string} textFile 题目文本文件路径
     * @param {Object} options 配置选项
     */
    async createSubject(subjectName, textFile, options = {}) {
        console.log(`🆕 创建新科目: ${subjectName}`);
        
        // 创建科目目录
        const subjectDir = path.join(this.subjectsDir, this.sanitizeName(subjectName));
        if (!fs.existsSync(subjectDir)) {
            fs.mkdirSync(subjectDir, { recursive: true });
        }

        // 复制题目文件
        const targetTextFile = path.join(subjectDir, 'questions.txt');
        fs.copyFileSync(textFile, targetTextFile);

        // 转换题目
        const QuestionConverter = require('./converter');
        const converter = new QuestionConverter();
        const questions = converter.parseFile(targetTextFile);
        const jsonFile = path.join(subjectDir, 'questions.json');
        converter.saveToJson(questions, jsonFile);

        // 创建科目配置
        const subjectConfig = {
            app: {
                title: "通用答题系统",
                description: `${subjectName}答题系统`,
                version: "1.0.0"
            },
            currentSubject: {
                name: subjectName,
                dataFile: `subjects/${this.sanitizeName(subjectName)}/questions.json`,
                description: `${subjectName}题库`,
                ...options
            },
            questionTypes: {
                single_choice: { name: "单选题" },
                multiple_choice: { name: "多选题" },
                true_false: { name: "判断题" }
            },
            scoring: {
                singleChoicePoints: options.singleChoicePoints || 2,
                multipleChoicePoints: options.multipleChoicePoints || 3,
                trueFalsePoints: options.trueFalsePoints || 1
            }
        };

        const configFile = path.join(subjectDir, 'config.json');
        fs.writeFileSync(configFile, JSON.stringify(subjectConfig, null, 2));

        console.log(`✅ 科目 "${subjectName}" 创建完成`);
        console.log(`📊 题目统计:`);
        console.log(`  - 总题目: ${questions.length}`);
        
        return {
            name: subjectName,
            path: subjectDir,
            questions: questions.length
        };
    }

    /**
     * 切换到指定科目
     * @param {string} subjectName 科目名称
     */
    switchToSubject(subjectName) {
        const subjectDir = path.join(this.subjectsDir, this.sanitizeName(subjectName));
        const configFile = path.join(subjectDir, 'config.json');
        
        if (!fs.existsSync(configFile)) {
            throw new Error(`科目 "${subjectName}" 不存在`);
        }

        // 复制科目配置到主配置
        const subjectConfig = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
        fs.writeFileSync(this.configPath, JSON.stringify(subjectConfig, null, 2));

        // 复制题目数据到主目录
        const subjectQuestions = path.join(subjectDir, 'questions.json');
        const mainQuestions = path.join(__dirname, 'questions.json');
        fs.copyFileSync(subjectQuestions, mainQuestions);

        console.log(`✅ 已切换到科目: ${subjectName}`);
    }

    /**
     * 列出所有科目
     */
    listSubjects() {
        if (!fs.existsSync(this.subjectsDir)) {
            console.log('📝 暂无科目');
            return [];
        }

        const subjects = fs.readdirSync(this.subjectsDir)
            .filter(dir => fs.statSync(path.join(this.subjectsDir, dir)).isDirectory())
            .map(dir => {
                const configFile = path.join(this.subjectsDir, dir, 'config.json');
                if (fs.existsSync(configFile)) {
                    const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
                    const questionsFile = path.join(this.subjectsDir, dir, 'questions.json');
                    let questionCount = 0;
                    if (fs.existsSync(questionsFile)) {
                        const data = JSON.parse(fs.readFileSync(questionsFile, 'utf-8'));
                        questionCount = data.totalQuestions || 0;
                    }
                    return {
                        name: config.currentSubject.name,
                        dir: dir,
                        description: config.currentSubject.description,
                        questions: questionCount
                    };
                }
                return null;
            })
            .filter(Boolean);

        console.log('📚 可用科目:');
        subjects.forEach((subject, index) => {
            console.log(`  ${index + 1}. ${subject.name} (${subject.questions}题)`);
        });

        return subjects;
    }

    /**
     * 删除科目
     * @param {string} subjectName 科目名称
     */
    deleteSubject(subjectName) {
        const subjectDir = path.join(this.subjectsDir, this.sanitizeName(subjectName));
        
        if (!fs.existsSync(subjectDir)) {
            throw new Error(`科目 "${subjectName}" 不存在`);
        }

        // 递归删除目录
        fs.rmSync(subjectDir, { recursive: true, force: true });
        console.log(`🗑️ 已删除科目: ${subjectName}`);
    }

    sanitizeName(name) {
        return name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
    }
}

// 命令行接口
function main() {
    const args = process.argv.slice(2);
    const manager = new SubjectManager();

    if (args.length === 0) {
        console.log('📋 科目管理工具');
        console.log('');
        console.log('使用方法:');
        console.log('  node subject-manager.js list                    # 列出所有科目');
        console.log('  node subject-manager.js create <名称> <文件>     # 创建新科目');
        console.log('  node subject-manager.js switch <名称>           # 切换科目');
        console.log('  node subject-manager.js delete <名称>           # 删除科目');
        console.log('');
        console.log('示例:');
        console.log('  node subject-manager.js create "高等数学" math.txt');
        console.log('  node subject-manager.js switch "高等数学"');
        return;
    }

    const command = args[0];

    try {
        switch (command) {
            case 'list':
                manager.listSubjects();
                break;

            case 'create':
                if (args.length < 3) {
                    console.log('❌ 请提供科目名称和题目文件路径');
                    return;
                }
                const subjectName = args[1];
                const textFile = args[2];
                
                if (!fs.existsSync(textFile)) {
                    console.log(`❌ 文件不存在: ${textFile}`);
                    return;
                }
                
                manager.createSubject(subjectName, textFile);
                break;

            case 'switch':
                if (args.length < 2) {
                    console.log('❌ 请提供科目名称');
                    return;
                }
                manager.switchToSubject(args[1]);
                break;

            case 'delete':
                if (args.length < 2) {
                    console.log('❌ 请提供科目名称');
                    return;
                }
                manager.deleteSubject(args[1]);
                break;

            default:
                console.log(`❌ 未知命令: ${command}`);
        }
    } catch (error) {
        console.error(`❌ 错误: ${error.message}`);
    }
}

if (require.main === module) {
    main();
}

module.exports = SubjectManager;
