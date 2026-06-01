// Build an index of extracted PDF text
let pdfIndex = [];

// Load and index all PDFs listed in data.json async function loadAndIndexPDFs() {
    console.log("Loading data.json...");
    const response = await fetch("data.json");
    const docs = await response.json();

    for (const doc of docs) {
        console.log("Loading PDF:", doc.file);

        try {
            const pdf = await pdfjsLib.getDocument(doc.file).promise;
            let fullText = "";

            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const content = await page.getTextContent();
                const strings = content.items.map(item => item.str).join(" ");
                fullText += " " + strings;
            }

            pdfIndex.push({
                title: doc.title,
                file: doc.file,
                text: fullText
            });

            console.log("Indexed:", doc.file);

        } catch (err) {
            console.error("Error loading PDF:", doc.file, err);
        }
    }

    console.log("Indexing complete.");
}

// Run a keyword search
async function runSearch() {
    const keyword = document.getElementById("searchInput").value.trim();
    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = "";

    if (!keyword) {
        resultsContainer.innerHTML = "<p>Please enter a keyword.</p>";
        return;
    }

    if (pdfIndex.length === 0) {
        resultsContainer.innerHTML = "<p>Indexing PDFs… please wait a moment and try again.</p>";
        return;
    }

    const results = pdfIndex.filter(doc =>
        doc.text.toLowerCase().includes(keyword.toLowerCase())
    );

    if (results.length === 0) {
        resultsContainer.innerHTML = "<p>No matches found.</p>";
        return;
    }

    results.forEach(doc => {
        const idx = doc.text.toLowerCase().indexOf(keyword.toLowerCase());
        const start = Math.max(0, idx - 60);
        const end = Math.min(doc.text.length, idx + 60);
        const snippet = doc.text.substring(start, end);

        const div = document.createElement("div");
        div.className = "result";
        div.innerHTML = `
            <h3>${doc.title}</h3>
            <p>... ${snippet} ...</p>
            <a href="${doc.file}" target="_blank">Open PDF</a>
        `;
        resultsContainer.appendChild(div);
    });
}

// Start indexing as soon as the page loads window.addEventListener("load", loadAndIndexPDFs);

