const parsers = require("./parsers");
const { getSGMail, getSGClient } = require("./helpers");

async function sendEmail(action, settings){
    const mail = getSGMail(settings, action.params);
    const { to, cc, bcc, from, replyTo, subject, text, html, template, dynamicTemplateData, 
            attachmentPaths, categories, headers, customArgs, sendAt} = action.params;

    if (!to || !(from || template)) {
        throw "One of the required parameters was not provided";
    }
    const attachments = attachmentPaths ? parsers.array(attachmentPaths).map(parsers.sgAttachment) : undefined;
    const request = {
        to: parsers.sgEmailAddrMulti(to),
        cc: parsers.sgEmailAddrMulti(cc),
        bcc: parsers.sgEmailAddrMulti(bcc),
        from: parsers.sgEmailAddr(from),
        replyTo: parsers.sgEmailAddr(replyTo),
        subject: parsers.string(subject),
        substitutionWrappers: ['{{', '}}'],
        text: text || undefined,
        html: html || undefined,
        templateId:  parsers.autocomplete(template),
        dynamicTemplateData: parsers.object(dynamicTemplateData),
        attachments,
        categories: parsers.autocomplete(categories),
        sendAt: sendAt ? Number.parseInt(parsers.autocomplete(sendAt)) : undefined,
        headers: parsers.object(headers),
        customArgs: parsers.object(customArgs),
    };
    // send mail
    const [response, {}] = await mail.send(request);
    return {headers: response.headers, status: response.statusCode === 202 ? "processing" : "delivered"};
}

async function getEmailStats(action, settings){
    const client = getSGClient(settings, action.params);
    const startDate = parsers.autocomplete(action.params.startDate);
	const endDate = parsers.autocomplete(action.params.endDate);
    const { limit, offset } = action.params;
    
    return client.request({
        method: "GET",
        url: "/v3/stats",
        qs: {
            "limit": parsers.number(limit),
            "offset": parsers.number(offset),
            'aggregated_by': 'day',
            'end_date': endDate,// || (new Date().toISOString().split('T')[0]),
            'start_date': startDate
        }
    });
}

async function getEventWebhooks(action, settings){
    const client = getSGClient(settings, action.params);
    return client.request({
        method: "GET",
        url: "/v3/user/webhooks/event/settings"
    });
}

async function getCategories(action, settings){
    const client = getSGClient(settings, action.params);
    const { limit, offset } = action.params;
    return client.request({
        method: "GET",
        url: "/v3/categories",
        qs: {
            "limit": parsers.number(limit),
            "offset": parsers.number(offset)
        }
    });
}
module.exports = {
    sendEmail,
	getEmailStats,
	getEventWebhooks,
	getCategories,
// Autocomplete Functions
    ...require("./autocomplete")
}