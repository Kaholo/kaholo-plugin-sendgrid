const parsers = require("./parsers");
const { getSGClient } = require("./helpers");

const MAX_RESULTS = 10;
// auto complete helper methods

function mapAutoParams(autoParams) {
  const params = {};
  autoParams.forEach((param) => {
    params[param.name] = parsers.autocomplete(param.value);
  });
  return params;
}

function handleResult(result, query, key) {
  let items = result.items || result;
  if (items.length === 0) {
    throw result;
  }
  items = items.map((item) => ({
    id: key ? item[key] : item.id,
    value: key ? item[key] : item.displayName || item.name || item.id,
  }));

  return filterItems(items, query);
}

function filterItems(items, query) {
  let resolvedItems = items;
  if (query) {
    const qWords = query.split(/[. ]/g).map((word) => word.toLowerCase()); // split by '.' or ' ' and make lower case
    resolvedItems = resolvedItems.filter((item) => (
      qWords.every((word) => item.value.toLowerCase().includes(word))
    ));
    resolvedItems = resolvedItems.sort((word1, word2) => (
      word1.value.toLowerCase().indexOf(qWords[0]) - word2.value.toLowerCase().indexOf(qWords[0])
    ));
  }
  return resolvedItems.splice(0, MAX_RESULTS);
}

// auto complete main methods

async function listTemplates(query, pluginSettings, pluginActionParams) {
  const settings = mapAutoParams(pluginSettings);
  const params = mapAutoParams(pluginActionParams);
  const client = getSGClient(settings, params);
  const [, body] = await client.request({
    method: "GET",
    url: "/v3/templates?generations=legacy,dynamic",
  });
  return handleResult(body.templates, query);
}

async function listCategories(query, pluginSettings, pluginActionParams) {
  const settings = mapAutoParams(pluginSettings);
  const params = mapAutoParams(pluginActionParams);
  const client = getSGClient(settings, params);
  const [, body] = await client.request({
    method: "GET",
    url: "/v3/categories",
  });
  return handleResult(body, query, "category");
}

async function listCategoriesWithNew(query, pluginSettings, pluginActionParams) {
  const result = await listCategories(query, pluginSettings, pluginActionParams);
  const categoryName = query.trim();
  if (!categoryName || result.some((category) => category.value === categoryName)) {
    return result;
  }
  return [{ id: categoryName, value: categoryName }, ...result];
}

async function getSendAt(userQuery, pluginSettings, pluginActionParams) {
  const params = mapAutoParams(pluginActionParams);
  const query = userQuery || parsers.number(params.sendAt);
  let curTime;
  if (query) {
    try {
      curTime = new Date(query);
      // eslint-disable-next-line no-empty
    } catch {}
  }
  if (!curTime) {
    curTime = new Date();
  }
  return [{ id: (curTime.getTime() / 1000).toString(), value: curTime.toISOString() }];
}

function getDate(paramName) {
  return async (userQuery, pluginSettings, pluginActionParams) => {
    const params = mapAutoParams(pluginActionParams);
    const query = userQuery || params[paramName];
    let curDate;
    if (query) {
      try {
        [curDate] = new Date(query).toISOString().split("T");
        // eslint-disable-next-line no-empty
      } catch {}
    }
    if (!curDate) {
      [curDate] = new Date().toISOString().split("T");
    }
    return [{ id: curDate, value: curDate }];
  };
}

module.exports = {
  listTemplates,
  listCategories,
  listCategoriesWithNew,
  getSendAt,
  getStartDate: getDate("startDate"),
  getEndDate: getDate("endDate"),
};
