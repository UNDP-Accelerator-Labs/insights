import { isLoading, showToast } from "/js/notification/index.js";
import {
  updateQueryParams,
  autoCheckLists,
  appendChips,
  applySearch,
} from "/js/browse/helper.js";
import { fetchResults } from "/js/browse/cards.js";
import { years, months } from "/js/variables.js";

export function fetchStats(refreshPage) {
  const queryParams = new URL(window.location.href).searchParams;
  const queryString = queryParams.toString();
  const url = "/nlp-stats" + "?" + queryString;

  renderDateDropdowns(years, months, "#start-date", "start");
  renderDateDropdowns(years, months, "#end-date", "end");

  d3.select('#languageMenu').classed('blur-view', true)
  d3.select('#result-total').classed('blur-view', true)

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const {
        bureaus,
        countries,
        doc_type,
        languages,
        page,
        total_pages,
        total_r,
        grouped_date,
      } = data;
      d3.select("#result-total").text(`Showing ${total_r} results.`);
      renderBureauList(bureaus, countries);
      renderLanguageMenu(languages);

      renderDocumentTypeList(doc_type);
      renderPagination(page, total_pages);
      autoCheckLists();

     d3.select('#languageMenu').classed('blur-view', false)
     d3.select('#result-total').classed('blur-view', false)
    })
    .catch((error) => {
      d3.select("#list-container").classed("blur-view", false);
      console.error("Error fetching data:", error);
      showToast(
        "Error occurred while fetching stats. Please try again.",
        "danger",
        5000
      );
      d3.select(".toast").remove();
      d3.select('#languageMenu').classed('blur-view', false)
      d3.select('#result-total').classed('blur-view', false)
    });
}

function renderBureauList(bureau, country) {
  const ul = d3.select("#regionList"); // Select the ul element

  const li = ul
    .selectAll("li")
    .data(bureau)
    .enter()
    .append("li")
    .attr("role", "option")
    .classed("has-submenu", true);

  li.append("button")
    .attr("class", "checkbox-item")
    .text((d) => `${d.bureau} (${d.recordcount || 0})`);

  li.append("ul")
    .attr("role", "listbox")
    .attr("class", "sub-menu")
    .each(function (d) {
      const subUl = d3.select(this);
      const countries = country.filter(
        (country) => country.bureau === d.bureau
      );

      countries.forEach((country) => {
        const subLi = subUl.append("li").attr("role", "option");

        subLi
          .append("div")
          .attr("class", "form-check")
          .html(
            `<label for="${country.iso3}">${country.name} (${
              country.recordcount || 0
            })</label>
                  <input type="checkbox" id="${
                    country.iso3
                  }" name="country" data-bureau="${country.bureau}" value="${
              country.iso3
            }">`
          )
          .on("click", function (e, d) {
            applySearch();
          });
      });
    });
}

// Function to render the document type list
function renderDocumentTypeList(data) {
  const ul = d3.select("#documentList");

  const li = ul
    .selectAll("li")
    .data(data)
    .enter()
    .append("li")
    .attr("role", "option");

  li.append("div")
    .attr("class", "form-check")
    .html(
      (d) => `<label for="${d.key}">${d.label} (${d.value || 0})</label>
                 <input type="checkbox" id="${d.key}" name="doc_type" value="${
        d.key
      }">`
    )
    .on("click", function (e, d) {
      applySearch();
    });
}

// Function to render the language menu
function renderLanguageMenu(data) {
  const ul = d3.select("#languageMenu");

  const li = ul
    .selectAll("li")
    .data(data)
    .enter()
    .append("li")
    .attr("role", "menuitem");

  li.append("a")
    .attr("href", "#")
    .attr("lang", (d) => d.iso_lang)
    .attr("hreflang", (d) => d.lang)
    .attr("tabindex", "-1")
    .text((d) => d.lang)
    .on("click", function (event, d) {
      event.preventDefault();
      updateQueryParams("language", d.iso_lang);

      //IF PAGE IS GREATER THAN 1, RESET PAGE TO 1
      let page = d3.select("#current_page").node().value;
      if (+page !== 1) page = 1;
      updateQueryParams("page", 1);

      appendChips();
      fetchStats();
      fetchResults();
    });
}

export function renderPagination(currentPage, totalPages) {
  const paginationContainer = d3.select(".pagination");

  // Clear existing pagination
  paginationContainer.selectAll("*").remove();

  // Render new pagination
  const paginationList = paginationContainer.append("ul");

  if (currentPage > 1) {
    paginationList
      .append("li")
      .append("a")
      .attr("href", "#")
      .attr("role", "button")
      .attr("aria-label", "Previous")
      .attr("data-page", currentPage - 1)
      .text("Previous")
      .on("click", function (e, d) {
        e.preventDefault();
        const url = new URL(window.location.href);
        url.searchParams.set("page", +currentPage - 1);
        window.history.replaceState({}, "", url);

        fetchStats();
        fetchResults();
      });
  }

  d3.select("#current_page").property("value", currentPage);
  paginationList.append("li").text(`Page ${currentPage} of ${totalPages}`);

  if (currentPage < totalPages) {
    paginationList
      .append("li")
      .append("a")
      .attr("href", "#")
      .attr("role", "button")
      .attr("aria-label", "Next")
      .attr("data-page", currentPage + 1)
      .text("Next")
      .on("click", function (e, d) {
        e.preventDefault();
        const url = new URL(window.location.href);
        url.searchParams.set("page", +currentPage + 1);
        window.history.replaceState({}, "", url);

        fetchStats();
        fetchResults();
      });
  }
}

// Function to render the date list
function renderDateDropdowns(years, months, id, prefix = "start") {
  const container = d3.select(id);

  // Clear existing content
  container.selectAll("*").remove();

  if (id == "#start-date") container.append("h6").text("Start Date");
  else container.append("h6").text("End Date");

  // Append select-box div for month
  const monthSelectBoxDiv = container
    .append("div")
    .attr("class", "select-box block-inline")
    .attr("data-select", "")
    .on("click", function () {
      const expanded = !d3.select(this).classed("expanded");
      d3.select(this).classed("expanded", expanded);
      d3.select(this).select("ul").classed("active", expanded);
    });

  // Append button element for month selection
  monthSelectBoxDiv
    .append("button")
    .attr("type", "button")
    .attr("aria-haspopup", "listbox")
    .attr("aria-label", "Select")
    .attr("data-select-open", "")
    .attr("id", `${prefix}-month`)
    .text("Month");

  // Append ul element for month options
  const monthUl = monthSelectBoxDiv
    .append("ul")
    .attr("role", "listbox")
    .attr("data-select-options", "")
    .attr("id", `${prefix}-month-ul`)
    .attr("class", "h-3");

  // Add options for months
  months.forEach((month) => {
    monthUl
      .append("li")
      .attr("role", "option")
      .attr("tabindex", "0")
      .attr("data-value", month)
      .append("span")
      .text(month)
      .on("click", function () {
        d3.select(`#${prefix}-month`).text(month);
        checkSelectionValidity(prefix);
      });
  });

  // Append select-box div for year
  const yearSelectBoxDiv = container
    .append("div")
    .attr("class", "select-box block-inline")
    .attr("data-select", "")
    .on("click", function () {
      const expanded = !d3.select(this).classed("expanded");
      d3.select(this).classed("expanded", expanded);
      d3.select(this).select("ul").classed("active", expanded);
    });

  // Append button element for year selection
  yearSelectBoxDiv
    .append("button")
    .attr("type", "button")
    .attr("aria-haspopup", "listbox")
    .attr("aria-label", "Select")
    .attr("data-select-open", "")
    .attr("id", `${prefix}-year`)
    .text("Year");

  // Append ul element for year options
  const yearUl = yearSelectBoxDiv
    .append("ul")
    .attr("role", "listbox")
    .attr("data-select-options", "")
    .attr("id", `${prefix}-year-ul`)
    .attr("class", "h-3");

  // Add options for years
  years.forEach((year) => {
    yearUl
      .append("li")
      .attr("role", "option")
      .attr("tabindex", "0")
      .attr("data-value", year)
      .append("span")
      .text(year)
      .on("click", function () {
        d3.select(`#${prefix}-year`).text(year);
        checkSelectionValidity(prefix);
      });
  });

  // Function to check if both month and year have been selected
  function checkSelectionValidity(prefix) {
    const month = d3.select(`#${prefix}-month`).text();
    const year = d3.select(`#${prefix}-year`).text();

    // Check if both month and year have been selected
    if (month !== "Month" && year !== "Year") {
      applySearch();
    }
  }
}
