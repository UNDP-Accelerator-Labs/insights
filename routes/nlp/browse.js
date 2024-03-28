const { nlp_api_url } = include("/config");
const { p_fetch } = require("./services");

module.exports = async (req, res, json = true) => {
  const url = `${nlp_api_url}/query_embed`;
  const data = await p_fetch(req, url);

  if (!data) return res.status(500).send("Error occurred!");
  if (json) return res.status(200).json(data);
  return data;
};
