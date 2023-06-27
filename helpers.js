const sendgridMail = require("@sendgrid/mail");
const sendgridClient = require("@sendgrid/client");

function getSGMail(settings, params) {
  const apiToken = params.token || settings.token;
  if (!apiToken) {
    throw new Error("Did not provide API token!");
  }
  sendgridMail.setApiKey(apiToken);
  return sendgridMail;
}

function getSGClient(settings, params) {
  const apiToken = params.token || settings.token;
  if (!apiToken) {
    throw new Error("Did not provide API token!");
  }
  sendgridClient.setApiKey(apiToken);
  return sendgridClient;
}

module.exports = {
  getSGMail,
  getSGClient,
};
