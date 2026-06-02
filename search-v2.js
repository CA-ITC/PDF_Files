let pdfIndex = [];

// Load and index all PDFs listed in data-v4.json async function loadAndIndexPDFs() {
    console.log("Loading data-v4.json...");
    const response = await fetch("data-v4.json");
    const docs = await response.json();

    for (const doc of docs) {
        console.log("Loading PDF:", doc.file);

        try {
            const pdf = await pdfjsLib.getDocument(doc.file).promise;

            let pages = []; // store text per page

            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const content = await page.getTextContent();
                const strings = content.items.map(item => item.str).join(" ");
                pages.push(strings);
            }

            pdfIndex.push({
                title: doc.title,
                file: doc.file,
                pages: pages
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

    let foundAny = false;

    pdfIndex.forEach(doc => {
        doc.pages.forEach((pageText, pageNumber) => {
            const idx = pageText.toLowerCase().indexOf(keyword.toLowerCase());
            if (idx !== -1) {
                foundAny = true;

                const start = Math.max(0, idx - 60);
                const end = Math.min(pageText.length, idx + 60);
                const snippet = pageText.substring(start, end);

                const div = document.createElement("div");
                div.className = "result";
                div.innerHTML = `
                    <h3>${doc.title}</h3>
                    <p><strong>Page ${pageNumber + 1}</strong></p>
                    <p>... ${snippet} ...</p>
                    <a href="${doc.file}#page=${pageNumber + 1}" target="_blank">
                        Open to Page ${pageNumber + 1}
                    </a>
                `;
                resultsContainer.appendChild(div);
            }
        });
    });

    if (!foundAny) {
        resultsContainer.innerHTML = "<p>No matches found.</p>";
    }
}

// Start indexing as soon as the page loads window.addEventListener("load", loadAndIndexPDFs);
