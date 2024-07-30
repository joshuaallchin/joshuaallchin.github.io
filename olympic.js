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
    const headerRow = table.insertRow();
    headerRow.innerHTML = "<th>Person</th><th>Countries</th><th>Total Points</th>";

    medalData.forEach(({ person, medals, totalPoints }) => {
        const row = table.insertRow();
        const cell = row.insertCell();
        cell.rowSpan = medals.length;
        cell.textContent = person;

        const countriesCell = row.insertCell();
        const countriesTable = document.createElement("table");
        countriesTable.style.borderCollapse = "collapse";
        countriesTable.style.border = "1px solid black";

        medals.forEach(({ name, gold, silver, bronze }) => {
            const countryRow = countriesTable.insertRow();
            const countryCell = countryRow.insertCell();
            countryCell.colSpan = 3;
            countryCell.innerHTML = `<div style="border-bottom: 1px solid black; text-align: center;">${name}</div>
                                     <div style="display: flex; justify-content: space-around;">
                                         <div style="border-right: 1px solid black; text-align: center;">Gold: ${gold}</div>
                                         <div style="border-right: 1px solid black; text-align: center;">Silver: ${silver}</div>
                                         <div style="text-align: center;">Bronze: ${bronze}</div>
                                     </div>`;

            countryCell.style.border = "1px solid black";
            countryCell.style.padding = "5px";
        });

        countriesCell.appendChild(countriesTable);
        const pointsCell = row.insertCell();
        pointsCell.textContent = totalPoints;
    });

    document.body.appendChild(table);
};

updateContent();
