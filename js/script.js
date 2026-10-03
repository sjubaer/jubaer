const description = document.querySelector('.portfolio-description');
const readMore = description.querySelector('.read-more');
const readLess = description.querySelector('.read-less');

readMore.addEventListener('click', () => {
  description.classList.add('expanded');
});

readLess.addEventListener('click', () => {
  description.classList.remove('expanded');
});