exports.constructQueryString = (params) => {
	const { search, country, type, full_filters } = params;
    let queryString = "";
    if (search) {
      queryString += "search=" + encodeURIComponent(search) + "&";
    }

    if (country) {
      if (Array.isArray(country)) {
        country.forEach(function (c) {
          queryString += "country=" + encodeURIComponent(c) + "&";
        });
      } else {
        queryString += "country=" + encodeURIComponent(country) + "&";
      }
    }

    if (type) {
      if (Array.isArray(type)) {
        type.forEach(function (t) {
          queryString += "type=" + encodeURIComponent(t) + "&";
        });
      } else {
        queryString += "type=" + encodeURIComponent(type) + "&";
      }
    }

	if(full_filters && typeof full_filters === 'string'){
		queryString += "full_filters=" + encodeURIComponent(full_filters) + "&"
	}

    return queryString.slice(0, -1);
};