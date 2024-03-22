import { d3 } from "/js/globals.js";
import { isLoading } from "/js/notification/loader.js";

export function updateSearchQuery(resetPage) {
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

export function updatePaginationLinks() {
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
