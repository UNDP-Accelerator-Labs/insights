const { nlp_api_url } = include("/config");
const fetch = require("node-fetch");
const fs = require("fs");
const PDFParser = require("pdf-parse");
const mammoth = require("mammoth");

module.exports = async (req, res) => {
  let { document } = req.body;
  let { modules } = req.query;
  const av = ["language", "location"];

  // Check if modules is not an array
  if (!Array.isArray(modules)) {
    return res.status(500).send("Modules is not an array.");
  } else {
    if (!modules.every((item) => typeof item === "string")) {
      return res.status(500).send("Modules format is not correct.");
    } else {
      // Check if each element of modules is not part of av
      let modulesNotInAV = modules.filter((module) => !av.includes(module));
      if (modulesNotInAV.length > 0) {
        return res
          .status(500)
          .send(
            `The following modules are not part of available modules: ${modulesNotInAV}`
          );
      } else {
        modules = modules.map((p) => ({ name: p }));
      }
    }
  }
  if (req.is("json")) {
    document = req.body?.document || null;
  }
  if (req.is("text/*")) {
    document = req.body;
  } else if (req.file) {
    // Access file content from memory
    const fileBuffer = req.file.buffer;
    const fileType = req.file.mimetype;

    // Handle different file types
    if (fileType === "application/pdf") {
      document = await extractTextFromPDF(fileBuffer);
    } else if (fileType === "text/plain") {
      document = await Promise.resolve(fileBuffer.toString("utf8"));
    } else if (
      fileType === "application/msword" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      document = await extractTextFromDOC(fileBuffer);
    } else {
      return res.status(400).send("Unsupported file type");
    }
  }

  if (document) {
    let body = {
      modules,
      token: process.env.API_TOKEN,
      input: document,
    };
    try {
      const response = await fetch(nlp_api_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        console.error(
          "Network response was not ok: ",
          response.statusText,
          errorMessage
        );
        throw new Error("Network response was not ok ");
      }

      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      console.log("error ", error);
      res.status(500).send(error);
    }
  } else {
    res.status(400).send("Document could not be process or empty.");
  }
};

// Function to extract text content from a PDF buffer
async function extractTextFromPDF(buffer) {
  const doc = await new Promise((resolve, reject) => {
    PDFParser(buffer)
      .then((data) => {
        resolve(data.text);
      })
      .catch((err) => {
        console.log(err);
        reject(null);
      });
  });
  return doc;
}

// Function to extract text content from a DOC buffer
async function extractTextFromDOC(buffer) {
  const doc = await mammoth
    .extractRawText({ buffer: buffer })
    .then((result) => result.value.trim())
    .catch((e) => {
      console.log(e);
      return null;
    });
  return doc;
}
