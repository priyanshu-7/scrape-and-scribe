let summaries = {};

function showForm(formType) {
    const forms = ['youtubeForm', 'urlForm', 'pdfForm'];
    forms.forEach(form => {
        if (form === formType + 'Form') {
            document.getElementById(form).style.display = 'block';
        } else {
            document.getElementById(form).style.display = 'none';
        }
    });
}

function showLoadingIndicator(show) {
    const loader = document.getElementById('loading');
    if (show) {
        loader.style.display = 'block';
    } else {
        loader.style.display = 'none';
    }
}

function addOrUpdateSummary(identifier, prompt, response) {
    if (summaries[identifier]) {
        summaries[identifier].push({ prompt, response });
    } else {
        summaries[identifier] = [{ prompt, response }];
    }
    updateDisplay();
}

function updateDisplay() {
    const displayArea = document.getElementById('summaryDisplay');
    displayArea.innerHTML = '';  // Clear current display

    Object.keys(summaries).forEach((identifier, index) => {
        let container = document.createElement('div');
        container.innerHTML = `
            <div class="accordion-item">
                <h2 class="accordion-header" id="heading${index}">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="true" aria-controls="collapse${index}">
                        ${identifier}
                    </button>
                </h2>
                <div id="collapse${index}" class="accordion-collapse collapse show" aria-labelledby="heading${index}" data-bs-parent="#summaryDisplay">
                    <div class="accordion-body">
                        ${summaries[identifier].map(item => `<p><strong>Prompt:</strong> ${item.prompt}<br><strong>Response:</strong> ${item.response}</p>`).join('')}
                    </div>
                </div>
            </div>`;
        displayArea.appendChild(container);
    });
}
function fetchData(url, data) {
    console.log("Sending data:", JSON.stringify(data));
    showLoadingIndicator(true);
    fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP status ${response.status}`);
        }
        return response.text(); 
    })
    .then(text => {
        let formattedText = formatText(text);
        showLoadingIndicator(false);
        addOrUpdateSummary(data.url, data.prompt, formattedText);
    })
    .catch(error => {
        showLoadingIndicator(false);
        console.error('Error:', error);
        showPopup('Failed to fetch data: ' + error.message);
    });
}

function formatText(text) {
    return text.replace(/[\*]|\n\n|\n/g, '');
}

function summarizeYouTube() {
    const url = document.getElementById('youtubeUrl').value;
    const prompt = document.getElementById('youtubePrompt').value;
    fetchData('/summarize-video', { url, prompt });
}

function summarizeUrl() {
    const url = document.getElementById('url').value;
    const prompt = document.getElementById('urlPrompt').value;
    fetchData('/summarize-url', { url, prompt });
}

function summarizePDF() {
    const file = document.getElementById('pdfFile').files[0];
    const prompt = document.getElementById('pdfPrompt').value;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('prompt', prompt);

    showLoadingIndicator(true);
    fetch('/summarize-pdf', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        showLoadingIndicator(false);
        addOrUpdateSummary(file.name, prompt, JSON.stringify(data));
    })
    .catch(error => {
        showLoadingIndicator(false);
        console.error('Error:', error);
        showPopup('Failed to fetch data.');
    });
}

function saveSummariesAsPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let yPos = 10; 
    Object.keys(summaries).forEach((identifier, index) => {
        let content = `Identifier: ${identifier}\n`;
        summaries[identifier].forEach(item => {
            content += `Question: ${item.prompt}\nAnswer: ${item.response}\n\n`;
        });
        const lines = doc.splitTextToSize(content, 190);
        doc.text(lines, 10, yPos); 
        yPos += lines.length * 6 + 10; 
        if (yPos > 280) { 
            doc.addPage();
            yPos = 10; 
        }
    });
    doc.save('notes.pdf');
}
document.getElementById('savePdfButton').addEventListener('click', saveSummariesAsPDF);

