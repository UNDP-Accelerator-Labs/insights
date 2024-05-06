const { pagemetadata } = require("../page");
const { page_content_limit } = include("/config");

module.exports = async (req, res) => {
  const _kwarq = {
    pagecount: page_content_limit,
    page_content_limit,
    req,
    res,
  };
  const metadata = pagemetadata(_kwarq);

  res.status(404).render(
    "errors/404", 
    metadata
  );
};
