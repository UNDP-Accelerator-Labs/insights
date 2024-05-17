const { pagemetadata } = require("../page");
const { page_content_limit } = include("/config");
const stats_r = include("controllers/blog/stats");
const { DB } = include("db/");

module.exports = async (req, res) => {
  let { page } = req.query;
  if (!page && isNaN(page)) page = 1;

  const statistics = await stats_r.main({
    connection: DB.blog,
    req,
    res,
    page,
  });

  const _kwarq = {
    page,
    pagecount: page_content_limit,
    page_content_limit,
    req,
    res,
  };
  const metadata = pagemetadata(_kwarq);

  const [counts] = statistics?.stats || [null, null];
  res.render(
    "home/",
    Object.assign(metadata, {
      f_total_record: formatNumberToK(counts?.total_records || 0),
      countries: counts?.distinct_country_count || 0,
      articletype: counts?.distinct_article_type_count || 0,
      total_blogs: formatNumberToK(counts?.total_blogs || 0),
      total_publications: formatNumberToK(counts?.total_publications || 0)
    })
  );
};

function formatNumberToK(number) {
  if (number < 1000) return number;
  const formattedNumber = Math.floor(number / 1000);
  return formattedNumber + "K+";
}
