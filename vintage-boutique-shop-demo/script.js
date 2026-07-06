const storageKey = "malitasPlaceInventory";
const cartKey = "malitasPlaceCart";

const seedInventory = [
  {
    id: "oak-washstand",
    name: "Oak Washstand",
    price: 245,
    category: "furniture",
    description: "Solid oak washstand with dovetail drawers and a warm refinished top.",
    quantity: 1,
    restockable: false,
    status: "published",
    image: "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "painted-sideboard",
    name: "Painted Sideboard",
    price: 395,
    category: "custom",
    description: "Custom painted sideboard with sealed finish, updated hardware, and roomy storage.",
    quantity: 2,
    restockable: true,
    status: "published",
    image: "https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "brass-candle-set",
    name: "Brass Candle Set",
    price: 58,
    category: "decor",
    description: "Collected brass candleholders sold as a set of five. Natural patina included.",
    quantity: 0,
    restockable: false,
    status: "published",
    image: "https://images.unsplash.com/photo-1602872030490-4a484a7b3ba6?auto=format&fit=crop&w=900&q=80",
  },
];

let inventory = loadInventory();
let cart = loadCart();
let activeFilter = "all";
let pendingImage = "";

const views = {
  shop: document.querySelector("#shopView"),
  inventory: document.querySelector("#inventoryView"),
};

const productGrid = document.querySelector("#productGrid");
const inventoryList = document.querySelector("#inventoryList");
const cartCount = document.querySelector("#cartCount");
const cartItems = document.querySelector("#cartItems");
const checkoutButton = document.querySelector("#checkoutButton");
const itemForm = document.querySelector("#itemForm");
const photoInput = document.querySelector("#photoInput");
const photoDrop = document.querySelector("#photoDrop");
const photoPreview = document.querySelector("#photoPreview");

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.view));
});

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll(".filter").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    renderShop();
  });
});

photoInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    pendingImage = reader.result;
    photoPreview.src = pendingImage;
    photoPreview.alt = "New item preview";
    photoDrop.classList.add("has-image");
  };
  reader.readAsDataURL(file);
});

itemForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!pendingImage) {
    photoDrop.focus();
    alert("Please add a picture first. It helps the owner confirm the listing before publishing.");
    return;
  }

  const item = {
    id: crypto.randomUUID(),
    name: document.querySelector("#nameInput").value.trim(),
    price: Number(document.querySelector("#priceInput").value),
    category: document.querySelector("#categoryInput").value,
    description: document.querySelector("#descriptionInput").value.trim() || "Freshly added piece. Description can be polished before publishing.",
    quantity: Number(document.querySelector("#quantityInput").value),
    restockable: document.querySelector("#restockableInput").checked,
    status: "draft",
    image: pendingImage,
  };

  inventory.unshift(item);
  pendingImage = "";
  photoPreview.removeAttribute("src");
  photoDrop.classList.remove("has-image");
  itemForm.reset();
  document.querySelector("#quantityInput").value = 1;
  saveInventory();
  renderAll();
  switchView("inventory");
});

checkoutButton.addEventListener("click", () => {
  if (!cart.length) return;

  cart.forEach((cartId) => {
    const item = inventory.find((entry) => entry.id === cartId);
    if (item && item.quantity > 0) item.quantity -= 1;
  });

  cart = [];
  saveInventory();
  saveCart();
  renderAll();
  alert("Demo order placed. Inventory quantities updated, and sold-out items are now unavailable in the shop.");
});

document.querySelector("#resetDemo").addEventListener("click", () => {
  inventory = structuredClone(seedInventory);
  cart = [];
  saveInventory();
  saveCart();
  renderAll();
});

function loadInventory() {
  const saved = localStorage.getItem(storageKey);
  return saved ? JSON.parse(saved) : structuredClone(seedInventory);
}

function loadCart() {
  const saved = localStorage.getItem(cartKey);
  return saved ? JSON.parse(saved) : [];
}

function saveInventory() {
  localStorage.setItem(storageKey, JSON.stringify(inventory));
}

function saveCart() {
  localStorage.setItem(cartKey, JSON.stringify(cart));
}

function switchView(viewName) {
  Object.entries(views).forEach(([name, view]) => view.classList.toggle("is-visible", name === viewName));
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("is-active", tab.dataset.view === viewName));
}

function renderAll() {
  renderShop();
  renderInventory();
  renderCart();
  if (window.lucide) lucide.createIcons();
}

function renderShop() {
  const visibleProducts = inventory.filter((item) => {
    const isPublished = item.status === "published";
    const matchesFilter = activeFilter === "all" || item.category === activeFilter;
    return isPublished && matchesFilter;
  });

  productGrid.innerHTML = visibleProducts.length
    ? visibleProducts.map(renderProductCard).join("")
    : `<p class="empty-state">No published items match this filter yet.</p>`;

  productGrid.querySelectorAll("[data-add]").forEach((button) => {
    button.addEventListener("click", () => {
      cart.push(button.dataset.add);
      saveCart();
      renderCart();
    });
  });
}

function renderProductCard(item) {
  const soldOut = item.quantity <= 0;
  const badge = soldOut ? "Unavailable" : `${item.quantity} available`;
  const badgeClass = soldOut ? "product-badge unavailable" : "product-badge";
  const restockText = item.restockable ? "Can be restocked" : "One of a kind";

  return `
    <article class="product-card">
      <div class="product-image">
        <img src="${item.image}" alt="${escapeHtml(item.name)}" />
        <span class="${badgeClass}">${badge}</span>
      </div>
      <div class="product-body">
        <div class="product-title-row">
          <h3>${escapeHtml(item.name)}</h3>
          <p class="price">$${item.price.toLocaleString()}</p>
        </div>
        <p class="description">${escapeHtml(item.description)}</p>
        <div class="tag-row">
          <span class="tag">${labelFor(item.category)}</span>
          <span class="tag">${restockText}</span>
        </div>
        <button class="primary-action" data-add="${item.id}" type="button" ${soldOut ? "disabled" : ""}>
          <i data-lucide="shopping-cart"></i>
          ${soldOut ? "Sold out" : "Add to cart"}
        </button>
      </div>
    </article>
  `;
}

function renderInventory() {
  const drafts = inventory.filter((item) => item.status === "draft").length;
  const live = inventory.filter((item) => item.status === "published").length;
  document.querySelector("#draftCount").textContent = drafts;
  document.querySelector("#liveCount").textContent = live;

  inventoryList.innerHTML = inventory.length
    ? inventory.map(renderInventoryItem).join("")
    : `<p class="empty-state">No inventory yet. Add the first item using the form.</p>`;

  inventoryList.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => updateItem(button.dataset.id, button.dataset.action));
  });
}

function renderInventoryItem(item) {
  const soldOut = item.quantity <= 0;
  const statusClass = soldOut && item.status === "published" ? "status out" : `status ${item.status === "draft" ? "draft" : "live"}`;
  const statusText = soldOut && item.status === "published" ? "Unavailable" : item.status === "draft" ? "Draft" : "Live";
  const restockText = item.restockable ? "Restockable" : "One-off item";

  return `
    <article class="inventory-item">
      <img src="${item.image}" alt="${escapeHtml(item.name)}" />
      <div class="inventory-copy">
        <div class="inventory-title-row">
          <h3>${escapeHtml(item.name)}</h3>
          <span class="${statusClass}">${statusText}</span>
        </div>
        <p class="inventory-meta">$${item.price.toLocaleString()} | ${labelFor(item.category)} | ${item.quantity} in stock | ${restockText}</p>
        <p class="description">${escapeHtml(item.description)}</p>
        <div class="inventory-actions">
          ${item.status === "draft" ? `<button class="mini-action publish" data-action="publish" data-id="${item.id}" type="button">Publish</button>` : ""}
          ${item.status === "published" ? `<button class="mini-action" data-action="draft" data-id="${item.id}" type="button">Move to draft</button>` : ""}
          <button class="mini-action" data-action="restock" data-id="${item.id}" type="button">Add 1</button>
          <button class="mini-action" data-action="sell" data-id="${item.id}" type="button">Mark sold</button>
          <button class="mini-action danger" data-action="delete" data-id="${item.id}" type="button">Delete</button>
        </div>
      </div>
    </article>
  `;
}

function updateItem(id, action) {
  const item = inventory.find((entry) => entry.id === id);
  if (!item) return;

  if (action === "publish") item.status = "published";
  if (action === "draft") item.status = "draft";
  if (action === "restock") item.quantity += 1;
  if (action === "sell") item.quantity = Math.max(0, item.quantity - 1);
  if (action === "delete") inventory = inventory.filter((entry) => entry.id !== id);

  cart = cart.filter((cartId) => {
    const cartItem = inventory.find((entry) => entry.id === cartId);
    return cartItem && cartItem.quantity > 0 && cartItem.status === "published";
  });

  saveInventory();
  saveCart();
  renderAll();
}

function renderCart() {
  cartCount.textContent = cart.length;
  checkoutButton.disabled = cart.length === 0;

  if (!cart.length) {
    cartItems.textContent = "Add a product to test the automatic inventory update.";
    return;
  }

  const counts = cart.reduce((summary, id) => {
    summary[id] = (summary[id] || 0) + 1;
    return summary;
  }, {});

  cartItems.innerHTML = Object.entries(counts)
    .map(([id, count]) => {
      const item = inventory.find((entry) => entry.id === id);
      return item ? `${escapeHtml(item.name)} x ${count}` : "";
    })
    .filter(Boolean)
    .join("<br />");
}

function labelFor(category) {
  return category.charAt(0).toUpperCase() + category.slice(1);
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
