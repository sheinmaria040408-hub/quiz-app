console.log('script.js підключено успішно (Лабораторна 11 - localStorage & IndexedDB)!');


// Helper function to decode HTML entities
function decodeHTMLEntities(text) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
}

// Функції роботи з localStorage
const LOCAL_STORAGE_KEY = 'quiz_pulse_results';

function saveToLocalStorage(results) {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(results));
    } catch (error) {
        console.error('Помилка збереження у localStorage:', error);
    }
}

function loadFromLocalStorage() {
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        console.error('Пошкоджені дані в localStorage:', error);
        return [];
    }
}

// Функції роботи з IndexedDB
const DB_NAME = 'QuizPulseDB';
const DB_VERSION = 1;
const STORE_NAME = 'results';

// Відкриття бази даних з обгорткою у Promise
function openDB() {
    return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            reject(new Error('Ваш браузер не підтримує IndexedDB.'));
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, {keyPath: 'id', autoIncrement: true});
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// додавання запису результату
async function addResultDB(resultItem) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const itemToSave = {...resultItem};
        if (!itemToSave.id) delete itemToSave.id;

        store.put(itemToSave);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

// отримання всіх записів результатів
async function getAllResultsDB() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

// видалення запису за id
async function deleteResultDB(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(id);

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function migrateLocalStorageToIndexedDB() {
    try {
        const isMigrated = localStorage.getItem('quiz_pulse_migrated');
        if (isMigrated) return;

        const dbResults = await getAllResultsDB();
        const localResults = loadFromLocalStorage();

        if (dbResults.length === 0 && localResults.length > 0) {
            console.log('Виконується міграція даних з localStorage в IndexedDB...');
            for (const item of localResults) {
                await addResultDB(item);
            }
        }
        localStorage.setItem('quiz_pulse_migrated', 'true');
    } catch (error) {
        console.error('Помилка під час міграції даних:', error);
    }
}

const QuizQuestion = {
    props: {
        question: String,
        options: Array,
        correctIndex: Number,
        currentIndex: Number,
        totalQuestions: Number
    },
    emits: ['answer', 'next-step'],
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
            this.$emit('answer', this.selectedIndex);
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

                <div v-if="submitted" class="validation-alert" :class="selectedIndex === correctIndex ? 'validation-alert--success' : 'validation-alert--error'">
                    <span class="validation-alert__icon">{{ selectedIndex === correctIndex ? '✔' : '✕' }}</span>
                    <div class="validation-alert__details">
                        <strong>{{ selectedIndex === correctIndex ? 'Правильно!' : 'Неправильно!' }}</strong>
                        <span>Правильна відповідь: {{ options[correctIndex] }}</span>
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
                    correctIndex: 1
                },
                {
                    question: 'Який протокол використовується для автоматичного отримання IP-адрес?',
                    options: ['DNS', 'DHCP', 'ARP', 'FTP'],
                    correctIndex: 1
                },
                {
                    question: 'На якому рівні моделі OSI працює протокол IP?',
                    options: ['Канальний', 'Мережевий', 'Транспортний', 'Прикладний'],
                    correctIndex: 1
                },
                {
                    question: 'Який порт за замовчуванням використовує безпечний протокол HTTPS?',
                    options: ['80', '21', '443', '22'],
                    correctIndex: 2
                },
                {
                    question: 'Який протокол транслює доменні імена у числові IP-адреси?',
                    options: ['DHCP', 'DNS', 'HTTP', 'SNMP'],
                    correctIndex: 1
                }
            ],
            apiQuestionsList: [],
            currentQuestionIndex: 0,
            userScore: 0,
            quizFinished: false,
            loading: false,
            errorMessage: '',
            dbErrorMessage: '',
            savedResults: []
        };
    },
    computed: {
        currentQuestion() {
            return this.interactiveQuestions[this.currentQuestionIndex] || {};
        },
        sortedResults() {
            return [...this.savedResults].sort((a, b) => {
                const percentA = (a.score / a.total) * 100;
                const percentB = (b.score / b.total) * 100;
                return percentB - percentA;
            });
        }
    },
    methods: {
        calcScorePercent(score, total) {
            if (!total) return 0;
            return Math.round((score / total) * 100);
        },
        handleAnswer(selectedIndex) {
            if (selectedIndex === this.currentQuestion.correctIndex) {
                this.userScore++;
            }
        },
        async nextQuestionUI() {
            if (this.currentQuestionIndex < this.interactiveQuestions.length - 1) {
                this.currentQuestionIndex++;
            } else {
                this.quizFinished = true;
                await this.saveQuizSession();
            }
        },
        async saveQuizSession() {
            const newRecord = {
                date: new Date().toLocaleString('uk-UA'),
                score: this.userScore,
                total: this.interactiveQuestions.length
            };

            const localList = loadFromLocalStorage();
            localList.push(newRecord);
            saveToLocalStorage(localList);

            try {
                await addResultDB(newRecord);
                await this.loadResultsFromDB();
            } catch (err) {
                console.error('Не вдалося зберегти результат в IndexedDB:', err);
            }
        },
        async loadResultsFromDB() {
            try {
                this.savedResults = await getAllResultsDB();
            } catch (err) {
                console.error('Помилка завантаження з IndexedDB:', err);
                this.dbErrorMessage = 'Не вдалося відкрити IndexedDB. Режим приватного перегляду або обмеження браузера.';
                this.savedResults = loadFromLocalStorage();
            }
        },
        async removeResult(id) {
            try {
                if (id) {
                    await deleteResultDB(id);
                }
                await this.loadResultsFromDB();
            } catch (err) {
                console.error('Помилка видалення запису:', err);
            }
        },
        resetQuiz() {
            this.currentQuestionIndex = 0;
            this.userScore = 0;
            this.quizFinished = false;
        },
        async fetchApiQuestions() {
            this.loading = true;
            this.errorMessage = '';
            const TRIVIA_API_URL = 'https://opentdb.com/api.php?amount=10&type=multiple';

            try {
                const response = await fetch(TRIVIA_API_URL);
                if (!response.ok) throw new Error(`Сервер відповів кодом помилки ${response.status}`);

                const data = await response.json();
                if (data.response_code !== 0) throw new Error('API повернуло порожній результат');

                const mapped = data.results.map((item) => {
                    const decodedCorrect = decodeHTMLEntities(item.correct_answer);
                    const decodedIncorrect = item.incorrect_answers.map(decodeHTMLEntities);

                    const options = [...decodedIncorrect, decodedCorrect].sort(() => Math.random() - 0.5);
                    const correctIndex = options.indexOf(decodedCorrect);

                    return {
                        question: decodeHTMLEntities(item.question),
                        options,
                        correctIndex
                    };
                });

                this.apiQuestionsList = mapped;
                this.interactiveQuestions = mapped;
                this.resetQuiz();
            } catch (err) {
                console.error(err);
                this.errorMessage = 'Не вдалося завантажити питання з сервера. Перевірте зʼєднання з інтернетом.';
            } finally {
                this.loading = false;
            }
        }
    },
    async mounted() {
        try {
            await migrateLocalStorageToIndexedDB();
            await this.loadResultsFromDB();
        } catch (err) {
            console.error('Помилка ініціалізації бази даних:', err);
            this.dbErrorMessage = 'Помилка доступу до локального сховища IndexedDB.';
        }

        this.fetchApiQuestions();
    }
});

app.mount('#vue-app');