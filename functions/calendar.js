
exports.handler = async function(req, res, firestoreDb, calendarHandler) {

    if (!req.query.calendar) {   
        console.log('The function must be called with one argument "calendar".') 
        return res.status(400).send('Invalid request')      
    }
    if (!req.query.id) {   
        console.log('The function must be called with one argument "id".') 
        return res.status(400).send('Invalid request')      
    }
    if (!req.query.uid) {   
        console.log('The function must be called with one argument "uid".') 
        return res.status(400).send('Invalid request')      
    }

    const id = req.query.id
    const uid = req.query.uid

    try {
        const [
            userSnap,
            jobSnap,
        ] = await Promise.all([
            firestoreDb.collection('/users').doc(uid).get(),
            firestoreDb.collection('/users').doc(uid).collection('meetings').doc(id).get(),
        ])

        // check for empty documents
        if (!userSnap.exists) {
            console.log('No such user!') 
            return res.status(400).send('Invalid request')      
        }
        if (!jobSnap.exists) {
            console.log('No such job!') 
            return res.status(400).send('Invalid request')      
        }

        const userDoc = userSnap.data();
        const user = {
            uid: uid,
            name: userDoc.displayName,
            email: userDoc.email,
        }
        const jobRecord = jobSnap.data();

        switch(req.query.calendar) {
            case "google":
                res.redirect(calendarHandler.getCalendarLink(user, jobRecord, 'google'))
                break;  
            case "outlook":
                res.redirect(calendarHandler.getCalendarLink(user, jobRecord, 'outlook'))
                break;
            case "yahoo":
                res.redirect(calendarHandler.getCalendarLink(user, jobRecord, 'yahoo'))
                break;
            case "ics":
                res.setHeader('Content-Type', 'text/calendar');
                return res.send(calendarHandler.generateICal(user, jobRecord, 'request'))
            case "download":
                res.setHeader('Content-Type', 'text/calendar');
                res.setHeader("Content-Disposition", "attachment;filename=invite.ics");
                return res.send(calendarHandler.generateICal(user, jobRecord, 'request'))
            default:
                return res.status(400).send('Invalid request')      
        }

        return res.status(400).send('Invalid request')      
        
    } catch (error) {
        console.error("Error: ", error);
        return res.status(400).send('Invalid request')      
    }

}