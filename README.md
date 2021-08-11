# kaholo-plugin-sendgrid
Kaholo plugin for integration with SendGrid API.

##  Settings
1. API Token (Vault) **Optional** - Default sendGrid API Token to authenticate with.

## Method: Send Email
Send a new email.

## Parameters
1. API Token (Vault) **Optional** - SendGrid API Token to authenticate with.
2. To (Text) **Required** - Email Addresses to send this message to. Can enter multiple values by seperating each with a new line.
3. CC (Text) **Optional** - Email Addresses to send this message to, to include in the CC field.
4. BCC (Text) **Optional** - Email Addresses to send this message to, to include in the BCC field.
5. From (String) **Required** - The email addresses to send this message from
6. Reply To (String) **Optional** - The email address to send the reply of this message to.
7. Subject (String) **Optional** - The subject of the email to send.
8. Text (Text) **Optional** - The content of the email as text.
9. HTML (Text) **Optional** - The content of the email, as html.
10. Template (Autocomplete) **Optional** - If specified, create the new email using the specified template.
11. Dynamic Template Data (Text) **Optional** - Variables to pass to the template. Can be passed either as key=value pairs seperated each with a new line, or passed as an object from code.
12. Attachment Paths (Text) **Optional** - If specified, attach all files from the Paths specified to the email.
13. Categories (Autocomplete) **Optional** - categories to assign this message to. Can pass one category from autocomplete, or multiple categories as an array from code.
14. Send At (Autocomplete) **Optional** - The time and date to send the message. If passed from code, make sure to pass it as a unix timestamp.
15. Headers (Text) **Optional** - Any custom headers to attach to the email. Can be passed as key=value pairs seperated each with a new line. Can also be passed from code as an object.
16. Custom Args (Text) **Optional** - Any custom arguments to attach to email events. Can be passed as key=value pairs seperated each with a new line. Can also be passed from code as an object.

## Method: Get Email Stats
Get email stats in the range of dates specified.

## Parameters
1. API Token (Vault) **Optional** - SendGrid API Token to authenticate with.
2. Start Date (Autocomplete) **Optional**
3. End Date (Autocomplete) **Optional**

## Method: Get Event Webhook Settings
Get event webhook settings

## Parameters
1. API Token (Vault) **Optional** - SendGrid API Token to authenticate with.

## Method: Get Categories
List all catrgories in the connected account

## Parameters
1. API Token (Vault) **Optional** - SendGrid API Token to authenticate with.