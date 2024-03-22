const { pagemetadata } = require("../page");
const { page_content_limit } = include("/config");
const stats_r = include("controllers/blog/stats");
const { nlp_stats } = require("../nlp");
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
  const data = await nlp_stats(req, res, false);

  if (data) {
    res.render(
      "home/",
      Object.assign(metadata, {
        f_total_record: formatNumberToK(data?.doc_count || 0),
        countries: Object.keys(data?.fields?.iso3)?.length || 0,
        sources: Object.entries(data?.fields?.base).map(([key, value]) => ({ label: key, value })),
        lang_count: Object.keys(data?.fields?.language)?.length || 0,
        doc_type: Object.keys(data?.fields?.doc_type)?.length || 0,
      })
    );
  } else res.status(500).send("Error occurred. Please try again.");
};

function formatNumberToK(number) {
  if (number < 1000) return number;
  const formattedNumber = Math.floor(number / 1000);
  return formattedNumber + "K+";
}
