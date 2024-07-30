const people = {
    'Annemarie': ['GBR', 'ESP', 'SWE', 'FIN'],
    'Ben': ['CAN', 'KOR', 'POL', 'BEL'],
    'Sena': ['GER', 'ITA', 'UKR', 'CZE'],
    'Sean': ['MEX', 'NZL', 'JAM', 'THA'],
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
    // Placeholder fetch function for testing
    return flagEmojis;
};

const fetchMedals = async (countryCode) => {
    // Placeholder fetch function for testing
    return {
        name: flagEmojis[countryCode] || countryCode,
        gold: Math.floor(Math.random() * 3),
        silver: Math.floor(Math.random() * 3),
        bronze: Math.floor(Math.random() * 3),
        total: 0
    };
};

const updateContent = async () => {
    const countryMapping = await fetchCountryCodes();
    if (!countryMapping) {
        console.error("Country mapping is not available.");
        return;
    }

    const medalData = await Promise.all(
        Object.entries(people).map(async ([person, countries]) => {
            const medals = await Promise.all(countries.map(countryCode => fetchMedals(countryCode)));
            const totalPoints = medals.reduce((sum, country) => sum + country.total, 0);
            return { person, medals, totalPoints };
        })
    );

    medalData.sort((a, b) => b.totalPoints - a.totalPoints);

    const table = document.createElement("table");
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";
    table.style.border = "1px solid black";
    table.style.fontSize = "18px"; // Larger text size for overall table

    const headerRow = table.insertRow();
    headerRow.innerHTML = `<th style='border: 1px solid black; text-align: left; padding: 4px;'>Person</th>
                            <th style='border: 1px solid black; text-align: left; padding: 4px;'>Countries</th>
                            <th style='border: 1px solid black; text-align: left; padding: 4px;'>Total Points</th>`;

    medalData.forEach(({ person, medals, totalPoints }) => {
        const row = table.insertRow();
        const personCell = row.insertCell();
        personCell.rowSpan = medals.length + 1;
        personCell.textContent = person;
        personCell.style.border = "1px solid black";
        personCell.style.padding = "4px";
        personCell.style.fontSize = "22px"; // Larger text size for person's name

        const countriesCell = row.insertCell();
        countriesCell.rowSpan = medals.length + 1;
        countriesCell.style.border = "1px solid black";
        countriesCell.style.padding = "4px";
        countriesCell.style.fontSize = "22px"; // Larger text size for countries

        const countriesTable = document.createElement("table");
        countriesTable.style.borderCollapse = "collapse";
        countriesTable.style.width = "100%";

        medals.forEach(({ name, gold, silver, bronze }) => {
            const countryRow = countriesTable.insertRow();
            const countryCell = countryRow.insertCell();
            countryCell.style.border = "1px solid black";
            countryCell.style.padding = "4px";

            // Place flag before medals
            countryCell.innerHTML = `<div style="text-align: center; font-size: 24px;">${name}</div>
                                     <div style="display: flex; align-items: center; justify-content: space-around; font-size: 16px;">
                                         <div style="text-align: center; font-size: 24px;">${flagEmojis[countryCode]}</div>
                                         <div style="text-align: center;">🏅 ${gold}</div>
                                         <div style="text-align: center;">🥈 ${silver}</div>
                                         <div style="text-align: center;">🥉 ${bronze}</div>
                                     </div>`;

            countryCell.style.border = "1px solid black";
            countryCell.style.padding = "4px";
        });

        countriesCell.appendChild(countriesTable);
        
        const pointsCell = row.insertCell();
        pointsCell.rowSpan = medals.length + 1;
        pointsCell.textContent = totalPoints;
        pointsCell.style.border = "1px solid black";
        pointsCell.style.padding = "4px";
        pointsCell.style.fontSize = "22px"; // Larger text size for total points

        medals.forEach(() => table.insertRow()); // Add empty rows to maintain alignment
    });

    document.body.appendChild(table);
};

// Call updateContent to initialize the table
updateContent();
