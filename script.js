// Check script connection
console.log('script.js підключено успішно!');

// Variant 8 dataset
const quizQuestions = [
    {
        question: 'Який протокол забезпечує надійну доставку зі встановленням з’єднання?',
        answer: 'TCP'
    },
    {
        question: 'Який протокол використовується для автоматичного отримання IP-адрес?',
        answer: 'DHCP'
    },
    {
        question: 'На якому рівні моделі OSI працює протокол IP?',
        answer: 'Мережевий'
    },
    {
        question: 'Який порт за замовчуванням використовує безпечний протокол HTTPS?',
        answer: '443'
    },
    {
        question: 'Який протокол транслює доменні імена у числові IP-адреси?',
        answer: 'DNS'
    }
];

// Arrow function to calculate score percentage
const calcScorePercent = (correctCount, total) => Math.round((correctCount / total) * 100);

// Console simulation (Lab 6)
function runQuizSimulation(questions) {
    console.log('Початок тестування: Комп’ютерні мережі');
    const userAnswers = ['TCP', 'DHCP', 'Канальний', '443', 'DNS'];
    let correctCount = 0;
    let index = 0;

    for (const item of questions) {
        const currentUserAnswer = userAnswers[index];
        console.log(`Питання ${index + 1}: ${item.question}`);
        console.log(`Відповідь користувача: "${currentUserAnswer}" | Правильна відповідь: "${item.answer}"`);

        if (currentUserAnswer.toLowerCase() === item.answer.toLowerCase()) {
            console.log('Статус: Правильно');
            correctCount++;
        } else {
            console.log('Статус: Неправильно');
        }
        index++;
    }

    const totalQuestions = questions.length;
    const scorePercent = calcScorePercent(correctCount, totalQuestions);
    console.log(`Підсумок тесту: ${correctCount} з ${totalQuestions} правильних відповідей.`);
    console.log(`Успішність склала: ${scorePercent}%`);
}

runQuizSimulation(quizQuestions);

// Remove static placeholder (Lab 7)
const staticPlaceholder = document.querySelector('#static-placeholder');
if (staticPlaceholder) {
    staticPlaceholder.remove();
}

// Select DOM elements (Lab 7)
const listContainer = document.querySelector('#questions-list');
const questionsCount = document.querySelector('#questions-count');

// Render questions list into DOM (Lab 7)
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

// Initial render call
renderQuestions(quizQuestions);

if (questionsCount) {
    questionsCount.textContent = `Усього активних питань у базі: ${quizQuestions.length}`;
}

// Extended dataset for interactive form navigation
const interactiveQuestions = [
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
];

let currentQuestionIndex = 0;
let userScore = 0;

// Select form and control elements
const quizForm = document.querySelector('#quiz-form');
const submitBtn = document.querySelector('#submit-btn');
const nextBtn = document.querySelector('#next-btn');
const validationAlert = document.querySelector('#validation-alert');
const alertIcon = document.querySelector('#alert-icon');
const alertTitle = document.querySelector('#alert-title');
const alertText = document.querySelector('#alert-text');

// Helper function to update question UI
// Helper function to update question UI
function loadQuestion(index) {
    const currentQ = interactiveQuestions[index];
    if (!currentQ || !quizForm) return;

    const currentCounter = document.querySelector('#quiz-counter-current');
    const totalCounter = document.querySelector('#quiz-counter-total');
    const progressFill = document.querySelector('#quiz-progress-fill');
    const promptTitle = document.querySelector('#quiz-prompt');

    if (currentCounter) currentCounter.textContent = String(index + 1).padStart(2, '0');
    if (totalCounter) totalCounter.textContent = String(interactiveQuestions.length).padStart(2, '0');
    if (progressFill) progressFill.style.width = `${((index + 1) / interactiveQuestions.length) * 100}%`;
    if (promptTitle) promptTitle.textContent = currentQ.question;

    const radioInputs = quizForm.querySelectorAll('input[name="answer"]');
    radioInputs.forEach((input, idx) => {
        input.value = currentQ.options[idx];
        input.checked = false;
        input.required = true; // Гарантуємо наявність required для валідації браузером

        const parentLabel = input.closest('.answer-card');
        if (parentLabel) {
            parentLabel.classList.remove('answer-card--checked');
            const titleSpan = parentLabel.querySelector('.answer-card__title');
            if (titleSpan) titleSpan.textContent = currentQ.options[idx];
        }
    });

    if (validationAlert) validationAlert.style.display = 'none';
    if (submitBtn) submitBtn.style.display = 'inline-flex';
    if (nextBtn) nextBtn.style.display = 'none';
}

// Highlight radio card on selection change
if (quizForm) {
    quizForm.addEventListener('change', (e) => {
        if (e.target.name === 'answer') {
            quizForm.querySelectorAll('.answer-card').forEach(card => card.classList.remove('answer-card--checked'));
            const chosenCard = e.target.closest('.answer-card');
            if (chosenCard) chosenCard.classList.add('answer-card--checked');
        }
    });

    // Step 2 & 3: Handle form submit and prevent reload
    quizForm.addEventListener('submit', (event) => {
        const selectedRadio = quizForm.querySelector('input[name="answer"]:checked');

        if (!selectedRadio) {
            return;
        }

        event.preventDefault();

        const selectedValue = selectedRadio.value;
        const currentQ = interactiveQuestions[currentQuestionIndex];

        if (validationAlert) validationAlert.style.display = 'flex';

        if (selectedValue.toLowerCase() === currentQ.answer.toLowerCase()) {
            userScore++;
            if (validationAlert) validationAlert.className = 'validation-alert validation-alert--success';
            if (alertIcon) alertIcon.textContent = '✔';
            if (alertTitle) alertTitle.textContent = 'Правильно!';
            if (alertText) alertText.textContent = `Відповідь "${currentQ.answer}" є вірною.`;
        } else {
            if (validationAlert) validationAlert.className = 'validation-alert validation-alert--error';
            if (alertIcon) alertIcon.textContent = '✕';
            if (alertTitle) alertTitle.textContent = 'Неправильно!';
            if (alertText) alertText.textContent = `Правильна відповідь: "${currentQ.answer}".`;
        }

        if (submitBtn) submitBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'inline-flex';
    });
}

// Step 9: Second event - Click handler for "Next Question" button
if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < interactiveQuestions.length) {
            // Step 7: Reset form and load next question
            quizForm.reset();
            loadQuestion(currentQuestionIndex);
        } else {
            // Final state after all questions are answered
            quizForm.reset();
            const promptTitle = document.querySelector('#quiz-prompt');
            if (promptTitle) {
                promptTitle.textContent = `Тест завершено! Ваш результат: ${userScore} з ${interactiveQuestions.length} (${calcScorePercent(userScore, interactiveQuestions.length)}%).`;
            }
            const answersGrid = document.querySelector('#answers-grid');
            if (answersGrid) answersGrid.style.display = 'none';
            if (validationAlert) validationAlert.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
        }
    });
}

// Initial load of the first question
loadQuestion(0);