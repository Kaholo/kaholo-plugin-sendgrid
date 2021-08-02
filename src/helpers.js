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

module.exports = {
    getSGMail,
    getSGClient
}