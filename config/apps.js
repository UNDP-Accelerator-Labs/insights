exports.app_title = "Insights Hub";
exports.app_title_short = "sdg-commons-blogs";
exports.app_suite = "acclab_platform";
exports.app_suite_secret = process.env.APP_SUITE_SECRET || "secret";

exports.app_storage = "https://acclabplatforms.blob.core.windows.net/";
exports.own_app_url = "https://insights.sdg-innovation-commons.org";

const base_host = "sdg-innovation-commons.org";
exports.app_base_host = base_host;
exports.app_suite_url = `https://www.${base_host}/`;
exports.sso_app_url = "https://login.sdg-innovation-commons.org";

exports.blogapi_url =
  process.env.NODE_ENV === "production"
    ? "blog-api-scrapper.azurewebsites.net/blogs/"
    : "http://localhost:4000/blogs/";
exports.page_content_limit = 15;

exports.acclab_suites = [
  {
    title: "Solutions",
    url: "https://solutions.sdg-innovation-commons.org/en/browse/pads/public",
  },
  {
    title: "Action plans",
    url: "https://learningplans.sdg-innovation-commons.org/en/browse/pads/public",
  },
  {
    title: "Experiments",
    url: "https://experiments.sdg-innovation-commons.org/en/browse/pads/public",
  },
  {
    title: "Insights",
    url: "https://sdg-innovation-commons.org/",
  },
];
