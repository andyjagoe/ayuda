const functions = require('firebase-functions');
const { google, outlook, yahoo, ics } = require('calendar-link');
const ical = require('ical-generator');
const moment = require('moment');


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
                url: `${functions.config().ayuda.url}/job/${jobRecord.ref_id}`,
                uid: jobRecord.ref_id,
            }
        ]   
    }
    if (method !== null) {myCal.method = method}
    return ical(myCal).toString();
} 


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


const getCalendarLink = (user, jobRecord, calendar) => {
    const calendarEvent = {
        title: jobRecord.topic,
        description: getInvitationMarkup(user, jobRecord),
        start: moment.unix(jobRecord.t.seconds).format(),
        duration: [jobRecord.d, "minutes"]
    }

    switch(calendar) {
        case "google":
            return google(calendarEvent)
        case "outlook":
            return outlook(calendarEvent)
        case "yahoo":
            return yahoo(calendarEvent)
        case "ics":
            return ics(calendarEvent)
        default:
            return ics(calendarEvent)
    }
}

module.exports = {
    getCalendarLink,
    getInvitationMarkup,
    generateICal
}