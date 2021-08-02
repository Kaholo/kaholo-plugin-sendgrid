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
    
    await mail.send({
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
        customArgs: parsers.object(customArgs)
    });
    return "Success";
}

async function getEmailMessages(action, settings){
    const client = getSGClient(settings, action.params);
    const { to, from, subjects, limit } = action.params;
    let filters = [{}];
    if (to) filters = parsers.array(to).map(addr => ({to: addr}));

    if (from) filters = filters.map(filter => 
        parsers.array(from).map(addr => 
            ({ ...filter, from: addr }))).flat();

    if (subjects) filters = filters.map(filter => 
        parsers.array(subjects).map(subject => 
            ({ ...filter, subject }))).flat();
            
    return Promise.all(filters.map(filter => client.request({
        method: "GET",
        url: "/v3/messages",
        qs: {
            "limit": parsers.number(limit),
            "query": Object.entries(filter).map(([key, val]) => 
                `${key}="${val}"`).join("&")
        }
    })));
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

async function getCategoriesStats(action, settings){
    const client = getSGClient(settings, action.params);
    const { limit, offset } = action.params;
    const categories = parsers.autocomplete(action.params.categories);
	const startDate = parsers.autocomplete(action.params.startDate);
	const endDate = parsers.autocomplete(action.params.endDate);
    if (!categories || (Array.isArray(categories) && categories.length == 0 )) {
        throw "Must provide at least one category!";
    }
    return client.request({
        method: "GET",
        url: "/v3/categories",
        qs: {
            "limit": parsers.number(limit),
            "offset": parsers.number(offset),
            'aggregated_by': 'day',
            'end_date': endDate,// || (new Date().toISOString().split('T')[0]),
            'start_date': startDate,
            "categories": categories
        }
    });
} 

module.exports = {
    sendEmail,
	getEmailMessages,
	getEmailStats,
	getEventWebhooks,
	getCategories,
	getCategoriesStats,
// Autocomplete Functions
    ...require("./autocomplete")
}