async function runSearch() {
    const keyword = document.getElementById('searchInput').value.trim();
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = "";

    if (!keyword) {
        resultsContainer.innerHTML = "<p>Please enter a keyword.</p>";
        return;
    }

    const response = await fetch('data.json');
    const docs = await response.json();

    const results = docs.filter(doc =>
        doc.content.toLowerCase().includes(keyword.toLowerCase())
    );

    if (results.length === 0) {
        resultsContainer.innerHTML = "<p>No matches found.</p>";
        return;
    }

    results.forEach(doc => {
        const snippetIndex = doc.content.toLowerCase().indexOf(keyword.toLowerCase());
        const snippetStart = Math.max(0, snippetIndex - 60);
        const snippetEnd = Math.min(doc.content.length, snippetIndex + 60);

        const snippet = doc.content.substring(snippetStart, snippetEnd);

        const div = document.createElement('div');
        div.className = "result";

        div.innerHTML = `
            <h3>${doc.title}</h3>
            <p>... ${snippet} ...</p>
        `;

        resultsContainer.appendChild(div);
    });
}
