const people = {
        'Annemarie': ['GBR', 'ESP', 'SWE', 'FIN'],
        'Ben': ['CAN', 'KOR', 'POL', 'BEL'],
        'Sena': ['GER', 'ITA', 'UKR','CZE'],
        'Sean': ['MEX', 'NZL', 'JAM', 'THA'],
        'Deva': ['AUS', 'BRA', 'ROU', 'GRE' ],
        'Josh': ['NED', 'HUN', 'TUR', 'GEO'],
        'Piya': ['FRA', 'SUI', 'DEN','NOR'],
        'Shione': ['JPN', 'ETH', 'KEN', 'IRI' ]
    };

const fetchCountryCodes = async () => {
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
};

const fetchMedals = async (countryCode, countryMapping) => {
    try {
        const response = await fetch(`https://api.olympics.kevle.xyz/medals?country=${countryCode}`);
        const data = await response.json();
        const results = data.results[0];

        if (!results.country) {
            return {
                name: countryMapping[countryCode] || countryCode,
                gold: 0,
                silver: 0,
                bronze: 0,
                total: 0
            };
        }

        const { gold, silver, bronze } = results.medals;
        return {
            name: results.country.name,
            gold,
            silver,
            bronze,
            total: gold * 3 + silver * 2 + bronze
        };
    } catch (error) {
        console.error("Error fetching data:", error);
        return {
            name: countryMapping[countryCode] || countryCode,
            gold: 0,
            silver: 0,
            bronze: 0,
            total: 0
        };
    }
};

const updateContent = async () => {
    const countryMapping = await fetchCountryCodes();
    const medalData = await Promise.all(
        Object.entries(people).map(async ([person, countries]) => {
            const medals = await Promise.all(countries.map(countryCode => fetchMedals(countryCode, countryMapping)));
            const totalPoints = medals.reduce((sum, country) => sum + country.total, 0);
            return { person, medals, totalPoints };
        })
    );

    medalData.sort((a, b) => b.totalPoints - a.totalPoints);

    const table = document.createElement("table");
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";
    table.style.border = "1px solid black";

    const headerRow = table.insertRow();
    headerRow.innerHTML = "<th style='border: 1px solid black;'>Person</th><th style='border: 1px solid black;'>Countries</th><th style='border: 1px solid black;'>Total Points</th>";

    medalData.forEach(({ person, medals, totalPoints }) => {
        // Create a row for the person's name and total points
        const row = table.insertRow();
        const personCell = row.insertCell();
        personCell.rowSpan = medals.length + 1; // Span to cover all country rows
        personCell.textContent = person;
        personCell.style.border = "1px solid black";
        personCell.style.padding = "5px";

        const countriesCell = row.insertCell();
        countriesCell.rowSpan = medals.length + 1; // Span to cover all country rows
        countriesCell.style.border = "1px solid black";
        countriesCell.style.padding = "5px";
        const countriesTable = document.createElement("table");
        countriesTable.style.borderCollapse = "collapse";
        countriesTable.style.width = "100%";

        medals.forEach(({ name, gold, silver, bronze }) => {
            const countryRow = countriesTable.insertRow();
            const countryCell = countryRow.insertCell();
            countryCell.colSpan = 1;
            countryCell.style.border = "1px solid black";
            countryCell.style.padding = "5px";
            countryCell.innerHTML = `<div style="border-bottom: 1px solid black; text-align: center;">${name}</div>
                                     <div style="display: flex; justify-content: space-around;">
                                         <div style="text-align: center;">🏅 ${gold}</div>
                                         <div style="text-align: center;">🥈 ${silver}</div>
                                         <div style="text-align: center;">🥉 ${bronze}</div>
                                     </div>`;

            countryCell.style.border = "1px solid black";
            countryCell.style.padding = "5px";
        });

        countriesCell.appendChild(countriesTable);
        
        const pointsCell = row.insertCell();
        pointsCell.rowSpan = medals.length + 1; // Span to cover all country rows
        pointsCell.textContent = totalPoints;
        pointsCell.style.border = "1px solid black";
        pointsCell.style.padding = "5px";

        // Add additional rows for each country
        medals.forEach(() => table.insertRow()); // Add empty rows to maintain alignment
    });

    document.body.appendChild(table);
};

updateContent();
