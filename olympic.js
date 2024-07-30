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

const WIKIPEDIA_URL = "https://en.wikipedia.org/wiki/2024_Summer_Olympics_medal_table";

const fetchMedalsFromWikipedia = async () => {
    const response = await fetch(WIKIPEDIA_URL, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
        }
    });
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    const tableRows = doc.querySelectorAll(".wikitable tbody tr");

    const medalData = {};

    tableRows.forEach(row => {
        const cells = row.querySelectorAll("td");
        if (cells.length > 1) {
            const countryCode = cells[1].querySelector("span.flagicon a")?.getAttribute("title") || cells[1].textContent.trim();
            const gold = parseInt(cells[2].textContent.trim()) || 0;
            const silver = parseInt(cells[3].textContent.trim()) || 0;
            const bronze = parseInt(cells[4].textContent.trim()) || 0;
            const total = gold * 3 + silver * 2 + bronze;

            medalData[countryCode] = {
                gold,
                silver,
                bronze,
                total
            };
        }
    });

    return medalData;
};

const fetchMedals = async (countryCode, medalData) => {
    const medals = medalData[countryCode] || {
        gold: 0,
        silver: 0,
        bronze: 0,
        total: 0
    };

    return {
        name: countryCode,
        gold: medals.gold,
        silver: medals.silver,
        bronze: medals.bronze,
        total: medals.total
    };
};

const updateContent = async () => {
    const medalData = await fetchMedalsFromWikipedia();
    const peopleMedals = await Promise.all(
        Object.entries(people).map(async ([person, countries]) => {
            const medals = await Promise.all(countries.map(countryCode => fetchMedals(countryCode, medalData)));
            const totalPoints = medals.reduce((sum, country) => sum + country.total, 0);
            return { person, medals, totalPoints };
        })
    );

    peopleMedals.sort((a, b) => b.totalPoints - a.totalPoints);

    const table = document.createElement("table");
    const headerRow = table.insertRow();
    headerRow.innerHTML = "<th>Person</th><th>Country</th><th>Gold</th><th>Silver</th><th>Bronze</th><th>Total Points</th>";

    peopleMedals.forEach(({ person, medals }) => {
        medals.forEach(({ name, gold, silver, bronze, total }) => {
            const row = table.insertRow();
            row.innerHTML = `<td>${person}</td><td>${name}</td><td>${gold}</td><td>${silver}</td><td>${bronze}</td><td>${total}</td>`;
        });
    });

    document.body.appendChild(table);
};

updateContent();
