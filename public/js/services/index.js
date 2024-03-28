import { d3 } from "/js/globals.js";
import { fetchStats } from '/js/browse/load.js'
import { fetchResults } from '/js/browse/cards.js'

export function updatePaginationLinks() {
  const paginationLinks = d3.selectAll('.pagination a[role="button"]');

  paginationLinks.on("click", function () {
    const targetPage = parseInt(this.getAttribute("data-page"), 10);

    // Update the page in the URL and trigger the search query update
    const queryParams = new URL(window.location.href).searchParams;
    queryParams.set("page", targetPage);
    fetchStats();
    fetchResults()
  });
}

export function formatDate(inputDate) {
  const date = new Date(inputDate);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Get the components of the date
  const year = date.getFullYear();
  const month = date.getMonth(); 
  const day = date.getDate();

  // Format the date string
  const formattedDate = `${months[month]} ${day}, ${year}`;

  return formattedDate;
}
