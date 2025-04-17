let currentTool = 'summarizer';
const tabs = document.querySelectorAll('.tab');
const input = document.getElementById('userInput');
const output = document.getElementById('outputBox');
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
const pdfBtn = document.getElementById('pdfBtn');
const modeToggle = document.getElementById('modeToggle');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentTool = tab.dataset.tool;
        output.innerText = '';
        input.value = '';
    });
});

async function fetchFromLLM(prompt) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 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'
        },
        body: JSON.stringify({
            model: 'llama3-70b-8192',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7
        })
    });

    const data = await response.json();
    return data.choices[0].message.content;
}

generateBtn.addEventListener('click', async () => {
    const text = input.value.trim();
    if (!text) return;
    output.innerText = 'Generating...';

    let prompt = '';
    if (currentTool === 'summarizer') {
        prompt = `Summarize the following notes in simple points:\n\n${text}`;
    } else if (currentTool === 'qgen') {
        prompt = `Generate 5 quiz questions based on this topic:\n\n${text}`;
    } else if (currentTool === 'interview') {
        prompt = `Give 5 interview questions and sample answers for the role:\n\n${text}`;
    }

    try {
        const reply = await fetchFromLLM(prompt);
        output.innerText = reply;
    } catch (err) {
        output.innerText = 'Something went wrong. Check your API key.';
    }
});

copyBtn.addEventListener('click', () => {
    const text = output.innerText;
    if (!text) return;
    navigator.clipboard.writeText(text);
    copyBtn.innerText = 'Copied!';
    setTimeout(() => (copyBtn.innerText = 'Copy'), 1500);
});

pdfBtn.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let text = output.innerText;
    let marginLeft = 10;
    let marginTop = 10;
    let maxWidth = 180;
    let lineHeight = 10;

    let splitText = doc.splitTextToSize(text, maxWidth);
    let y = marginTop;

    splitText.forEach(line => {
        if (y > 280) {
            doc.addPage();
            y = marginTop;
        }
        doc.text(line, marginLeft, y);
        y += lineHeight;
    });

    doc.save('genai-output.pdf');
});

modeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
});