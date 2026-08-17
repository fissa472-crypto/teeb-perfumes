(() => {
  const eros = "https://f.nooncdn.com/p/pzsku/ZF81F5984D9406950E0B6Z/45/_/1779713614/02f87c67-35c7-4c9f-b8eb-20daf8cba367.jpg";
  try {
    const products = JSON.parse(localStorage.getItem("teeb_products") || "[]");
    if (Array.isArray(products)) {
      const p = products.find(x => x.id === "eros-najim");
      if (p) { p.image = eros; localStorage.setItem("teeb_products", JSON.stringify(products)); }
    }
  } catch(e) {}
  function fixImages() {
    document.querySelectorAll('img').forEach(img => {
      if ((img.alt || "").toLowerCase().includes("versace eros najim")) img.src = eros;
    });
  }
  fixImages();
  document.addEventListener("DOMContentLoaded", fixImages);
  setTimeout(fixImages, 300);
  setTimeout(fixImages, 1000);
})();
