import { fetchStats } from "/js/browse/load.js";
import { fetchResults } from "/js/browse/cards.js";
import { showToast } from "/js/notification/index.js";

export function updateQueryParams(key, value, remove = false) {
  const url = new URL(window.location.href);
  const queryParams = url.searchParams;

  if (remove) {
    // Get all values for the specified key
    const values = queryParams.getAll(key);
    // Remove all occurrences of the specified value from the array
    const filteredValues = values.filter((v) => v !== value);

    // Remove all occurrences of the key from the URL
    queryParams.delete(key);

    // Add back the filtered values if there are any
    if (filteredValues.length > 0) {
      filteredValues.forEach((v) => queryParams.append(key, v));
    }
  } else {
    url.searchParams.set(key, value);
  }

  window.history.replaceState({}, "", url);
}

export function getAllQueryParams() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const queryParams = {};

  for (const [key, value] of urlParams.entries()) {
    queryParams[key] = value;
  }

  return queryParams;
}

export function applySearch(resetPage) {
  const searchInputValue = document.getElementById("search-input").value;
  const selectedCountries = d3
    .selectAll('input[name="country"]:checked')
    .nodes()
    .map((node) => node.value);
  const selectedDocTypes = d3
    .selectAll('input[name="doc_type"]:checked')
    .nodes()
    .map((node) => node.value);

  const startMonth = d3.select("#start-month").text();
  const startYear = d3.select("#start-year").text();
  const endMonth = d3.select("#end-month").text();
  const endYear = d3.select("#end-year").text();

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

  if (selectedDocTypes.length > 0) {
    const docTypesParam = selectedDocTypes
      .map((type) => encodeURIComponent(type))
      .join("&type=");
    queryParamsArray.push(`type=${docTypesParam}`);
  }

  if (startMonth && startMonth != "Month" && startYear && startYear != "Year") {
    queryParamsArray.push(`start=${startMonth},${startYear}`);
  }

  if (endMonth && endMonth != "Month" && endYear && endYear != "Year") {
    queryParamsArray.push(`end=${endMonth},${endYear}`);
  }

  if (page) {
    queryParamsArray.push(`page=${page}`);
  }

  const searchQuery = queryParamsArray.join("&");
  const url = `/browse?${searchQuery}`;

  if (searchQuery !== "") {
    window.history.replaceState({}, "", url);
    fetchStats(false);
    fetchResults(false);
    appendChips();
  }
}

export function autoCheckLists() {
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
  const documentCheckboxes = d3.selectAll('input[name="doc_type"]');
  documentCheckboxes.nodes().forEach((node) => {
    const documentValue = node.value;
    if (queryParams.getAll("type").includes(documentValue)) {
      node.checked = true;
    }
  });

  const [startmonth, startyear] = queryParams.get("start")?.split(",") || [
    null,
    null,
  ];
  const [endmonth, endyear] = queryParams.get("end")?.split(",") || [
    null,
    null,
  ];

  if (startmonth && startyear) {
    d3.select("#start-month").text(startmonth);
    d3.select("#start-year").text(startyear);
  }
  if (endmonth && endyear) {
    const d1 = new Date(`${startmonth},${startyear}`)
    const d2 = new Date(`${endmonth},${endyear}`)

    if(d2 < d1 ) showToast(
        "Invalid date input. The end date cannot be before the start date.",
        "danger",
        5000
      );
    else {
        d3.select("#end-month").text(endmonth);
        d3.select("#end-year").text(endyear);   
    }
  }
}

export function appendChips() {
  // Create and append chips for query parameters
  const selectedChipsContainer = d3.select(".selected-chips");
  const queryParams = new URLSearchParams(window.location.search);

  // Remove all existing chips before adding new ones
  selectedChipsContainer.selectAll(".chip").remove();

  queryParams.forEach((value, key) => {
    if (value && key !== "page") {
      let existingChip;
      if (key == "language")
        existingChip = selectedChipsContainer.select(
          `span[option-name="${key}"]`
        );
      else
        existingChip = selectedChipsContainer.select(
          `span[option-name="${key}"][option-value="${value}"]`
        );

      if (existingChip.empty()) {
        // Chip doesn't exist, create a new one
        const chip = selectedChipsContainer
          .append("span")
          .attr("class", "chip chip__cross")
          .attr("tabindex", "0")
          .attr("role", "button")
          .attr("option-name", key)
          .attr("option-value", value)
          .text(`${key.toUpperCase()} (${value})`);

        // Add an event listener to remove the chip when clicked
        chip.on("click", function () {
          const updatedQueryParams = new URLSearchParams(
            window.location.search
          );
          updatedQueryParams.set("page", "1");
          updateQueryParams(key, value, true);
          fetchStats();
          fetchResults();
        });
      } else {
        // Chip exists, update its text content
        existingChip.text(`${key.toUpperCase()} (${value})`);
      }
    }

    if (value) {
      const clearAllButton = d3.select(".clear-search-filter");
      clearAllButton.style("display", "block");
    }
  });
}

export function handleDateInputChange() {
  const startDate = document.getElementById("startdate").value;
  const endDate = document.getElementById("enddate").value;

  const isValidStartDate =
    new Date(startDate) instanceof Date && !isNaN(new Date(startDate));
  const isValidEndDate =
    new Date(endDate) instanceof Date && !isNaN(new Date(endDate));

  // Check if both start and end dates are valid
  if (startDate && endDate) {
    // Check if both start and end dates are valid dates
    if (isValidStartDate && isValidEndDate) {
      // Check if end date is greater than or equal to start date
      if (new Date(endDate) >= new Date(startDate)) {
        // Update URL with start and end dates
        updateQueryParams("start", startDate);
        updateQueryParams("end", endDate);
        d3.select("#date-error").text("");
      } else {
        // Show error message for invalid date range
        d3.select("#date-error").text(
          "End date must be greater than or equal to start date"
        );
      }
    } else {
      // Show error message for invalid dates
      d3.select("#date-error").text("Please enter valid start and end dates");
    }
  } else if (!isValidStartDate && isValidEndDate) {
    d3.select("#date-error").text("Please enter valid start and end dates");
  } else if (isValidStartDate && !isValidEndDate) {
    updateQueryParams("start", startDate);
    updateQueryParams("end", new Date().toDateString());
    d3.select("#date-error").text("");
  }
}
