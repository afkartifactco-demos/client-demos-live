const products = [
  {
    label: "Weekly drops",
    name: "Graphic tees",
    price: "$20+",
    image: "assets/product-01.jpg",
    text: "Ready-to-order designs, seasonal drops, and custom sayings for adults and youth.",
  },
  {
    label: "Comfort Colors",
    name: "Premium cotton tees",
    price: "$25",
    image: "assets/product-04.jpg",
    text: "Preshrunk cotton blanks with bright prints and laid-back boutique color options.",
  },
  {
    label: "Rush capable",
    name: "Event shirts",
    price: "Quote",
    image: "assets/product-08.jpg",
    text: "School, team, family, and last-minute event apparel with clear deadline handling.",
  },
  {
    label: "Business growth",
    name: "Workwear and promos",
    price: "Bulk quote",
    image: "assets/product-09.jpg",
    text: "Polos, tees, jerseys, vinyl signage, and window graphics for local brands.",
  },
];

const productGrid = document.querySelector("[data-products]");
const orderForm = document.querySelector("[data-order-form]");
const quoteForm = document.querySelector("[data-quote-form]");
const summary = document.querySelector("[data-summary]");
const copyButton = document.querySelector("[data-copy]");
const toast = document.querySelector("[data-toast]");

let latestSummary = "";

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function renderProducts() {
  productGrid.innerHTML = products
    .map(
      (product) => `
        <article class="product-card">
          <img src="${product.image}" alt="${product.name}" />
          <div>
            <small>${product.label} | ${product.price}</small>
            <h3>${product.name}</h3>
            <p>${product.text}</p>
          </div>
        </article>
      `
    )
    .join("");
}

function formValue(formData, key) {
  return String(formData.get(key) || "").trim();
}

function enableCopy(text) {
  latestSummary = text;
  summary.textContent = text;
  copyButton.disabled = false;
}

orderForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(orderForm);
  const quantity = Number(formValue(data, "quantity") || "1");
  const style = formValue(data, "style");
  const fulfillment = formValue(data, "fulfillment");
  const basePrice = style === "Comfort Colors tee" ? 25 : style === "Regular 50/50 tee" ? 20 : 0;
  const shipping = fulfillment.includes("Ship") ? 6 : 0;
  const estimated = basePrice ? `$${basePrice * quantity + shipping}` : "Needs quote";

  enableCopy(`Brewers Creative Designs shirt order
Name: ${formValue(data, "customerName")}
Email: ${formValue(data, "email")}
Phone: ${formValue(data, "phone")}

Style: ${style}
Size: ${formValue(data, "size")}
Color: ${formValue(data, "color")}
Quantity: ${quantity}
Fulfillment: ${fulfillment}
Estimated starting total: ${estimated}

Design notes:
${formValue(data, "notes")}

Artwork reminder: email reference photo or image file to Brewerscreativedesigns@gmail.com`);

  showToast("Order summary ready");
});

quoteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(quoteForm);
  enableCopy(`Brewers Creative Designs bulk quote request
Organization: ${formValue(data, "organization")}
Quantity: ${formValue(data, "quantity")}
Need: ${formValue(data, "need")}
Deadline: ${formValue(data, "deadline") || "Flexible"}

Please confirm apparel options, artwork needs, pricing, and pickup or shipping details.`);
  document.querySelector("#order").scrollIntoView({ behavior: "smooth", block: "start" });
  showToast("Quote request previewed");
});

copyButton.addEventListener("click", async () => {
  if (!latestSummary) return;
  await navigator.clipboard.writeText(latestSummary);
  showToast("Summary copied");
});

renderProducts();

window.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
