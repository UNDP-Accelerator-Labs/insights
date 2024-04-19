const { nlp_api_url } = include("/config");
const fetch = require("node-fetch");

module.exports = async (req, res) => {
    console.log('req.body ', req.body)
    const { content } = req.body;
    let body = {
      modules: [{ name: "location" }, { name: "language" }],
      token: process.env.API_TOKEN,
      input: content,
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
        console.log('error ', error)
      res.status(500).send(error);
    }
  };