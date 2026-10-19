
/* =========================================================
   REVIEW CONFIGURATION
   ========================================================= */

const REVIEWS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTtBl1EljPqC3oBQo-QyBgJ-40x_BxLR7N9JnIEt2uemUkeZsWGCWGV4XiOavCZ_aiuRAbZaFUkmh2v/pub?gid=493748529&single=true&output=csv';
const REVIEWS_PER_PAGE = 4;

let allReviews = [];
let visibleReviewsCount = 0;
let reviewsLoaded = false;
let reviewsLoading = false;


/* =========================================================
   LOAD REVIEWS
   ========================================================= */

async function loadReviews() {
  const container = document.getElementById('reviewsContainer');

  if (!container || reviewsLoaded || reviewsLoading) return;

  reviewsLoading = true;

  try {
    const response = await fetch(REVIEWS_CSV_URL);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const csv = await response.text();

    Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,

      // Normalize column headers:
      // "Review #" -> "review"
      // "Review Date" -> "review_date"
      // "Review Text" -> "review_text"
      transformHeader: header => {
        return header
          .trim()
          .replace(/^review\s*#$/i, 'review')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_|_$/g, '');
      },

      complete: results => {
        allReviews = results.data
          .filter(review => review.reviewer && review.review_text)
          .map(review => ({
            ...review,
            rating: Math.min(
              5,
              Math.max(0, Number(review.rating) || 0)
            )
          }))
          .sort((a, b) => {
            return parseReviewDate(b.review_date) -
                   parseReviewDate(a.review_date);
          });

        reviewsLoaded = true;

        renderReviewSummary();
        loadMoreReviews();
      },

      error: error => {
        console.error('Review CSV parsing failed:', error);
        showReviewsError();
      }
    });

  } catch (error) {
    console.error('Failed to load reviews:', error);
    showReviewsError();

  } finally {
    reviewsLoading = false;
  }
}


/* =========================================================
   DATE HELPER
   ========================================================= */

function parseReviewDate(value) {
  if (!value) return 0;

  const timestamp = Date.parse(value);

  return Number.isNaN(timestamp) ? 0 : timestamp;
}


/* =========================================================
   RENDER REVIEW SUMMARY
   ========================================================= */

function renderReviewSummary() {
  const summary = document.getElementById('reviewsSummary');

  if (!summary || !allReviews.length) return;

  const ratedReviews = allReviews.filter(review => review.rating > 0);

  const averageRating = ratedReviews.length
    ? ratedReviews.reduce((total, review) => total + review.rating, 0) /
      ratedReviews.length
    : 0;

  summary.innerHTML = `
    <div class="reviews-summary-rating">
      <strong>${averageRating.toFixed(1)}</strong>
      <span class="review-stars">${renderStars(averageRating.toFixed(1))}</span>
      <span>${ratedReviews.length} rated reviews</span>
    </div>
  `;
}


/* =========================================================
   LOAD NEXT FOUR REVIEWS
   ========================================================= */

function loadMoreReviews() {
  const container = document.getElementById('reviewsContainer');

  if (!container) return;

  const nextReviews = allReviews.slice(
    visibleReviewsCount,
    visibleReviewsCount + REVIEWS_PER_PAGE
  );

  container.insertAdjacentHTML(
    'beforeend',
    nextReviews.map(createReviewHTML).join('')
  );

  visibleReviewsCount += nextReviews.length;

  const wrapper = document.getElementById(
    'reviewsLoadMoreContainer'
  );

  if (wrapper) {
    wrapper.style.display =
      visibleReviewsCount < allReviews.length ? 'block' : 'none';
  }
}


/* =========================================================
   CREATE REVIEW CARD
   ========================================================= */

function createReviewHTML(review) {
  const reviewer = escapeReviewHTML(review.reviewer);
  const country = escapeReviewHTML(review.country);
  const text = escapeReviewHTML(review.review_text);
  const date = formatReviewDate(review.review_date);
  const price = escapeReviewHTML(review.price);
  const duration = escapeReviewHTML(review.duration);

  const rating = Math.min(5, Math.max(0, Number(review.rating) || 0));

  return `
    <article class="review-card">

      <div class="review-card-header">
        <div class="reviewer-info">
          <h3>${reviewer}</h3>
          <p class="reviewer-location">${country}</p>
        </div>

        <div class="review-rating" aria-label="${rating} out of 5 stars">
          ${renderStars(rating)}
        </div>
      </div>

      <p class="review-date">${escapeReviewHTML(date)}</p>

      <div class="review-text">
        <p>${text}</p>
      </div>

      <div class="review-meta">
        ${price ? `
          <div>
            <span>Price</span>
            <strong>${price}</strong>
          </div>
        ` : ''}

        ${duration ? `
          <div>
            <span>Duration</span>
            <strong>${duration}</strong>
          </div>
        ` : ''}
      </div>

    </article>
  `;
}


/* =========================================================
   HELPERS
   ========================================================= */

function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;

  return (
    '★'.repeat(fullStars) +
    (halfStar ? '⯪' : '') +
    '☆'.repeat(emptyStars)
  );
}

function formatReviewDate(value) {
  if (!value) return '';

  const timestamp = parseReviewDate(value);

  if (!timestamp) return value;

  return new Date(timestamp).toLocaleDateString('en', {
    month: 'short',
    year: 'numeric'
  });
}

function escapeReviewHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function showReviewsError() {
  const container = document.getElementById('reviewsContainer');

  if (container) {
    container.innerHTML = `
      <p class="reviews-error">
        Unable to load reviews.
        <button type="button" id="retryReviews">
          Try Again
        </button>
      </p>
    `;
  }
}


/* =========================================================
   BUTTON EVENTS
   ========================================================= */

document.addEventListener('click', event => {
  if (event.target.closest('#loadMoreReviews')) {
    loadMoreReviews();
  }

  if (event.target.closest('#retryReviews')) {
    reviewsLoaded = false;
    loadReviews();
  }
});


/* =========================================================
   INITIALIZE
   ========================================================= */

loadReviews();
