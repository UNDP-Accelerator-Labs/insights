const {
  countryGroup,
  articleGroup,
  languageGroup,
  extractGeoQuery,
} = require("./query");
const { DB } = include("db/");

exports.main = async (kwargs) => {
  const conn = kwargs.connection ? kwargs.connection : DB.conn;
  const { req } = kwargs || {};
  let { search, country, type, language } = req.query || {};

  return conn
    .task((t) => {
      const batch = [];

      batch.push(
        t
          .any(countryGroup(search?.trim(), country, type, language))
          .then(async (results) => {
            const geoData = await DB.blog
              .any(extractGeoQuery(search?.trim(), country, type))
              .then((results) => results);

            results.geoData = geoData?.map((p) => p?.json);

            return results;
          })
          .catch((err) => console.log(err))
      );

      batch.push(
        t
          .any(articleGroup(search?.trim(), country, type, language))
          .then(async (results) => results)
          .catch((err) => console.log(err))
      );

      batch.push(
        t
          .any(languageGroup(search?.trim(), country, type, language))
          .then(async (results) => results)
          .catch((err) => console.log(err))
      );

      return t.batch(batch).catch((err) => console.log(err));
    })
    .then((d) => ({
      countries: d[0],
      articleType: d[1],
      geoData: d[0]?.["geoData"],
      language: d[2],
    }))
    .catch((err) => console.log(err));
};
