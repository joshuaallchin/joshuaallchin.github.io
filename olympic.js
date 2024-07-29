document.addEventListener('DOMContentLoaded', () => {
    const teams = {
        'Bob': ['USA', 'AUS', 'Panama'],
        'Bill': ['JAP', 'NZ', 'Fiji']
    };

    const promises = [];

    for (const person in teams) {
        teams[person].forEach(country => {
            const url = `https://api.olympics.kevle.xyz/medals?country=${country.toLowerCase()}`;
            promises.push(fetch(url).then(response => response.json()));
        });
    }

    Promise.all(promises).then(results => {
        const data = {};
        let resultIndex = 0;
        for (const person in teams) {
            data[person] = teams[person].map(country => {
                const result = results[resultIndex].results[0];
                resultIndex++;
                return result;
            });
        }
        updateContent(data);
    }).catch(error => console.error('Error fetching data:', error));
});

function updateContent(data) {
    const container = document.getElementById('medalTable');
    const personData = [];

    for (const person in data) {
        let totalPoints = 0;
        const countriesMedals = data[person].map(countryData => {
            const { country, medals } = countryData;
            const { gold, silver, bronze } = medals;
            const countryPoints = (gold * 3) + (silver * 2) + (bronze * 1);
            totalPoints += countryPoints;
            return {
                country: country.name,
                gold,
                silver,
                bronze,
                countryPoints
            };
        });

        personData.push({ person, totalPoints, countriesMedals });
    }

    personData.sort((a, b) => b.totalPoints - a.totalPoints);

    let tableContent = `
        <table>
            <thead>
                <tr>
                    <th>Person</th>
                    <th>Countries and Medals</th>
                    <th>Total Points</th>
                </tr>
            </thead>
            <tbody>
    `;

    personData.forEach(person => {
        let countriesMedals = '<table>';
        person.countriesMedals.forEach(countryData => {
            countriesMedals += `
                <tr>
                    <td>${countryData.country}</td>
                    <td>Gold: ${countryData.gold}</td>
                    <td>Silver: ${countryData.silver}</td>
                    <td>Bronze: ${countryData.bronze}</td>
                </tr>
            `;
        });
        countriesMedals += '</table>';

        tableContent += `
            <tr>
                <td>${person.person}</td>
                <td>${countriesMedals}</td>
                <td>${person.totalPoints}</td>
            </tr>
        `;
    });

    tableContent += `
            </tbody>
        </table>
    `;

    container.innerHTML = tableContent;
}
