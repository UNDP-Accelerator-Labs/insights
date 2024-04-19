const { nlp_api_url } = include("/config");
const { p_fetch, veriyToken } = require("./services");

module.exports = async (req, res, json = true) => {
  const { apikey } = req.headers;
  const url = `${nlp_api_url}/query_embed`;
  const [countries, languages] = db_cache || [null, null];

  const iso3ToNameMap = {};
  countries.forEach((item) => {
    iso3ToNameMap[item.iso3] = item.name;
  });

  let data = await p_fetch(req, url);
  if (data?.status == "ok" && data?.hits?.length) {
    if (apikey && !veriyToken(apikey)) {
      data.message = "Invalid API Key";
    }
    data.hits = data.hits.map((p) => ({
      ...p,
      countries: p?.meta?.iso3
        ?.map((iso3) => iso3ToNameMap[iso3])
        .filter(Boolean),
    }));
  }

  if (!data) return res.status(500).send("Error occurred!");
  if (json) return res.status(200).json(data);
  return data;
};
