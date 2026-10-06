const PROJECTS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTtBl1EljPqC3oBQo-QyBgJ-40x_BxLR7N9JnIEt2uemUkeZsWGCWGV4XiOavCZ_aiuRAbZaFUkmh2v/pub?output=csv';

async function loadProjects() {
    try {
        const response = await fetch(PROJECTS_CSV_URL);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const csv = await response.text();

        console.log(csv);

    } catch (error) {
        console.error('Failed to load projects:', error);
    }
}

loadProjects();