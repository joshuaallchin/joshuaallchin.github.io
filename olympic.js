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
        const response = await fetch(`https://api.olympics.kelve.xyz/medals?country=${countryCode}`);
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
    headerRow.innerHTML = "<th>Person</th><th>Country</th><th>Gold</th><th>Silver</th><th>Bronze</th><th>Total Points</th>";

    medalData.forEach(({ person, medals }) => {
        medals.forEach(({ name, gold, silver, bronze, total }) => {
            const row = table.insertRow();
            row.innerHTML = `<td>${person}</td><td>${name}</td><td>${gold}</td><td>${silver}</td><td>${bronze}</td><td>${total}</td>`;
        });
    });

    document.body.appendChild(table);
};

updateContent();
