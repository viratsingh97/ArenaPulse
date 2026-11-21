
const API = "/api/venues";

let venues = [];

const icons = {
    Basketball: "🏀",
    Badminton: "🏸",
    Football: "⚽",
    Cricket: "🏏",
    Tennis: "🎾",
    Volleyball: "🏐"
};

// Load all venues
async function loadVenues() {
    const list = document.getElementById("venueList");

    list.innerHTML = "<p>Loading venues...</p>";

    try {
        const response = await fetch(API);

        if (!response.ok) {
            throw new Error("Unable to load venues");
        }

        const data = await response.json();

        // Supports both Spring Page and List responses
        venues = Array.isArray(data) ? data : data.content || [];

        updateDashboard();
        renderVenues();

    } catch (error) {
        list.innerHTML = `
            <div class="empty-state">
                <h3>Unable to connect to server</h3>
                <p>Please check whether ArenaPulse is running.</p>
            </div>`;
    }
}

// Update dashboard statistics
function updateDashboard() {
    document.getElementById("totalVenues").textContent =
        venues.length;

    const sports = new Set(
        venues.map(v => v.sport)
    );

    document.getElementById("totalSports").textContent =
        sports.size;
}

// Display venue cards
function renderVenues() {
    const list = document.getElementById("venueList");

    const search = document
        .getElementById("searchInput")
        .value.toLowerCase();

    const sport = document
        .getElementById("sportFilter")
        .value;

    const filtered = venues.filter(v => {
        const matchesSearch =
            v.name.toLowerCase().includes(search);

        const matchesSport =
            sport === "All" || v.sport === sport;

        return matchesSearch && matchesSport;
    });

    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <h3>No venues found</h3>
                <p>Add a new venue or change your search.</p>
            </div>`;
        return;
    }

    list.innerHTML = filtered.map(v => `
        <div class="venue-card">
            <div class="venue-icon">
                ${icons[v.sport] || "🏟️"}
            </div>

            <h3>${escapeHTML(v.name)}</h3>

            <span class="sport-tag">
                ${escapeHTML(v.sport)}
            </span>

            <small>Venue ID: ${v.id}</small>

            <button class="delete-btn"
                onclick="deleteVenue(${Number(v.id)})">
                Delete Venue
            </button>
        </div>
    `).join("");
}

// Prevent HTML injection in venue text
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Open and close modal
function openModal() {
    document.getElementById("venueModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("venueModal").style.display = "none";
    document.getElementById("venueForm").reset();
    document.getElementById("formMessage").textContent = "";
}

// Add venue
document.getElementById("venueForm")
    .addEventListener("submit", async function(event) {

    event.preventDefault();

    const name = document.getElementById("venueName").value.trim();
    const sport = document.getElementById("venueSport").value;
    const message = document.getElementById("formMessage");

    message.textContent = "";

    if (!name || !sport) {
        message.textContent = "Please fill in all fields.";
        return;
    }

    try {
        const response = await fetch(API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, sport })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            const errors = error.errors
                ? Object.values(error.errors).join(", ")
                : "Unable to add venue";

            throw new Error(errors);
        }

        closeModal();
        await loadVenues();

    } catch (error) {
        message.textContent = error.message;
    }
});

// Delete venue
async function deleteVenue(id) {
    if (!confirm("Are you sure you want to delete this venue?")) {
        return;
    }

    try {
        const response = await fetch(`${API}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Unable to delete venue");
        }

        await loadVenues();

    } catch (error) {
        alert(error.message);
    }
}

// Search and filtering
document.getElementById("searchInput")
    .addEventListener("input", renderVenues);

document.getElementById("sportFilter")
    .addEventListener("change", renderVenues);

// Initial application load
loadVenues();
