const { acclab_suites } = include("/config");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

module.exports = async (req, res) => {
  const { apikey } = req.headers;
  const { platform, object, output, optional_parameters, regions, countries } =
    req.query;
  const app = acclab_suites.filter((p) => p.value === platform);
  const obj = app_object.filter((p) => p === object);
  const out = app_output.filter((p) => p === output);

  if (!app.length) return res.status(400).send("Invalid platform value.");
  if (!obj.length) return res.status(400).send("Invalid object value.");
  if (object === "pads") {
    if (!out.length) return res.status(400).send("Invalid output value.");
  }
  let opt;
  if (optional_parameters?.length) {
    if (Array.isArray(optional_parameters)) {
      opt = "&" + optional_parameters?.join("=true&");
    } else {
      opt = "&" + `${optional_parameters}=true`;
    }
  }
  let url = `${app[0].url}/apis/fetch/${object}?output=${output}${opt ?? ""}`;

  // CREATE A tmp FOLDER TO STORE EVERYTHING
  if (optional_parameters?.includes("render")) {
    var basedir = path.join(rootpath, "/tmp");
    if (!fs.existsSync(basedir)) fs.mkdirSync(basedir);
    const now = new Date();
    var dir = path.join(basedir, `download-${+now}`);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  }

  if (countries) {
    if (typeof countries === "string") {
      url += `&countries=${encodeURIComponent(countries)}`;
    } else if (Array.isArray(countries) && countries.length > 0) {
      countries.forEach((country) => {
        url += `&countries=${encodeURIComponent(country)}`;
      });
    }
  }

  if (regions) {
    if (typeof regions === "string") {
      url += `&regions=${encodeURIComponent(regions)}`;
    } else if (Array.isArray(regions) && regions.length > 0) {
      regions.forEach((region) => {
        url += `&regions=${encodeURIComponent(region)}`;
      });
    }
  }
 
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-access-token": apikey,
      },
    });

    if (response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType.includes("application/json")) {
        const data = await response.json();
        return res.status(200).json(data);
      } else if (
        contentType.includes("application/zip") &&
        optional_parameters?.includes("render")
      ) {
        // Extract the zip
        const zip = await response.buffer();
        fs.writeFileSync(path.join(basedir, "archive.zip"), zip);
        const fileSize = fs.statSync(path.join(basedir, "/archive.zip")).size;
        const filename = "archive.zip"; // specify the filename here
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}"`
        );
        res.setHeader("Content-Length", fileSize);

        // Send the zip file
        res.setHeader("Content-type", "application/zip");
        res.sendFile(path.join(basedir, "/archive.zip"), {}, function () {
          fs.rmSync(path.join(basedir, "/archive.zip"));
          fs.rmSync(dir, { recursive: true });
          console.log("Folder removed");
        });
      } else {
        res.status(500).send("Unsupported content type");
      }
    } else {
      res.status(response.status).send(response.statusText);
    }
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).send(error.message);
  }
};

const app_object = [
  "pads",
  "contributors",
  "tags",
  "statistics",
  "countries",
  "regions",
];
const app_output = ["csv", "json", "geojson"];
