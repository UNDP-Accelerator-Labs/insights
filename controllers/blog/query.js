const { sqlregex } = include("middleware/search");

const theWhereClause = (country, type, language) => {
  let whereClause = "";

  if (country) {
    if (Array.isArray(country) && country.length > 0) {
      whereClause += ` AND country IN ('${country.join("','")}')`;
    } else if (typeof country === "string") {
      whereClause += ` AND country = '${country}'`;
    }
  }

  if (type) {
    if (Array.isArray(type) && type.length > 0) {
      whereClause += ` AND article_type IN ('${type.join("','")}')`;
    } else if (typeof type === "string") {
      whereClause += ` AND article_type = '${type}'`;
    }
  }

  if (language) {
    if (Array.isArray(language) && language.length > 0) {
      whereClause += ` AND language IN ('${language.join("','")}')`;
    } else if (typeof language === "string") {
      whereClause += ` AND language = '${language}'`;
    }
  }

  return whereClause;
};

const searchTextConditionFn = (searchText) => {
  const [search, terms] = sqlregex(searchText);
  let searchTextCondition = "";
  if (
    searchText !== null &&
    searchText !== undefined &&
    searchText.length > 0
  ) {
    searchTextCondition = `
      AND (title ~* '\\m${search}\\M'
        OR content ~* '\\m${search}\\M'
        OR all_html_content ~* '\\m${search}\\M')
    `;
  }
  return searchTextCondition;
};

exports.searchBlogQuery = (
  searchText,
  page,
  country,
  type,
  page_content_limit,
  language
) => {
  let whereClause = theWhereClause(country, type, language);
  let values = [page_content_limit, (page - 1) * page_content_limit, page];

  let searchTextCondition = searchTextConditionFn(searchText);
  let textColumn = "COALESCE(content, all_html_content)";

  return {
    text: `
      WITH search_results AS (
        SELECT id, url, country, article_type, title, posted_date, posted_date_str, parsed_date, language, created_at,
          regexp_replace(${textColumn}, E'\\n', ' ', 'g') AS content
        FROM articles
        WHERE has_lab IS TRUE
        ${searchTextCondition}
        ${whereClause}
        ORDER BY 
            CASE
                WHEN posted_date IS NOT NULL THEN posted_date
                WHEN parsed_date IS NOT NULL THEN parsed_date
                ELSE '1970-01-01'
            END DESC
        LIMIT $1 OFFSET $2
      ),
      total_count AS (
        SELECT COUNT(*) AS total_records
        FROM articles
        WHERE has_lab IS TRUE
        ${searchTextCondition}
        ${whereClause}
      )
      SELECT sr.*, tc.total_records, (CEIL(tc.total_records::numeric / $1)) AS total_pages, ${"$3"}  AS current_page
      FROM search_results sr
      CROSS JOIN total_count tc;
    `,
    values,
  };
};

exports.articleGroup = (searchText, country, type, language) => {
  let whereClause = theWhereClause(country, type, language);
  let searchTextCondition = searchTextConditionFn(searchText);

  return {
    text: `
      SELECT article_type, COUNT(*) AS recordCount
      FROM articles
      WHERE has_lab IS TRUE
        ${searchTextCondition}
        ${whereClause}
      GROUP BY article_type;
    `,
  };
};

exports.languageGroup = (searchText, country, type, language) => {
  let whereClause = theWhereClause(country, type, language);
  let searchTextCondition = searchTextConditionFn(searchText);

  return {
    text: `
      SELECT language, COUNT(*) AS recordCount
      FROM articles
      WHERE has_lab IS TRUE
        ${searchTextCondition}
        ${whereClause}
      GROUP BY language;
    `,
  };
};

exports.countryGroup = (searchText, country, type, language) => {
  let whereClause = theWhereClause(country, type, language);
  let searchTextCondition = searchTextConditionFn(searchText);

  return {
    text: `
      SELECT country, iso3, COUNT(*) AS recordCount
      FROM articles
      WHERE has_lab IS TRUE
        ${searchTextCondition}
        ${whereClause}
      GROUP BY country, iso3;
    `,
  };
};

exports.statsQuery = (searchText, country, type, language) => {
  let whereClause = theWhereClause(country, type, language);
  let searchTextCondition = searchTextConditionFn(searchText);

  return {
    text: `
        WITH search_results AS (
          SELECT id, url, content, country, article_type, title, posted_date, posted_date_str, created_at, has_lab, iso3
          FROM articles
          WHERE has_lab IS TRUE
            ${searchTextCondition}
            ${whereClause}
        ),
        total_country_count AS (
          SELECT country, COUNT(*) AS count
          FROM search_results
          GROUP BY country
        ),
        total_null_country_count AS (
          SELECT COUNT(*) AS count
          FROM search_results
        ),
        total_article_type_count AS (
          SELECT article_type, COUNT(*) AS count
          FROM search_results
          GROUP BY article_type
        ),
        total_count AS (
          SELECT COUNT(*) AS total_records
          FROM search_results
        )
        SELECT 
          (SELECT COUNT(DISTINCT country) FROM total_country_count) AS distinct_country_count,
          (SELECT count FROM total_null_country_count) AS null_country_count,
          (SELECT COUNT(DISTINCT article_type) FROM total_article_type_count) AS distinct_article_type_count,
          (SELECT total_records FROM total_count) AS total_records;
      `,
  };
};

exports.extractGeoQuery = (searchText, country, type, language) => {
  let whereClause = theWhereClause(country, type, language);
  let searchTextCondition = searchTextConditionFn(searchText);

  return {
    text: `
        WITH search_results AS (
          SELECT *
          FROM articles
          WHERE has_lab IS TRUE
          ${searchTextCondition}
          ${whereClause}
        )
        SELECT
          jsonb_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJson(ST_Centroid(ST_Collect(clusters.geo)))::jsonb,
            'properties', json_build_object(
              'pads', json_agg(clusters.cid),
              'count', COUNT(clusters.cid),
              'cid', clusters.cid
            )::jsonb
          ) AS json
        FROM (
          SELECT c.iso3 AS cid, c.has_lab, ST_Point(c.lng, c.lat) AS geo
          FROM search_results c
        ) AS clusters
        GROUP BY clusters.cid
        ORDER BY clusters.cid;
      `,
  };
};
