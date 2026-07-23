const config = {
  brandName: "Custom Apparel Co.",
  contactEmail: "hello@example.com",
  shippingFee: 6,
  prices: {
    "Basic tee": 20,
    "Premium tee": 25,
    Hoodie: 38,
    Crewneck: 34,
    "Long sleeve tee": 28,
  },
};

const products = [
  {
    label: "Everyday",
    name: "Graphic tees",
    price: "$20+",
    swatch: "#61cbd1",
    text: "Seasonal drops, business logos, family shirts, and custom sayings.",
  },
  {
    label: "Premium",
    name: "Boutique blanks",
    price: "$25+",
    swatch: "#e84f7f",
    text: "Comfort-style cotton, garment-dyed colors, and softer retail-ready pieces.",
  },
  {
    label: "Groups",
    name: "Teams and events",
    price: "Quote",
    swatch: "#6f55ba",
    text: "Schools, tournaments, reunions, fundraisers, staff shirts, and rush jobs.",
  },
  {
    label: "Business",
    name: "Workwear and signs",
    price: "Bulk quote",
    swatch: "#f5bf3f",
    text: "Polos, uniforms, decals, vinyl signs, window graphics, and promo gear.",
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

function renderBrand() {
  document.querySelectorAll("[data-brand-name]").forEach((node) => {
    node.textContent = config.brandName;
  });
  document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
    link.href = `mailto:${config.contactEmail}`;
    if (link.textContent.includes("@")) {
      link.textContent = config.contactEmail;
    }
  });
}

function renderProducts() {
  productGrid.innerHTML = products
    .map(
      (product) => `
        <article class="product-card">
          <div class="product-visual" style="--swatch: ${product.swatch}">
            <span class="shirt-icon" aria-hidden="true"></span>
          </div>
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
  const basePrice = config.prices[style] || 0;
  const shipping = fulfillment.includes("Ship") ? config.shippingFee : 0;
  const estimated = basePrice ? `$${basePrice * quantity + shipping}` : "Needs quote";

  enableCopy(`${config.brandName} order request
Name: ${formValue(data, "customerName")}
Email: ${formValue(data, "email")}
Phone: ${formValue(data, "phone")}

Style: ${style}
Size or size run: ${formValue(data, "size")}
Color: ${formValue(data, "color")}
Quantity: ${quantity}
Fulfillment: ${fulfillment}
Estimated starting total: ${estimated}

Design notes:
${formValue(data, "notes")}

Artwork reminder: send reference photos, logo files, and placement notes to ${config.contactEmail}`);

  showToast("Order summary ready");
});

quoteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(quoteForm);
  enableCopy(`${config.brandName} bulk quote request
Organization: ${formValue(data, "organization")}
Quantity: ${formValue(data, "quantity")}
Need: ${formValue(data, "need")}
Deadline: ${formValue(data, "deadline") || "Flexible"}

Please confirm product options, artwork needs, pricing, turnaround, and pickup or shipping details.`);
  document.querySelector("#order").scrollIntoView({ behavior: "smooth", block: "start" });
  showToast("Quote request previewed");
});

copyButton.addEventListener("click", async () => {
  if (!latestSummary) return;
  await navigator.clipboard.writeText(latestSummary);
  showToast("Summary copied");
});

renderBrand();
renderProducts();

window.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
