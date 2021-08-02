const parsers = require("./parsers");
const { getSGMail, getSGClient } = require("./helpers");

const MAX_RESULTS = 10;
// auto complete helper methods

function mapAutoParams(autoParams){
  const params = {};
  autoParams.forEach(param => {
    params[param.name] = parsers.autocomplete(param.value);
  });
  return params;
}

function handleResult(result, query, key){
  let items = result.items || result;
  if (items.length === 0) throw result;
  items = items.map(item => ({
    id: key ? item[key] : item.id, 
    value:  key ? item[key] :
            item.displayName ? item.displayName :
            item.name ? item.name : 
            item.id
  }));

  return filterItems(items, query);
}

async function filterItems(items, query){
  if (query){
    const qWords = query.split(/[. ]/g).map(word => word.toLowerCase()); // split by '.' or ' ' and make lower case
    items = items.filter(item => qWords.every(word => item.value.toLowerCase().includes(word)));
    items = items.sort((word1, word2) => word1.value.toLowerCase().indexOf(qWords[0]) - word2.value.toLowerCase().indexOf(qWords[0]));
  }
  return items.splice(0, MAX_RESULTS);
}

// auto complete main methods

async function listTemplates(query, pluginSettings, pluginActionParams){
  const settings = mapAutoParams(pluginSettings); 
  const params = mapAutoParams(pluginActionParams);
  const client = getSGClient(settings, params);
  const [response, body] = await client.request({
    method: "GET",
    url: "/v3/templates?generations=legacy,dynamic"
  });
  return handleResult(body.templates, query);
}

async function listCategories(query, pluginSettings, pluginActionParams){
  const settings = mapAutoParams(pluginSettings); 
  const params = mapAutoParams(pluginActionParams);
  const client = getSGClient(settings, params);
  const [response, body] = await client.request({
    method: "GET",
    url: "/v3/categories"
  });
  return handleResult(body, query);
}

async function getSendAt(query, pluginSettings, pluginActionParams){
  const params = mapAutoParams(pluginActionParams);
  query = query || parsers.number(params.sendAt);
  let curTime;
  if (query){
    try {
      curTime = new Date(query);
    } catch (err) {}
  }
  if (!curTime) curTime = new Date();
  return [{id: (curTime.getTime() / 1000).toString(), value: curTime.toISOString()}];
}

function getDate(paramName){
  return async (query, pluginSettings, pluginActionParams) => {
    const params = mapAutoParams(pluginActionParams);
    query = query || params[paramName];
    let curDate;
    if (query){
      try {
        curTime = new Date(query).toISOString().split('T')[0];
      } catch (err) {}
    }
    if (!curDate) curDate = new Date().toISOString().split('T')[0];
    return [{id: curTime, value: curTime}];
  }
}

module.exports = {
  listTemplates,
	listCategories,
	getSendAt,
	getStartDate: getDate("startDate"),
	getEndDate: getDate("endDate") 
}