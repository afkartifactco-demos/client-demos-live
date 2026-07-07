const storageKey = "barberTemplateDemoState";
const authKey = "barberTemplateStaffAuthed";

const seedState = {
  selectedClientId: "travis-b",
  clients: [
    {
      id: "travis-b",
      name: "Client A.",
      phone: "(937) 555-0194",
      barber: "Primary Barber",
      lastVisit: "June 26",
      preferences: ["Low skin fade", "#2 into scissors", "Natural neckline", "Matte paste"],
      notes: [
        { date: "June 26", title: "Low skin fade", detail: "Start with a #1.5 guard above the ear, drop fade slightly in back, leave enough top for side part." },
        { date: "May 30", title: "Same cut, shorter beard", detail: "Beard to 6mm, keep cheek line natural, no hard part." },
      ],
    },
    {
      id: "ben-w",
      name: "Client B.",
      phone: "(937) 555-0127",
      barber: "Primary Barber",
      lastVisit: "June 22",
      preferences: ["Mid taper", "Rounded back", "Beard line up", "No product"],
      notes: [
        { date: "June 22", title: "Mid taper and beard", detail: "Blend sideburn into beard, keep mustache off lip, no hard line at neckline." },
      ],
    },
    {
      id: "marcus-r",
      name: "Client C.",
      phone: "(937) 555-0171",
      barber: "Primary Barber",
      lastVisit: "June 18",
      preferences: ["Executive cut", "Scissor top", "Tapered neckline", "Light pomade"],
      notes: [
        { date: "June 18", title: "Executive cut", detail: "Leave top longer at front, taper sides with shears, finish with light shine pomade." },
      ],
    },
  ],
  appointments: [
    { id: "appt-1", clientId: "travis-b", name: "Client A.", service: "Adult Haircut", barber: "Primary Barber", date: "2026-07-03", time: "10:00 AM", notes: "Repeat low skin fade, textured top." },
    { id: "appt-2", clientId: "ben-w", name: "Client B.", service: "Shave", barber: "Primary Barber", date: "2026-07-03", time: "11:30 AM", notes: "Keep beard fuller at chin." },
    { id: "appt-3", clientId: "marcus-r", name: "Client C.", service: "Adult Haircut", barber: "Primary Barber", date: "2026-07-03", time: "1:15 PM", notes: "Classic cut, natural part." },
  ],
};

let state = loadState();
let searchTerm = "";

const loginView = document.querySelector("#loginView");
const dashboard = document.querySelector("#dashboard");
const loginForm = document.querySelector("#loginForm");
const loginMessage = document.querySelector("#loginMessage");
const logoutButton = document.querySelector("#logoutButton");
const clientList = document.querySelector("#clientList");
const clientRecord = document.querySelector("#clientRecord");
const noteForm = document.querySelector("#noteForm");
const clientSearch = document.querySelector("#clientSearch");

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = document.querySelector("#usernameInput").value.trim();
  const password = document.querySelector("#passwordInput").value;

  if (username === "Test" && password === "1234") {
    sessionStorage.setItem(authKey, "true");
    loginMessage.textContent = "";
    showDashboard();
    return;
  }

  loginMessage.textContent = "Invalid login. Use Test / 1234 for this demo.";
});

logoutButton.addEventListener("click", () => {
  sessionStorage.removeItem(authKey);
  loginForm.reset();
  showLogin();
});

clientSearch.addEventListener("input", () => {
  searchTerm = clientSearch.value.trim().toLowerCase();
  renderClients();
});

noteForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const client = getSelectedClient();
  if (!client) return;

  const fade = document.querySelector("#fadeInput").value.trim();
  const top = document.querySelector("#topInput").value.trim();
  const detail = document.querySelector("#detailInput").value.trim();
  const preference = detail ? `${fade} | ${top} | ${detail}` : `${fade} | ${top}`;

  client.preferences = [fade, top, detail || "Standard finish"].filter(Boolean);
  client.notes.unshift({
    date: "July 3",
    title: "Updated preference",
    detail: preference,
  });
  client.lastVisit = "July 3";

  noteForm.reset();
  saveState();
  renderAll();
});

function showDashboard() {
  loginView.classList.add("is-hidden");
  dashboard.classList.remove("is-locked");
  logoutButton.classList.remove("is-hidden");
  renderAll();
  dashboard.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showLogin() {
  loginView.classList.remove("is-hidden");
  dashboard.classList.add("is-locked");
  logoutButton.classList.add("is-hidden");
  loginView.scrollIntoView({ behavior: "smooth", block: "start" });
  if (window.lucide) lucide.createIcons();
}

function loadState() {
  const saved = localStorage.getItem(storageKey);
  return normalizeState(saved ? JSON.parse(saved) : structuredClone(seedState));
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function normalizeState(nextState) {
  const serviceMap = {
    "Skin Fade": "Adult Haircut",
    "Classic Cut": "Adult Haircut",
    "Beard Trim": "Shave",
    "Cut + Beard": "Cut + Shave",
  };

  nextState.clients.forEach((client) => {
    client.barber = "Primary Barber";
  });

  nextState.appointments.forEach((appointment) => {
    appointment.barber = "Primary Barber";
    appointment.service = serviceMap[appointment.service] || appointment.service;
  });

  return nextState;
}

function renderAll() {
  renderClients();
  renderRecord();
  renderStats();
  if (window.lucide) lucide.createIcons();
}

function renderClients() {
  const filtered = state.clients.filter((client) => {
    const haystack = `${client.name} ${client.phone} ${client.barber} ${client.preferences.join(" ")}`.toLowerCase();
    return haystack.includes(searchTerm);
  });

  clientList.innerHTML = filtered.length
    ? filtered.map((client) => `
      <button class="client-button ${client.id === state.selectedClientId ? "is-active" : ""}" data-client="${client.id}" type="button">
        <strong>${escapeHtml(client.name)}</strong>
        <span>${escapeHtml(client.barber)} | Last visit ${escapeHtml(client.lastVisit)}</span>
      </button>
    `).join("")
    : `<p class="empty-state">No matching clients.</p>`;

  clientList.querySelectorAll("[data-client]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedClientId = button.dataset.client;
      saveState();
      renderAll();
    });
  });
}

function renderRecord() {
  const client = getSelectedClient();

  if (!client) {
    clientRecord.innerHTML = `<p class="empty-state">Choose a client to view saved cut notes.</p>`;
    return;
  }

  clientRecord.innerHTML = `
    <div class="record-summary">
      <div class="record-head">
        <div>
          <p class="eyebrow">Client record</p>
          <h2>${escapeHtml(client.name)}</h2>
          <p class="client-meta">${escapeHtml(client.phone)} | Preferred barber: ${escapeHtml(client.barber)} | Last visit ${escapeHtml(client.lastVisit)}</p>
        </div>
        <div class="client-avatar">${escapeHtml(initials(client.name))}</div>
      </div>
      <div class="preference-grid">
        ${client.preferences.map((preference) => `<span class="preference-pill">${escapeHtml(preference)}</span>`).join("")}
      </div>
      <div class="note-list">
        ${client.notes.map((note) => `
          <div class="timeline-item">
            <strong>${escapeHtml(note.date)} - ${escapeHtml(note.title)}</strong>
            ${escapeHtml(note.detail)}
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderStats() {
  document.querySelector("#clientCount").textContent = state.clients.length;
  document.querySelector("#appointmentCount").textContent = state.appointments.length;
  document.querySelector("#noteCount").textContent = state.clients.reduce((total, client) => total + client.notes.length, 0);
}

function getSelectedClient() {
  return state.clients.find((client) => client.id === state.selectedClientId) || state.clients[0];
}

function initials(name) {
  return name.split(" ").map((part) => part.charAt(0)).join("").slice(0, 2).toUpperCase();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

if (sessionStorage.getItem(authKey) === "true") {
  showDashboard();
} else {
  showLogin();
}
