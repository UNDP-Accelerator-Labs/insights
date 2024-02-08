const { pagemetadata, constructQueryString } = require("../page");
const { blogapi_url, page_content_limit } = include("/config");
const axios = require("axios");

module.exports = async (req, res) => {
  let { page, search, country, type } = req.query;
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

  const queryString = constructQueryString({ search, country, type });
  const url = `${blogapi_url}${page_content_limit}/${page}?${queryString}`;

  const data = await axios
    .get(url, {
      headers: headers,
    })
    .catch(() => null);

  const [stats, searchResults, filters] =
    data?.data && Array.isArray(data.data) ? data.data : [null, null, null];
  const results = searchResults?.searchResults || [];
  const total_pages = results[0]?.total_pages || 0;
  const current_page = results[0]?.current_page || 1;
  const total_records = results[0]?.total_records || 0;

  res.render(
    "browse/",
    Object.assign(metadata, {
      stats: stats?.stats,
      results,
      total_pages,
      total_records,
      current_page,
      countries: filters?.countries,
      articletype: filters?.articleType,
      geodata: filters?.geoData,
    })
  );
};
