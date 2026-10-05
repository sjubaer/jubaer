const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRvuRr5cW7OvLDHDAKvSW54UxWrA7kPCLS4KwHzg7DIFgV2MEp5HkHSu0R_HMbwhzEE15EL7-piGkPm/pub?output=csv';

async function loadProjects() {
  try {
    const response = await fetch(sheetURL);
    const csv = await response.text();

    const projects = parseCSV(csv);

    renderProjects(projects);

  } catch (error) {
    console.error('Failed to load projects:', error);
  }
}

//initial parser for test
function parseCSV(csv) {
  const rows = csv.trim().split('\n');
  console.log(rows)

  const headers = rows[0].split(',').map(header => header.trim());

  return rows.slice(1).map(row => {
    const values = row.split(',').map(value => value.trim());

    return headers.reduce((project, header, index) => {
      project[header] = values[index] || '';
      return project;
    }, {});
  });
}

//project cards
function renderProjects(projects) {
  const container = document.getElementById('projectsGrid');

  container.innerHTML = projects.map(project => `
    <article class="project-card">

      <a href="${project.url}" target="_blank">
        <img src="${project.image}" alt="${project.title}">
      </a>

      <h3>${project.title}</h3>

      <p class="project-role">${project.role}</p>

      <p>${project.description}</p>

      <div class="project-tech">
        ${project.tech}
      </div>

      <a href="${project.url}" target="_blank">
        View Project
      </a>

    </article>
  `).join('');
}
loadProjects();