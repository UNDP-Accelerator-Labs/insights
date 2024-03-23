import { isLoading } from "/js/notification/loader.js";
import {
  updateQueryParams,
  autoCheckLists,
  appendChips,
} from "/js/browse/helper.js";
import { fetchResults } from "/js/browse/cards.js";

export function fetchStats() {
  const queryParams = new URL(window.location.href).searchParams;
  const queryString = queryParams.toString();
  const url = "/nlp-stats" + "?" + queryString;

  isLoading(true);
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const { bureaus, countries, doc_type, languages, page, total_pages, total_r } = data;
      d3.select("#result-total").text(
        `Showing ${total_r} results.`
      );
      renderBureauList(bureaus, countries);
      renderLanguageMenu(languages);

      renderDocumentTypeList(doc_type);
      renderPagination(page, total_pages)

      autoCheckLists();
      isLoading(false);
    })
    .catch((error) => {
      isLoading(false);
      console.error("Error fetching data:", error);
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

        subLi.append("div").attr("class", "form-check").html(`<label for="${
          country.iso3
        }">${country.name} (${country.recordcount || 0})</label>
                  <input type="checkbox" id="${
                    country.iso3
                  }" name="country" data-bureau="${country.bureau}" value="${
          country.iso3
        }">`);
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
    );
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
        paginationList.append("li")
            .append("a")
            .attr("href", "#")
            .attr("role", "button")
            .attr("aria-label", "Previous")
            .attr("data-page", currentPage - 1)
            .text("Previous")
            .on("click", function(e,d) {
                e.preventDefault();
                const url = new URL(window.location.href);
                url.searchParams.set('page', +currentPage - 1);
                window.history.replaceState({}, "", url);

                fetchStats();
                fetchResults()
            });
    }

    d3.select('#current_page').property('value', currentPage);
    paginationList.append("li")
        .text(`Page ${currentPage} of ${totalPages}`);

    if (currentPage < totalPages) {
        paginationList.append("li")
            .append("a")
            .attr("href", "#")
            .attr("role", "button")
            .attr("aria-label", "Next")
            .attr("data-page", currentPage + 1)
            .text("Next")
            .on("click", function(e,d) {
                e.preventDefault();
                const url = new URL(window.location.href);
                url.searchParams.set('page', +currentPage + 1);
                window.history.replaceState({}, "", url);

                fetchStats();
                fetchResults()
            });
    }
}

