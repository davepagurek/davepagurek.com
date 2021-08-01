const sketches = [...document.querySelectorAll('.sketch')];
const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.remove('hidden');
    } else {
      entry.target.classList.add('hidden');
    }
  });
}, { rootMargin: '0px' });
sketches.forEach(sketch => observer.observe(sketch));
