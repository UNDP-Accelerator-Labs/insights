const { blogapi_url } = include("/config");
const fetch = require("node-fetch");

module.exports = async (req, res) => {
  const api_url = `${blogapi_url}/get-webpage-content`;

  const { url, embed_data, auth_key } = req.body;
  const body = {
    url,
    embed_data,
  };

  if (auth_key !== process.env.BLOG_SECRET) {
    return res.status(401).send("Unauthorize access. Invalid key.");
  }
  try {
    const response = await fetch(api_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "token-authorization": process.env.BLOG_SECRET,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.log("error ", error);
    res.status(500).send(error);
  }
};
