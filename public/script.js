console.log('script.js підключено успішно (Лабораторна 13 - SPA Hash Router)!');

// Helper function to decode HTML entities
function decodeHTMLEntities(text) {
    if (!text) return '';
    const doc = new DOMParser().parseFromString(String(text), 'text/html');
    return doc.documentElement.textContent;
}

const LOCAL_STORAGE_KEY = 'quiz_pulse_results';
const DB_NAME = 'QuizPulseDB';
const DB_VERSION = 1;
const STORE_NAME = 'results';

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
            submitted: false,
            timeLimit: 15,
            timeLeft: 15,
            animationFrameId: null,
            startTime: null
        };
    },
    watch: {
        currentIndex() {
            this.startTimer();
        }
    },
    methods: {
        startTimer() {
            this.stopTimer();
            this.timeLeft = this.timeLimit;
            this.startTime = performance.now();

            const draw = (now) => {
                if (this.submitted) return;

                const elapsed = (now - this.startTime) / 1000;
                this.timeLeft = Math.max(0, this.timeLimit - elapsed);

                this.renderCanvasTimer();

                if (this.timeLeft > 0) {
                    this.animationFrameId = requestAnimationFrame(draw);
                } else {
                    this.handleTimeOut();
                }
            };

            this.animationFrameId = requestAnimationFrame(draw);
        },
        stopTimer() {
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
        },
        renderCanvasTimer() {
            const canvas = this.$refs.timerCanvas;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const width = canvas.width;
            const height = canvas.height;
            const centerX = width / 2;
            const centerY = height / 2;
            const radius = 32;

            ctx.clearRect(0, 0, width, height);

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 6;
            ctx.stroke();

            const progress = this.timeLeft / this.timeLimit;
            const startAngle = -Math.PI / 2;
            const endAngle = startAngle + (Math.PI * 2 * progress);

            let strokeColor = '#3182ce';
            if (progress < 0.3) {
                strokeColor = '#e53e3e';
            } else if (progress < 0.6) {
                strokeColor = '#dd6b20';
            }

            if (progress > 0) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, startAngle, endAngle);
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = 6;
                ctx.lineCap = 'round';
                ctx.stroke();
            }

            ctx.font = 'bold 16px Inter, sans-serif';
            ctx.fillStyle = strokeColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${Math.ceil(this.timeLeft)}s`, centerX, centerY);
        },
        handleTimeOut() {
            if (this.submitted) return;
            this.submitted = true;
            this.stopTimer();
            this.$emit('answer', -1);
        },
        submitChoice() {
            if (this.selectedIndex === null || this.submitted) return;
            this.submitted = true;
            this.stopTimer();
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
    mounted() {
        this.startTimer();
    },
    beforeUnmount() {
        this.stopTimer();
    },
    template: `
        <div class="quiz-question-component">
            <div class="quiz-meta-panel" style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div class="quiz-badge-group">
                    </div>
                    <div class="quiz-counter" style="margin-top: 8px;">
                        <span class="quiz-counter__current">{{ String(currentIndex + 1).padStart(2, '0') }}</span>
                        <span class="quiz-counter__divider">/</span>
                        <span class="quiz-counter__total">{{ String(totalQuestions).padStart(2, '0') }}</span>
                    </div>
                </div>

                <div class="timer-container" style="text-align: center;">
                    <canvas ref="timerCanvas" width="80" height="80"></canvas>
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
                        <strong>{{ selectedIndex === correctIndex ? 'Правильно!' : (selectedIndex === -1 ? 'Час вийшов!' : 'Неправильно!') }}</strong>
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
            currentRoute: '/',
            currentRouteParamId: null,
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
        },
        // Обчислювальний розбір для детального маршруту /results/:id
        selectedResultDetail() {
            if (!this.currentRouteParamId) return null;
            const targetId = Number(this.currentRouteParamId);
            return this.savedResults.find(r => r.id === targetId) || null;
        }
    },
    methods: {
        // Обробник зміни hash в URL
        handleHashChange() {
            const hashPath = location.hash.slice(1) || '/';
            this.currentRouteParamId = null;

            // Зіставлення маршрутів
            if (hashPath.startsWith('/results/')) {
                const parts = hashPath.split('/');
                if (parts.length === 3 && parts[2]) {
                    this.currentRoute = '/results/:id';
                    this.currentRouteParamId = parts[2];
                    return;
                }
            }

            const validRoutes = ['/', '/quiz', '/results'];
            if (validRoutes.includes(hashPath)) {
                this.currentRoute = hashPath;
            } else {
                this.currentRoute = '/404';
            }
        },
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
                this.dbErrorMessage = 'Не вдалося відкрити IndexedDB.';
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
            const LOCAL_NODE_API_URL = '/api/questions';

            try {
                const response = await fetch(LOCAL_NODE_API_URL);
                if (!response.ok) throw new Error(`Сервер відповів кодом помилки ${response.status}`);

                const data = await response.json();

                const mapped = data.map((item) => {
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
        // Налаштування слухача подій hashchange для клієнтської маршрутизації
        window.addEventListener('hashchange', () => this.handleHashChange());
        this.handleHashChange();

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