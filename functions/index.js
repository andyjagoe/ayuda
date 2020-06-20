const admin = require('firebase-admin');
const functions = require('firebase-functions');
admin.initializeApp(functions.config().firebase);
const billing = require('./billing');
const emailHandler = require('./emailHandler');
const calendarHandler = require('./calendarHandler');
const taskHandler = require('./taskHandler');
const zoomHelper = require('./zoomHelper');
var firestoreDb = admin.firestore();


if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'newUserSignup') {
    const newUserSignup = require('./newUserSignup');
    exports.newUserSignup = functions.auth.user().onCreate((event) => {
        return newUserSignup.handler(event, firestoreDb, admin, zoomHelper, emailHandler);
    });
}

if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'isEnabledForPayments') {
    const isEnabledForPayments = require('./isEnabledForPayments');
    exports.isEnabledForPayments = functions.https.onCall((data, context) => {
        return isEnabledForPayments.handler(data, context, firestoreDb);
    });
}

if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'connectStripe') {
    const connectStripe = require('./connectStripe');
    exports.connectStripe = functions.https.onCall((data, context) => {
        return connectStripe.handler(data, context, firestoreDb);
    });
}

if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'addJob') {
    const addJob = require('./addJob');
    exports.addJob = functions.https.onCall((data, context) => {
        return addJob.handler(data, context, firestoreDb, admin, zoomHelper);
    });
}

if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'cancelJob') {
    const cancelJob = require('./cancelJob');
    exports.cancelJob = functions.https.onCall((data, context) => {
        return cancelJob.handler(data, context, firestoreDb);
    });
}

if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'updateJob') {
    const updateJob = require('./updateJob');
    exports.updateJob = functions.https.onCall((data, context) => {
        return updateJob.handler(data, context, firestoreDb, admin, zoomHelper);
    });
}

if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'jobCreatedTasks') {
    const jobCreatedTasks = require('./jobCreatedTasks');
    exports.jobCreatedTasks = functions.firestore.document('/users/{uid}/meetings/{meeting_id}')
    .onCreate((snapshot, context) => {    
        return jobCreatedTasks.handler(snapshot, context, firestoreDb, emailHandler, taskHandler);
    });
}

if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'jobUpdatedTasks') {
    const jobUpdatedTasks = require('./jobUpdatedTasks');
    exports.jobUpdatedTasks = functions.firestore.document('/users/{uid}/meetings/{meeting_id}')
    .onUpdate((change, context) => {    
        return jobUpdatedTasks.handler(change, context, firestoreDb, emailHandler, taskHandler, 
            zoomHelper, admin, billing);
    });
}

if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'calendar') {
    const calendar = require('./calendar');
    exports.calendar = functions.https.onRequest((req, res) => {
        return calendar.handler(req, res, firestoreDb, calendarHandler);
    });
}

if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'addCustomer') {
    const addCustomer = require('./addCustomer');
    exports.addCustomer = functions.https.onCall((data, context) => {
        return addCustomer.handler(data, context, firestoreDb, admin);
    });
}

if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'fetchCheckoutSession') {
    const fetchCheckoutSession = require('./fetchCheckoutSession');
    exports.fetchCheckoutSession = functions.https.onCall((data, context) => {
        return fetchCheckoutSession.handler(data, context, firestoreDb, billing);
    });
}

if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'cloudTaskCallback') {
    const cloudTaskCallback = require('./cloudTaskCallback');
    exports.cloudTaskCallback = functions.https.onRequest((req, res) => {
        return cloudTaskCallback.handler(req, res, firestoreDb, emailHandler, admin, zoomHelper, taskHandler, billing);
    });
}

if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'accountBalance') {
    const accountBalance = require('./accountBalance');
    exports.accountBalance = functions.https.onCall((data, context) => {
        return accountBalance.handler(data, context, firestoreDb, admin);
    });
}

if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'publicProfile') {
    const publicProfile = require('./publicProfile');
    exports.publicProfile = functions.https.onCall((data, context) => {
        return publicProfile.handler(data, context, firestoreDb);
    });
}

if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'getUploadAvatarUrl') {
    const getUploadAvatarUrl = require('./getUploadAvatarUrl');
    exports.getUploadAvatarUrl = functions.https.onCall((data, context) => {
        return getUploadAvatarUrl.handler(data, context, firestoreDb);
    });
}

if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'stripeLoginLink') {
    const stripeLoginLink = require('./stripeLoginLink');
    exports.stripeLoginLink = functions.https.onCall((data, context) => {
        return stripeLoginLink.handler(data, context, firestoreDb, admin);
    });
}

if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'stripeCallback') {
    const stripeCallback = require('./stripeCallback');
    exports.stripeCallback = functions.https.onRequest((req, res) => {
        return stripeCallback.handler(req, res, firestoreDb, admin);
    });
}

if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'zoomCallback') {
    const zoomCallback = require('./zoomCallback');
    exports.zoomCallback = functions.https.onRequest((req, res) => {
        return zoomCallback.handler(req, res, firestoreDb, admin, zoomHelper, taskHandler);
    });
}
