
import { fetchStats } from '/js/browse/load.js'
import { fetchResults } from '/js/browse/cards.js'
import { handleDateInputChange, autoCheckLists } from '/js/browse/helper.js'

document.addEventListener("DOMContentLoaded", () => {
    fetchStats();
    fetchResults();
    autoCheckLists()
    // Add event listeners to date input fields
    d3.select("#startdate").on("change", handleDateInputChange);
    d3.select("#enddate").on("change", handleDateInputChange);

});
