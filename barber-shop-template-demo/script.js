const services = [
  { id: "adult-haircut", name: "Adult Haircut", price: 18, duration: "30 min", detail: "Classic barber cut with neckline cleanup and finished styling." },
  { id: "kids-haircut", name: "Kids Haircut", price: 15, duration: "25 min", detail: "Simple, clean cut for younger clients with a comfortable chair time." },
  { id: "straight-shave", name: "Shave", price: 15, duration: "20 min", detail: "Clean shave or beard cleanup with classic barbershop attention." },
  { id: "cut-shave", name: "Cut + Shave", price: 33, duration: "50 min", detail: "Adult haircut paired with a shave for a full-service visit." },
];

const storageKey = "barberTemplateDemoState";

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

const serviceGrid = document.querySelector("#serviceGrid");
const serviceSelect = document.querySelector("#serviceSelect");
const bookingForm = document.querySelector("#bookingForm");
const appointmentList = document.querySelector("#appointmentList");
const dateInput = document.querySelector("#dateInput");
const bookingConfirmation = document.querySelector("#bookingConfirmation");

dateInput.value = "2026-07-03";

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.querySelector("#clientName").value.trim();
  const phone = document.querySelector("#clientPhone").value.trim();
  const service = document.querySelector("#serviceSelect").value;
  const barber = document.querySelector("#barberSelect").value;
  const date = document.querySelector("#dateInput").value;
  const time = document.querySelector("#timeSelect").value;
  const notes = document.querySelector("#cutNotes").value.trim() || "First appointment. Staff can add preferences after the cut.";
  const clientId = findOrCreateClient(name, phone, barber, notes);

  state.appointments.unshift({
    id: crypto.randomUUID(),
    clientId,
    name,
    service,
    barber,
    date,
    time,
    notes,
  });

  state.selectedClientId = clientId;
  bookingForm.reset();
  dateInput.value = "2026-07-03";
  bookingConfirmation.textContent = `You're booked for ${service} with ${barber} on ${formatDate(date)} at ${time}.`;
  saveState();
  renderAppointments();
});

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
  renderServices();
  renderAppointments();
  if (window.lucide) lucide.createIcons();
}

function renderServices() {
  serviceGrid.innerHTML = services.map((service) => `
    <article class="service-card">
      <div class="service-meta">
        <span>$${service.price}</span>
        <span>${service.duration}</span>
      </div>
      <h3>${escapeHtml(service.name)}</h3>
      <p>${escapeHtml(service.detail)}</p>
    </article>
  `).join("");

  serviceSelect.innerHTML = services.map((service) => `
    <option value="${escapeHtml(service.name)}">${escapeHtml(service.name)} - $${service.price}</option>
  `).join("");
}

function renderAppointments() {
  const sorted = [...state.appointments].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  appointmentList.innerHTML = sorted.length
    ? sorted.slice(0, 6).map((appointment) => `
      <article class="appointment-card">
        <div class="appointment-top">
          <div>
            <h3>${escapeHtml(appointment.name)}</h3>
            <p>${escapeHtml(appointment.service)} with ${escapeHtml(appointment.barber)}</p>
          </div>
          <span class="time-badge">${formatDate(appointment.date)} ${escapeHtml(appointment.time)}</span>
        </div>
        <p>${escapeHtml(appointment.notes)}</p>
      </article>
    `).join("")
    : `<p class="empty-state">No appointments yet.</p>`;
}

function findOrCreateClient(name, phone, barber, notes) {
  const existing = state.clients.find((client) => client.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    existing.phone = phone;
    existing.barber = barber;
    existing.notes.unshift({ date: "July 3", title: "Booking note", detail: notes });
    existing.lastVisit = "Upcoming";
    return existing.id;
  }

  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || crypto.randomUUID();
  state.clients.unshift({
    id,
    name,
    phone,
    barber,
    lastVisit: "New client",
    preferences: ["New client", "Needs first cut notes"],
    notes: [{ date: "July 3", title: "First booking", detail: notes }],
  });
  return id;
}

function formatDate(value) {
  const date = new Date(`${value}T12:00:00`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

renderAll();
