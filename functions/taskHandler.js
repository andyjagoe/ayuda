const functions = require('firebase-functions');
const moment = require('moment');
const {CloudTasksClient} = require('@google-cloud/tasks');
const cloudTasksClient = new CloudTasksClient();
const serviceAccountEmail = functions.config().gcloud.tasks.serviceaccountemail;
const project = functions.config().gcloud.tasks.project;
const queue = functions.config().gcloud.tasks.queue;
const location = functions.config().gcloud.tasks.location;



const scheduleCompletionForJob = async (uid, jobId, jobFinishedInSeconds, firestoreDb) => {
    const billingPayload = {  type: 'task.meeting.completed',
                                data: {uid: uid, id: jobId}
                            }
    const whenInSeconds = moment(jobFinishedInSeconds.toDate()).add(1, 'hours')
    try {
        const billingTaskName = await addTask(billingPayload, whenInSeconds.unix())
        await trackBillingTask (uid, jobId, billingTaskName, billingPayload.type, firestoreDb)

        return true
    } catch (error) {
        console.error(error);
        return false
    }

}


const scheduleBillingForJob = async (uid, jobId, jobFinishedInSeconds, firestoreDb) => {
    const billingPayload = {  type: 'task.billing.standard',
                                data: {uid: uid, id: jobId}
                            }
    const whenInSeconds = moment(jobFinishedInSeconds.toDate()).add(3, 'hours')
    try {
        const billingTaskName = await addTask(billingPayload, whenInSeconds.unix())
        await trackBillingTask (uid, jobId, billingTaskName, billingPayload.type, firestoreDb)

        return true
    } catch (error) {
        console.error(error);
        return false
    }

}


const trackBillingTask = async (uid, id, taskName, type, firestoreDb) => {
    try {
        await firestoreDb.collection('/billing')
        .doc(uid)
        .collection('meetings')
        .doc(id)
        .collection('tasks')
        .add({id: taskName,type: type,
        })
        return true
    } catch (error) {
        console.error(error);
        return false
    }
}


const cancelAllBillingTasks = async (uid, jobId, firestoreDb) => {
    try {
        const tasks = await firestoreDb.collection('/billing')
            .doc(uid)
            .collection('meetings')
            .doc(jobId)
            .collection('tasks')
            .get()
        for (doc of tasks.docs) {
            //console.log(`Cancel task: ${doc.data().id}`)
            deleteTask(doc.data().id)
            doc.ref.delete();
        }
  
        return true
    } catch (error) {
        console.error(error);
        return false
    }
}


const cancelMeetingCompletedTasks = async (uid, jobId, firestoreDb) => {
    try {
        const tasks = await firestoreDb.collection('/billing')
            .doc(uid)
            .collection('meetings')
            .doc(jobId)
            .collection('tasks')
            .get()
        for (doc of tasks.docs) {
            //console.log(`Cancel task: ${doc.data().id}`)
            if (doc.data().type === 'task.meeting.completed') {
                deleteTask(doc.data().id)
                doc.ref.delete();                    
            }
        }
  
        return true
    } catch (error) {
        console.error(error);
        return false
    }
}


const trackReminder = async (uid, id, taskName, type, firestoreDb) => {
    try {
        await firestoreDb.collection('/users')
        .doc(uid)
        .collection('meetings')
        .doc(id)
        .collection('reminders')
        .add({id: taskName,type: type,
        })
        return true
    } catch (error) {
        console.error(error);
        return false
    }
}


const setMeetingReminders = async (uid, jobId, jobTimeInSeconds, firestoreDb) => {
    const thirtyMinPayload = {  type: 'reminder.meeting.30min',
                                data: {uid: uid, id: jobId}
                            }
    const thirtyMinInSeconds = moment(jobTimeInSeconds.toDate()).subtract(30, 'minutes')
    const oneDayPayload = {  type: 'reminder.meeting.24hour',
                                data: {uid: uid, id: jobId}
                            }
    const oneDayInSeconds = moment(jobTimeInSeconds.toDate()).subtract(24, 'hours')
    try {
        if (moment().isBefore(thirtyMinInSeconds)) {
            const thirtyMinTaskName = await addTask(thirtyMinPayload, thirtyMinInSeconds.unix())
            await trackReminder (uid, jobId, thirtyMinTaskName, thirtyMinPayload.type, firestoreDb)
        }
        if (moment().isBefore(oneDayInSeconds)) {
            const oneDayTaskName = await addTask(oneDayPayload, oneDayInSeconds.unix())
            await trackReminder (uid, jobId, oneDayTaskName, oneDayPayload.type, firestoreDb)
        }

        return true
    } catch (error) {
        console.error(error);
        return false
    }

}


const setAuthorizationReminders = async (uid, jobId, jobTimeInSeconds, firestoreDb) => {
    const sixDayPayload = { type: 'reminder.auth.6day', data: {uid: uid, id: jobId}}
    const sixDayInSeconds = moment(jobTimeInSeconds.toDate()).subtract(6, 'days')
    const fourDayPayload = {  type: 'reminder.auth.4day', data: {uid: uid, id: jobId}}
    const fourDayInSeconds = moment(jobTimeInSeconds.toDate()).subtract(4, 'days')
    const twoDayPayload = {  type: 'reminder.auth.2day', data: {uid: uid, id: jobId}}
    const twoDayInSeconds = moment(jobTimeInSeconds.toDate()).subtract(2, 'days')

    try {
        if (moment().isBefore(sixDayInSeconds)) {
            const sixDayTaskName = await addTask(sixDayPayload, sixDayInSeconds.unix())
            await trackReminder (uid, jobId, sixDayTaskName, sixDayPayload.type, firestoreDb)
        }
        if (moment().isBefore(fourDayInSeconds)) {
            const fourDayTaskName = await addTask(fourDayPayload, fourDayInSeconds.unix())
            await trackReminder (uid, jobId, fourDayTaskName, fourDayPayload.type, firestoreDb)
        }
        if (moment().isBefore(twoDayInSeconds)) {
            const twoDayTaskName = await addTask(twoDayPayload, twoDayInSeconds.unix())
            await trackReminder (uid, jobId, twoDayTaskName, twoDayPayload.type, firestoreDb)
        }

        return true
    } catch (error) {
        console.error(error);
        return false
    }

}


const cancelAllReminders = async (uid, jobId, firestoreDb) => {
    try {
        const reminders = await firestoreDb.collection('/users')
            .doc(uid)
            .collection('meetings')
            .doc(jobId)
            .collection('reminders')
            .get()
        for (doc of reminders.docs) {
            //console.log(`Cancel task: ${doc.data().id}`)
            deleteTask(doc.data().id)
            doc.ref.delete();
        }
  
        return true
    } catch (error) {
        console.error(error);
        return false
    }
}


const deleteTask = async (name) => {
    try {
        await cloudTasksClient.deleteTask({name: name});
        return true;
    } catch (error) {
        console.error(error);
        return false
    }
}


const addTask = async (payload, unixTime) => {

    // Construct the fully qualified queue name.
    const parent = cloudTasksClient.queuePath(project, location, queue);
    const url = `https://${location}-${project}.cloudfunctions.net/cloudTaskCallback`

    const task = {
        httpRequest: {
          httpMethod: 'POST',
          url,
          oidcToken: {
            serviceAccountEmail,
          },
          body: Buffer.from(JSON.stringify(payload)).toString('base64'),
          
          headers: {
            'Content-Type': 'application/json',
          },          
        },
        scheduleTime: {
          seconds: unixTime,
        }
    }

    try {
        const [response] = await cloudTasksClient.createTask({parent, task});
        //console.log(`Created task ${response.name}`);    
        return response.name;
    } catch (error) {
        console.error(error);
        return false
    }

}


module.exports = {
    setAuthorizationReminders,
    setMeetingReminders,
    cancelAllReminders,
    scheduleBillingForJob,
    scheduleCompletionForJob,
    cancelAllBillingTasks,
    cancelMeetingCompletedTasks,
}