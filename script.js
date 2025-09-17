class QuizApp {
    constructor() {
        this.questions = [];
        this.currentQuestion = 0;
        this.score = 0;
        this.selectedAnswer = null;
        this.showingResult = false;
        
        this.initializeElements();
        this.bindEvents();
        this.loadQuestions();
    }

    initializeElements() {
        this.loadingEl = document.getElementById("loading");
        this.quizEl = document.getElementById("quiz");
        this.resultEl = document.getElementById("result");
        this.questionEl = document.getElementById("question");
        this.answersEl = document.getElementById("answers");
        this.questionCounterEl = document.getElementById("question-counter");
        this.scoreDisplayEl = document.getElementById("score-display");
        this.progressEl = document.getElementById("progress");
        this.finalScoreEl = document.getElementById("final-score");
        this.resultMessageEl = document.getElementById("result-message");
        this.restartBtnEl = document.getElementById("restart-btn");
    }

    bindEvents() {
        this.restartBtnEl.addEventListener("click", () => this.restartQuiz());
    }

    async loadQuestions() {
        try {
            this.showLoading();
            
            const response = await fetch("https://opentdb.com/api.php?amount=10&type=multiple");
            const data = await response.json();
            
            if (data.response_code === 0) {
                this.questions = data.results.map(question => ({
                    question: this.decodeHtml(question.question),
                    correctAnswer: this.decodeHtml(question.correct_answer),
                    answers: this.shuffleArray([
                        this.decodeHtml(question.correct_answer),
                        ...question.incorrect_answers.map(answer => this.decodeHtml(answer))
                    ])
                }));
                
                this.showQuiz();
                this.displayQuestion();
            } else {
                throw new Error("Error loading questions from API");
            }
        } catch (error) {
            console.error("Error loading questions:", error);
            this.showError();
        }
    }

    decodeHtml(html) {
        const txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    showLoading() {
        this.loadingEl.classList.remove("hidden");
        this.quizEl.classList.add("hidden");
        this.resultEl.classList.add("hidden");
    }

    showQuiz() {
        this.loadingEl.classList.add("hidden");
        this.quizEl.classList.remove("hidden");
        this.resultEl.classList.add("hidden");
    }

    showResult() {
        this.loadingEl.classList.add("hidden");
        this.quizEl.classList.add("hidden");
        this.resultEl.classList.remove("hidden");
    }

    showError() {
        this.loadingEl.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h3 style="color: #ef4444; margin-bottom: 20px;">Error loading questions</h3>
                <p style="margin-bottom: 20px;">Could not connect to the question API.</p>
                <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
            </div>
        `;
    }

    displayQuestion() {
        const question = this.questions[this.currentQuestion];
        
        // Update progress information
        this.questionCounterEl.textContent = `Question ${this.currentQuestion + 1} of ${this.questions.length}`;
        this.scoreDisplayEl.textContent = `Score: ${this.score}`;
        
        // Update progress bar
        const progressPercent = ((this.currentQuestion + 1) / this.questions.length) * 100;
        this.progressEl.style.width = `${progressPercent}%`;
        
        // Display question
        this.questionEl.textContent = question.question;
        
        // Clear and create answer buttons
        this.answersEl.innerHTML = "";
        question.answers.forEach((answer, index) => {
            const button = document.createElement("button");
            button.className = "btn";
            button.textContent = answer;
            button.addEventListener("click", () => this.selectAnswer(answer, button));
            this.answersEl.appendChild(button);
        });
        
        this.selectedAnswer = null;
        this.showingResult = false;
    }

    selectAnswer(answer, buttonEl) {
        if (this.showingResult) return;
        
        this.selectedAnswer = answer;
        this.showingResult = true;
        
        const question = this.questions[this.currentQuestion];
        const isCorrect = answer === question.correctAnswer;
        
        // Disable all buttons
        const allButtons = this.answersEl.querySelectorAll(".btn");
        allButtons.forEach(btn => {
            btn.disabled = true;
            
            if (btn.textContent === question.correctAnswer) {
                btn.classList.add("correct");
            } else if (btn === buttonEl && !isCorrect) {
                btn.classList.add("incorrect");
            } else if (btn !== buttonEl && btn.textContent !== question.correctAnswer) {
                btn.classList.add("disabled");
            }
        });
        
        // Update score
        if (isCorrect) {
            this.score++;
            this.scoreDisplayEl.textContent = `Score: ${this.score}`;
        }
        
        // Advance to next question after delay
        setTimeout(() => {
            this.nextQuestion();
        }, 1500);
    }

    nextQuestion() {
        this.currentQuestion++;
        
        if (this.currentQuestion < this.questions.length) {
            this.displayQuestion();
        } else {
            this.showFinalResult();
        }
    }

    showFinalResult() {
        this.finalScoreEl.textContent = `${this.score}/${this.questions.length}`;
        this.resultMessageEl.textContent = `You got ${this.score} out of ${this.questions.length} questions correct`;
        this.showResult();
    }

    restartQuiz() {
        this.currentQuestion = 0;
        this.score = 0;
        this.selectedAnswer = null;
        this.showingResult = false;
        this.questions = [];
        this.loadQuestions();
    }
}

// Initialize the quiz when the page loads
document.addEventListener("DOMContentLoaded", () => {
    new QuizApp();
});

