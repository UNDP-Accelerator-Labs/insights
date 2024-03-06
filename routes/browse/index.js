const { pagemetadata } = require("../page");
const { page_content_limit } = include("/config");
const { browse_data } = include("controllers/");
const { DB } = include("db/");

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
  const data = await browse_data(DB.blog, req, res);

  const [stats, searchResults, filters] =
    data && Array.isArray(data) ? data : [null, null, null];
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
      bureau: filters?.bureau,
      articletype: filters?.articleType,
      geodata: filters?.geoData,
      language: filters?.language
    })
  );
};
