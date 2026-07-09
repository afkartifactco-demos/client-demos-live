const menuItems = [
  {
    id: "bourbon-pecan",
    name: "Bourbon Pecan",
    category: "coffee",
    price: 6,
    desc: "Bourbon caramel, butter pecan, espresso, and milk.",
    tags: ["iced", "hot", "local favorite"],
  },
  {
    id: "brown-sugar-buckeye",
    name: "Brown Sugar Buckeye",
    category: "coffee",
    price: 6,
    desc: "Peanut butter, chocolate, brown sugar, espresso, and milk.",
    tags: ["iced", "frozen", "sweet"],
  },
  {
    id: "fireside-cookie-dream",
    name: "Fireside Cookie Dream",
    category: "coffee",
    price: 6,
    desc: "Toasted marshmallow, cookie butter, espresso, and milk.",
    tags: ["iced", "hot", "cozy"],
  },
  {
    id: "white-chocolate-mocha",
    name: "White Chocolate Mocha",
    category: "coffee",
    price: 6,
    desc: "White chocolate, espresso, milk, and a second flavor option.",
    tags: ["classic", "iced", "hot"],
  },
  {
    id: "cherry-float",
    name: "Cherry Float",
    category: "dirty",
    price: 6.5,
    desc: "Dr Pepper, cherry, vanilla, and sweet cream.",
    tags: ["dirty soda", "sweet cream"],
  },
  {
    id: "raspberry-wave",
    name: "Raspberry Wave",
    category: "dirty",
    price: 6.5,
    desc: "Dr Pepper, raspberry, vanilla, and sweet cream.",
    tags: ["dirty soda", "fan favorite"],
  },
  {
    id: "orange-creamsicle",
    name: "Orange Creamsicle",
    category: "dirty",
    price: 6.5,
    desc: "Sprite, orange, vanilla, and sweet cream.",
    tags: ["dirty soda", "bright"],
  },
  {
    id: "candy-cloud",
    name: "Candy Cloud",
    category: "dirty",
    price: 7.5,
    desc: "Alani with raspberry, strawberry, and cold foam.",
    tags: ["dirty energy", "cold foam"],
  },
  {
    id: "southern-sunrise",
    name: "Southern Sunrise",
    category: "dirty",
    price: 7.5,
    desc: "Berry-forward Alani energy sip with raspberry.",
    tags: ["dirty energy", "berry"],
  },
  {
    id: "ocean-breeze",
    name: "Ocean Breeze",
    category: "dirty",
    price: 6.5,
    desc: "Pineapple, coconut, and blue raspberry over a soda base.",
    tags: ["dirty soda", "tropical"],
  },
  {
    id: "black-cherry-bliss",
    name: "Black Cherry Bliss",
    category: "dirty",
    price: 6.5,
    desc: "Black cherry, vanilla, and cream.",
    tags: ["dirty soda", "sweet cream"],
  },
  {
    id: "lemonade",
    name: "Flavored Lemonade",
    category: "beyond",
    price: 5.5,
    desc: "Blackberry, blueberry, peach, raspberry, strawberry, or lime.",
    tags: ["beyond coffee", "refreshing"],
  },
  {
    id: "frozen-hot-chocolate",
    name: "Frozen Hot Chocolate",
    category: "beyond",
    price: 6.5,
    desc: "Chocolate or white chocolate blended cold.",
    tags: ["frozen", "kid friendly"],
  },
  {
    id: "iced-coffee",
    name: "Iced Coffee",
    category: "coffee",
    price: 5,
    desc: "Classic iced coffee with your choice of flavor.",
    tags: ["classic", "custom"],
  },
  {
    id: "sweet-treat",
    name: "Trailer Treat",
    category: "bakery",
    price: 4,
    desc: "Rotating baked good from the trailer window.",
    tags: ["limited", "bakery"],
  },
  {
    id: "cinnamon-roll",
    name: "Cinnamon Roll",
    category: "bakery",
    price: 4.5,
    desc: "Fresh pastry option inspired by the Facebook bakery photos.",
    tags: ["bakery", "morning"],
  },
  {
    id: "babka",
    name: "Babka Slice",
    category: "bakery",
    price: 4.5,
    desc: "Rotating babka-style sweet bread when available.",
    tags: ["bakery", "limited"],
  },
  {
    id: "turnover",
    name: "Fruit Turnover",
    category: "bakery",
    price: 4.5,
    desc: "Flaky fruit pastry for market mornings.",
    tags: ["bakery", "fruit"],
  },
];

const cart = new Map();
const menuGrid = document.querySelector("[data-menu-grid]");
const cartItems = document.querySelector("[data-cart-items]");
const cartTotal = document.querySelector("[data-cart-total]");
const toast = document.querySelector("[data-toast]");
const orderNotes = document.querySelector("#order-notes");
let toastTimer;

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function renderMenu(filter = "all") {
  const items = filter === "all" ? menuItems : menuItems.filter((item) => item.category === filter);
  menuGrid.innerHTML = items
    .map(
      (item) => `
        <article class="menu-item" data-category="${item.category}">
          <div class="menu-top">
            <strong>${item.name}</strong>
            <span class="price">${money(item.price)}</span>
          </div>
          <p>${item.desc}</p>
          <div class="tag-row">
            ${item.tags.map((tag) => `<span>${tag}</span>`).join("")}
          </div>
          <div class="add-row">
            <span>${item.category === "dirty" ? "Soda or energy base" : "Pickup ready"}</span>
            <button type="button" data-add="${item.id}">
              <i data-lucide="plus"></i>
              <span>Add</span>
            </button>
          </div>
        </article>
      `
    )
    .join("");
  lucide.createIcons();
}

function renderCart() {
  if (cart.size === 0) {
    cartItems.innerHTML = '<li class="empty-cart">No items yet</li>';
    cartTotal.textContent = "$0.00";
    return;
  }

  let total = 0;
  cartItems.innerHTML = Array.from(cart.values())
    .map(({ item, qty }) => {
      total += item.price * qty;
      return `
        <li>
          <span class="qty-badge">${qty}</span>
          <span>${item.name}</span>
          <strong>${money(item.price * qty)}</strong>
        </li>
      `;
    })
    .join("");
  cartTotal.textContent = money(total);
}

function addItem(id) {
  const item = menuItems.find((entry) => entry.id === id);
  if (!item) return;
  const current = cart.get(id);
  cart.set(id, { item, qty: current ? current.qty + 1 : 1 });
  renderCart();
  showToast(`${item.name} added to your order.`);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2400);
}

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  if (addButton) {
    addItem(addButton.dataset.add);
    return;
  }

  const filterButton = event.target.closest("[data-filter]");
  if (filterButton) {
    document.querySelectorAll("[data-filter]").forEach((button) => button.classList.remove("active"));
    filterButton.classList.add("active");
    renderMenu(filterButton.dataset.filter);
    return;
  }

  if (event.target.closest("[data-clear]")) {
    cart.clear();
    renderCart();
    showToast("Cart cleared.");
    return;
  }

  if (event.target.closest("[data-checkout]")) {
    const pickupTime = document.querySelector("#pickup-time").value;
    const drinkStyle = document.querySelector("#drink-style").value;
    const customerName = document.querySelector("#customer-name").value.trim() || "Guest";
    const notes = orderNotes.value.trim();
    const count = Array.from(cart.values()).reduce((sum, entry) => sum + entry.qty, 0);
    const message =
      count === 0
        ? "Add a drink or treat before sending the order request."
        : `${customerName}'s ${count} item ${drinkStyle.toLowerCase()} order is ready for ${pickupTime}${notes ? ` (${notes})` : ""}.`;
    showToast(message);
    return;
  }

  if (event.target.closest("[data-booking-preview]")) {
    const eventType = document.querySelector("#event-type").value;
    const guests = document.querySelector("#event-guests").value || "guest count TBD";
    const date = document.querySelector("#event-date").value || "date TBD";
    const location = document.querySelector("#event-location").value.trim() || "location TBD";
    const message = `${eventType} request preview: ${guests} guests, ${date}, ${location}.`;
    showToast(message);
    return;
  }

  if (event.target.closest("[data-merch-preview]")) {
    const email = document.querySelector("#merch-email").value.trim();
    const message = email ? `Merch waitlist preview saved for ${email}.` : "Add an email before joining the merch waitlist.";
    showToast(message);
  }
});

renderMenu();
renderCart();
window.addEventListener("load", () => lucide.createIcons());
