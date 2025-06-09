class QuestionBankApp {
    constructor() {
        this.config = null;
        this.questionData = null;
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.selectedQuestions = [];
        this.userAnswers = [];
        this.score = 0;
        this.correctCount = 0;
        this.wrongQuestions = [];
        
        this.init();
    }    async init() {
        console.log('应用初始化开始');
        try {
            await this.loadConfig();
            console.log('配置加载完成');
            await this.loadQuestions();
            console.log('题目加载完成，题目总数:', this.questions.length);
            this.initializeUI();
            console.log('UI初始化完成');
            this.bindEvents();
            console.log('事件绑定完成');
            this.showScreen('start-screen');
            console.log('显示开始界面');
        } catch (error) {
            console.error('初始化过程中出错:', error);
        }
    }

    async loadConfig() {
        try {
            const response = await fetch('config.json');
            this.config = await response.json();
        } catch (error) {
            console.error('Failed to load config:', error);
            // 使用默认配置
            this.config = {
                app: { title: "通用答题系统" },
                currentSubject: { name: "题库", dataFile: "questions.json" },
                questionTypes: {
                    single_choice: { name: "单选题" },
                    multiple_choice: { name: "多选题" },
                    true_false: { name: "判断题" }
                },
                scoring: { singleChoicePoints: 2, multipleChoicePoints: 3, trueFalsePoints: 1 }
            };
        }
    }

    async loadQuestions() {
        try {
            const dataFile = this.config.currentSubject.dataFile;
            const response = await fetch(dataFile);
            this.questionData = await response.json();
            this.questions = this.questionData.questions || [];
        } catch (error) {
            console.error('Failed to load questions:', error);
            this.questions = [];
        }
    }

    initializeUI() {
        // 设置应用标题
        if (this.config && this.config.app) {
            const titleElement = document.getElementById('app-title');
            const descElement = document.getElementById('app-description');
            const subjectTitleElement = document.getElementById('subject-title');
            const subjectDescElement = document.getElementById('subject-description');
            
            if (titleElement) titleElement.textContent = this.config.app.title;
            if (descElement) descElement.textContent = this.config.app.description;
            if (subjectTitleElement) subjectTitleElement.textContent = this.config.currentSubject.name;
            if (subjectDescElement) subjectDescElement.textContent = this.config.currentSubject.description;
        }

        // 设置章节选项
        this.setupChapterOptions();
        
        // 设置题型选项
        this.setupQuestionTypeOptions();
        
        // 更新统计信息
        this.updateQuestionStats();
        
        // 隐藏加载指示器
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    updateQuestionStats() {
        if (!this.questions || this.questions.length === 0) return;
        
        const stats = {
            total: this.questions.length,
            single_choice: this.questions.filter(q => q.type === 'single_choice').length,
            multiple_choice: this.questions.filter(q => q.type === 'multiple_choice').length,
            true_false: this.questions.filter(q => q.type === 'true_false').length
        };
        
        const elements = {
            'total-questions': stats.total,
            'single-choice-count': stats.single_choice,
            'multiple-choice-count': stats.multiple_choice,
            'true-false-count': stats.true_false
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }    setupChapterOptions() {
        const chapterSelect = document.getElementById('chapter-select');
        if (!chapterSelect || !this.questionData) return;

        // 清空现有选项，并默认选中所有章节
        chapterSelect.innerHTML = '<option value="all" selected>所有章节</option>';
        
        // 添加章节选项
        if (this.questionData.chapters) {
            this.questionData.chapters.forEach(chapter => {
                const option = document.createElement('option');
                option.value = chapter.name;
                option.textContent = chapter.name;
                chapterSelect.appendChild(option);
            });
        }
    }    setupQuestionTypeOptions() {
        const typeSelect = document.getElementById('question-type-select');
        if (!typeSelect) return;

        typeSelect.innerHTML = '<option value="all">所有题型</option>';
        Object.entries(this.config.questionTypes).forEach(([type, info]) => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = info.name;
            typeSelect.appendChild(option);
        });
    }bindEvents() {
        // 确保元素存在后再绑定事件
        const startBtn = document.getElementById('start-quiz-btn');
        const practiceBtn = document.getElementById('practice-mode-btn');
        const submitBtn = document.getElementById('submit-answer-btn');
        const nextBtn = document.getElementById('next-btn');
        const prevBtn = document.getElementById('prev-btn');
        const reviewBtn = document.getElementById('review-wrong-btn');
        const restartBtn = document.getElementById('restart-btn');
        const backHomeBtn = document.getElementById('back-home-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const quitBtn = document.getElementById('quit-btn');

        console.log('绑定事件 - 开始按钮:', startBtn ? '找到' : '未找到');
        console.log('绑定事件 - 提交按钮:', submitBtn ? '找到' : '未找到');

        if (startBtn) {
            startBtn.addEventListener('click', () => {
                console.log('开始答题按钮被点击');
                this.startQuiz();
            });
        } else {
            console.error('找不到开始按钮元素 start-quiz-btn');
        }

        if (practiceBtn) {
            practiceBtn.addEventListener('click', () => {
                console.log('练习模式按钮被点击');
                this.startPracticeMode();
            });
        }

        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                console.log('提交答案按钮被点击');
                this.submitAnswer();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextQuestion());
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevQuestion());
        }

        if (reviewBtn) {
            reviewBtn.addEventListener('click', () => this.showWrongQuestions());
        }

        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restart());
        }

        if (backHomeBtn) {
            backHomeBtn.addEventListener('click', () => this.showScreen('start-screen'));
        }

        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.pauseQuiz());
        }

        if (quitBtn) {
            quitBtn.addEventListener('click', () => this.quitQuiz());
        }
    }    startQuiz() {
        console.log('startQuiz 方法被调用');
        
        const selectedChapter = document.getElementById('chapter-select').value;
        const selectedType = document.getElementById('question-type-select').value;
        const questionCount = document.getElementById('question-count').value;

        console.log('选中的章节:', selectedChapter);
        console.log('选中的题型:', selectedType);
        console.log('题目数量:', questionCount);
        console.log('总题目数:', this.questions.length);

        // 筛选题目
        this.selectedQuestions = this.questions.filter(q => {
            // 若未选择或选中 "all"，则不过滤章节
            const chapterVal = selectedChapter || 'all';
            const chapterMatch = chapterVal === 'all' || q.chapter === chapterVal;
            // 同理处理题型
            const typeVal = selectedType || 'all';
            const typeMatch = typeVal === 'all' || q.type === typeVal;
            return chapterMatch && typeMatch;
        });

        console.log('筛选后的题目数:', this.selectedQuestions.length);

        if (this.selectedQuestions.length === 0) {
            alert('没有找到符合条件的题目！');
            return;
        }

        // 打乱题目顺序
        this.selectedQuestions = this.shuffleArray(this.selectedQuestions);
        // 根据选择的数量限制题目
        if (questionCount !== 'all') {
            const count = parseInt(questionCount);
            if (this.selectedQuestions.length > count) {
                this.selectedQuestions = this.selectedQuestions.slice(0, count);
            }
        }
        
        // 重置状态
        this.currentQuestionIndex = 0;
        this.userAnswers = new Array(this.selectedQuestions.length).fill(null);
        this.score = 0;
        this.correctCount = 0;
        this.wrongQuestions = [];

        console.log('准备显示题目界面，最终题目数:', this.selectedQuestions.length);
        
        // 开始答题
        this.showScreen('quiz-screen');
        this.displayQuestion();
        this.updateProgress();
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }    displayQuestion() {
        const question = this.selectedQuestions[this.currentQuestionIndex];

        document.querySelectorAll('.option').forEach(opt => {
            opt.style.pointerEvents = '';
            opt.classList.remove('correct','incorrect','correct-answer','selected');
        });
        
        // 更新题目信息
        document.getElementById('question-chapter').textContent = question.chapter;
        document.getElementById('question-type-badge').textContent = this.getTypeDisplayName(question.type);
        document.getElementById('question-type-badge').className = `badge ${question.type}`;
        document.getElementById('question-counter').textContent = `第 ${this.currentQuestionIndex + 1} 题 / 共 ${this.selectedQuestions.length} 题`;
        document.getElementById('question-text').textContent = question.stem;

        // 显示选项
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';

        if (question.type === 'true_false') {
            optionsContainer.className = 'options-container true-false-options';
            this.createTrueFalseOptions(optionsContainer);
        } else {
            optionsContainer.className = 'options-container';
            this.createMultipleChoiceOptions(optionsContainer, question);
        }        // 更新导航按钮
        document.getElementById('prev-btn').disabled = this.currentQuestionIndex === 0;
        document.getElementById('submit-answer-btn').style.display = 'inline-block';
        document.getElementById('next-btn').style.display = 'none';
        document.getElementById('next-btn').disabled = true;  // 重新禁用下一题按钮
        document.getElementById('submit-answer-btn').disabled = true;

        // 恢复之前的答案
        this.restoreAnswer();
    }

    createTrueFalseOptions(container) {
        const trueOption = this.createOption('√', '正确', 'true');
        const falseOption = this.createOption('×', '错误', 'false');
        
        trueOption.classList.add('true-option');
        falseOption.classList.add('false-option');
        
        container.appendChild(trueOption);
        container.appendChild(falseOption);
    }

    createMultipleChoiceOptions(container, question) {
        question.options.forEach(option => {
            const optionElement = this.createOption(option.value, option.text, option.value);
            container.appendChild(optionElement);
        });
    }

    createOption(key, value, dataValue) {
        const option = document.createElement('div');
        option.className = 'option';
        option.dataset.value = dataValue;
        
        const keySpan = document.createElement('span');
        keySpan.className = 'option-key';
        keySpan.textContent = key;
        
        const valueSpan = document.createElement('span');
        valueSpan.className = 'option-value';
        valueSpan.textContent = value;
        
        option.appendChild(keySpan);
        option.appendChild(valueSpan);
        
        option.addEventListener('click', () => this.selectOption(option));
        
        return option;
    }    selectOption(selectedOption) {
        const question = this.selectedQuestions[this.currentQuestionIndex];
        const options = document.querySelectorAll('.option');
        // 清除上一题可能遗留的状态类
        options.forEach(opt => opt.classList.remove('correct', 'incorrect', 'correct-answer'));
        
        if (question.type === 'multiple_choice') {
            // 多选题允许多个选择
            selectedOption.classList.toggle('selected');
        } else {
            // 单选题和判断题只允许单个选择
            options.forEach(opt => opt.classList.remove('selected'));
            selectedOption.classList.add('selected');
        }
        
        // 如果至少选择了一个选项，启用提交按钮
        const selectedOptions = document.querySelectorAll('.option.selected');
        document.getElementById('submit-answer-btn').disabled = selectedOptions.length === 0;
    }    restoreAnswer() {
        const savedAnswer = this.userAnswers[this.currentQuestionIndex];
        if (!savedAnswer) return;

        const options = document.querySelectorAll('.option');
        const question = this.selectedQuestions[this.currentQuestionIndex];

        if (question.type === 'multiple_choice') {
            savedAnswer.forEach(ans => {
                const option = Array.from(options).find(opt => opt.dataset.value === ans);
                if (option) option.classList.add('selected');
            });
        } else {
            const option = Array.from(options).find(opt => opt.dataset.value === savedAnswer);
            if (option) option.classList.add('selected');
        }

        document.getElementById('submit-answer-btn').disabled = false;
    }    submitAnswer() {
        const question = this.selectedQuestions[this.currentQuestionIndex];
        const selectedOptions = Array.from(document.querySelectorAll('.option.selected'));
        const userAnswer = selectedOptions.map(opt => opt.dataset.value);

        console.log('提交答案 - 当前题目:', {
            index: this.currentQuestionIndex,
            id: question.id,
            type: question.type,
            stem: question.stem.substring(0, 50) + '...',
            correctAnswer: question.correctAnswer,
            userAnswer: userAnswer
        });        // 保存用户答案
        let finalUserAnswer;
        if (question.type === 'multiple_choice') {
            this.userAnswers[this.currentQuestionIndex] = userAnswer;
            finalUserAnswer = userAnswer;
        } else {
            this.userAnswers[this.currentQuestionIndex] = userAnswer[0];
            finalUserAnswer = userAnswer[0];
        }

        // 检查答案
        const isCorrect = this.checkAnswer(question, userAnswer);
        
        // 更新分数
        if (isCorrect) {
            console.log('添加正确题目:', {});
            this.correctCount++;
            this.score += this.getQuestionScore(question.type);
        } else {
            console.log('添加错题:', {
                questionId: question.id,
                questionType: question.type,
                correctAnswer: question.correctAnswer,
                userAnswer: finalUserAnswer,
                questionIndex: this.currentQuestionIndex
            });
            this.wrongQuestions.push({
                question: question,
                userAnswer: finalUserAnswer, // 使用格式化后的答案
                questionIndex: this.currentQuestionIndex
            });
        }

        // 显示答案反馈
        console.log(question, userAnswer, isCorrect);
        this.showAnswerFeedback(question, userAnswer);        // 更新UI
        document.getElementById('submit-answer-btn').style.display = 'none';
        document.getElementById('next-btn').style.display = 'inline-block';
        document.getElementById('next-btn').disabled = false;  // 启用下一题按钮
        
        this.updateProgress();
    }

    checkAnswer(question, userAnswer) {
        // 标准化正确答案与用户答案
        const correctAns = String(question.correctAnswer).trim();
        if (question.type === 'true_false') {
            const userVal = String(userAnswer[0]).trim();
            const isValid = (userVal === 'true') === (correctAns === 'true');
            console.log('checkAnswer [true_false]', { userVal, correctAns, isValid });
            return isValid;
        } else if (question.type === 'multiple_choice') {
            const correctArr = correctAns.split('').map(v => v.trim()).sort();
            const userArr = userAnswer.map(v => String(v).trim()).sort();
            const isValid = JSON.stringify(correctArr) === JSON.stringify(userArr);
            console.log('checkAnswer [multiple_choice]', { correctArr, userArr, isValid });
            return isValid;
        } else {
            const userVal = String(userAnswer[0]).trim();
            const isValid = userVal === correctAns;
            console.log('checkAnswer [single_choice]', { userVal, correctAns, isValid });
            return isValid;
        }
    }    showAnswerFeedback(question, userAnswer) {
        const options = document.querySelectorAll('.option');
        // 统一为数组格式
        const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
        // 取正确答案数组
        const correctAnswers = (question.type === 'multiple_choice')
            ? String(question.correctAnswer).split('').map(v => v.trim())
            : [String(question.correctAnswer).trim()];
        // 禁止点击所有选项
        options.forEach(opt => opt.style.pointerEvents = 'none');
        console.log('options ', options);
        options.forEach(opt => {
            opt.classList.remove('correct', 'incorrect', 'correct-answer');
        });
        // 整体判断是否正确
        const isAllCorrect = this.checkAnswer(question, userAnswers);
        // 单选题及判断题
        if (question.type === 'single_choice' || question.type === 'true_false') {
            const val = userAnswers[0];
            const selectedOpt = Array.from(options).find(opt => opt.dataset.value === val);
            if (isAllCorrect) {
                console.log('selectedOpt1:', selectedOpt);
                if (selectedOpt) {
                    selectedOpt.classList.remove('incorrect');
                    selectedOpt.classList.remove('correct-answer');
                    selectedOpt.classList.add('correct');
                }
            } else {
                console.log('selectedOpt2:', selectedOpt);
                if (selectedOpt) {
                    selectedOpt.classList.remove('correct');
                    selectedOpt.classList.remove('correct-answer');
                    selectedOpt.classList.add('incorrect');
                }
                // 高亮正确答案
                correctAnswers.forEach(ans => {
                    const opt = Array.from(options).find(o => o.dataset.value === ans);
                    if (opt) {
                        selectedOpt.classList.remove('correct');
                        selectedOpt.classList.remove('incorrect');
                        opt.classList.add('correct-answer');
                    }
                });
            }
        } else {
            // 多选题：区分漏选、错选、选中正确
            const uaSet = new Set(userAnswers);
            options.forEach(opt => {
                const val = opt.dataset.value;
                const isSelected = uaSet.has(val);
                const isCorrect = correctAnswers.includes(val);
                if (isSelected) {
                    console.log('selectedOpt3:', opt);
                    // 选中项：正确/错误
                    opt.classList.remove(isCorrect ? 'incorrect' : 'correct');
                    opt.classList.remove('correct-answer');
                    opt.classList.add(isCorrect ? 'correct' : 'incorrect');
                } else if (isCorrect) {
                    console.log('selectedOpt4:', opt);
                    // 漏选的正确答案
                    opt.classList.remove('correct');
                    opt.classList.remove('incorrect');
                    opt.classList.add('correct-answer');
                }
            });
        }
    }

    isCorrectOption(question, value) {
        if (question.type === 'true_false') {
            return (value === 'true') === (question.correctAnswer === 'true');
        } else if (question.type === 'multiple_choice') {
            return question.correctAnswer.includes(value);
        } else {
            return value === question.correctAnswer;
        }
    }

    getQuestionScore(type) {
        const scoring = this.config.scoring;
        switch (type) {
            case 'single_choice': return scoring.singleChoicePoints;
            case 'multiple_choice': return scoring.multipleChoicePoints;
            case 'true_false': return scoring.trueFalsePoints;
            default: return 1;
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.selectedQuestions.length - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion();
            this.updateProgress();
        } else {
            this.showResults();
        }
    }

    prevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayQuestion();
            this.updateProgress();
        }
    }    updateProgress() {
        const progress = ((this.currentQuestionIndex + 1) / this.selectedQuestions.length) * 100;
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        
        const questionCounter = document.getElementById('question-counter');
        if (questionCounter) {
            questionCounter.textContent = `第 ${this.currentQuestionIndex + 1} 题 / 共 ${this.selectedQuestions.length} 题`;
        }
    }

    updateStats() {
        // 在新版本中，统计信息主要在结果页面显示
        // 这里可以更新实时统计信息（如果需要的话）
        console.log(`当前统计: 得分: ${this.score}, 正确: ${this.correctCount}`);
    }    showResults() {
        const totalQuestions = this.selectedQuestions.length;
        const wrongCount = totalQuestions - this.correctCount;
        const accuracy = Math.round((this.correctCount / totalQuestions) * 100);

        document.getElementById('final-score').textContent = this.score;
        document.getElementById('result-total').textContent = totalQuestions;
        document.getElementById('result-correct').textContent = this.correctCount;
        document.getElementById('result-wrong').textContent = wrongCount;
        document.getElementById('result-accuracy').textContent = `${accuracy}%`;

        // 根据错题数量显示/隐藏复习按钮
        const reviewButton = document.getElementById('review-wrong-btn');
        if (reviewButton) {
            reviewButton.style.display = this.wrongQuestions.length > 0 ? 'inline-block' : 'none';
        }

        this.showScreen('result-screen');
    }    showWrongQuestions() {
        this.showScreen('review-screen');
        console.log('显示错题回顾，错题数量:', this.wrongQuestions.length);
        console.log('完整错题列表:', this.wrongQuestions);
        
        // 清空之前的错题列表
        const reviewContainer = document.querySelector('#review-screen .screen-content');
        const existingList = reviewContainer.querySelector('.wrong-questions-list');
        if (existingList) {
            existingList.remove();
        }
        
        // 创建错题列表容器
        const wrongQuestionsList = document.createElement('div');
        wrongQuestionsList.className = 'wrong-questions-list';
        
        if (this.wrongQuestions.length === 0) {
            wrongQuestionsList.innerHTML = '<p>恭喜！没有答错的题目。</p>';
        } else {
            // 为每个错题创建显示项
            this.wrongQuestions.forEach((wrongItem, index) => {
                const questionItem = this.createWrongQuestionItem(wrongItem, index + 1);
                wrongQuestionsList.appendChild(questionItem);
            });
        }
        
        // 将错题列表添加到容器中
        reviewContainer.appendChild(wrongQuestionsList);
    }

    // 添加缺失的方法
    startPracticeMode() {
        console.log('练习模式暂未实现');
        alert('练习模式功能正在开发中...');
    }

    pauseQuiz() {
        console.log('暂停答题');
        if (confirm('确定要暂停答题吗？')) {
            this.showScreen('start-screen');
        }
    }

    quitQuiz() {
        console.log('退出答题');
        if (confirm('确定要退出答题吗？当前进度将丢失。')) {
            this.restart();
        }
    }    createWrongQuestionItem(wrongItem, index) {
        const { question, userAnswer, questionIndex } = wrongItem;
        
        console.log('创建错题显示项:', {
            index: index,
            questionId: question.id,
            questionType: question.type,
            questionStem: question.stem.substring(0, 50) + '...',
            correctAnswer: question.correctAnswer,
            userAnswer: userAnswer,
            userAnswerType: typeof userAnswer
        });
        
        const div = document.createElement('div');
        div.className = 'wrong-question-item';
        
        const header = document.createElement('div');
        header.className = 'wrong-question-header';
        header.innerHTML = `
            <span>第 ${questionIndex + 1} 题 - ${question.chapter}</span>
            <span>${this.getTypeDisplayName(question.type)}</span>
        `;
        
        const stem = document.createElement('div');
        stem.className = 'wrong-question-stem';
        stem.textContent = question.stem;
        
        const answersDiv = document.createElement('div');
        answersDiv.className = 'wrong-question-answer';
        
        const userAnswerDiv = document.createElement('div');
        userAnswerDiv.className = 'user-answer';
        userAnswerDiv.innerHTML = `
            <div class="answer-label">你的答案：</div>
            <div>${this.formatAnswer(question, userAnswer)}</div>
        `;
        
        const correctAnswerDiv = document.createElement('div');
        correctAnswerDiv.className = 'correct-answer';
        correctAnswerDiv.innerHTML = `
            <div class="answer-label">正确答案：</div>
            <div>${this.formatAnswer(question, question.correctAnswer)}</div>
        `;
        
        answersDiv.appendChild(userAnswerDiv);
        answersDiv.appendChild(correctAnswerDiv);
        
        div.appendChild(header);
        div.appendChild(stem);
        div.appendChild(answersDiv);
        
        return div;
    }

    formatAnswer(question, answer) {
        if (question.type === 'true_false') {
            return answer === 'true' ? '正确 (√)' : '错误 (×)';
        } else if (question.type === 'multiple_choice') {
            const answers = Array.isArray(answer) ? answer : answer.split('');
            return answers.map(ans => {
                const option = question.options.find(opt => opt.value === ans);
                return option ? `${ans}. ${option.text}` : ans;
            }).join('; ');
        } else {
            const option = question.options.find(opt => opt.value === answer);
            return option ? `${answer}. ${option.text}` : answer;
        }
    }

    getTypeDisplayName(type) {
        return this.config.questionTypes[type]?.name || '未知题型';
    }    restart() {
        this.currentQuestionIndex = 0;
        this.selectedQuestions = [];
        this.userAnswers = [];
        this.score = 0;
        this.correctCount = 0;
        this.wrongQuestions = [];
        
        // 重置进度条
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            progressFill.style.width = '0%';
        }
        
        this.showScreen('start-screen');
    }

    showScreen(screenId) {
        console.log('切换到屏幕:', screenId);
        
        // 隐藏加载指示器
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
        
        // 切换屏幕
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        } else {
            console.error('找不到屏幕:', screenId);
        }
    }
}

// 当DOM加载完成时初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new QuestionBankApp();
});
