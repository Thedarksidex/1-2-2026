const API_URL = "http://localhost:3000/api/auth";

// Toggle between login and signup forms
function toggleForms() {
  const loginBox = document.getElementById("loginBox");
  const signupBox = document.getElementById("signupBox");

  loginBox.classList.toggle("hidden");
  signupBox.classList.toggle("hidden");

  // Clear error messages
  clearAllErrors();
}

// Clear all error messages
function clearAllErrors() {
  document.querySelectorAll(".error").forEach(el => el.textContent = "");
}

// Show error message
function showError(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
  }
}

// Handle Login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  clearAllErrors();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  // Validation
  if (!email) {
    showError("login-email-error", "Email is required");
    return;
  }
  if (!password) {
    showError("login-password-error", "Password is required");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      showError("login-error", data.error || "Login failed");
      return;
    }

    // Save token to localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // Show success message
    showSuccessMessage(`Welcome back, ${data.user.name}!`);
  } catch (error) {
    console.error("Login error:", error);
    showError("login-error", "An error occurred. Please try again.");
  }
});

// Handle Signup
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  clearAllErrors();

  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const confirm = document.getElementById("signup-confirm").value;

  // Validation
  if (!name) {
    showError("signup-name-error", "Name is required");
    return;
  }
  if (!email) {
    showError("signup-email-error", "Email is required");
    return;
  }
  if (!password) {
    showError("signup-password-error", "Password is required");
    return;
  }
  if (password.length < 6) {
    showError("signup-password-error", "Password must be at least 6 characters");
    return;
  }
  if (password !== confirm) {
    showError("signup-confirm-error", "Passwords do not match");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      showError("signup-error", data.error || "Signup failed");
      return;
    }

    // Save token to localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // Show success message
    showSuccessMessage(`Welcome, ${data.user.name}!`);
  } catch (error) {
    console.error("Signup error:", error);
    showError("signup-error", "An error occurred. Please try again.");
  }
});

// Show success message
function showSuccessMessage(message) {
  document.getElementById("loginBox").classList.add("hidden");
  document.getElementById("signupBox").classList.add("hidden");
  document.getElementById("successBox").classList.remove("hidden");
  document.getElementById("successMessage").textContent = message;

  // Update navbar
  updateNavbar();

  // Redirect after 3 seconds
  setTimeout(redirectHome, 3000);
}

// Redirect to home
function redirectHome() {
  window.location.href = "home.html";
}

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
  window.location.href = "home.html";
}

// Check if user is already logged in
function checkAuthStatus() {
  const user = localStorage.getItem("user");
  if (user) {
    showSuccessMessage(`Welcome back!`);
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  updateNavbar();
});
