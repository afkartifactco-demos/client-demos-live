const quoteEmail = "jlc_construction@yahoo.com";
const estimateForm = document.querySelector("#estimateForm");
const formStatus = document.querySelector("#formStatus");
const projectCards = Array.from(document.querySelectorAll(".project-card"));
const filterButtons = Array.from(document.querySelectorAll(".filter-button"));
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightboxImage");
const lightboxTitle = document.querySelector("#lightboxTitle");

function showFilteredProjects(filter) {
  projectCards.forEach((card) => {
    const tags = card.dataset.filterTags.split(" ");
    const isVisible = filter === "all" || tags.includes(filter);
    card.classList.toggle("is-hidden", !isVisible);
  });
}

function encodeMailtoLine(label, value) {
  return `${label}: ${value || "Not provided"}`;
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    showFilteredProjects(button.dataset.filter);
  });
});

projectCards.forEach((card) => {
  card.addEventListener("click", () => {
    lightboxImage.src = card.dataset.image;
    lightboxImage.alt = card.querySelector("img").alt;
    lightboxTitle.textContent = card.dataset.title;
    lightbox.showModal();
  });
});

document.querySelector(".close-lightbox").addEventListener("click", () => {
  lightbox.close();
});

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    lightbox.close();
  }
});

estimateForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.querySelector("#nameInput").value.trim();
  const email = document.querySelector("#emailInput").value.trim();
  const phone = document.querySelector("#phoneInput").value.trim();
  const location = document.querySelector("#locationInput").value.trim();
  const projectType = document.querySelector("#projectType").value;
  const timeline = document.querySelector("#timelineInput").value;
  const notes = document.querySelector("#notesInput").value.trim();

  const subject = `Curry Construction Estimate Request - ${projectType}`;
  const body = [
    "New estimate request from the Curry Construction Services website.",
    "",
    encodeMailtoLine("Name", name),
    encodeMailtoLine("Email", email),
    encodeMailtoLine("Phone", phone),
    encodeMailtoLine("Location", location),
    encodeMailtoLine("Project type", projectType),
    encodeMailtoLine("Timeline", timeline),
    "",
    encodeMailtoLine("Project notes", notes),
  ].join("\n");

  window.location.href = `mailto:${quoteEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  formStatus.textContent = "Opening your email app with the estimate request addressed to Curry Construction Services LLC.";
});

window.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
