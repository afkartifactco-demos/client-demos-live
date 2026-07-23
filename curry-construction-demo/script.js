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

  const provided = [name, email, phone, location, projectType, timeline, notes].filter(Boolean).length;
  formStatus.textContent = `Concept complete: ${provided} project details captured. A production build would send this to the contractor's preferred inbox or CRM.`;
});

window.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
