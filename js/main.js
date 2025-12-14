const previewGrid = document.getElementById("previewGrid");
const modal = document.getElementById("productModal");
const modalImg = document.getElementById("modalImg");
const modalName = document.getElementById("modalName");
const modalDescription = document.getElementById("modalDescription");
const modalPrice = document.getElementById("modalPrice");
const closeBtn = document.querySelector(".close");

if (previewGrid) {
    products.slice(0, 3).forEach(product => {
        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <span>$${product.price}</span>
    `;

        // Показ модального окна
        card.addEventListener("click", () => {
            modal.style.display = "block";
            modalImg.src = product.image;
            modalName.textContent = product.name;
            modalDescription.textContent = product.description;
            modalPrice.textContent = `$${product.price}`;
        });

        previewGrid.appendChild(card);
    });
}

// Закрытие модального окна
closeBtn.onclick = () => modal.style.display = "none";

// Закрытие при клике вне модального контента
window.onclick = (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
};