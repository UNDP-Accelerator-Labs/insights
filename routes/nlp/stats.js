const { nlp_api_url } = include("/config");
const { p_fetch, groupDates } = require("./services");
const { DB } = include("db/");
const { page_content_limit } = include("/config");

module.exports = async (req, res, json = true) => {
  const url = `${nlp_api_url}/stat_embed`;
  let { page } = req.query;
  if (!page && isNaN(page)) page = 1;

  const data = await p_fetch(req, url);

  if (!data) return res.status(500).send("Error occurred!");

  const language = Object.entries(data?.fields?.language).map(
    ([key, value]) => ({ label: key, value })
  );

  const iso3 = Object.entries(data?.fields?.iso3)
    .map(([key, value]) => ({
      label: key,
      value,
    }))
    .filter((p) => p.value > 0);

  const doc_type =
    Object.entries(data?.fields?.doc_type).map(([key, value]) => ({
      label: key.toUpperCase(),
      key,
      value,
    })) || [];

  const [countries, languages] = db_cache;

  const m_languages = languages?.map((c) => ({
    ...c,
    count: language.filter((lang) => lang?.label === c?.iso_lang)?.value || 0,
  }));

  const m_countries = iso3
    ?.map((itemA) => {
      const matchingItemB = countries?.find(
        (itemB) => itemB?.iso3 === itemA?.label
      );
      if (matchingItemB) {
        return {
          ...matchingItemB,
          recordcount: parseInt(itemA?.value),
        };
      }
      return null;
    })
    .filter(Boolean);

  const bureaus = m_countries.reduce((acc, curr) => {
    const foundIndex = acc.findIndex((item) => item.bureau === curr.bureau);
    if (foundIndex !== -1) {
      acc[foundIndex].recordcount += curr.recordcount;
    } else {
      acc.push({
        bureau: curr.bureau,
        iso3: curr.iso3,
        recordcount: curr.recordcount,
      });
    }
    return acc;
  }, []);

  const total_r = data?.doc_count || 0;

  const m_data = await Object.assign(data, {
    countries: m_countries || [],
    bureaus,
    languages: m_languages || [],
    doc_type,

    grouped_date: groupDates(data?.fields?.date) || [],
    total_r,
    page,
    total_pages: Math.ceil(total_r / page_content_limit),
  });

  if (json) return res.status(200).json(m_data);
  return m_data;
};
