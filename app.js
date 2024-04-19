// INSPIRED BY https://coderwall.com/p/th6ssq/absolute-paths-require
global.include = (path) => require(`${__dirname}/${path}`);
global.rootpath = __dirname;

require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);
const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/index.json'); 

const { app_suite, app_base_host, app_suite_secret, csp_config } =
  include("config/");
const { DB } = include("db/");
const { getVersionString } = include("middleware");
const port = process.env.PORT || 3000;
const routes = include("routes/");
const app = express();
app.disable("x-powered-by");

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(32).toString("hex");
  next();
});

app.use(helmet(csp_config));

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "same-origin");
  next();
});

app.set("view engine", "ejs");
app.set("trust proxy", true); // trust leftmost proxy
app.use(express.static(path.join(__dirname, "./public")));
app.use("/scripts", express.static(path.join(__dirname, "./node_modules")));
app.use("/config", express.static(path.join(__dirname, "./config")));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(xss());

const cookie = {
  domain: process.env.NODE_ENV === "production" ? app_base_host : undefined,
  httpOnly: true, // THIS IS ACTUALLY DEFAULT
  secure: process.env.NODE_ENV === "production",
  maxAge: 1 * 1000 * 60 * 60 * 24 * 1, // DEFAULT TO 1 DAY. UPDATE TO 1 YEAR FOR TRUSTED DEVICES
  sameSite: "lax",
};

const sessionMiddleware = session({
  name: `${app_suite}-session`,
  secret: `${app_suite}-${app_suite_secret}-pass`,
  store: new PgSession({ pgPromise: DB.general }),
  resave: false,
  saveUninitialized: false,
  cookie,
});

app.use(sessionMiddleware);
app.use(cookieParser(`${app_suite}-${app_suite_secret}-pass`));

app.get("/", routes.home.index);
app.get("/browse", routes.home.browse);
app.get("/browse/toolkit", routes.browse.toolkit);

//API ENDPOINTS
app.get('/semantic/search', routes.nlp_api.nlp_browse)
app.get('/semantic/stats', routes.nlp_api.nlp_stats)
app.post('/semantic/document/meta', routes.nlp_api.document_metadata)

app.get('/scrapper/search', routes.blogs.browse)

app.get("/version", (req, res) => {
  getVersionString()
    .then((vo) => res.send(vo))
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        name: "error while reading version",
        commit: "unknown",
        app: `${app_id}`,
      });
    });
});

// Serve Swagger UI at /api-docs route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(routes.err.err404);
app.use(routes.err.err500);


DB.general
.tx(async (t) => {
  const batch = [];
    batch.push(
      t.any(
        `
        SELECT adm0_a3 AS iso3, name_en AS name, undp_bureau AS bureau
        FROM adm0
        GROUP BY adm0_a3, name_en, undp_bureau;
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
.then(d=> {
  global.db_cache = d
})
.catch((e) => {
  console.log(e);
  return [null, null];
});


app.listen(port, () => {
  console.log(`app listening on port ${port}`);
  getVersionString()
    .then((vo) => {
      console.log("name", vo.name);
      console.log("commit", vo.commit);
    })
    .catch((err) => console.log(err));
});
