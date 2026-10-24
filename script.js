/* ==========================================================
   Smart General Store - script.js
   Owner: edit only the two sections marked "EDIT HERE".
   ========================================================== */
"use strict";

/* ============ EDIT HERE (1): STORE DETAILS ============ */
// Country code + number, digits only. Example: "919876543210"
const WHATSAPP_NUMBER = "91XXXXXXXXXX";

// EDIT THESE VALUES BEFORE LAUNCH. Delivery settings are estimates only;
// because this is a static website, customers can modify browser-side code.
const DELIVERY = { fixedCharge: 0, freeAbove: 0 }; // Set fixedCharge, e.g. 40. Set freeAbove to 999 for free delivery above ₹999.

const STORE = {
  name: "Smart General Store",
  address: "Shop No. 12, Main Market, Your City, Your State - 000000",
  phone: "+91 XXXXX XXXXX",
  hours: "Mon-Sat: 8:00 AM - 9:00 PM, Sun: 9:00 AM - 2:00 PM",
  mapsUrl: "https://maps.google.com/" // Paste your Google Maps share link here
};

/* ============ EDIT HERE (2): PRODUCT LIST ============
   Fields:
   id          - unique number. Never repeat an id.
   name        - product name
   price       - selling price in rupees
   mrp         - original price in rupees (must be >= price)
   category    - must match one name in CATEGORIES below
   emoji       - picture used when "image" is empty
   image       - optional photo link (e.g. "images/rice.jpg"). Leave "" to use emoji.
   description - one short line
   tags        - optional: "deal" (Today's deals), "best" (Best sellers), "featured"
*/
const CATEGORIES = [
  { name: "Grocery", icon: "🌾" },
  { name: "Snacks and Beverages", icon: "🥤" },
  { name: "Personal Care", icon: "🧴" },
  { name: "Home and Kitchen", icon: "🍳" },
  { name: "Stationery", icon: "✏️" },
  { name: "Electronics Accessories", icon: "🔌" },
  { name: "Daily Essentials", icon: "🧺" }
];

// DEMO PRODUCT DATA: verify every name, price, offer and image with the shop owner before launch.
const PRODUCTS = [
  { id: 1,  name: "Basmati Rice 5 kg",        price: 449, mrp: 560, category: "Grocery", emoji: "🍚", image: "", description: "Long grain, aged rice.", tags: ["best", "deal"] },
  { id: 2,  name: "Aata (Wheat Flour) 5 kg",  price: 235, mrp: 270, category: "Grocery", emoji: "🌾", image: "", description: "Fresh stone-ground aata.", tags: ["best"] },
  { id: 3,  name: "Refined Sunflower Oil 1 L", price: 139, mrp: 165, category: "Grocery", emoji: "🛢️", image: "", description: "Light oil for daily cooking.", tags: ["deal"] },
  { id: 4,  name: "Masala Chips (Pack of 5)", price: 50,  mrp: 60,  category: "Snacks and Beverages", emoji: "🥔", image: "", description: "Crunchy, spicy potato chips.", tags: ["best"] },
  { id: 5,  name: "Cold Drink 2 L",           price: 90,  mrp: 100, category: "Snacks and Beverages", emoji: "🥤", image: "", description: "Chilled and fizzy.", tags: ["featured"] },
  { id: 6,  name: "Tea Powder 500 g",         price: 215, mrp: 250, category: "Snacks and Beverages", emoji: "🍵", image: "", description: "Strong Assam tea.", tags: ["featured", "deal"] },
  { id: 7,  name: "Herbal Shampoo 340 ml",    price: 189, mrp: 260, category: "Personal Care", emoji: "🧴", image: "", description: "For smooth, strong hair.", tags: ["deal"] },
  { id: 8,  name: "Bathing Soap (Pack of 4)", price: 145, mrp: 180, category: "Personal Care", emoji: "🧼", image: "", description: "Gentle on skin.", tags: ["best"] },
  { id: 9,  name: "Non-stick Tawa 28 cm",     price: 399, mrp: 599, category: "Home and Kitchen", emoji: "🍳", image: "", description: "Even heating, easy to clean.", tags: ["featured"] },
  { id: 10, name: "Steel Water Bottle 1 L",   price: 249, mrp: 349, category: "Home and Kitchen", emoji: "🍶", image: "", description: "Rust-free stainless steel.", tags: ["featured"] },
  { id: 11, name: "Notebook (Pack of 6)",     price: 180, mrp: 240, category: "Stationery", emoji: "📓", image: "", description: "172 pages each, ruled.", tags: [] },
  { id: 12, name: "Gel Pens (Pack of 10)",    price: 99,  mrp: 130, category: "Stationery", emoji: "🖊️", image: "", description: "Smooth blue ink.", tags: ["best"] },
  { id: 13, name: "Fast Charging Cable 1 m",  price: 199, mrp: 399, category: "Electronics Accessories", emoji: "🔌", image: "", description: "Type-C, durable braided wire.", tags: ["deal", "featured"] },
  { id: 14, name: "Wired Earphones",          price: 249, mrp: 499, category: "Electronics Accessories", emoji: "🎧", image: "", description: "Clear sound with mic.", tags: [] },
  { id: 15, name: "Detergent Powder 1 kg",    price: 109, mrp: 130, category: "Daily Essentials", emoji: "🧺", image: "", description: "Tough on stains.", tags: ["best"] },
  { id: 16, name: "Toilet Cleaner 500 ml",    price: 89,  mrp: 110, category: "Daily Essentials", emoji: "🧽", image: "", description: "Kills germs, fresh smell.", tags: [] }
];

/* ============ CODE BELOW: no need to edit ============ */
const MAX_QTY = 20;
const CART_KEY = "sgs_cart_v1";
const $ = (s, el = document) => el.querySelector(s);
const rupee = n => "₹" + Number(n).toLocaleString("en-IN");
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const byId = id => PRODUCTS.find(p => p.id === id);

const state = { category: "All", query: "", sort: "default", offerTag: "deal", cart: loadCart() };

/* ---------- Cart storage (LocalStorage, this browser only) ---------- */
function loadCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY)) || {};
    const clean = {};
    for (const [id, q] of Object.entries(raw)) {
      const qty = Math.floor(Number(q));
      if (byId(Number(id)) && qty >= 1) clean[id] = Math.min(qty, MAX_QTY);
    }
    return clean;
  } catch (e) { return {}; }
}
function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(state.cart)); } catch (e) { /* storage blocked: cart works until page closes */ }
}

/* ---------- Images (emoji picture if no photo link) ---------- */
const BG = ["#E4F3EC", "#FFF3CC", "#FCE4E0", "#E3EEFA", "#EFE6F7"];
function placeholder(p) {
  const bg = BG[p.id % BG.length];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><rect width='200' height='200' fill='${bg}'/><text x='100' y='132' font-size='90' text-anchor='middle'>${p.emoji || "🛍️"}</text></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
// If a photo link is broken, fall back to the emoji picture.
document.addEventListener("error", e => {
  const img = e.target;
  if (img.tagName === "IMG" && img.dataset.pid && !img.dataset.failed) {
    img.dataset.failed = "1";
    img.src = placeholder(byId(Number(img.dataset.pid)));
  }
}, true);

const discount = p => (p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0);

/* ---------- Render: categories ---------- */
function renderCategories() {
  const all = [{ name: "All", icon: "🛍️" }, ...CATEGORIES];
  $("#cats").innerHTML = all.map(c =>
    `<button class="cat ${state.category === c.name ? "active" : ""}" data-cat="${esc(c.name)}"><span class="ico">${c.icon}</span><span>${esc(c.name)}</span></button>`
  ).join("");
}

/* ---------- Render: product card ---------- */
function cardHTML(p) {
  const d = discount(p);
  return `<article class="card">
    ${d ? `<span class="off">${d}% OFF</span>` : ""}
    <img class="card-img" src="${esc(p.image || placeholder(p))}" data-pid="${p.id}" alt="${esc(p.name)}" loading="lazy" width="200" height="200">
    <div class="card-body">
      <span class="card-cat">${esc(p.category)}</span>
      <h3 class="card-name">${esc(p.name)}</h3>
      <p class="card-desc">${esc(p.description)}</p>
      <div class="price"><b>${rupee(p.price)}</b>${d ? `<s>${rupee(p.mrp)}</s>` : ""}</div>
      <div class="card-actions">
        <button class="btn btn-outline" data-add="${p.id}">Add to Cart</button>
        <button class="btn btn-green" data-buy="${p.id}">Buy Now</button>
      </div>
    </div>
  </article>`;
}

/* ---------- Render: products with search, filter, sort ---------- */
function renderProducts() {
  let list = PRODUCTS.filter(p =>
    (state.category === "All" || p.category === state.category) &&
    p.name.toLowerCase().includes(state.query)
  );
  if (state.sort === "low") list.sort((a, b) => a.price - b.price);
  if (state.sort === "high") list.sort((a, b) => b.price - a.price);

  $("#productsTitle").textContent = state.category === "All" ? "All products" : state.category;
  $("#productGrid").innerHTML = list.map(cardHTML).join("");
  $("#noResults").hidden = list.length > 0;
}

/* ---------- Render: offers strip ---------- */
function renderOffers() {
  const list = PRODUCTS.filter(p => (p.tags || []).includes(state.offerTag));
  $("#offerStrip").innerHTML = list.length ? list.map(cardHTML).join("") : `<p>No items here yet.</p>`;
  document.querySelectorAll("#offerTabs .tab").forEach(t => t.classList.toggle("active", t.dataset.tag === state.offerTag));
}

/* ---------- Cart logic ---------- */
function cartTotals() {
  let count = 0, subtotal = 0;
  for (const [id, q] of Object.entries(state.cart)) {
    const p = byId(Number(id));
    if (p) { count += q; subtotal += p.price * q; }
  }
  const delivery = DELIVERY.freeAbove > 0 && subtotal >= DELIVERY.freeAbove ? 0 : DELIVERY.fixedCharge;
  return { count, subtotal, delivery, total: subtotal + delivery };
}

function addToCart(id, qty = 1) {
  const cur = state.cart[id] || 0;
  if (cur >= MAX_QTY) { toast(`Maximum ${MAX_QTY} per item`); return false; }
  state.cart[id] = Math.min(cur + qty, MAX_QTY);
  saveCart(); renderCart();
  return true;
}
function changeQty(id, delta) {
  const next = (state.cart[id] || 0) + delta;
  if (next < 1) return;
  if (next > MAX_QTY) { toast(`Maximum ${MAX_QTY} per item`); return; }
  state.cart[id] = next;
  saveCart(); renderCart();
}
function removeItem(id) {
  delete state.cart[id];
  saveCart(); renderCart();
}

function renderCart() {
  const { count, subtotal, delivery, total } = cartTotals();
  $("#cartCount").textContent = count;
  const empty = count === 0;
  $("#emptyCart").hidden = !empty;
  $("#cartFooter").hidden = empty;

  $("#cartItems").innerHTML = Object.entries(state.cart).map(([id, q]) => {
    const p = byId(Number(id));
    return `<div class="line">
      <img src="${esc(p.image || placeholder(p))}" data-pid="${p.id}" alt="" width="56" height="56">
      <div>
        <div class="line-name">${esc(p.name)}</div>
        <div>${rupee(p.price)} each</div>
        <div class="line-row">
          <div class="qty">
            <button data-dec="${id}" aria-label="Decrease quantity" ${q <= 1 ? "disabled" : ""}>−</button>
            <span>${q}</span>
            <button data-inc="${id}" aria-label="Increase quantity" ${q >= MAX_QTY ? "disabled" : ""}>+</button>
          </div>
          <strong>${rupee(p.price * q)}</strong>
          <button class="remove" data-remove="${id}">Remove</button>
        </div>
      </div>
    </div>`;
  }).join("");

  $("#subtotal").textContent = rupee(subtotal);
  $("#deliveryCharge").textContent = rupee(delivery);
  $("#total").textContent = rupee(total);
  $("#deliveryNote").textContent = DELIVERY.freeAbove > 0 ? `Delivery is free on orders of ${rupee(DELIVERY.freeAbove)} or more; otherwise ${rupee(DELIVERY.fixedCharge)}.` : `Estimated delivery charge: ${rupee(DELIVERY.fixedCharge)}. The shop must confirm the final amount.`;
}

/* ---------- Drawer open / close ---------- */
function openCart() {
  $("#drawer").classList.add("open");
  $("#drawer").setAttribute("aria-hidden", "false");
  $("#overlay").hidden = false;
  document.body.style.overflow = "hidden";
}
function closeCart() {
  $("#drawer").classList.remove("open");
  $("#drawer").setAttribute("aria-hidden", "true");
  $("#overlay").hidden = true;
  document.body.style.overflow = "";
}

/* ---------- Toast ---------- */
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---------- Checkout: validate and open WhatsApp ---------- */
function validateForm() {
  const name = $("#custName").value.trim();
  const phone = $("#custPhone").value.replace(/\s+/g, "");
  const address = $("#custAddress").value.trim();
  const landmark = $("#custLandmark").value.trim();
  const instructions = $("#custInstructions").value.trim();
  const errors = {};
  if (name.length < 2) errors.Name = "Enter your full name.";
  if (!/^[6-9]\d{9}$/.test(phone)) errors.Phone = "Enter a valid 10-digit Indian mobile number.";
  if (address.length < 10) errors.Address = "Enter your full delivery address (at least 10 characters).";

  for (const f of ["Name", "Phone", "Address"]) {
    $("#err" + f).textContent = errors[f] || "";
    $("#cust" + f).classList.toggle("invalid", !!errors[f]);
  }
  return Object.keys(errors).length ? null : { name, phone, address, landmark, instructions };
}

function buildMessage(c) {
  const { subtotal, delivery, total } = cartTotals();
  const lines = Object.entries(state.cart).map(([id, q], i) => {
    const p = byId(Number(id));
    return `${i + 1}. ${p.name} x ${q} = ${rupee(p.price * q)}`;
  });
  return [
    `*New Order - ${STORE.name}*`, "",
    `*Name:* ${c.name}`,
    `*Mobile:* ${c.phone}`,
    `*Address:* ${c.address}`,
    ...(c.landmark ? [`*Landmark:* ${c.landmark}`] : []),
    ...(c.instructions ? [`*Delivery instructions:* ${c.instructions}`] : []), "",
    `*Items:*`, ...lines, "",
    `*Subtotal:* ${rupee(subtotal)}`,
    `*Estimated delivery:* ${rupee(delivery)}`,
    `*Estimated total: ${rupee(total)}*`, "",
    `Please confirm availability and the final amount. This message is not sent until I press Send in WhatsApp.`
  ].join("\n");
}

function checkout(e) {
  e.preventDefault();
  if (cartTotals().count === 0) { toast("Your cart is empty"); return; }
  const customer = validateForm();
  if (!customer) return;

  if (!/^\d{10,15}$/.test(WHATSAPP_NUMBER)) {
    alert("Store setup needed: the shop owner has not set the WhatsApp number in script.js yet.");
    return;
  }
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage(customer))}`;
  window.open(url, "_blank", "noopener");
  toast("WhatsApp opened. Press Send to contact the store; this website does not save a shared order.");
}

/* ---------- Events (one listener for all buttons) ---------- */
document.addEventListener("click", e => {
  const t = e.target.closest("button, a");
  if (!t) return;
  const d = t.dataset;

  if (d.add) { if (addToCart(Number(d.add))) toast("Added to cart"); }
  else if (d.buy) { if (addToCart(Number(d.buy))) openCart(); }
  else if (d.inc) changeQty(d.inc, 1);
  else if (d.dec) changeQty(d.dec, -1);
  else if (d.remove) removeItem(d.remove);
  else if (d.cat) {
    state.category = d.cat;
    renderCategories(); renderProducts();
    $("#products").scrollIntoView();
  }
  else if (d.tag) { state.offerTag = d.tag; renderOffers(); }
  else if (t.id === "cartBtn") openCart();
  else if (t.id === "closeCart" || t.id === "startShopping") { closeCart(); if (t.id === "startShopping") $("#products").scrollIntoView(); }
  else if (t.id === "clearCart") { if (confirm("Remove all items from your cart?")) { state.cart = {}; saveCart(); renderCart(); } }
  else if (t.id === "resetBtn") { resetFilters(); }
  else if (t.id === "menuBtn") {
    const open = $("#nav").classList.toggle("open");
    t.setAttribute("aria-expanded", open);
  }
  else if (t.closest("#nav")) $("#nav").classList.remove("open");
});

function resetFilters() {
  state.category = "All"; state.query = ""; state.sort = "default";
  $("#searchInput").value = ""; $("#sortSelect").value = "default";
  renderCategories(); renderProducts();
}

$("#overlay").addEventListener("click", closeCart);
document.addEventListener("keydown", e => { if (e.key === "Escape") closeCart(); });
$("#checkoutForm").addEventListener("submit", checkout);
$("#sortSelect").addEventListener("change", e => { state.sort = e.target.value; renderProducts(); });
$("#searchInput").addEventListener("input", e => {
  state.query = e.target.value.trim().toLowerCase();
  renderProducts();
  if (state.query) $("#products").scrollIntoView();
});
// Phone field: digits only
$("#custPhone").addEventListener("input", e => { e.target.value = e.target.value.replace(/\D/g, ""); });

/* ---------- Fill store details into the page ---------- */
function fillStoreInfo() {
  document.querySelectorAll("[data-store]").forEach(el => {
    const k = el.dataset.store;
    if (k === "phoneLink") { el.textContent = STORE.phone; el.href = "tel:" + STORE.phone.replace(/[^\d+]/g, ""); }
    else el.textContent = STORE[k];
  });
  $("#waContact").href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello, I have a question about my order.")}`;
  $("#mapLink").href = STORE.mapsUrl;
  $("#year").textContent = new Date().getFullYear();
}

/* ---------- Start ---------- */
fillStoreInfo();
renderCategories();
renderOffers();
renderProducts();
renderCart();
