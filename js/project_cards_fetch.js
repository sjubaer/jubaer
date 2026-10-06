const PROJECTS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTtBl1EljPqC3oBQo-QyBgJ-40x_BxLR7N9JnIEt2uemUkeZsWGCWGV4XiOavCZ_aiuRAbZaFUkmh2v/pub?output=csv';

/* =========================================================
   PROJECTS DATA
   Google Sheets → CSV → JavaScript → Portfolio
   ========================================================= */


const portfolioData = {
  projects: []
};


/* =========================================================
   LOAD PROJECTS
   ========================================================= */

async function loadProjects() {
  const container = document.getElementById('projectsContainer');

  if (!container) {
    console.error('Projects container not found.');
    return;
  }

  try {
    const response = await fetch(PROJECTS_CSV_URL, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const csv = await response.text();

    Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,

      complete: function (results) {

        if (results.errors.length) {
          console.warn('CSV parsing warnings:', results.errors);
        }

        portfolioData.projects = results.data
          .filter(project => project.id || project.title)
          .sort((a, b) => {
            return Number(a.sort_order || 999) -
                   Number(b.sort_order || 999);
          });

        renderProjects();
      },

      error: function (error) {
        console.error('CSV parsing failed:', error);
      }
    });

  } catch (error) {
    console.error('Failed to load projects:', error);

    container.innerHTML = `
      <p class="projects-error">
        Unable to load projects right now.
      </p>
    `;
  }
}


/* =========================================================
   RENDER PROJECTS
   ========================================================= */

function renderProjects() {

  const container = document.getElementById('projectsContainer');

  if (!container) return;

  container.innerHTML = portfolioData.projects
    .map(project => createProjectHTML(project))
    .join('');
}


/* =========================================================
   CREATE PROJECT HTML
   ========================================================= */

function createProjectHTML(project) {

  const title = project.title || '';
  const theme = project.theme || '';
  const image = project.cover_image || '';
  const shortDescription = project.short_description || '';
  const description1 = project.description_1 || '';
  const description2 = project.description_2 || '';
  const features = project.features || '';

  return `
    <article class="project">

      <div class="project-visual ${theme}">

        <div class="fake-nav">
          <span>${title}</span>
        </div>

        <div class="fake-body">

          <div class="project-image-container">

            <img
              src="${image}"
              alt="${title}"
              loading="lazy"
            >

          </div>

        </div>

      </div>


      <div class="project-details">

        <h3>${title}</h3>


        <div class="portfolio-description">

          <div class="description-preview">

            <p>
              ${shortDescription}

              <span class="description-dots">...</span>

              <button
                class="read-more"
                type="button"
              >
                Read More
              </button>

            </p>

          </div>


          <div class="description-more">

            ${description1 ? `<p>${description1}</p>` : ''}

            ${description2 ? `<p>${description2}</p>` : ''}

            <button
              class="read-less"
              type="button"
            >
              Read Less
            </button>

          </div>

        </div>


        <p class="project-meta">
          ${features}
        </p>

      </div>

    </article>
  `;
}


/* =========================================================
   READ MORE / READ LESS
   Event delegation allows dynamically generated buttons
   to work without adding individual event listeners.
   ========================================================= */

document.addEventListener('click', function (event) {

  const readMore = event.target.closest('.read-more');
  const readLess = event.target.closest('.read-less');


  /* -------------------------
     READ MORE
     ------------------------- */

  if (readMore) {

    const description =
      readMore.closest('.portfolio-description');

    if (description) {
      description.classList.add('expanded');
    }

  }


  /* -------------------------
     READ LESS
     ------------------------- */

  if (readLess) {

    const description =
      readLess.closest('.portfolio-description');

    if (description) {
      description.classList.remove('expanded');
    }

  }

});


/* =========================================================
   INITIAL LOAD
   ========================================================= */

loadProjects();


