const { pagemetadata } = require("../page");
const { toolkits } = include("/config");

module.exports = async (req, res) => {
  const _kwarq = {
    req,
    res,
  };
  const metadata = pagemetadata(_kwarq);
  res.render("toolkits/", Object.assign(metadata, { toolkits }));
};
