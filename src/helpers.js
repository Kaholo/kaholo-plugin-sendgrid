function getSGMail(settings, params){
    const apiToken = params.token || settings.token;
    if (!apiToken) throw "Did not provide API token!";
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(apiToken);
    return sgMail;
}

function getSGClient(settings, params){
    const apiToken = params.token || settings.token;
    if (!apiToken) throw "Did not provide API token!";
    const client = require('@sendgrid/client');
    client.setApiKey(apiToken);
    return client;
}

function addFilter(filters, key, vals){
    return filters.map(filter => vals.map(val => {
        const newFilter = { ...filter };
        newFilter[key] = val;
        return newFilter;
    })).flat();
}

async function sleep(ms){
    return new Promise(r => setTimeout(r, ms));
}

module.exports = {
    getSGMail,
    getSGClient,
    addFilter,
    sleep
}