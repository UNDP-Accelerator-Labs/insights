
import { fetchStats } from '/js/browse/load.js'
import { fetchResults } from '/js/browse/cards.js'

document.addEventListener("DOMContentLoaded", () => {
    fetchStats();
    fetchResults()
});
