import React, { Component } from "react";
import JobCell from './JobCell';
import { UserContext } from "../providers/UserProvider";
import { firestore } from "../firebase";
var moment = require('moment');


export default class Jobs extends Component {  
    constructor(props) {
      super(props);
      this.state = {
        jobs: [],
        content: '',
      };
    }

    static contextType = UserContext

    async componentDidMount() {
        const user = this.context
        const {uid} = user;
        //this.setState({ readError: null });
        let jobs = [];

        //TODO: switch to using observer and providers + local cache to reduce server hits

        await firestore
            .collection("/users")
            .doc(uid)
            .collection('meetings')
            .where('t', '>', moment().subtract(12,"h").toDate()) //upcoming as of 12 hours ago
            .orderBy('t')
            .get()
            .then(snapshot => {
                if (snapshot.empty) {
                    console.log('No matching documents.');
                    return jobs;
                }  
                snapshot.forEach(doc => {
                    //console.log(doc.id, '=>', doc.data());
                    jobs.push({id: doc.id, data: doc.data()});
                });
                return jobs;
            })
            .then(jobs => {
                //console.log(jobs);                        
                this.setState({ jobs });                
            })
            .catch(err => {
                console.log('Error getting documents', err);
                //this.setState({ readError: err.message });
            });            
    }

    render() {

        return (
            <div className="jobs">
                {this.state.jobs.map(job => {
                return <JobCell jobRecord={job.data} key={job.id} jobKey={job.id}/>    
                })}
            </div>
        );
    }
}
