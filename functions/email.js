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
const moment = require('moment');
const ical = require('ical-generator');
const { google, outlook, yahoo, ics } = require('calendar-link');



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

const getInvitationMarkup = (user, jobRecord, productName) => {
    const formattedstart = moment
    .unix(jobRecord.t.seconds)
    .tz(jobRecord.tz)  
    .format(('MMMM Do, h:mm a'));
    return `${user.name} (${user.email}) is inviting you to a scheduled ${productName} meeting.

Topic: ${jobRecord.topic}
Time: ${formattedstart}
        
Join the Zoom Meeting
${jobRecord.join_url}
    
Meeting ID: ${jobRecord.id}
Password: ${jobRecord.password}
`
}


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


const generateICal = (user, jobRecord, method) => {
    const myCal = {
        domain: 'ayuda.live',
        prodId: '//ayuda.live//ical-generator//EN',
        //method: 'request',  //setting this as request method gives recipient yes, maybe, no options
        events: [
            {
                start: moment.unix(jobRecord.t.seconds),
                end: moment.unix(jobRecord.t.seconds).add(jobRecord.d, 'minutes'),
                timestamp: moment(),
                summary: jobRecord.topic,
                description: getInvitationMarkup(user, jobRecord),
                organizer: `${user.name} <ayuda@ayuda.live>`, //must use this email since we send from it
                url: `https://ayuda.live/job/${jobRecord.ref_id}`,
                uid: jobRecord.ref_id,
            }
        ]   
    }
    if (method !== null) {myCal.method = method}
    return ical(myCal).toString();
}   


const getCalendarLinks = (user, jobRecord) => {
    const calendarEvent = {
        title: jobRecord.topic,
        description: getInvitationMarkup(user, jobRecord),
        start: moment.unix(jobRecord.t.seconds).format(),
        duration: [jobRecord.d, "minutes"]
    }
    return {
        google_url: google(calendarEvent),
        outlook_url: outlook(calendarEvent),
        yahoo_url: yahoo(calendarEvent),
        ics_url: ics(calendarEvent),
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
                content: generateICal(user, jobRecord, null)
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
    const start = moment.unix(jobRecord.t.seconds)
    const end = moment.unix(jobRecord.t.seconds).add(jobRecord.d, 'minutes')


    const add_job_client = {
        template: "add-job-client",
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
            preheader: `${user.name} has invited you to an ${productName} meeting`,
            email: customerDoc.email, 
            customer_name: customerDoc.name,
            action_url: 'https://ayuda.live',
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

    return email.send(add_job_client)
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
                content: generateICal(user, newJobDoc, null)
            },
        },
        locals: {                 
            name: user.name,
            product_name: productName,
            support_email: supportEmail,
            preheader: 'Your job has been scheduled and the Zoom meeting details are below.',
            current_job_doc: formatJobDoc(currentJobDoc, currentCustomerDoc, currentRateDoc),
            new_job_doc: formatJobDoc(newJobDoc, newCustomerDoc, newRateDoc),
            job_url: `https://ayuda.live/job/${currentJobDoc.ref_id}`,
            calendar_links: getCalendarLinks(user, newJobDoc),
        },  
    }

    return email.send(change_job_provider)
}


const sendCancelJobProviderEmail = (user, jobRecord, customerDoc, rateDoc) => {
    const cancel_job_provider = {
        template: "cancel-job-provider",
        message: {
            to: formatToName(user),
            icalEvent: {
                filename: 'invite.ics',
                method: 'cancel',
                content: generateICal(user, jobRecord, 'cancel')
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


module.exports = {
    sendWelcomeEmail,
    sendAddJobProviderEmail,
    sendAddJobClientEmail,
    sendChangeJobProviderEmail,
    sendCancelJobProviderEmail,
}