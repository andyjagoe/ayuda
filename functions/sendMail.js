const { google, outlook, yahoo, ics } = require('calendar-link');
const functions = require('firebase-functions');
const nodemailer = require("nodemailer");
const path = require('path');
const Email = require('email-templates');
const AWS = require("aws-sdk");
AWS.config.update({
    accessKeyId: "AKIAXVJ7W2BSYI26P3ZN",
    secretAccessKey: "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",
    region: "us-west-2"
});
let transporter = nodemailer.createTransport({
    SES: new AWS.SES({
        apiVersion: '2010-12-01'
    })
});

/*
// Mailgun config settings

const mg = require('nodemailer-mailgun-transport');
const auth = {
    auth: {
      api_key: 'key-2bfc2f9988831f464a6597d09c1ce463',
      domain: 'biztext.co'
    },
  }
const transporter = nodemailer.createTransport(mg(auth));
*/

exports.handler = function(data, context, firestoreDb) {
    //console.log(JSON.stringify(context.rawRequest.headers, null, 2));

    // Authentication / user information is automatically added to the request.
    const uid = context.auth.uid;


    // Checking that the user is authenticated.
    if (!context.auth) {    
        // Throwing an HttpsError so that the client gets the error details.      
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +                                           
        'while authenticated.');      
    }

    const rootPath = path.join(__dirname, 'views', 'emails');
    // Create a new email
    const email = new Email({
            views: {
                root: path.resolve(__dirname, "views/emails"),
                options: {
                    extension: 'ejs'
                }
            },
            message: {
                from: 'ajagoe@gmail.com'
            },
            transport: transporter,
            juiceResources: {
                webResources: {
                    relativeTo: rootPath
                }
            }
    });




    const welcome_email = {
        template: "welcome",
        message: {
            to: "ajagoe@gmail.com",
        },
        locals: {                 
            name: 'niftylettuce',
            product_name: 'Ayuda Live',
            preheader: 'Thanks for trying out Ayuda live. We’ve pulled together some information and resources to help you get started.',
            email: 'first@last.com',         
        }
    }


    const topic = 'Studying with James'
    const customer_name = "Ian Johnson"


    const calendarEvent = {
        title: topic,
        description: `Scheduled job for ${customer_name}`,
        start: "2020-05-15 18:00:00 -0700",
        duration: [3, "hour"]
    };


    const add_job_provider = {
        template: "add-job-provider",
        message: {
            to: "ajagoe@gmail.com",
            attachments: [
                {
                    filename: 'invite.ics',
                    path: ics(calendarEvent)
                },
            ]
        },
        locals: {                 
            name: 'niftylettuce',
            product_name: 'Ayuda Live',
            preheader: 'Your job has been scheduled and the Zoom meeting details are below.',
            email: 'ian@johnson.com',
            customer_name: customer_name,
            job_date_time: "Wed, May 15, 2pm PT",
            topic: topic,
            duration: '1 hour',
            rate: '$20',
            meeting_id: '88407053980',
            meeting_password: '5xL9c891',
            job_url: 'https://ayuda.live/job/EFZzDGm4cNTo2auHnbWa',
            join_url: 'https://us02web.zoom.us/j/88407053980?pwd=ZXBmd2lURVJkaXZsK0VRdUx2RmVyUT09',
            action_url: 'https://us02web.zoom.us/s/88407053980?zak=eyJ6bV9za20iOiJ6bV9vMm0iLCJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJjbGllbnQiLCJ1aWQiOiJXUjJPX0VxWlJobU9JVVBuVWxLVDNRIiwiaXNzIjoid2ViIiwic3R5Ijo5OSwid2NkIjoidXMwMiIsImNsdCI6MCwic3RrIjoiTXBoVnBOM1ZNUGNTTWpMNXNWa0NlNWthLUprZjBLUXU2UmZsbmJpaVcxdy5CZ1VnSzBoRFFUQTVNemwzYmsxdFppczRTekJGUVhWcVRFRnBObG8yVWxCUFNYb0FBQXd6UTBKQmRXOXBXVk16Y3owQUJIVnpNREkiLCJleHAiOjE1OTYyOTg4MTQsImlhdCI6MTU4ODUyMjgxNCwiYWlkIjoiMVdFNng5R1JRanF3cGVhd21wWEdxdyIsImNpZCI6IiJ9.41MX8L6gY8IwYnrwF0bPwfLXBpjhzmkFDPW8rB-oZ-4',
            notes: 'Please read chapters 1-4 before our call.',
            google_url: google(calendarEvent),
            outlook_url: outlook(calendarEvent),
            yahoo_url: yahoo(calendarEvent),
            ics_url: ics(calendarEvent),
        },        
    }


    return email.send(add_job_provider);

    /*  
    return transporter.sendMail({
        from: 'ajagoe@gmail.com',
        to: 'ajagoe@gmail.com', // An array if you have multiple recipients.
        subject: 'Hello World from SES',
        'h:Reply-To': 'ajagoe@gmail.com',
        //You can use "html:" to send HTML email content. It's magic!
        html: '<b>Wow Big powerful letters</b>',
        //You can use "text:" to send plain-text content. It's oldschool!
        text: 'Mailgun rocks, pow pow!'
      }, (err, info) => {
        if (err) {
          console.log(`Error: ${err}`);
          return false
        }
        else {
          console.log(`Response: ${info}`);
          return true
        }
      });

      */
}