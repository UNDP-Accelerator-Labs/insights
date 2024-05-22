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

const { app_suite, app_base_host, app_suite_secret, csp_links } =
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

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "img-src": csp_links,
        "script-src": csp_links.concat([
          (req, res) => `'nonce-${res.locals.nonce}'`,
          "sha256-NNiElek2Ktxo4OLn2zGTHHeUR6b91/P618EXWJXzl3s=",
          "strict-dynamic",
        ]),
        "script-src-attr": [
          "'self'",
          "*.sdg-innovation-commons.org",
          "sdg-innovation-commons.org",
        ],
        "style-src": csp_links,
        "connect-src": csp_links,
        "frame-src": [
          "'self'",
          "*.sdg-innovation-commons.org",
          "sdg-innovation-commons.org",
          "https://www.youtube.com/",
          "https://youtube.com/",
          "https://web.microsoftstream.com",
        ],
        "form-action": [
          "'self'",
          "*.sdg-innovation-commons.org",
          "sdg-innovation-commons.org",
        ],
      },
    },
    referrerPolicy: {
      policy: ["strict-origin-when-cross-origin", "same-origin"],
    },
    xPoweredBy: false,
    strictTransportSecurity: {
      maxAge: 123456,
    },
  })
);

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
// app.get("/", routes.home.browse);
app.get("/browse", routes.home.browse);

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


app.use((req, res, next) => {
  res.status(404).send("<h1>Page not found on the server</h1>");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
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
