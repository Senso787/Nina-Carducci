/* --------------------------------------------------
   VARIABLES GLOBALES
--------------------------------------------------- */
let carouselIndex = 0;

let allImages = [];
let activeTag = "all";
let lightboxIndex = 0;

/* --------------------------------------------------
   INITIALISATION
--------------------------------------------------- */
function init() {
  initCarousel();
  initGallery();
}

document.addEventListener("DOMContentLoaded", init);

/* --------------------------------------------------
   CAROUSEL
--------------------------------------------------- */
function initCarousel() {
  const carousel = document.getElementById("carousel");
  const img = document.getElementById("carousel-image");
  if (!carousel || !img) return;

  const prevBtn = carousel.querySelector(".prev");
  const nextBtn = carousel.querySelector(".next");
  const dots = Array.from(carousel.querySelectorAll(".dot"));

  const slides = [
    {
      src: "./assets/images/slider/ryoji-iwata.jpg",
      alt: "Photo d'un homme marchant sur un passage piéton",
    },
    {
      src: "./assets/images/slider/nicholas-green.jpg",
      alt: "Spectateurs d'un concert de Nicholas Green",
    },
    {
      src: "./assets/images/slider/edward-cisneros.jpg",
      alt: "Couple s’embrassant en tenue de mariés avec le public",
    },
  ];

  function render() {
    img.src = slides[carouselIndex].src;
    img.alt = slides[carouselIndex].alt;

    dots.forEach((d) => d.classList.remove("active"));
    if (dots[carouselIndex]) dots[carouselIndex].classList.add("active");
  }

  function goTo(index) {
    carouselIndex = (index + slides.length) % slides.length;
    render();
  }

  prevBtn.addEventListener("click", () => goTo(carouselIndex - 1));
  nextBtn.addEventListener("click", () => goTo(carouselIndex + 1));

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      goTo(Number(dot.dataset.index));
    });
  });

  document.addEventListener("keydown", (e) => {
    // navigation clavier pour le carousel
    if (e.key === "ArrowLeft") goTo(carouselIndex - 1);
    if (e.key === "ArrowRight") goTo(carouselIndex + 1);
  });

  render();
}

/* --------------------------------------------------
   GALLERY
--------------------------------------------------- */
function initGallery() {
  const gallery = document.querySelector(".gallery");
  if (!gallery) return;

  allImages = Array.from(gallery.querySelectorAll("img.gallery-item"));

  buildGalleryGrid(gallery);
  buildTagsBar(gallery);
  setupTagClicks(gallery);
  setupLightbox(gallery);

  gallery.classList.remove("is-hidden");
}

function buildGalleryGrid(gallery) {
  const row = document.createElement("div");
  row.className = "gallery-items-row";

  allImages.forEach((img) => {
    const col = document.createElement("div");
    col.className = "item-column";
    col.appendChild(img);
    row.appendChild(col);
  });

  gallery.innerHTML = "";
  gallery.appendChild(row);
}

function buildTagsBar(gallery) {
  const tags = getUniqueTags(allImages);

  const ul = document.createElement("ul");
  ul.className = "tags-bar";

  ul.appendChild(createTag("Tous", "all", true));
  tags.forEach((tag) => ul.appendChild(createTag(tag, tag, false)));

  gallery.insertBefore(ul, gallery.firstChild);
}

function getUniqueTags(images) {
  const tags = [];
  images.forEach((img) => {
    const tag = img.dataset.galleryTag;
    if (tag && !tags.includes(tag)) tags.push(tag);
  });
  return tags;
}

function createTag(label, value, isActive) {
  const li = document.createElement("li");
  li.className = "nav-item";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "nav-link";
  btn.textContent = label;
  btn.dataset.imagesToggle = value;

  if (isActive) btn.classList.add("active-tag");

  li.appendChild(btn);
  return li;
}

function setupTagClicks(gallery) {
  gallery.addEventListener("click", (e) => {
    const btn = e.target.closest(".tags-bar .nav-link");
    if (!btn) return;

    if (btn.classList.contains("active-tag")) return;

    setActiveTagButton(gallery, btn);
    activeTag = btn.dataset.imagesToggle || "all";
    applyTagFilter();
  });
}

function setActiveTagButton(gallery, clicked) {
  const buttons = gallery.querySelectorAll(".tags-bar .nav-link");
  buttons.forEach((b) => b.classList.remove("active-tag"));
  clicked.classList.add("active-tag");
}

function applyTagFilter() {
  allImages.forEach((img) => {
    const tag = img.dataset.galleryTag;
    const col = img.closest(".item-column");
    const show = activeTag === "all" || tag === activeTag;
    col.style.display = show ? "" : "none";
  });
}

/* --------------------------------------------------
   LIGHTBOX
--------------------------------------------------- */
function setupLightbox(gallery) {
  const lightbox = document.getElementById("lightbox");
  const img = lightbox.querySelector(".lightbox-image");
  const closeBtn = lightbox.querySelector(".lightbox-close");
  const prevBtn = lightbox.querySelector(".lightbox-prev");
  const nextBtn = lightbox.querySelector(".lightbox-next");

  gallery.addEventListener("click", (e) => {
    const clickedImg = e.target.closest("img.gallery-item");
    if (!clickedImg) return;

    const visible = getVisibleImages();
    lightboxIndex = visible.findIndex((i) => i.src === clickedImg.src);
    if (lightboxIndex < 0) lightboxIndex = 0;

    openLightbox(visible[lightboxIndex].src, clickedImg.alt);
  });

  closeBtn.addEventListener("click", closeLightbox);
  prevBtn.addEventListener("click", () => navigateLightbox(-1));
  nextBtn.addEventListener("click", () => navigateLightbox(1));

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("open")) return;

    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") navigateLightbox(-1);
    if (e.key === "ArrowRight") navigateLightbox(1);
  });

  function openLightbox(src, alt) {
    img.src = src;
    img.alt = alt || "Photo agrandie";
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
  }

  function navigateLightbox(step) {
    const visible = getVisibleImages();
    if (visible.length === 0) return;

    lightboxIndex = (lightboxIndex + step + visible.length) % visible.length;
    openLightbox(visible[lightboxIndex].src, visible[lightboxIndex].alt);
  }
}

function getVisibleImages() {
  if (activeTag === "all") {
    return allImages.filter(
      (img) => img.closest(".item-column").style.display !== "none",
    );
  }
  return allImages.filter((img) => img.dataset.galleryTag === activeTag);
}
