const { google, outlook, yahoo, ics } = require('calendar-link');
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
    const start = moment.unix(jobRecord.t.seconds)
    const end = moment.unix(jobRecord.t.seconds).add(jobRecord.d, 'minutes')

    const myCal = ical({
        domain: 'ayuda.live',
        prodId: '//ayuda.live//ical-generator//EN',
        //method: 'request',  //setting this as request method gives recipient yes, maybe, no options
        events: [
            {
                start: start,
                end: end,
                timestamp: moment(),
                summary: jobRecord.topic,
                description: 'Sample description',  //change to Zoom meeting invite details + notes
                organizer: `${user.name} <ayuda@ayuda.live>`, //must use this email since we send from it
                url: `https://ayuda.live/job/${jobRecord.ref_id}`,
                uid: jobRecord.ref_id,
            }
        ]   
    }).toString();
    
    const calendarEvent = {
        title: jobRecord.topic,
        description: 'Sample description', //change to Zoom meeting invite details + notes
        start: start.format(),
        duration: [jobRecord.d, "minutes"]
    };

    const add_job_provider = {
        template: "add-job-provider",
        message: {
            to: formatToName(user),
            icalEvent: {
                filename: 'invite.ics',
                //method: 'request',
                content: myCal
            },
            /*      
            attachments: [
                {
                    filename: 'invite.ics',
                    path: ics(calendarEvent)
                },
            ]
            */
        },
        locals: {                 
            name: user.name,
            product_name: productName,
            support_email: supportEmail,
            preheader: 'Your job has been scheduled and the Zoom meeting details are below.',
            email: customerDoc.email, 
            customer_name: customerDoc.name,
            job_date_time: moment
                .unix(jobRecord.t.seconds)
                .tz(jobRecord.tz)  
                .format('MMMM Do, h:mm a'),
            topic: jobRecord.topic,
            duration: formatDuration(jobRecord.d),
            rate: formatRateName(rateDoc.name),
            meeting_id: jobRecord.id,
            meeting_password: jobRecord.password,
            job_url: `https://ayuda.live/job/${jobRecord.ref_id}`,
            join_url: jobRecord.join_url,
            action_url: jobRecord.start_url,
            notes: jobRecord.agenda ,
            google_url: google(calendarEvent),
            outlook_url: outlook(calendarEvent),
            yahoo_url: yahoo(calendarEvent),
            ics_url: ics(calendarEvent),
        },        
    }

    return email.send(add_job_provider)
}



module.exports = {
    sendWelcomeEmail,
    sendAddJobProviderEmail,
}