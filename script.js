//  Verify script connection
console.log('script.js підключено успішно!');

// Variant 8 quiz dataset
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

// Quiz simulation in console
function runQuizSimulation(questions) {
    console.log('Початок тестування: Комп’ютерні мережі ');
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

// Remove static placeholder
const staticPlaceholder = document.querySelector('#static-placeholder');
if (staticPlaceholder) {
    staticPlaceholder.remove();
}

//  Select DOM elements
const listContainer = document.querySelector('#questions-list');
const questionsCount = document.querySelector('#questions-count');

// Render questions list into DOM
function renderQuestions(questions) {
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

// Initial render
renderQuestions(quizQuestions);

// Update total count
if (questionsCount) {
    questionsCount.textContent = `Усього активних питань у базі: ${quizQuestions.length}`;
}