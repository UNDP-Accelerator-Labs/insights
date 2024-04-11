exports.app_title = "Insights Hub";
exports.app_title_short = "sdg-commons-blogs";
exports.app_suite = "acclab_platform";
exports.app_suite_secret = process.env.APP_SUITE_SECRET || "secret";

exports.app_storage = "https://acclabplatforms.blob.core.windows.net/";
exports.own_app_url = "https://insights.sdg-innovation-commons.org";

const base_host = "sdg-innovation-commons.org";
exports.app_base_host = base_host;
exports.app_suite_url = `https://www.${base_host}/`;
exports.sso_app_url =
  process.env.NODE_ENV === "production"
    ? "https://login.sdg-innovation-commons.org"
    : "http://localhost:2000";

exports.nlp_api_url = "https://nlpapi.sdg-innovation-commons.org/api";

exports.blogapi_url =
  process.env.NODE_ENV === "production"
    ? "blog-api-scrapper.azurewebsites.net/blogs/"
    : "http://localhost:4000/blogs/";
exports.page_content_limit = 12;

exports.acclab_suites = [
  {
    title: "Solution mapping",
    url: "https://solutions.sdg-innovation-commons.org",
  },
  {
    title: "Action plans",
    url: "https://learningplans.sdg-innovation-commons.org",
  },
  {
    title: "Experiments",
    url: "https://experiments.sdg-innovation-commons.org",
  },
  {
    title: "R&D Practice",
    url: "https://practice.sdg-innovation-commons.org",
  },
];

exports.menu_list = [
  {
    title: "SDG Map",
    url: "https://map.sdg-innovation-commons.org/",
  },
  {
    title: "Github",
    url: "https://github.com/orgs/UNDP-Accelerator-Labs/repositories",
  },
];
