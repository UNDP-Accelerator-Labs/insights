const { chromeOption } = require("./chrome");
const config = require("./config");
const { csp_links } = require("./csp");
const {
  app_suite,
  app_title,
  app_title_short,
  app_suite_secret,
  app_storage,
  own_app_url,
  app_base_host,
  app_suite_url,
  acclab_suites,
  menu_list,
  sso_app_url,
  blogapi_url,
  page_content_limit
} = require("./apps");

const { toolkits } = require('./toolkit')

exports.config = config;
exports.chromeOption = chromeOption;
exports.csp_links = csp_links;
exports.app_title = app_title;
exports.app_title_short = app_title_short;
exports.app_suite = app_suite;
exports.menu_list = menu_list;
exports.app_suite_secret = app_suite_secret;

exports.app_storage = app_storage;
exports.own_app_url = own_app_url;
exports.app_base_host = app_base_host;
exports.app_suite_url = app_suite_url;
exports.acclab_suites = acclab_suites;
exports.sso_app_url = sso_app_url;
exports.blogapi_url = blogapi_url;
exports.page_content_limit = page_content_limit


exports.toolkits = toolkits;