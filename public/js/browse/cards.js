import { formatDate } from "/js/services/index.js";
import { isLoading, showToast } from "/js/notification/index.js";

export function fetchResults(refreshPage) {
  const queryParams = new URL(window.location.href).searchParams;
  const queryString = queryParams.toString();
  const url = "/nlp-browse" + "?" + queryString;

  if (refreshPage) isLoading(true);

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const { status, hits } = data;
      if (status === "ok") {
        renderCards(hits);
      } else {
        // Show error message
        showToast("Error occurred. Please try again.", "danger", 5000);
      }
      isLoading(false);
    })
    .catch((error) => {
      isLoading(false);
      showToast("Error occurred while fetching data. Please try again.", "danger", 5000);
    });
}

export function renderCards(data) {
  const resultsContainer = d3.select("#card-container");

  // Clear existing cards
  resultsContainer.selectAll("*").remove();

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
        <p><small class="content-caption">${formatDate(
          blog.meta.date
        )}</small></p>
        <h6>${blog.country ?? ""}</h6>
        <div class="content-caption">
          <h5 tabindex="0" data-viewport="false">${blog.title}</h5>
          <p>${blog.snippets || ""}</p>
          <span class="cta__link cta--arrow">READ MORE <i></i></span>
        </div>
      </a>
    `
    );
}
