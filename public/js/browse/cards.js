import { formatDate } from "/js/services/index.js";
import { applySearch } from "/js/browse/helper.js";

let controller = new AbortController();

export function fetchResults() {
  // Abort previous fetch request
  controller.abort();
  controller = new AbortController();

  const queryParams = new URL(window.location.href).searchParams;
  const queryString = queryParams.toString();
  const url = "/nlp-browse" + "?" + queryString;

  d3.select("#list-container").classed("blur-view", true);

  fetch(url, { signal: controller.signal })
    .then((response) => response.json())
    .then((data) => {
      const { status, hits } = data;
      if (status === "ok") {
        d3.select("#error-page").selectAll("*").remove();
        renderCards(hits);
      } else {
        // Show error message
        renderErrorPage();
      }
      d3.select("#list-container").classed("blur-view", false);
    })
    .catch((error) => {
      console.log("error ", error.message);
      d3.select("#list-container").classed("blur-view", false);
      if (error.message.includes("The user aborted a request")) {
        d3.select("#list-container").classed("blur-view", true);
      } else renderErrorPage();
    });
}

export function renderCards(data) {
  const resultsContainer = d3.select("#card-container");

  // Clear existing cards
  resultsContainer.selectAll("*").remove();
  d3.select("#error-page").selectAll("*").remove();

  resultsContainer
    .selectAll(".cell.medium-4")
    .data(data || [])
    .enter()
    .append("div")
    .attr("class", "cell medium-4")
    .append("div")
    .attr(
      "class",
      (blog) =>
        `content-card ${
          blog.meta.doc_type === "publications" ? "card-emphasize" : "card"
        }`
    )
    .html(
      (blog) => `
      <a href="${blog.url}" target="_blank">
        <h6 tabindex="0" data-viewport="false">${blog.meta.doc_type}</h6>
        <p class="ly-2"><small class="content-caption">${formatDate(
          blog.meta.date
        )}</small></p>
        <p class="ly-4"><small class="content-caption">${
          blog.countries[0] || ""
        }</small></p>
        <div class="content-caption">
          <h5 tabindex="0" data-viewport="false">${blog.title}</h5>
          <p>${blog.snippets || ""}</p>
          ${
            blog.countries.length
              ? `<div class='block pt-2 ly-3'>
            <hr/>
            <span class='article-country'>Mentioned countries: </span>
            <span class='fs-10'>${
              blog.countries?.slice(0, 3)?.join(", ") || ""
            } </span>
            ${
              blog.countries.length > 3
                ? `<span class="tooltip fs-10">...
              <i class='fa fa-info-circle fs-12'> </i>
              <span class="tooltiptext">${
                blog.countries?.join(", ") || ""
              }</span>
            </span>`
                : ""
            }
            <br/>
          </div>`
              : ""
          }
          <span class="cta__link cta--arrow">READ MORE <i></i></span>
        </div>
      </a>
    `
    );
}

export function renderErrorPage() {
  const container = d3.select("#error-page");
  container.selectAll("*").remove();
  d3.select(".pagination").remove();
  d3.select("#result-total").remove();
  d3.select("#card-container").remove();

  const errorBackground = container.classed("error-background", true);

  const middle = errorBackground.append("div").classed("middle", true);

  middle.append("h6").text("Error occurred");

  middle
    .append("a")
    .classed("button button-primary button-arrow", true)
    .attr("role", "button")
    .attr("href", "#")
    .text("Please try again")
    .on("click", function (e, d) {
      e.preventDefault();
      applySearch();
    });
}
