const { page_content_limit } = include("/config");
const fetch = require("node-fetch");

exports.filters = (req) => {
  const { uuid, rights } = req.session;
  let { page, search, country, type, language, platform } = req.query;
  if (!page && isNaN(page)) page = 1;

  const data = {
    input: "",
    token: process.env.NLP_TOKEN,
    offset: (page - 1) * page_content_limit,
    limit: page_content_limit,
    db: "main", //process.env.NODE_ENV === "production" ? "main" : "test",
    score_threshold: 0.2, // TBD
    rights: rights || 0,
    filters: {},
  };

  if (search) {
    data.input = search;
  }

  if (country) {
    if (Array.isArray(country)) {
      data.filters.iso3 = country;
    } else {
      data.filters.iso3 = [country];
    }
  }

  if (language) {
    if (Array.isArray(language)) {
      data.filters.language = language;
    } else {
      data.filters.language = [language];
    }
  }

  if (type) {
    if (Array.isArray(type)) {
      data.filters.doc_type = type;
    } else {
      data.filters.doc_type = [type];
    }
  }

  if (platform) {
    if (Array.isArray(platform)) {
      data.filters.base = platform;
    } else {
      data.filters.base = [platform];
    }
  }

  if (rights < 2 || !rights) {
    data.filters.status = ["public"];
  } else if (rights >= 2)
    data.filters.status = ["public", "preview", "preprint", "private"];

  //GET ALL STATS FOR HOMEPAGE
  if(req.originalUrl == '/') delete data.filters

  return data;
};

exports.p_fetch = (req, url) => {
  const body = this.filters(req);
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then(async (response) => {
      const data = await response.json();
      return data
    })
    .catch((err) => {
        console.log(err)
        return null
    });
};
