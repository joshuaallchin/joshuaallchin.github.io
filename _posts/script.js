document.addEventListener('DOMContentLoaded', () => {
    fetch('https://api.olympics.kevle.xyz/medals?country=uzb')
        .then(response => response.json())
        .then(data => {
            console.log('Data fetched:', data); // Debugging line
            updateContent(data);
        })
        .catch(error => console.error('Error fetching data:', error));
});

function updateContent(data) {
    const container = document.getElementById('medalTable');
    const lastUpdated = document.getElementById('lastUpdated');

    lastUpdated.textContent = `Last Updated: ${new Date(data.last_updated).toLocaleString()}`;

    let tableContent = `
        <table>
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Country</th>
                    <th>Gold</th>
                    <th>Silver</th>
                    <th>Bronze</th>
                    <th>Total</th>
                    <th>Source</th>
                </tr>
            </thead>
            <tbody>
    `;

    data.results.forEach(result => {
        tableContent += `
            <tr>
                <td>${result.rank}</td>
                <td>${result.country.name}</td>
                <td>${result.medals.gold}</td>
                <td>${result.medals.silver}</td>
                <td>${result.medals.bronze}</td>
                <td>${result.medals.total}</td>
                <td>${result.source}</td>
            </tr>
        `;
    });

    tableContent += `
            </tbody>
        </table>
    `;

    container.innerHTML = tableContent;
}
