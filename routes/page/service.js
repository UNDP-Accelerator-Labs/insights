const { sso_app_url, own_app_url, app_title } = include("config/");

exports.profile_url = (req) => {
  const { uuid } = req.session;
  if (uuid) return `${sso_app_url}/en/edit/contributor?id=${uuid}`;
  return `${sso_app_url}/login?app=${app_title}&origin=${encodeURIComponent(
    req.headers.referer
  )}`;
};
