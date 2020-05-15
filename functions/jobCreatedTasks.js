const moment = require('moment');
// Values needed for Google Cloud Tasks
const project = 'ayuda-9ea45';
const queue = 'reminders';
const location = 'us-central1';


async function getSnaps(uid, jobDoc, firestoreDb) {
    try {
        const [
            userSnap,
            customerSnap,
            rateSnap,
        ] = await Promise.all([
            firestoreDb.collection('/users').doc(uid).get(),
            firestoreDb.collection('/users').doc(uid).collection('customers').doc(jobDoc.payer_id).get(),
            firestoreDb.collection('/users').doc(uid).collection('rates').doc(jobDoc.rate_id).get(),
        ])

        // check for empty documents
        if (!userSnap.exists) {
            console.log('No such user!')
            return false
        }
        if (!customerSnap.exists) {
            console.log('No such customer (current)!') 
            return false
        }
        if (!rateSnap.exists) {
            console.log('No such rate (current)!') 
            return false
        }


        const user = {
            uid: uid,
            name: userSnap.data().displayName,
            email: userSnap.data().email,
        }
        var customerDoc = customerSnap.data()
        customerDoc.id = customerSnap.id;
        var rateDoc = rateSnap.data()
        rateDoc.id = rateSnap.id;

        return {
            user: user,
            userDoc: userSnap.data(),
            customerDoc: customerDoc,
            rateDoc: rateDoc,
        }

    } catch (error) {
        console.error("Error: ", error);
        return false
    }
}


async function createTask(client) {
    const payload = {data: 'hello world!!!'};
    const inSeconds = 60;

    // Construct the fully qualified queue name.
    const parent = client.queuePath(project, location, queue);
    const url = `https://${location}-${project}.cloudfunctions.net/sendReminderCallback`

    const task = {
        httpRequest: {
          httpMethod: 'POST',
          url,
          body: Buffer.from(JSON.stringify(payload)).toString('base64'),
          
          headers: {
            'Content-Type': 'application/json',
          },          
        },
        scheduleTime: {
          seconds: inSeconds + Date.now() / 1000,
        }
    }

    const request = {parent, task};
    const [response] = await client.createTask(request);
    const name = response.name;
    //console.log(`Created task ${name}`);

    return name
}


exports.handler = async function(snapshot, context, firestoreDb, emailHandler, admin, cloudTasksClient) {
    const uid = context.params.uid;    

    jobDoc = snapshot.data();
    jobDoc.ref_id = context.params.meeting_id

    try {
        const { user, customerDoc, rateDoc 
        } = await getSnaps( uid, jobDoc, firestoreDb)

        await emailHandler.sendAddJobProviderEmail(user, jobDoc, customerDoc, rateDoc)
        await emailHandler.sendAddJobClientEmail(user, jobDoc, customerDoc, rateDoc);

        const validToAuthDate = moment(jobDoc.t.toDate()).subtract(6, 'days') // Auth valid  up to 7 days
        // Only send auth email if job  is with in 6 days and is not zero rate
        if (moment().isAfter(validToAuthDate) && rateDoc.rate !== 0) {
            await emailHandler.sendAuthorizeJobClientEmail(user, jobDoc, customerDoc, rateDoc);
            await firestoreDb.collection('/users')
                .doc(uid)
                .collection('meetings')
                .doc(jobDoc.ref_id)
                .set({
                    last_auth_email: admin.firestore.Timestamp.fromDate(new Date())
                }, { merge: true })
        }

        await createTask(cloudTasksClient)

        return true           

    } catch (error) {
        console.error("Error: ", error);
        return false
    }   

}
