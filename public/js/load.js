import { d3 } from "/js/globals.js";
import { isLoading } from "/js/notification/loader.js";
import {
  updateSearchQuery,
  updatePaginationLinks,
} from "/js/services/index.js";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/app.serviceWorker.js")
      .then((res) => console.log("service worker registered"))
      .catch((err) => console.log("service worker not registered", err));
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
  parallaxEffect(".stats-card-slider");

  //SHOW LOADING ICON WHEN A SUBMIT BUTTON IS CLICKED
  d3.selectAll("form").on("submit", function () {
    isLoading(true);
  });

  isLoading(false);


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

  d3.selectAll(".dropdown-language a").on("click", function () {
    var selectedLanguage = d3.select(this).attr("lang");
    var url = new URL(window.location.href);
    url.searchParams.set("language", selectedLanguage);
    window.location.href = url;
    isLoading(true);
  });

  updatePaginationLinks();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", onLoad);
} else {
  await onLoad();
}
