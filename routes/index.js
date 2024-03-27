if (!exports.api) { exports.api = {} }
if (!exports.home) { exports.home = {} }
if (!exports.browse) { exports.browse = {} }
if (!exports.nlp_api) { exports.nlp_api = {}}

const { DB } = include('db/')

exports.home.index = require('./home')
exports.home.browse = require('./browse')
exports.browse.toolkit = require('./toolkit')

exports.nlp_api.nlp_browse = require('./nlp').nlp_browse
exports.nlp_api.nlp_stats = require('./nlp').nlp_stats;

exports.load_db_data = async () => await DB.general
.tx(async (t) => {
  const batch = [];
    batch.push(
      t.any(
        `
        SELECT a.iso3, a.name, b.bureau
        FROM country_names a
        JOIN countries b ON b.iso3 = a.iso3
        WHERE language = 'en'
        GROUP BY a.iso3, a.name, b.bureau
        `,
      )
    );

    batch.push(
      t.any(
        `
        SELECT set1 AS iso_lang, name AS lang
        FROM iso_languages
        `,
      )
    );

  return t.batch(batch).catch((err) => console.log(err));
})
.catch((e) => {
  console.log(e);
  return [null, null];
});