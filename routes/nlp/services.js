const { page_content_limit } = include("/config");
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");

exports.filters = (req) => {
  const { uuid, rights } = req.session;
  const { apikey } = req.headers;
  let { page, search, country, type, language, start, end, page_limit } =
    req.query;
  if (!page || isNaN(page)) page = 1;

  const data = {
    input: "",
    token: process.env.NLP_TOKEN,
    offset: (page - 1) * (+page_limit ? +page_limit : page_content_limit),
    limit: +page_limit ? +page_limit : page_content_limit,
    db: "main", //process.env.NODE_ENV === "production" ? "main" : "test",
    score_threshold: 0.2, // TBD
    filters: {},
    fields: ["language", "iso3", "date", "doc_type"],
    short_snippets: true,
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

  if (rights < 2 || !rights) {
    data.filters.status = ["public"];
  } else if (rights >= 2) data.filters.status = ["public", "preview"];
  else if (apikey) {
    if (veriyToken(apikey)) {
      data.filters.status = ["public", "preview"];
    } else {
      data.filters.status = ["public"];
    }
  }

  if ((start && this.isValidDate(start)) || (end && this.isValidDate(end))) {
    const [d1, d2] = this.getFirstAndLastDayOfMonth(start, end);
    data.filters.date = [d1, d2];
  }

  //GET ALL STATS FOR HOMEPAGE
  if (req.originalUrl == "/") delete data.filters;

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
      return data;
    })
    .catch((err) => {
      console.log(err);
      return null;
    });
};

exports.isValidDate = (dateString) => {
  const dateObject = new Date(dateString);
  return dateObject instanceof Date && !isNaN(dateObject);
};

exports.formatDateToYYYYMMDD = (dateString, addADay) => {
  if (!this.isValidDate(dateString)) return;
  const date = new Date(dateString);
  if (addADay) date.setDate(date.getDate() + 1);
  return date.toISOString();
};

exports.getYMD = (date) => {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  return [year, month, day];
};

exports.groupDates = (datesObject) => {
  const groupedDates = Object.entries(datesObject).reduce(
    (acc, [dateStr, count]) => {
      const [year, month] = dateStr.split("-");
      const groupDate = `${year}-${month}`;
      const formattedDate = `${months[parseInt(month) - 1]}, ${year}`;

      if (!acc[groupDate]) {
        acc[groupDate] = {
          date: dateStr,
          group_date: groupDate,
          year: year,
          month: month,
          count: 0,
          formattedDate,
        };
      }
      acc[groupDate].count += count;
      return acc;
    },
    {}
  );

  return Object.values(groupedDates).filter((p) => p.count > 0);
};

exports.getFirstAndLastDayOfMonth = (start, end) => {
  const [startYear, startMonth, startDay] = this.getYMD(start);
  const [endYear, endMonth, endDay] = this.getYMD(end);
  const startDate = `${startMonth}/1/${startYear}`; //MM/DD/YYYY
  let endDate;
  if (end && this.isValidDate(end)) {
    let [endM, endD, endY] =
      +endMonth >= 12 ? [1, 1, endYear + 1] : [+endMonth + 1, 1, endYear];
    endDate = `${endM}/${endD}/${endY}`;
  } else {
    // If no end date is supplied or it's invalid, set end date to today's date
    endDate = new Date();
  }

  const formattedStartDate = this.formatDateToYYYYMMDD(startDate, false);
  const formattedEndDate = this.formatDateToYYYYMMDD(endDate, false);

  return [formattedStartDate, formattedEndDate];
};

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

exports.veriyToken = (token) => {
  jwt.verify(token, process.env.APP_SECRET, async function (err, decoded) {
    if (decoded) {
      const { uuid, rights } = decoded;
      if (!uuid || !rights) {
        return false;
      }
      return true;
    } else {
      return false;
    }
  });
};
