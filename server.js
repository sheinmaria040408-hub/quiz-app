const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const localQuestions = [
    {
        id: 1,
        question: "Який протокол забезпечує надійну доставку зі встановленням з’єднання?",
        correct_answer: "TCP",
        incorrect_answers: ["UDP", "IP", "ICMP"]
    },
    {
        id: 2,
        question: "Який протокол використовується для автоматичного отримання IP-адрес?",
        correct_answer: "DHCP",
        incorrect_answers: ["DNS", "ARP", "FTP"]
    },
    {
        id: 3,
        question: "На якому рівні моделі OSI працює протокол IP?",
        correct_answer: "Мережевий",
        incorrect_answers: ["Канальний", "Транспортний", "Прикладний"]
    },
    {
        id: 4,
        question: "Який порт за замовчуванням використовує безпечний протокол HTTPS?",
        correct_answer: "443",
        incorrect_answers: ["80", "21", "22"]
    },
    {
        id: 5,
        question: "Який протокол транслює доменні імена у числові IP-адреси?",
        correct_answer: "DNS",
        incorrect_answers: ["DHCP", "HTTP", "SNMP"]
    }
];

app.get('/api/questions', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(localQuestions);
});

app.get('/api/questions/:id', (req, res) => {
    const questionId = Number(req.params.id);
    const foundQuestion = localQuestions.find(q => q.id === questionId);

    res.setHeader('Content-Type', 'application/json');

    if (!foundQuestion) {
        return res.status(404).json({error: 'Питання з вказаним ID не знайдено'});
    }

    res.json(foundQuestion);
});

app.listen(PORT, () => {
    console.log(`Сервер QuizPulse запущено на http://localhost:${PORT}`);
});