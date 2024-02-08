const { pagemetadata } = require("../page");
const { blogapi_url, page_content_limit } = include("/config");
const axios = require("axios");

module.exports = async (req, res) => {
  let { page } = req.query;
  if (!page && isNaN(page)) page = 1;
  const _kwarq = {
    page,
    pagecount: page_content_limit,
    page_content_limit,
    req,
    res,
  };
  const metadata = pagemetadata(_kwarq);
  const headers = {
    "Content-Type": "application/json",
    "token-authorization": process.env.APP_SECRET,
  };
  const url = `${blogapi_url}${page_content_limit}/${page}`;

  const data = await axios
    .get(url, {
      headers: headers,
    })
    .catch(() => null);

  const [stats, searchResults, filters] =
    data?.data && Array.isArray(data.data) ? data.data : [null, null, null];

  res.render(
    "home/",
    Object.assign(metadata, {
      stats: stats?.stats,
      countries: filters?.countries,
      articletype: filters?.articleType,
    })
  );
};
