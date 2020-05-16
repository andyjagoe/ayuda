const moment = require('moment');
const {CloudTasksClient} = require('@google-cloud/tasks');
const cloudTasksClient = new CloudTasksClient();
const serviceAccountEmail = 'cloud-tasks@ayuda-9ea45.iam.gserviceaccount.com';
const project = 'ayuda-9ea45';
const queue = 'reminders';
const location = 'us-central1';


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
        console.error(error.message);
        return false
    }
}


const setMeetingReminders = async (user, jobId, jobTimeInSeconds, firestoreDb) => {
    const thirtyMinPayload = {  type: 'reminder.meeting.30min',
                                data: {uid: user.uid, id: jobId}
                            }
    const thirtyMinInSeconds = moment(jobTimeInSeconds.toDate()).subtract(30, 'minutes')
    const oneDayPayload = {  type: 'reminder.meeting.24hour',
                                data: {uid: user.uid, id: jobId}
                            }
    const oneDayInSeconds = moment(jobTimeInSeconds.toDate()).subtract(24, 'hours')
    try {
        if (moment().isBefore(thirtyMinInSeconds)) {
            const thirtyMinTaskName = await addTask(thirtyMinPayload, thirtyMinInSeconds.unix())
            await trackReminder (user.uid, jobId, thirtyMinTaskName, thirtyMinPayload.type, firestoreDb)
        }
        if (moment().isBefore(oneDayInSeconds)) {
            const oneDayTaskName = await addTask(oneDayPayload, oneDayInSeconds.unix())
            await trackReminder (user.uid, jobId, oneDayTaskName, oneDayPayload.type, firestoreDb)
        }

        return true
    } catch (error) {
        console.error(error.message);
        return false
    }

}


const setAuthorizationReminders = async (user, jobId, jobTimeInSeconds, firestoreDb) => {
    const sixDayPayload = { type: 'reminder.auth.6day', data: {uid: user.uid, id: jobId}}
    const sixDayInSeconds = moment(jobTimeInSeconds.toDate()).subtract(6, 'days')
    const fourDayPayload = {  type: 'reminder.auth.4day', data: {uid: user.uid, id: jobId}}
    const fourDayInSeconds = moment(jobTimeInSeconds.toDate()).subtract(4, 'days')
    const twoDayPayload = {  type: 'reminder.auth.2day', data: {uid: user.uid, id: jobId}}
    const twoDayInSeconds = moment(jobTimeInSeconds.toDate()).subtract(2, 'days')

    try {
        if (moment().isBefore(sixDayInSeconds)) {
            const sixDayTaskName = await addTask(sixDayPayload, sixDayInSeconds.unix())
            await trackReminder (user.uid, jobId, sixDayTaskName, sixDayPayload.type, firestoreDb)
        }
        if (moment().isBefore(fourDayInSeconds)) {
            const fourDayTaskName = await addTask(fourDayPayload, fourDayInSeconds.unix())
            await trackReminder (user.uid, jobId, fourDayTaskName, fourDayPayload.type, firestoreDb)
        }
        if (moment().isBefore(twoDayInSeconds)) {
            const twoDayTaskName = await addTask(twoDayPayload, twoDayInSeconds.unix())
            await trackReminder (user.uid, jobId, twoDayTaskName, twoDayPayload.type, firestoreDb)
        }

        return true
    } catch (error) {
        console.error(error.message);
        return false
    }

}


const cancelAllReminders = async (user, jobId, firestoreDb) => {
    try {
        const reminders = await firestoreDb.collection('/users')
            .doc(user.uid)
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
        console.error(error.message);
        return false
    }
}


const deleteTask = async (name) => {
    try {
        await cloudTasksClient.deleteTask({name: name});
        return true;
    } catch (error) {
        console.error(error.message);
        return false
    }
}


const addTask = async (payload, unixTime) => {

    // Construct the fully qualified queue name.
    const parent = cloudTasksClient.queuePath(project, location, queue);
    const url = `https://${location}-${project}.cloudfunctions.net/sendReminderCallback`

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
        console.error(error.message);
        return false
    }

}


module.exports = {
    setAuthorizationReminders,
    setMeetingReminders,
    cancelAllReminders,
}