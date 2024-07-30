const people = {
    'Annmarie': ['GBR', 'ESP', 'SWE', 'FIN'],
    'Ben': ['CAN', 'KOR', 'POL', 'BEL'],
    'Sena': ['GER', 'ITA', 'UKR', 'CZE'],
    'Shorn': ['MEX', 'NZL', 'JAM', 'THA'],
    'Deva': ['AUS', 'BRA', 'ROU', 'GRE'],
    'Josh': ['NED', 'HUN', 'TUR', 'GEO'],
    'Piya': ['FRA', 'SUI', 'DEN', 'NOR'],
    'Shione': ['JPN', 'ETH', 'KEN', 'IRI']
};

// Mapping of country codes to flag emojis
const flagEmojis = {
    'GBR': '🇬🇧', 'ESP': '🇪🇸', 'SWE': '🇸🇪', 'FIN': '🇫🇮',
    'CAN': '🇨🇦', 'KOR': '🇰🇷', 'POL': '🇵🇱', 'BEL': '🇧🇪',
    'GER': '🇩🇪', 'ITA': '🇮🇹', 'UKR': '🇺🇦', 'CZE': '🇨🇿',
    'MEX': '🇲🇽', 'NZL': '🇳🇿', 'JAM': '🇯🇲', 'THA': '🇹🇭',
    'AUS': '🇦🇺', 'BRA': '🇧🇷', 'ROU': '🇷🇴', 'GRE': '🇬🇷',
    'NED': '🇳🇱', 'HUN': '🇭🇺', 'TUR': '🇹🇷', 'GEO': '🇬🇪',
    'FRA': '🇫🇷', 'SUI': '🇨🇭', 'DEN': '🇩🇰', 'NOR': '🇳🇴',
    'JPN': '🇯🇵', 'ETH': '🇪🇹', 'KEN': '🇰🇪', 'IRI': '🇮🇷'
};

const fetchCountryCodes = async () => {
    try {
        const response = await fetch("https://olympics.com/en/news/paris-2024-olympics-full-list-ioc-national-olympic-committee-codes");
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");
        const countryMapping = {};

        doc.querySelectorAll(".news-article p").forEach(paragraph => {
            const parts = paragraph.textContent.split(': ');
            if (parts.length === 2) {
                const iocCode = parts[0].trim();
                const countryName = parts[1].trim();
                countryMapping[iocCode] = countryName;
            }
        });

        return countryMapping;
    } catch (error) {
        console.error("Error fetching country codes:", error);
    }
};

const fetchMedals = async (countryCode, countryMapping) => {
    try {
        const response = await fetch(`https://api.olympics.kevle.xyz/medals?country=${countryCode}`);
        const data = await response.json();
        const results = data.results[0];

        if (!results.country) {
            return {
                name: flagEmojis[countryCode] || countryCode,
                gold: 0,
                silver: 0,
                bronze: 0,
                total: 0
            };
        }

        const { gold, silver, bronze } = results.medals;
        return {
            name: flagEmojis[countryCode] || results.country.name,
            gold,
            silver,
            bronze,
            total: gold * 3 + silver * 2 + bronze
        };
    } catch (error) {
        console.error("Error fetching medals data:", error);
        return {
            name: flagEmojis[countryCode] || countryCode,
            gold: 0,
            silver: 0,
            bronze: 0,
            total: 0
        };
    }
};

const updateContent = async () => {
    const countryMapping = await fetchCountryCodes();
    if (!countryMapping) {
        console.error("Country mapping is not available.");
        return;
    }

    const medalData = await Promise.all(
        Object.entries(people).map(async ([person, countries]) => {
            const medals = await Promise.all(countries.map(countryCode => fetchMedals(countryCode, countryMapping)));
            const totalPoints = medals.reduce((sum, country) => sum + country.total, 0);
            return { person, medals, totalPoints };
        })
    );

    medalData.sort((a, b) => b.totalPoints - a.totalPoints);

    const table = document.createElement("table");

    const headerRow = table.insertRow();
    headerRow.innerHTML = `<th>Person</th>
                           <th>Countries</th>
                           <th>Total Points</th>`;

    medalData.forEach(({ person, medals, totalPoints }) => {
        const row = table.insertRow();
        const personCell = row.insertCell();
        personCell.rowSpan = medals.length + 1;
        personCell.textContent = person;
        personCell.className = 'person-cell';

        const countriesCell = row.insertCell();
        countriesCell.rowSpan = medals.length + 1;
        countriesCell.className = 'countries-cell';

        const countriesTable = document.createElement("table");

        medals.forEach(({ name, gold, silver, bronze }) => {
            const countryRow = countriesTable.insertRow();
            const countryCell = countryRow.insertCell();
            countryCell.colSpan = 1;
            countryCell.className = 'country-name';

            countryCell.innerHTML = `<div style="display: flex; justify-content: space-around; align-items: center;">
                                         <div>${name}</div>
                                         <div class="medal-count">🏅 ${gold}</div>
                                         <div class="medal-count">🥈 ${silver}</div>
                                         <div class="medal-count">🥉 ${bronze}</div>
                                     </div>`;
        });

        countriesCell.appendChild(countriesTable);

        const pointsCell = row.insertCell();
        pointsCell.rowSpan = medals.length + 1;
        pointsCell.textContent = totalPoints;
        pointsCell.className = 'points-cell';

        medals.forEach(() => table.insertRow()); // Add empty rows to maintain alignment
    });

    document.getElementById('medalTable').appendChild(table);
};

// Call updateContent to initialize the table
updateContent();
