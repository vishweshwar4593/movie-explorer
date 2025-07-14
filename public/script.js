const apiKey = "8d9461078911e03d9cb6dbda7be21ff0";
let lastSearchTerm = "";

async function searchMovie(term) {
  const input = document.getElementById("search-input");
  const title = term || input.value.trim();
  const resultsContainer = document.getElementById("results");
  const errorBox = document.getElementById("error-message");
  const detailsBox = document.getElementById("movie-details");

  lastSearchTerm = title;
  resultsContainer.innerHTML = "";
  errorBox.classList.add("hidden");
  detailsBox.classList.add("hidden");

  if (!title) {
    showError("Please enter a movie title.");
    return;
  }

  const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}`;

  try {
    const res = await fetch(searchUrl);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      showError("No movies found. Try a different title.");
      return;
    }

    data.results.slice(0, 8).forEach(movie => {
      const card = document.createElement("div");
      card.classList.add("result-card");
      card.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
        <p><strong>${movie.title}</strong> (${movie.release_date?.split("-")[0] || "N/A"})</p>
      `;
      card.onclick = () => showMovieDetails(movie.id);
      resultsContainer.appendChild(card);
    });

  } catch (err) {
    showError("Something went wrong. Please try again.");
    console.error(err);
  }
}

function showError(message) {
  const errorBox = document.getElementById("error-message");
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

async function showMovieDetails(movieId) {
  const detailsBox = document.getElementById("movie-details");
  const resultsContainer = document.getElementById("results");

  const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&append_to_response=credits,watch/providers,videos`;

  try {
    const res = await fetch(url);
    const details = await res.json();

    const cast = details.credits.cast.slice(0, 5).map(actor => actor.name).join(", ");
    const ott = details["watch/providers"]?.results?.IN?.flatrate?.map(p => p.provider_name).join(", ") || "Not available";

    const videos = details.videos?.results || [];
    const trailer = videos.find(v => v.type === "Trailer" && v.site === "YouTube");
    const trailerKey = trailer ? trailer.key : null;

    resultsContainer.innerHTML = "";

    const html = `
      <button onclick="goBack()" style="margin-bottom: 20px; padding: 10px 20px; background: #01b4e4; border: none; color: white; border-radius: 6px; cursor: pointer;">🔙 Back</button>
      <div style="display: flex; flex-wrap: wrap; gap: 20px;">
        <img class="poster" src="https://image.tmdb.org/t/p/w500${details.poster_path}" alt="${details.title}">
        <div class="details">
          <h2>${details.title} (${details.release_date?.split("-")[0] || "N/A"})</h2>
          <p><strong>Rating:</strong> ${details.vote_average}/10</p>
          <p><strong>Overview:</strong> ${details.overview}</p>
          <p><strong>Top Cast:</strong> ${cast}</p>
          <p><strong>Available on:</strong> ${ott}</p>
          ${trailerKey ? `
            <div style="margin-top: 20px;">
              <iframe width="100%" height="315"
                src="https://www.youtube.com/embed/${trailerKey}"
                title="Trailer"
                frameborder="0"
                allowfullscreen
              ></iframe>
            </div>
          ` : '<p><strong>Trailer:</strong> Not available</p>'}
        </div>
      </div>
    `;

    detailsBox.innerHTML = html;
    detailsBox.classList.remove("hidden");

  } catch (err) {
    showError("Failed to load movie details.");
    console.error(err);
  }
}

function goBack() {
  document.getElementById("movie-details").classList.add("hidden");
  document.getElementById("results").innerHTML = "";
  document.getElementById("search-input").value = lastSearchTerm;
  searchMovie(lastSearchTerm);
}

function toggleForm(form) {
  document.getElementById("login-form").classList.add("hidden");
  document.getElementById("signup-form").classList.add("hidden");
  document.getElementById(`${form}-form`).classList.remove("hidden");
}

async function signupUser() {
  const username = document.getElementById("signup-username").value.trim();
  const password = document.getElementById("signup-password").value.trim();

  try {
    const res = await fetch("/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (res.ok) {
  showAlert("🎉 Signup successful. Please log in.");
  toggleForm("login");
} else {
  alert(data.error);
}

   
  } catch (err) {
    alert("Signup failed");
    console.error(err);
  }
}

async function loginUser() {
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value.trim();

  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

   if (res.ok) {
  showAlert(data.message);
  document.querySelector(".auth-container").classList.add("hidden");
  document.querySelector(".container").classList.remove("hidden");
} else {
  alert(data.error);
}

  } catch (err) {
    alert("Login failed");
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".container").classList.add("hidden");
});
function showAlert(message, duration = 2000) {
  const alertBox = document.getElementById("alert-box");
  alertBox.textContent = message;
  alertBox.classList.remove("hidden");

  setTimeout(() => {
    alertBox.classList.add("hidden");
  }, duration);
}
