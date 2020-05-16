var nodemailer = require("nodemailer");
const path = require('path');
const Email = require('email-templates');
const AWS = require("aws-sdk");
AWS.config.update({
    accessKeyId: "AKIAXVJ7W2BSYI26P3ZN",
    secretAccessKey: "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",
    region: "us-west-2"
});
var transporter = nodemailer.createTransport({
    SES: new AWS.SES({
        apiVersion: '2010-12-01'
    })
});
const calendarHandler = require('./calendarHandler');
const moment = require('moment');



const rootPath = path.join(__dirname, 'views', 'emails');
const email = new Email({
        views: {
            root: path.resolve(__dirname, "views/emails"),
            options: {
                extension: 'ejs'
            }
        },
        message: {
            from: 'Ayuda Live <ayuda@ayuda.live>'
        },
        transport: transporter,
        juiceResources: {
            webResources: {
                relativeTo: rootPath
            }
        }
});



const productName = 'Ayuda Live'
const supportEmail = 'support@ayuda.live'


const formatToName = (user) => {
    return `${user.name} <${user.email}>`
}


const formatDuration = (d) => {
    return `${d} minutes`
}


const formatRateName = (name) => {
    return `$${name}`
}


const formatJobDoc = (jobDoc, customerDoc, rateDoc) => {
    var newDoc = {}

    newDoc.topic = jobDoc.topic
    newDoc.agenda = jobDoc.agenda
    newDoc.id = jobDoc.id
    newDoc.password = jobDoc.password
    newDoc.job_date_time = moment
        .unix(jobDoc.t.seconds)
        .tz(jobDoc.tz)
        .format('MMMM Do, h:mm a')
    newDoc.duration = formatDuration(jobDoc.d)
    newDoc.start_url = jobDoc.start_url
    newDoc.join_url = jobDoc.join_url
    newDoc.customer_name = customerDoc.name
    newDoc.customer_email = customerDoc.email
    newDoc.rate_name = formatRateName(rateDoc.name)

    return newDoc
}


const getCalendarLinks = (user, jobRecord) => {
    return {
        google_url: `https://ayuda.live/calendar?calendar=google&id=${jobRecord.ref_id}&uid=${user.uid}`,
        outlook_url: `https://ayuda.live/calendar?calendar=outlook&id=${jobRecord.ref_id}&uid=${user.uid}`,
        yahoo_url: `https://ayuda.live/calendar?calendar=yahoo&id=${jobRecord.ref_id}&uid=${user.uid}`,
        ics_url: `https://ayuda.live/calendar?calendar=ics&id=${jobRecord.ref_id}&uid=${user.uid}`,
        download_url: `https://ayuda.live/calendar?calendar=download&id=${jobRecord.ref_id}&uid=${user.uid}`,
    };
}


const sendWelcomeEmail = (user) => {
    const welcome_email = {
        template: 'welcome',
        message: {
            to: formatToName(user),
        },
        locals: {                 
            name: user.name,
            product_name: productName,
            preheader: `Thanks for trying out ${productName}. We’ve pulled together some information and resources to help you get started.`,
            email: user.email,
            support_email: supportEmail      
        }
    }

    return email.send(welcome_email)
}


const sendAddJobProviderEmail = (user, jobRecord, customerDoc, rateDoc) => {
    const add_job_provider = {
        template: "add-job-provider",
        message: {
            to: formatToName(user),
            icalEvent: {
                filename: 'invite.ics',
                //method: 'request', //setting this as request method gives recipient yes, maybe, no options
                content: calendarHandler.generateICal(user, jobRecord, null)
            },
        },
        locals: {                 
            name: user.name,
            product_name: productName,
            support_email: supportEmail,
            preheader: 'Your job has been scheduled and the Zoom meeting details are below.',
            current_job_doc: formatJobDoc(jobRecord, customerDoc, rateDoc),
            job_url: `https://ayuda.live/job/${jobRecord.ref_id}`,
            calendar_links: getCalendarLinks(user, jobRecord),
        },        
    }

    return email.send(add_job_provider)
}


const sendAddJobClientEmail = (user, jobRecord, customerDoc, rateDoc) => {

    const add_job_client = {
        template: "add-job-client",
        message: {
            to: formatToName({
                name: customerDoc.name,
                email: customerDoc.email
            }),
            icalEvent: {
                filename: 'invite.ics',
                content: calendarHandler.generateICal(user, jobRecord, null)
            },
        },
        locals: {                 
            name: user.name,
            product_name: productName,
            support_email: supportEmail,
            preheader: `${user.name} has invited you to an ${productName} meeting`,
            current_job_doc: formatJobDoc(jobRecord, customerDoc, rateDoc),
            calendar_links: getCalendarLinks(user, jobRecord),
        },        
    }

    return email.send(add_job_client)
}


const sendAuthorizeJobClientEmail = (user, jobRecord, customerDoc, rateDoc) => {

    const authorize_job_client = {
        template: "authorize-job-client",
        message: {
            to: formatToName({
                name: customerDoc.name,
                email: customerDoc.email
            }),
        },
        locals: {                 
            name: user.name,
            product_name: productName,
            support_email: supportEmail,
            preheader: `Billing details are required to hold your appointment with ${user.name}.`,
            email: customerDoc.email, 
            customer_name: customerDoc.name,
            action_url: `https://ayuda.live/authorize?id=${jobRecord.ref_id}` 
                + `&uid=${user.uid}&cid=${customerDoc.id}&rid=${rateDoc.id}`,
            job_date_time: moment
                .unix(jobRecord.t.seconds)
                .tz(jobRecord.tz)  
                .format('MMMM Do, h:mm a'),
            topic: jobRecord.topic,
            duration: formatDuration(jobRecord.d),
            rate: formatRateName(rateDoc.name),
            notes: jobRecord.agenda,
        },        
    }

    return email.send(authorize_job_client)
}

const sendChangeJobProviderEmail = (
        user, 
        currentJobDoc, 
        newJobDoc, 
        currentCustomerDoc, 
        newCustomerDoc,
        currentRateDoc,
        newRateDoc
    ) => {    
    const change_job_provider = {
        template: "change-job-provider",
        message: {
            to: formatToName(user),
            icalEvent: {
                filename: 'invite.ics',
                content: calendarHandler.generateICal(user, newJobDoc, null)
            },
        },
        locals: {                 
            name: user.name,
            product_name: productName,
            support_email: supportEmail,
            preheader: `Your job for has been updated.`,
            current_job_doc: formatJobDoc(currentJobDoc, currentCustomerDoc, currentRateDoc),
            new_job_doc: formatJobDoc(newJobDoc, newCustomerDoc, newRateDoc),
            job_url: `https://ayuda.live/job/${currentJobDoc.ref_id}`,
            calendar_links: getCalendarLinks(user, newJobDoc),
        },  
    }

    return email.send(change_job_provider)
}


const sendChangeJobClientEmail = (
    user, 
    currentJobDoc, 
    newJobDoc, 
    currentCustomerDoc, 
    newCustomerDoc,
    currentRateDoc,
    newRateDoc
) => {
const change_job_client = {
    template: "change-job-client",
    message: {
        to: formatToName({
            name: currentCustomerDoc.name,
            email: currentCustomerDoc.email
        }),
        icalEvent: {
            filename: 'invite.ics',
            content: calendarHandler.generateICal(user, newJobDoc, null)
        },
    },
    locals: {                 
        name: user.name,
        product_name: productName,
        support_email: supportEmail,
        preheader: `Your session with ${user.name} has been updated.`,
        current_job_doc: formatJobDoc(currentJobDoc, currentCustomerDoc, currentRateDoc),
        new_job_doc: formatJobDoc(newJobDoc, newCustomerDoc, newRateDoc),
        calendar_links: getCalendarLinks(user, newJobDoc),
    },  
}

return email.send(change_job_client)
}


const sendCancelJobProviderEmail = (user, jobRecord, customerDoc, rateDoc) => {
    const cancel_job_provider = {
        template: "cancel-job-provider",
        message: {
            to: formatToName(user),
            icalEvent: {
                filename: 'invite.ics',
                method: 'cancel',
                content: calendarHandler.generateICal(user, jobRecord, 'cancel')
            },
        },
        locals: {                 
            name: user.name,
            product_name: productName,
            support_email: supportEmail,
            preheader: `Your job for ${customerDoc.name} has been cancelled.`,
            current_job_doc: formatJobDoc(jobRecord, customerDoc, rateDoc),
        },        
    }

    return email.send(cancel_job_provider)
}


const sendCancelJobClientEmail = (user, jobRecord, customerDoc, rateDoc) => {
    const cancel_job_client = {
        template: "cancel-job-client",
        message: {
            to: formatToName({
                name: customerDoc.name,
                email: customerDoc.email
            }),
            icalEvent: {
                filename: 'invite.ics',
                method: 'cancel',
                content: calendarHandler.generateICal(user, jobRecord, 'cancel')
            },
        },
        locals: {                 
            name: user.name,
            product_name: productName,
            support_email: supportEmail,
            preheader: `Your job with ${user.name} has been cancelled.`,
            current_job_doc: formatJobDoc(jobRecord, customerDoc, rateDoc),
        },        
    }

    return email.send(cancel_job_client)
}


const sendConfirmedJobProviderEmail = (user, jobRecord, customerDoc, rateDoc) => {
    const confirmed_job_provider = {
        template: "confirmed-job-provider",
        message: {
            to: formatToName(user),
            icalEvent: {
                filename: 'invite.ics',
                content: calendarHandler.generateICal(user, jobRecord, null)
            },
        },
        locals: {                 
            name: user.name,
            product_name: productName,
            support_email: supportEmail,
            preheader: `Your job for ${customerDoc.name} has been confirmed.`,
            current_job_doc: formatJobDoc(jobRecord, customerDoc, rateDoc),
            job_url: `https://ayuda.live/job/${jobRecord.ref_id}`,
            calendar_links: getCalendarLinks(user, jobRecord),
        },        
    }

    return email.send(confirmed_job_provider)
}


const sendConfirmedJobClientEmail = (user, jobRecord, customerDoc, rateDoc) => {
    const confirmed_job_client = {
        template: "confirmed-job-client",
        message: {
            to: formatToName({
                name: customerDoc.name,
                email: customerDoc.email
            }),
            icalEvent: {
                filename: 'invite.ics',
                content: calendarHandler.generateICal(user, jobRecord, null)
            },
        },
        locals: {                 
            name: user.name,
            product_name: productName,
            support_email: supportEmail,
            preheader: `Your job with ${user.name} has been confirmed.`,
            current_job_doc: formatJobDoc(jobRecord, customerDoc, rateDoc),
            calendar_links: getCalendarLinks(user, jobRecord),
        },        
    }

    return email.send(confirmed_job_client)
}


const sendReminderJobProviderEmail = (user, jobRecord, customerDoc, rateDoc, type) => {
    const reminder_job_provider = {
        template: "reminder-job-provider",
        message: {
            to: formatToName(user),
            icalEvent: {
                filename: 'invite.ics',
                content: calendarHandler.generateICal(user, jobRecord, null)
            },
        },
        locals: {                 
            name: user.name,
            product_name: productName,
            support_email: supportEmail,
            preheader: `Your job for ${customerDoc.name} has been confirmed.`,
            current_job_doc: formatJobDoc(jobRecord, customerDoc, rateDoc),
            type: type,
            job_url: `https://ayuda.live/job/${jobRecord.ref_id}`,
            calendar_links: getCalendarLinks(user, jobRecord),
        },        
    }

    return email.send(reminder_job_provider)
}


const sendReminderJobClientEmail = (user, jobRecord, customerDoc, rateDoc, type) => {
    const reminder_job_client = {
        template: "reminder-job-client",
        message: {
            to: formatToName({
                name: customerDoc.name,
                email: customerDoc.email
            }),
            icalEvent: {
                filename: 'invite.ics',
                content: calendarHandler.generateICal(user, jobRecord, null)
            },
        },
        locals: {                 
            name: user.name,
            product_name: productName,
            support_email: supportEmail,
            preheader: `Your job with ${user.name} has been confirmed.`,
            current_job_doc: formatJobDoc(jobRecord, customerDoc, rateDoc),
            type: type,
            calendar_links: getCalendarLinks(user, jobRecord),
        },        
    }

    return email.send(reminder_job_client)
}



module.exports = {
    sendWelcomeEmail,
    sendAddJobProviderEmail,
    sendAddJobClientEmail,
    sendAuthorizeJobClientEmail,
    sendChangeJobProviderEmail,
    sendChangeJobClientEmail,
    sendCancelJobProviderEmail,
    sendCancelJobClientEmail,
    sendConfirmedJobProviderEmail,
    sendConfirmedJobClientEmail,
    sendReminderJobProviderEmail,
    sendReminderJobClientEmail,
}