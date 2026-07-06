const products = [
  {
    id: "brass-pendant",
    type: "Solid brass",
    name: "America 250 Solid Brass Pendant",
    price: 35,
    image: "assets/brass-pendant.jpg",
    description: "Detailed solid brass pendant keepsake with raised patriotic relief.",
    tags: ["Brass", "Keepsake", "Gift"],
    finishes: ["Antique brass", "Bright brass", "Dark aged brass"],
  },
  {
    id: "board-game",
    type: "Custom board games",
    name: "Personalized Wood Game Board",
    price: 30,
    image: "assets/custom-board-game.jpg",
    description: "Engraved board game fronts with family names, sayings, and custom wording.",
    tags: ["Family gifts", "Laser engraved", "Wood"],
    finishes: ["Natural wood", "Light stain", "Dark stain"],
  },
  {
    id: "sign",
    type: "Signs",
    name: "Custom Engraved Signs",
    price: 25,
    image: "assets/friendly-acres-sign.jpg",
    description: "Rustic wood signs for farms, families, garages, shops, and gifts.",
    tags: ["Starts at $25", "Indoor", "Outdoor style"],
    finishes: ["Natural cedar", "Golden stain", "Dark walnut", "Black engraved"],
  },
  {
    id: "hat",
    type: "Hats",
    name: "Hat With Custom Leather Patch",
    price: 25,
    image: "assets/richardson-hat-patch.jpg",
    description: "Trucker hats and beanies with custom engraved leather-look patches.",
    tags: ["Richardson style", "Beanies", "Logo patch"],
    finishes: ["Gray hat", "Black hat", "Navy hat", "Beanie"],
  },
  {
    id: "cupcake-stand",
    type: "Wedding displays",
    name: "Wedding Cupcake Stand",
    price: 75,
    image: "assets/custom-wood-sign-keefe.jpg",
    description: "Custom event display stand built for cupcakes, dessert tables, and receptions.",
    tags: ["Wedding", "Event", "Custom setup"],
    finishes: ["Natural wood", "Golden stain", "Dark walnut", "Whitewashed"],
  },
  {
    id: "patch",
    type: "Patches",
    name: "Custom Leather-Style Patch",
    price: 12,
    image: "assets/dairy-barn-patch.jpg",
    description: "Small engraved patches for hats, beanies, businesses, clubs, and gifts.",
    tags: ["Starts at $12", "Logo-ready", "Bulk friendly"],
    finishes: ["Cognac", "Dark brown", "Black", "Rawhide"],
  },
  {
    id: "ornament",
    type: "Christmas",
    name: "Personalized Christmas Ornament",
    price: 15,
    image: "assets/xmas-ornaments.jpg",
    description: "Name ornaments for families, classrooms, teams, trees, and gift exchanges.",
    tags: ["Names", "Holiday", "Gift sets"],
    finishes: ["Red", "Gold", "Silver", "Green"],
  },
];

const state = {
  cart: [],
  selectedProduct: null,
};

const productGrid = document.querySelector("[data-products]");
const productTemplate = document.querySelector("#product-template");
const cartPanel = document.querySelector("[data-cart-panel]");
const cartItems = document.querySelector("[data-cart-items]");
const cartCount = document.querySelector("[data-cart-count]");
const cartTotal = document.querySelector("[data-cart-total]");
const dialog = document.querySelector("[data-custom-dialog]");
const customForm = document.querySelector("[data-custom-form]");
const toast = document.querySelector("[data-toast]");
const savedOrdersWrap = document.querySelector("[data-saved-orders]");

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function renderProducts() {
  productGrid.innerHTML = "";
  products.forEach((product) => {
    const card = productTemplate.content.firstElementChild.cloneNode(true);
    const image = card.querySelector("img");
    image.src = product.image;
    image.alt = product.name;
    card.querySelector(".price-pill").textContent = `${money(product.price)}+`;
    card.querySelector(".product-type").textContent = product.type;
    card.querySelector("h3").textContent = product.name;
    card.querySelector(".product-description").textContent = product.description;
    card.querySelector(".product-options").innerHTML = product.tags.map((tag) => `<span>${tag}</span>`).join("");
    card.querySelector("button").addEventListener("click", () => openCustomizer(product.id));
    productGrid.appendChild(card);
  });
}

function openCart() {
  cartPanel.setAttribute("aria-hidden", "false");
  document.body.classList.add("cart-open");
}

function closeCart() {
  cartPanel.setAttribute("aria-hidden", "true");
  document.body.classList.remove("cart-open");
}

function openCustomizer(productId) {
  const product = products.find((item) => item.id === productId);
  state.selectedProduct = product;
  dialog.querySelector("[data-dialog-image]").src = product.image;
  dialog.querySelector("[data-dialog-image]").alt = product.name;
  dialog.querySelector("[data-dialog-type]").textContent = product.type;
  dialog.querySelector("[data-dialog-title]").textContent = product.name;
  dialog.querySelector("[data-dialog-description]").textContent = product.description;
  dialog.querySelector("[data-dialog-price]").textContent = `${money(product.price)} starting price`;
  dialog.querySelector("[data-finish-select]").innerHTML = product.finishes
    .map((finish) => `<option>${finish}</option>`)
    .join("");
  customForm.reset();
  customForm.quantity.value = 1;
  dialog.showModal();
}

function addToCart(item) {
  state.cart.push(item);
  renderCart();
  openCart();
  showToast("Added to cart");
}

function removeFromCart(index) {
  state.cart.splice(index, 1);
  renderCart();
}

function cartSubtotal() {
  return state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function renderCart() {
  cartCount.textContent = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  cartTotal.textContent = money(cartSubtotal());

  if (!state.cart.length) {
    cartItems.innerHTML = `<div class="cart-line"><p>Your cart is empty. Add a custom item to start an order.</p></div>`;
    return;
  }

  cartItems.innerHTML = state.cart
    .map(
      (item, index) => `
        <div class="cart-line">
          <div>
            <h3>${item.quantity} x ${item.name}</h3>
            <p>${item.finish} - ${item.personalization}</p>
            <p>${item.neededBy ? `Needed by ${item.neededBy}` : "No deadline added"}</p>
          </div>
          <div>
            <strong>${money(item.price * item.quantity)}</strong>
            <button type="button" data-remove="${index}">Remove</button>
          </div>
        </div>
      `
    )
    .join("");

  cartItems.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => removeFromCart(Number(button.dataset.remove)));
  });
}

function getSavedOrders() {
  return JSON.parse(localStorage.getItem("wilsonsOrders") || "[]");
}

function setSavedOrders(orders) {
  localStorage.setItem("wilsonsOrders", JSON.stringify(orders));
  renderSavedOrders();
}

function buildOrderSummary(order) {
  const lines = order.items
    .map(
      (item) =>
        `${item.quantity} x ${item.name} (${item.finish}) - ${item.personalization} - ${money(
          item.price * item.quantity
        )}`
    )
    .join("\n");
  return `Wilson's Custom Creations order request
Customer: ${order.customerName}
Phone: ${order.phone}
Email: ${order.email || "Not provided"}
Fulfillment: ${order.fulfillment}
Notes: ${order.notes || "None"}

Items:
${lines}

Estimated subtotal: ${money(order.subtotal)}`;
}

function renderSavedOrders() {
  const orders = getSavedOrders();
  if (!orders.length) {
    savedOrdersWrap.innerHTML = `<p class="fine-print">No saved requests yet.</p>`;
    return;
  }

  savedOrdersWrap.innerHTML = orders
    .slice()
    .reverse()
    .map(
      (order) => `
        <article class="saved-order">
          <strong>${order.customerName}</strong> - ${money(order.subtotal)} - ${order.items.length} item${
        order.items.length === 1 ? "" : "s"
      }<br />
          ${order.phone} - ${order.fulfillment}<br />
          <small>${new Date(order.createdAt).toLocaleString()}</small>
        </article>
      `
    )
    .join("");
}

customForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const product = state.selectedProduct;
  const formData = new FormData(customForm);
  addToCart({
    id: product.id,
    name: product.name,
    price: product.price,
    quantity: Number(formData.get("quantity")),
    personalization: formData.get("personalization").trim(),
    finish: formData.get("finish"),
    neededBy: formData.get("neededBy"),
  });
  dialog.close();
});

document.querySelector("[data-dialog-cancel]").addEventListener("click", () => dialog.close());

document.querySelectorAll("[data-cart-open]").forEach((button) => button.addEventListener("click", openCart));
document.querySelectorAll("[data-cart-close]").forEach((button) => button.addEventListener("click", closeCart));

document.querySelector("[data-order-form]").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!state.cart.length) {
    showToast("Add at least one item first");
    return;
  }

  const formData = new FormData(event.currentTarget);
  const order = {
    customerName: formData.get("customerName").trim(),
    phone: formData.get("phone").trim(),
    email: formData.get("email").trim(),
    fulfillment: formData.get("fulfillment"),
    notes: formData.get("notes").trim(),
    items: state.cart,
    subtotal: cartSubtotal(),
    createdAt: new Date().toISOString(),
  };

  setSavedOrders([...getSavedOrders(), order]);
  state.cart = [];
  renderCart();
  event.currentTarget.reset();
  showToast("Order request saved");
});

document.querySelector("[data-copy-order]").addEventListener("click", async () => {
  if (!state.cart.length) {
    showToast("Add items before copying an order");
    return;
  }

  const form = document.querySelector("[data-order-form]");
  const formData = new FormData(form);
  const order = {
    customerName: formData.get("customerName") || "Customer name not entered",
    phone: formData.get("phone") || "Phone not entered",
    email: formData.get("email") || "",
    fulfillment: formData.get("fulfillment"),
    notes: formData.get("notes") || "",
    items: state.cart,
    subtotal: cartSubtotal(),
  };

  await navigator.clipboard.writeText(buildOrderSummary(order));
  showToast("Order summary copied");
});

document.querySelector("[data-clear-orders]").addEventListener("click", () => {
  setSavedOrders([]);
  showToast("Saved requests cleared");
});

renderProducts();
renderCart();
renderSavedOrders();
