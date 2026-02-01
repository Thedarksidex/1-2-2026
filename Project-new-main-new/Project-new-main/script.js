console.log("Mahindra Showroom website loaded");

const API_URL = "http://localhost:3000/api/feedback";

const menuIcon = document.getElementById('menu-icon');
const mobileMenu = document.getElementById('mobileMenu');

function toggleMenu() {
  mobileMenu.style.display = mobileMenu.style.display === 'block' ? 'none' : 'block';
}

menuIcon.addEventListener('click', toggleMenu);

// Update navbar with user info
function updateNavbar() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navbarUser = document.getElementById("navbar-user");
  const mobileUser = document.getElementById("mobile-user");

  if (user) {
    navbarUser.textContent = `${user.name} (Logout)`;
    navbarUser.href = "#";
    navbarUser.onclick = logout;

    mobileUser.textContent = `${user.name} (Logout)`;
    mobileUser.href = "#";
    mobileUser.onclick = logout;
  }
}

// Logout function
function logout(e) {
  if (e) e.preventDefault();
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  alert("Logged out successfully!");
  location.reload();
}

// Initialize auth on page load
document.addEventListener("DOMContentLoaded", () => {
  updateNavbar();
  // Initialize stats with 0
  document.getElementById("totalReviews").textContent = "0";
  document.getElementById("avgRating").textContent = "0⭐";
  // Load feedback
  loadFeedback();
});

// Button redirect
const btn = document.getElementById('redirectBtn');
btn.addEventListener('click', function() {
    window.open('https://www.justdial.com/Sindhudurg/Sapale-Auto-Service-Pvt-Ltd-JANAVLI-Kankavli/9999P2362-2362-150311193002-G5R6_BZDET', '_blank');
});

// ==================== FEEDBACK SECTION ====================

const form = document.getElementById("reviewForm");
const reviewGrid = document.getElementById("reviewGrid");
let selectedRating = 0;

// Star rating functionality
document.querySelectorAll(".star").forEach(star => {
  star.addEventListener("click", function() {
    selectedRating = this.dataset.value;
    updateStarDisplay();
  });

  star.addEventListener("mouseover", function() {
    const hoverValue = this.dataset.value;
    document.querySelectorAll(".star").forEach((s, idx) => {
      s.style.opacity = idx < hoverValue ? "1" : "0.5";
    });
  });
});

document.querySelector(".rating-stars").addEventListener("mouseleave", updateStarDisplay);

function updateStarDisplay() {
  document.querySelectorAll(".star").forEach((s, idx) => {
    s.style.opacity = idx < selectedRating ? "1" : "0.5";
  });

  const ratingText = document.getElementById("rating-text");
  const ratings = ["No rating", "Poor", "Fair", "Good", "Very Good", "Excellent"];
  ratingText.textContent = ratings[selectedRating] || "";
  document.getElementById("rating").value = selectedRating;
}

// Clear errors
function clearErrors() {
  document.querySelectorAll(".error").forEach(el => el.textContent = "");
}

// Show error
function showError(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) element.textContent = message;
}

// Submit feedback
form.addEventListener("submit", async function (e) {
  e.preventDefault();
  clearErrors();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const car = document.getElementById("car").value.trim();
  const review = document.getElementById("review").value.trim();
  const rating = document.getElementById("rating").value;

  // Validation
  if (!name) {
    showError("name-error", "Name is required");
    return;
  }
  if (!email || !email.includes("@")) {
    showError("email-error", "Valid email is required");
    return;
  }
  if (!car) {
    showError("car-error", "Car model is required");
    return;
  }
  if (!review) {
    showError("review-error", "Experience is required");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` })
      },
      body: JSON.stringify({
        name,
        email,
        carModel: car,
        experience: review,
        rating: rating > 0 ? rating : null
      })
    });

    const data = await response.json();

    if (!response.ok) {
      showError("form-error", data.error || "Failed to submit feedback");
      return;
    }

    // Show success
    const successMsg = document.getElementById("success-msg");
    successMsg.textContent = "✓ Feedback submitted successfully!";
    successMsg.style.color = "#27ae60";
    successMsg.style.display = "block";

    form.reset();
    selectedRating = 0;
    updateStarDisplay();

    setTimeout(() => {
      successMsg.style.display = "none";
      loadFeedback();
    }, 2000);

  } catch (error) {
    console.error("Feedback error:", error);
    showError("form-error", "An error occurred. Please try again.");
  }
});

// Load and display feedback
async function loadFeedback() {
  try {
    const response = await fetch(`${API_URL}/all?limit=6`);
    const data = await response.json();

    if (!response.ok) {
      console.error("Failed to load feedback");
      // Set default stats even if error
      document.getElementById("totalReviews").textContent = "0";
      document.getElementById("avgRating").textContent = "0⭐";
      return;
    }

    reviewGrid.innerHTML = "";

    if (data.feedbacks.length === 0) {
      reviewGrid.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: #999;'>No reviews yet. Be the first to share your experience!</p>";
    } else {
      data.feedbacks.forEach(feedback => {
        const card = document.createElement("div");
        card.classList.add("review-card");

        const rating = feedback.rating ? "⭐".repeat(feedback.rating) : "No rating";

        card.innerHTML = `
          <div class="review-header">
            <div class="review-rating">${rating}</div>
            <span class="review-date">${new Date(feedback.created_at).toLocaleDateString()}</span>
          </div>
          <p class="review-text">"${feedback.experience}"</p>
          <div class="reviewer">
            <h4>${feedback.name}</h4>
            <span>${feedback.car_model}</span>
          </div>
        `;

        reviewGrid.appendChild(card);
      });
    }

    // Update stats - always ensure they display
    if (data.stats) {
      const totalReviewsElement = document.getElementById("totalReviews");
      const avgRatingElement = document.getElementById("avgRating");
      
      if (totalReviewsElement) {
        totalReviewsElement.textContent = data.stats.totalFeedback || "0";
      }
      if (avgRatingElement) {
        const avgValue = parseFloat(data.stats.averageRating) || 0;
        avgRatingElement.textContent = `${avgValue.toFixed(1)}⭐`;
      }
    } else {
      // Fallback if stats not in response
      const totalReviewsElement = document.getElementById("totalReviews");
      const avgRatingElement = document.getElementById("avgRating");
      if (totalReviewsElement) totalReviewsElement.textContent = "0";
      if (avgRatingElement) avgRatingElement.textContent = "0⭐";
    }

  } catch (error) {
    console.error("Load feedback error:", error);
    // Set default stats on error
    document.getElementById("totalReviews").textContent = "0";
    document.getElementById("avgRating").textContent = "0⭐";
  }
}

