document.addEventListener("DOMContentLoaded", () => {
  protectProfilePage();
  protectAddReviewPage();
  
  renderRestaurants();
  renderRestaurantDetails();
  populateRestaurantDropdown();

  setupSignupForm();
  setupLoginForm();
  setupReviewForm();
  setupContactForm();

  setupAccessibilityControls();
  setupAccessibilityPageControls();
  setupLogoutButton();

  renderProfileData();
  loadSavedAccessibilitySettings();
});

function renderRestaurants() {
  const container = document.getElementById("restaurantContainer");
  if (!container) return;

  container.innerHTML = "";

  restaurants.forEach((restaurant) => {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4";

    col.innerHTML = `
      <div class="card h-100 restaurant-card">
        <img
          src="${restaurant.image}"
          class="card-img-top"
          alt="${restaurant.name}"
        />
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="rank-badge">#${restaurant.rank}</span>
            <span class="accessibility-badge">Access: ${restaurant.accessibilityScore}</span>
          </div>

          <h3 class="h5 card-title">${restaurant.name}</h3>
          <p class="restaurant-meta mb-1"><strong>Rating:</strong> ${restaurant.rating} / 5</p>
          <p class="restaurant-meta mb-1"><strong>Cuisine:</strong> ${restaurant.cuisine}</p>
          <p class="restaurant-meta mb-3"><strong>Location:</strong> ${restaurant.location}</p>

          <ul class="feature-list">
            ${restaurant.features.map(feature => `<li>${feature}</li>`).join("")}
          </ul>

          <div class="mt-auto">
            <a
              href="restaurant.html?id=${restaurant.id}"
              class="btn btn-primary w-100"
              aria-label="View details for ${restaurant.name}"
            >
              More Info
            </a>
          </div>
        </div>
      </div>
    `;

    container.appendChild(col);
  });
}

function renderRestaurantDetails() {
  const detailsContainer = document.getElementById("restaurantDetails");
  if (!detailsContainer) return;

  const params = new URLSearchParams(window.location.search);
  const restaurantId = parseInt(params.get("id"), 10);
  const restaurant = restaurants.find((item) => item.id === restaurantId);

  if (!restaurant) {
    detailsContainer.innerHTML = `
      <div class="alert alert-warning">
        Restaurant not found. <a href="index.html">Return to homepage</a>.
      </div>
    `;
    return;
  }

  const savedReviews = getStoredReviews().filter(
    (review) => parseInt(review.restaurantId, 10) === restaurant.id
  );

  const combinedReviews = [
    ...restaurant.reviews.map((review) => ({ text: review, name: "Guest User", rating: "5" })),
    ...savedReviews
  ];

  detailsContainer.innerHTML = `
    <div class="row g-4">
      <div class="col-lg-7">
        <img src="${restaurant.image}" alt="${restaurant.name}" class="img-fluid rounded shadow-sm mb-4 detail-image" />
        <h1 class="mb-3">${restaurant.name}</h1>
        <p><strong>Rank:</strong> #${restaurant.rank}</p>
        <p><strong>Rating:</strong> ${restaurant.rating} / 5</p>
        <p><strong>Accessibility Score:</strong> ${restaurant.accessibilityScore}</p>
        <p><strong>Cuisine:</strong> ${restaurant.cuisine}</p>
        <p><strong>Location:</strong> ${restaurant.location}</p>
        <p>${restaurant.description}</p>
      </div>

      <div class="col-lg-5">
        <div class="card mb-4">
          <div class="card-body">
            <h2 class="h4">Accessibility Features</h2>
            <ul class="feature-list">
              ${restaurant.features.map(feature => `<li>${feature}</li>`).join("")}
            </ul>
          </div>
        </div>

        <div class="card">
            <div class="card-body">
              <h2 class="h4">Customer Reviews</h2>
              <ul class="feature-list">
                ${combinedReviews.map(review => `
                  <li>
                    <strong>${review.name}</strong> (${review.rating}/5): ${review.text}
                  </li>
                `).join("")}
              </ul>
              ${
                isUserLoggedIn()
                  ? `<a href="add-review.html" class="btn btn-success w-100">Add Your Review</a>`
                  : `<a href="login.html" class="btn btn-outline-danger w-100">Login to Add Review</a>`
              }
            </div>
          </div>
      </div>
    </div>
  `;
}

function populateRestaurantDropdown() {
  const select = document.getElementById("restaurantSelect");
  if (!select) return;

  restaurants.forEach((restaurant) => {
    const option = document.createElement("option");
    option.value = restaurant.id;
    option.textContent = restaurant.name;
    select.appendChild(option);
  });
}

function setupSignupForm() {
  const form = document.getElementById("signupForm");
  const message = document.getElementById("signupMessage");
  if (!form || !message) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    if (!fullName || !email || !password || !confirmPassword) {
      message.innerHTML = `<div class="alert alert-danger">Please fill in all fields.</div>`;
      return;
    }

    if (password !== confirmPassword) {
      message.innerHTML = `<div class="alert alert-danger">Passwords do not match.</div>`;
      return;
    }

    const user = { fullName, email, password };
    localStorage.setItem("topRestaurantsUser", JSON.stringify(user));

    message.innerHTML = `<div class="alert alert-success">Account created successfully. Redirecting to login...</div>`;
    form.reset();

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  });
}

function setupLoginForm() {
  const form = document.getElementById("loginForm");
  const message = document.getElementById("loginMessage");
  if (!form || !message) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const savedUser = JSON.parse(localStorage.getItem("topRestaurantsUser"));

    if (!email || !password) {
      message.innerHTML = `<div class="alert alert-danger">Please enter email and password.</div>`;
      return;
    }

    if (!savedUser || savedUser.email !== email || savedUser.password !== password) {
      message.innerHTML = `<div class="alert alert-danger">Invalid login credentials.</div>`;
      return;
    }

    localStorage.setItem("isLoggedIn", "true");
    message.innerHTML = `<div class="alert alert-success">Login successful. Redirecting to Homepage...</div>`;
    form.reset();

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
  });
}

function setupReviewForm() {
  if (!isUserLoggedIn()) return;

  const form = document.getElementById("reviewForm");
  const message = document.getElementById("reviewMessage");
  if (!form || !message) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const restaurantId = document.getElementById("restaurantSelect").value;
    const reviewerName = document.getElementById("reviewerName").value.trim();
    const rating = document.getElementById("ratingInput").value.trim();
    const reviewText = document.getElementById("reviewText").value.trim();

    if (!restaurantId || !reviewerName || !rating || !reviewText) {
      message.innerHTML = `<div class="alert alert-danger">Please complete all review fields.</div>`;
      return;
    }

    const reviews = getStoredReviews();
    reviews.push({ restaurantId, name: reviewerName, rating, text: reviewText });
    localStorage.setItem("topRestaurantReviews", JSON.stringify(reviews));

    message.innerHTML = `<div class="alert alert-success">Your review has been submitted successfully.</div>`;
    form.reset();
  });
}

function setupContactForm() {
  const form = document.getElementById("contactForm");
  const message = document.getElementById("contactMessage");
  if (!form || !message) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("contactName").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const subject = document.getElementById("contactSubject").value.trim();
    const text = document.getElementById("contactText").value.trim();

    if (!name || !email || !subject || !text) {
      message.innerHTML = `<div class="alert alert-danger">Please fill in all contact fields.</div>`;
      return;
    }

    message.innerHTML = `<div class="alert alert-success">Your message has been sent successfully.</div>`;
    form.reset();
  });
}

function renderProfileData() {
  const profilePageTitle = document.querySelector("h1.h3");
  const profileCards = document.querySelectorAll(".card");
  if (!profilePageTitle || document.title.indexOf("Profile") === -1 || profileCards.length < 2) return;

  const savedUser = JSON.parse(localStorage.getItem("topRestaurantsUser"));
  const savedReviews = getStoredReviews();

  const profileCard = profileCards[0];
  const reviewsCard = profileCards[1];

  profileCard.innerHTML = `
    <h1 class="h3 mb-3">User Profile</h1>
    <p><strong>Name:</strong> ${savedUser?.fullName || "Sasikiran Reddy"}</p>
    <p><strong>Email:</strong> ${savedUser?.email || "sasi@example.com"}</p>
    <p><strong>Member Since:</strong> 2026</p>
    <p><strong>Total Reviews:</strong> ${savedReviews.length}</p>
  `;

  reviewsCard.innerHTML = `
    <h2 class="h4 mb-3">Recent Reviews</h2>
    ${
      savedReviews.length > 0
        ? savedReviews.map((review) => {
            const restaurant = restaurants.find(r => r.id === parseInt(review.restaurantId, 10));
            return `
              <div class="mb-3 border-bottom pb-3">
                <h3 class="h6">${restaurant ? restaurant.name : "Restaurant"}</h3>
                <p class="mb-1"><strong>Rating:</strong> ${review.rating}/5</p>
                <p class="mb-0">${review.text}</p>
              </div>
            `;
          }).join("")
        : `<p class="mb-0">No reviews submitted yet.</p>`
    }
  `;
}

function setupAccessibilityControls() {
  const contrastToggle = document.getElementById("contrastToggle");
  const fontIncrease = document.getElementById("fontIncrease");
  const fontReset = document.getElementById("fontReset");

  if (contrastToggle) {
    contrastToggle.addEventListener("click", () => toggleContrast());
  }

  if (fontIncrease) {
    fontIncrease.addEventListener("click", () => changeFontSize(2));
  }

  if (fontReset) {
    fontReset.addEventListener("click", () => resetFontSize());
  }
}

function setupAccessibilityPageControls() {
  const contrastTogglePage = document.getElementById("contrastTogglePage");
  const fontIncreasePage = document.getElementById("fontIncreasePage");
  const fontDecreasePage = document.getElementById("fontDecreasePage");
  const fontResetPage = document.getElementById("fontResetPage");

  if (contrastTogglePage) {
    contrastTogglePage.addEventListener("click", () => toggleContrast());
  }

  if (fontIncreasePage) {
    fontIncreasePage.addEventListener("click", () => changeFontSize(2));
  }

  if (fontDecreasePage) {
    fontDecreasePage.addEventListener("click", () => changeFontSize(-2));
  }

  if (fontResetPage) {
    fontResetPage.addEventListener("click", () => resetFontSize());
  }
}

function toggleContrast() {
  document.body.classList.toggle("high-contrast");
  const enabled = document.body.classList.contains("high-contrast");
  localStorage.setItem("highContrastEnabled", enabled ? "true" : "false");
}

function changeFontSize(amount) {
  const currentSize = parseInt(getComputedStyle(document.body).fontSize, 10);
  const newSize = Math.max(12, currentSize + amount);
  document.body.style.fontSize = `${newSize}px`;
  localStorage.setItem("savedFontSize", `${newSize}px`);
}

function resetFontSize() {
  document.body.style.fontSize = "16px";
  localStorage.setItem("savedFontSize", "16px");
}

function loadSavedAccessibilitySettings() {
  const savedContrast = localStorage.getItem("highContrastEnabled");
  const savedFontSize = localStorage.getItem("savedFontSize");

  if (savedContrast === "true") {
    document.body.classList.add("high-contrast");
  }

  if (savedFontSize) {
    document.body.style.fontSize = savedFontSize;
  }
}

function isUserLoggedIn() {
  return localStorage.getItem("isLoggedIn") === "true";
}

function protectProfilePage() {
  const isProfilePage = window.location.pathname.includes("profile.html");
  if (!isProfilePage) return;

  if (!isUserLoggedIn()) {
    const mainContent = document.getElementById("mainContent");
    if (mainContent) {
      mainContent.innerHTML = `
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <div class="card p-4 text-center">
              <h1 class="h3 mb-3">Login Required</h1>
              <p class="mb-4">You must log in to view your profile page.</p>
              <a href="login.html" class="btn btn-primary">Go to Login</a>
            </div>
          </div>
        </div>
      `;
    }
  }
}

function protectAddReviewPage() {
  const isAddReviewPage = window.location.pathname.includes("add-review.html");
  if (!isAddReviewPage) return;

  if (!isUserLoggedIn()) {
    const mainContent = document.getElementById("mainContent");
    if (mainContent) {
      mainContent.innerHTML = `
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <div class="card p-4 text-center">
              <h1 class="h3 mb-3">Login Required</h1>
              <p class="mb-4">You must log in before submitting a review.</p>
              <a href="login.html" class="btn btn-primary">Go to Login</a>
            </div>
          </div>
        </div>
      `;
    }
  }
}

function logoutUser() {
  localStorage.removeItem("isLoggedIn");
  window.location.href = "login.html";
}

function getStoredReviews() {
  return JSON.parse(localStorage.getItem("topRestaurantReviews")) || [];
}

function setupLogoutButton() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "index.html";
  });
}