const tabs = document.querySelectorAll(".menu-tab");
const items = document.querySelectorAll(".menu-item");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const filter = tab.dataset.filter;

    tabs.forEach((button) => {
      const active = button === tab;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });

    items.forEach((item) => {
      const shouldShow = filter === "all" || item.dataset.category === filter;
      item.classList.toggle("is-hidden", !shouldShow);
    });
  });
});
