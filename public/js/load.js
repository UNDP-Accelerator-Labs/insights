import { d3 } from "/js/globals.js";
import { isLoading } from "/js/notification/loader.js";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/app.serviceWorker.js")
      .then((res) => console.log("service worker registered"))
      .catch((err) => console.log("service worker not registered", err));
  });
}

function updateSearchQuery(resetPage) {
  const searchInputValue = document.getElementById("search-input").value;
  const selectedCountries = d3
    .selectAll('input[name="country"]:checked')
    .nodes()
    .map((node) => node.value);
  const selectedArticleTypes = d3
    .selectAll('input[name="article_type"]:checked')
    .nodes()
    .map((node) => node.value);

  const selectedLanguages = d3
    .selectAll('input[name="language"]:checked')
    .nodes()
    .map((node) => node.value);

  const selectedBureau = d3
    .selectAll('input[name="bureau"]:checked')
    .nodes()
    .map((node) => node.value);

  //RESET PAGE TO 1 IF NEW PARAMETERS ARE ADDED TO QUERY PARAMS
  let page = d3.select("#current_page").node().value;
  if (resetPage) page = 1;

  const queryParamsArray = [];

  queryParamsArray.push(`search=${encodeURIComponent(searchInputValue)}`);

  if (selectedCountries.length > 0) {
    const countriesParam = selectedCountries
      .map((country) => encodeURIComponent(country))
      .join("&country=");
    queryParamsArray.push(`country=${countriesParam}`);
  }

  if (selectedArticleTypes.length > 0) {
    const articleTypesParam = selectedArticleTypes
      .map((type) => encodeURIComponent(type))
      .join("&type=");
    queryParamsArray.push(`type=${articleTypesParam}`);
  }

  if (selectedLanguages.length > 0) {
    const languageParams = selectedLanguages
      .map((language) => encodeURIComponent(language))
      .join("&language=");
    queryParamsArray.push(`language=${languageParams}`);
  }

  if (selectedBureau.length > 0) {
    const bureauParams = selectedBureau
      .map((bureau) => encodeURIComponent(bureau))
      .join("&bureau=");
    queryParamsArray.push(`bureau=${bureauParams}`);
  }

  if (page) {
    queryParamsArray.push(`page=${page}`);
  }

  const searchQuery = queryParamsArray.join("&");

  if (searchQuery !== "") {
    window.location.href = `/browse?${searchQuery}`;
    isLoading(true);
  }
}

function updatePaginationLinks() {
  const paginationLinks = d3.selectAll('.pagination a[role="button"]');

  paginationLinks.on("click", function () {
    const targetPage = parseInt(this.getAttribute("data-page"), 10);

    // Update the page in the URL and trigger the search query update
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set("page", targetPage);
    window.location.href = `/browse?${queryParams.toString()}`;
    isLoading(true);
  });
}

async function onLoad() {
  navigationInitialize();
  navigationOverFlow();
  navigationMultiLevelEdgeDetection();

  accordion();
  sidebarNav();
  sidebarMenu();

  langSwitch();

  accordion('[data-accordion="mobile"]', ".footer-panel", "active");
  expandToSize(".pagehero-full");
  expandToSize(".homepage-hero-full");
  swiper(".fluid-carousel", ".slide-content");
  statsHover();

  expandSearch();
  multiSelect();
  toggleFilter();
  swiper(".stats-card-slider");
  // parallaxEffect('.stats-card-slider');

  //SHOW LOADING ICON WHEN A SUBMIT BUTTON IS CLICKED
  d3.selectAll("form").on("submit", function () {
    isLoading(true);
  });

  isLoading(false);

  // Add event listeners to the checkboxes
  // d3.selectAll('input[name="country"], input[name="article_type"]').on('change', updateSearchQuery);

  // Add an event listener to the search input
  d3.select("#apply-search").on("click", function () {
    updateSearchQuery(true);
  });
  d3.select("#search-input").on("keypress", function (event) {
    if (event.key === "Enter") {
      updateSearchQuery();
    }
  });
  d3.select(".clear-search-filter").on("click", function () {
    window.location.href = "/browse";
    isLoading(true);
  });

  const queryParams = new URLSearchParams(window.location.search);
  // Autofill search input
  const searchInput = document.getElementById("search-input");
  const searchParam = queryParams.get("search");
  if (searchParam) {
    searchInput.value = decodeURIComponent(searchParam.replace(/"/g, ""));
  }

  // Autofill countries checkboxes
  const countryCheckboxes = d3.selectAll('input[name="country"]');
  countryCheckboxes.nodes().forEach((node) => {
    const countryValue = node.value;
    if (queryParams.getAll("country").includes(countryValue)) {
      node.checked = true;
    }
  });

  // Autofill document checkboxes
  const documentCheckboxes = d3.selectAll('input[name="article_type"]');
  documentCheckboxes.nodes().forEach((node) => {
    const documentValue = node.value;
    if (queryParams.getAll("type").includes(documentValue)) {
      node.checked = true;
    }
  });

  // Autofill language checkboxes
  const languageCheckboxes = d3.selectAll('input[name="language"]');
  languageCheckboxes.nodes().forEach((node) => {
    const documentValue = node.value;
    if (queryParams.getAll("language").includes(documentValue)) {
      node.checked = true;
    }
  });

  // Create and append chips for query parameters
  const selectedChipsContainer = d3.select(".selected-chips");
  queryParams.forEach((value, key) => {
    if (value && key !== "page") {
      const chip = selectedChipsContainer
        .append("span")
        .attr("class", "chip chip__cross")
        .attr("tabindex", "0")
        .attr("role", "button")
        .attr("option-name", key)
        .text(`${key.toUpperCase()} (${value})`);

      // Add an event listener to remove the chip when clicked
      chip.on("click", function () {
        const updatedQueryParams = new URLSearchParams(window.location.search);
        updatedQueryParams.set("page", "1");
        updatedQueryParams.delete(key);
        window.location.href = `/browse?${updatedQueryParams.toString()}`;
        isLoading(true);
      });
    }

    if (value) {
      const clearAllButton = d3.select(".clear-search-filter");
      clearAllButton.style("display", "block");
    }
  });

  updatePaginationLinks();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", onLoad);
} else {
  await onLoad();
}
