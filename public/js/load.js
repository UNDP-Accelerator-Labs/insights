import { d3 } from "/js/globals.js";
import { isLoading } from "/js/notification/loader.js";
import { updatePaginationLinks } from "/js/services/index.js";
import { applySearch, appendChips } from "/js/browse/helper.js";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/app.serviceWorker.js")
      .then((res) => console.log("service worker registered"))
      .catch((err) => console.log("service worker not registered", err));
  });
}

async function onLoad() {
  //LOAD DEFAULT UI SYSTEM FUNCTIONS
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

  isLoading(false);

  //SHOW LOADING ICON WHEN A SUBMIT BUTTON IS CLICKED
  d3.selectAll("form").on("submit", function () {
    isLoading(true);
  });

  // Add an event listener to the search input
  d3.select("#apply-search").on("click", function () {
    applySearch(true);
  });
  d3.select("#search-input").on("keypress", function (event) {
    if (event.key === "Enter") {
      applySearch();
    }
  });
  d3.select(".clear-search-filter").on("click", function () {
    window.location.href = "/browse";
    isLoading(true);
  });

  updatePaginationLinks();
  appendChips();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", onLoad);
} else {
  await onLoad();
}
