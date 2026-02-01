console.log("Mahindra Showroom website loaded");

const menuIcon = document.getElementById('menu-icon');
const mobileMenu = document.getElementById('mobileMenu');

function toggleMenu() {
  mobileMenu.style.display = mobileMenu.style.display === 'block' ? 'none' : 'block';
}

menuIcon.addEventListener('click', toggleMenu);

// Button redirect
const btn = document.getElementById('redirectBtn');
btn.addEventListener('click', function() {
    window.open('https://www.justdial.com/Sindhudurg/Sapale-Auto-Service-Pvt-Ltd-JANAVLI-Kankavli/9999P2362-2362-150311193002-G5R6_BZDET', '_blank');
});

//about review section

const form = document.getElementById("reviewForm");
const reviewGrid = document.getElementById("reviewGrid");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const car = document.getElementById("car").value.trim();
  const review = document.getElementById("review").value.trim();

  if (!name || !car || !review) return;

  const card = document.createElement("div");
  card.classList.add("review-card");

  card.innerHTML = `
    <p class="review-text">"${review}"</p>
    <div class="reviewer">
      <h4>${name}</h4>
      <span>${car}</span>
    </div>
  `;

  reviewGrid.prepend(card);
  form.reset();
});
