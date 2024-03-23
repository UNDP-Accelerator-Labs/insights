const { nlp_api_url } = include("/config");
const { p_fetch } = require("./services");
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
  const iso3 = Object.entries(data?.fields?.iso3).map(([key, value]) => ({
    label: key,
    value,
  }));

  const doc_type = Object.entries(data?.fields?.doc_type).map(
    ([key, value]) => ({
      label: key.toUpperCase(),
      key,
      value,
    })
  );

  const [countries, languages] = await DB.general
    .tx(async (t) => {
      const batch = [];
      batch.push(
        t.any(
          `
        SELECT a.iso3, a.name, b.bureau
        FROM country_names a
        JOIN countries b ON b.iso3 = a.iso3
        WHERE a.iso3 IN ($1:csv)
        AND language = 'en'
        GROUP BY a.iso3, a.name, b.bureau
        `,
          [iso3.map((p) => p.label)]
        )
      );

      batch.push(
        t.any(
          `
        SELECT set1 AS iso_lang, name AS lang
        FROM iso_languages
        WHERE set1 IN ($1:csv)
        `,
          [language.map((p) => p.label)]
        )
      );

      return t.batch(batch).catch((err) => console.log(err));
    })
    .catch((e) => {
      console.log(e);
      return [null, null];
    });

  const m_languages = languages.map((c) => ({
    ...c,
    count: language.filter((lang) => lang.label === c.iso_lang)?.value || 0,
  }));

  const m_countries = iso3
    .map((itemA) => {
      const matchingItemB = countries.find(
        (itemB) => itemB.iso3 === itemA.label
      );
      if (matchingItemB) {
        return {
          ...matchingItemB,
          recordcount: parseInt(itemA.value),
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

  const total_r= data?.doc_count || 0;

  const m_data = await Object.assign(data, {
    countries: m_countries,
    bureaus,
    languages: m_languages,
    doc_type,
    total_r,
    page,
    total_pages : Math.ceil(total_r / page_content_limit)
  });

  if (json) return res.status(200).json(m_data);
  return m_data;
};
