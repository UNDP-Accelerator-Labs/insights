const loadStats = include("controllers/blog/stats");
const searchBlogs = include("controllers/blog/searchBlogs");
const filter = include("controllers/blog/filters");
const { DB } = include("db/");

exports.browse_data = async (conn, req, res) => {
  let { page_content_limit, page, language, bureau } = req.query;
  page = page ?? 1;
  page_content_limit = page_content_limit ?? 15;
  let iso3 = [];
  let whereClause = "";

  if (bureau) {
    if (Array.isArray(bureau) && bureau.length) {
      whereClause += `bureau IN ('${bureau.join("','")}')`;
    } else if (typeof bureau === "string") {
      whereClause += `bureau = '${bureau}'`;
    }
  }

  if (bureau) {
    iso3 = await DB.general
      .any(
        `
      SELECT iso3 FROM countries
      WHERE ${whereClause}
      `,
        [bureau]
      )
      .then((d) => d.map((p) => p?.iso3))
      .catch((e) => []);
  }

  return conn
    .tx(async (t) => {
      const batch = [];
      // LOAD AGGREGATE VALUES
      batch.push(loadStats.main({ connection: t, req, res, page, iso3 }));

      //LOAD search reasults
      batch.push(
        searchBlogs.main({
          connection: t,
          req,
          res,
          page_content_limit,
          page,
          language,
          iso3,
        })
      );

      //LOAD filter results
      batch.push(filter.main({ connection: t, req, res, iso3 }));

      return t.batch(batch).catch((err) => console.log(err));
    })
    .then(async (results) => results)
    .catch((err) => null);
};
