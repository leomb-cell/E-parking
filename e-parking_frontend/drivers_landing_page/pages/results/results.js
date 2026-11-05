// Resultados da busca: monta os cards dos estacionamentos com JavaScript, com filtros e ordenação.

const params = new URLSearchParams(location.search);
const parkingList = document.getElementById("parkingList");
const cardTemplate = document.getElementById("parkingCardTemplate");
const resultCount = document.getElementById("resultCount");
const emptyMessage = document.getElementById("emptyMessage");
const sortSelect = document.getElementById("sortSelect");
const filterButtons = document.querySelectorAll(".filter");

const activeFilters = new Set();

renderSessionLinks(document.getElementById("sessionLinks"), "../../");

const destination = params.get("destination");
if (destination) document.getElementById("searchText").textContent = destination;

const sortFunctions = {
  rating: (a, b) => b.rating - a.rating,
  price: (a, b) => a.price - b.price,
  spots: (a, b) => b.spots - a.spots
};

function parkingUrl(parking) {
  const query = new URLSearchParams({ id: parking.id });
  ["destination", "date", "time"].forEach(key => {
    if (params.get(key)) query.set(key, params.get(key));
  });
  return `../parking/parking.html?${query}`;
}

function createParkingCard(parking) {
  const card = cardTemplate.content.firstElementChild.cloneNode(true);
  card.querySelector(".parking-name").textContent = parking.name;
  card.querySelector(".parking-address").textContent = parking.address;
  card.querySelector(".rating-value").textContent = `★ ${parking.rating.toFixed(1)}`;
  card.querySelector(".rating-label").textContent = ratingLabel(parking.rating);
  card.querySelector(".price-value").textContent = formatCurrency(parking.price);
  card.querySelector(".btn").href = parkingUrl(parking);

  const chips = card.querySelector(".chips");
  const spotsChip = document.createElement("span");
  spotsChip.className = "chip available";
  spotsChip.textContent = `${parking.spots} vagas disponíveis`;
  chips.appendChild(spotsChip);

  parking.features.forEach(feature => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = feature;
    chips.appendChild(chip);
  });

  return card;
}

function renderParkings() {
  const visibleParkings = PARKINGS
    .filter(parking => [...activeFilters].every(feature => parking.features.includes(feature)))
    .sort(sortFunctions[sortSelect.value]);

  parkingList.replaceChildren(...visibleParkings.map(createParkingCard));

  const total = visibleParkings.length;
  resultCount.textContent = total === 1 ? "1 opção encontrada" : `${total} opções encontradas`;
  emptyMessage.hidden = total > 0;
}

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    const feature = button.dataset.feature;
    const isActive = activeFilters.has(feature);
    if (isActive) activeFilters.delete(feature);
    else activeFilters.add(feature);
    button.classList.toggle("active", !isActive);
    button.setAttribute("aria-pressed", String(!isActive));
    renderParkings();
  });
});

sortSelect.addEventListener("change", renderParkings);

renderParkings();
