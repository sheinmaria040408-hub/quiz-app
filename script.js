// Vue 3 забезпечує декларативну реактивність, зрозумілий синтаксис шаблонів і підключається за допомогою одного тегу <script> без складного налаштування середовища збірки.
console.log('script.js підключено успішно !');
// Helper function to calculate score percentage
const calcScorePercent = (correctCount, total) => Math.round((correctCount / total) * 100);

// Helper function to decode HTML entities
function decodeHTMLEntities(text) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
}

const QuizQuestion = {
    props: {
        question: String,
        options: Array,
        correctAnswer: String,
        currentIndex: Number,
        totalQuestions: Number
    },
    emits: ['select-answer', 'next-step'],
    data() {
        return {
            selectedIndex: null,
            submitted: false
        };
    },
    methods: {
        submitChoice() {
            if (this.selectedIndex === null) return;
            this.submitted = true;
            const chosenOption = this.options[this.selectedIndex];
            const isCorrect = chosenOption.toLowerCase() === this.correctAnswer.toLowerCase();
            this.$emit('select-answer', {isCorrect});
        },
        resetState() {
            this.selectedIndex = null;
            this.submitted = false;
        },
        goNext() {
            this.$emit('next-step');
            this.resetState();
        }
    },
    template: `
        <div class="quiz-question-component">
            <div class="quiz-meta-panel">
                <div class="quiz-badge-group">
                    <span class="status-pill status-pill--live">VUE 3 COMPONENT</span>
                    <span class="status-pill status-pill--category">Транспортний рівень OSI</span>
                </div>
                <div class="quiz-counter">
                    <span class="quiz-counter__current">{{ String(currentIndex + 1).padStart(2, '0') }}</span>
                    <span class="quiz-counter__divider">/</span>
                    <span class="quiz-counter__total">{{ String(totalQuestions).padStart(2, '0') }}</span>
                </div>
            </div>

            <div class="quiz-progress-track">
                <div class="quiz-progress-track__fill" :style="{ width: ((currentIndex + 1) / totalQuestions * 100) + '%' }"></div>
            </div>

            <h2 class="quiz-card__prompt">{{ question }}</h2>

            <form @submit.prevent="submitChoice" class="quiz-form">
                <fieldset class="quiz-form__fieldset answers-grid">
                    <legend class="visually-hidden">Варіанти відповіді</legend>
                    <label 
                        v-for="(option, idx) in options" 
                        :key="idx" 
                        class="answer-card"
                        :class="{ 'answer-card--checked': selectedIndex === idx }">
                        <input 
                            type="radio" 
                            name="answer" 
                            :value="idx" 
                            v-model="selectedIndex" 
                            :disabled="submitted"
                            required>
                        <div class="answer-card__body">
                            <span class="answer-card__key">{{ String.fromCharCode(65 + idx) }}</span>
                            <div class="answer-card__content">
                                <span class="answer-card__title">{{ option }}</span>
                            </div>
                        </div>
                    </label>
                </fieldset>
                <div v-if="submitted" class="validation-alert" :class="selectedIndex !== null && options[selectedIndex].toLowerCase() === correctAnswer.toLowerCase() ? 'validation-alert--success' : 'validation-alert--error'">
                    <span class="validation-alert__icon">{{ options[selectedIndex].toLowerCase() === correctAnswer.toLowerCase() ? '✔' : '✕' }}</span>
                    <div class="validation-alert__details">
                        <strong>{{ options[selectedIndex].toLowerCase() === correctAnswer.toLowerCase() ? 'Правильно!' : 'Неправильно!' }}</strong>
                        <span>Правильна відповідь: {{ correctAnswer }}</span>
                    </div>
                </div>

                <div class="quiz-form__actions">
                    <button v-if="!submitted" type="submit" class="btn-primary">
                        <span>Підтвердити вибір</span>
                        <span class="btn-primary__arrow">→</span>
                    </button>
                    <button v-else type="button" class="btn-primary" style="background-color: var(--brand-purple);" @click="goNext">
                        <span>Наступне питання</span>
                        <span class="btn-primary__arrow">→</span>
                    </button>
                </div>
            </form>
        </div>
    `
};

const {createApp} = Vue;

const app = createApp({
    components: {
        'quiz-question': QuizQuestion
    },
    data() {
        return {
            interactiveQuestions: [
                {
                    question: 'Який протокол забезпечує надійну доставку зі встановленням з’єднання?',
                    options: ['UDP', 'TCP', 'IP', 'ICMP'],
                    answer: 'TCP'
                },
                {
                    question: 'Який протокол використовується для автоматичного отримання IP-адрес?',
                    options: ['DNS', 'DHCP', 'ARP', 'FTP'],
                    answer: 'DHCP'
                },
                {
                    question: 'На якому рівні моделі OSI працює протокол IP?',
                    options: ['Канальний', 'Мережевий', 'Транспортний', 'Прикладний'],
                    answer: 'Мережевий'
                },
                {
                    question: 'Який порт за замовчуванням використовує безпечний протокол HTTPS?',
                    options: ['80', '21', '443', '22'],
                    answer: '443'
                },
                {
                    question: 'Який протокол транслює доменні імена у числові IP-адреси?',
                    options: ['DHCP', 'DNS', 'HTTP', 'SNMP'],
                    answer: 'DNS'
                }
            ],
            currentQuestionIndex: 0,
            userScore: 0,
            quizFinished: false
        };
    },
    computed: {
        currentQuestion() {
            return this.interactiveQuestions[this.currentQuestionIndex] || {};
        }
    },
    methods: {
        calcScorePercent(score, total) {
            return calcScorePercent(score, total);
        },
        handleAnswer(payload) {
            if (payload.isCorrect) {
                this.userScore++;
            }
        },
        nextQuestionUI() {
            if (this.currentQuestionIndex < this.interactiveQuestions.length - 1) {
                this.currentQuestionIndex++;
            } else {
                this.quizFinished = true;
            }
        },
        resetQuiz() {
            this.currentQuestionIndex = 0;
            this.userScore = 0;
            this.quizFinished = false;
        }
    }
});

const vm = app.mount('#vue-app');

const TRIVIA_API_URL = 'https://opentdb.com/api.php?amount=10&type=multiple';

const fetchBtn = document.querySelector('#fetch-btn');
const loadingSpinner = document.querySelector('#loading-spinner');
const errorMessage = document.querySelector('#error-message');
const errorText = document.querySelector('#error-text');
const questionsCount = document.querySelector('#questions-count');
const listContainer = document.querySelector('#questions-list');

function renderQuestions(questions) {
    if (!listContainer) return;
    listContainer.innerHTML = '';

    questions.forEach((item, index) => {
        const li = document.createElement('li');
        li.classList.add('questions-list__item');
        li.textContent = `${index + 1}. ${item.question}`;
        li.dataset.answer = item.answer;

        if (index < 2) {
            li.classList.add('answered');
        }

        listContainer.append(li);
    });
}

async function loadData() {
    if (loadingSpinner) loadingSpinner.style.display = 'block';
    if (errorMessage) errorMessage.style.display = 'none';
    if (fetchBtn) fetchBtn.disabled = true;

    try {
        const response = await fetch(TRIVIA_API_URL);

        if (!response.ok) {
            throw new Error(`Сервер відповів кодом помилки ${response.status}`);
        }

        const data = await response.json();

        if (data.response_code !== 0) {
            throw new Error('API повернуло порожній або некоректний результат');
        }

        const apiQuestions = data.results.map((item) => ({
            question: decodeHTMLEntities(item.question),
            answer: decodeHTMLEntities(item.correct_answer),
            options: [
                ...item.incorrect_answers.map(decodeHTMLEntities),
                decodeHTMLEntities(item.correct_answer)
            ].sort(() => Math.random() - 0.5)
        }));

        renderQuestions(apiQuestions);

        if (questionsCount) {
            questionsCount.textContent = `Завантажено з Open Trivia API: ${apiQuestions.length} питань`;
        }

        vm.interactiveQuestions = apiQuestions;
        vm.resetQuiz();

    } catch (error) {
        console.error('Помилка виконання fetch-запиту:', error);

        if (errorMessage) {
            errorMessage.style.display = 'flex';
            if (errorText) {
                errorText.textContent = 'Не вдалося завантажити питання з сервера. Перевірте зєднання з інтернетом або спробуйте пізніше.';
            }
        }
    } finally {
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        if (fetchBtn) fetchBtn.disabled = false;
    }
}

if (fetchBtn) {
    fetchBtn.addEventListener('click', () => {
        loadData();
    });
}

loadData();