// Verify script connection
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

// Simulate quiz run using for...of loop and if/else conditions
function runQuizSimulation(questions) {
    console.log('Початок тестування: Комп’ютерні мережі');

    const userAnswers = ['TCP', 'DHCP', 'Канальний', '443', 'DNS'];

    let correctCount = 0;
    let index = 0;
// Iterate over questions array
    for (const item of questions) {
        const currentUserAnswer = userAnswers[index];
        console.log(`Питання ${index + 1}: ${item.question}`);
        console.log(`Відповідь користувача: "${currentUserAnswer}" | Правильна відповідь: "${item.answer}"`);
// Strict comparison check
        if (currentUserAnswer.toLowerCase() === item.answer.toLowerCase()) {
            console.log('Статус: Правильно');
            correctCount++;
        } else {
            console.log('Статус: Неправильно');
        }
        index++;
    }

    // Calculate and display final results
    const totalQuestions = questions.length;
    const scorePercent = calcScorePercent(correctCount, totalQuestions);

    console.log(`Підсумок тесту: ${correctCount} з ${totalQuestions} правильних відповідей.`);
    console.log(`Успішність склала: ${scorePercent}%`);
}

runQuizSimulation(quizQuestions);