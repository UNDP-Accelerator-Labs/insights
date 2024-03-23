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

  res.render(
    "browse/", 
    Object.assign(metadata, {
      // total_pages,
    })
  );
};
