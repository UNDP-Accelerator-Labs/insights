const { page_content_limit } = include("/config");
const fetch = require("node-fetch");

exports.filters = (req) => {
  const { uuid, rights } = req.session;
  let { page, search, country, type, language, start, end } = req.query;
  if (!page || isNaN(page)) page = 1;

  const data = {
    input: "",
    token: process.env.NLP_TOKEN,
    offset: (page - 1) * page_content_limit,
    limit: page_content_limit,
    db: "main", //process.env.NODE_ENV === "production" ? "main" : "test",
    score_threshold: 0.2, // TBD
    filters: {},
    fields: ["language", "iso3", "date", "doc_type"],
    // short_snippets: true,
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
  console.log("body ", body);
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
  const date = new Date(dateString);
  if (addADay) date.setDate(date.getDate() + 1);
  return date.toISOString().split("T")[0];
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
  const startDate = `1-${startMonth}-${startYear}`;

  let endDate;
  if (end && this.isValidDate(end)) {
    endDate = `1-${+endMonth + 1}-${endYear}`;
  } else {
    // If no end date is supplied or it's invalid, set end date to start of next month
    endDate = `1-${+startMonth + 1}-${startYear}`;
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
