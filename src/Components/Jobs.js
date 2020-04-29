import React, { Component, useContext } from "react";
import JobCell from './JobCell';
import { UserContext } from "../providers/UserProvider";
import { firestore } from "../firebase";


export default class Jobs extends Component {  
    constructor(props) {
      super(props);
      this.state = {
        jobs: [],
        content: '',
        readError: null,
        writeError: null
      };
    }

    static contextType = UserContext

    async componentDidMount() {
        const user = this.context
        const {photoURL, displayName, email, uid} = user;
        this.setState({ readError: null });

        await firestore
            .collection("/users")
            .doc(uid)
            .collection('meetings')
            .get()
            .then(snapshot => {
                let jobs = [];
                snapshot.forEach(doc => {
                    console.log(doc.id, '=>', doc.data());
                    jobs.push({id: doc.id, data: doc.data()});
                });
                return jobs;
            })
            .then(jobs => {
                this.setState({ jobs });
                console.log(jobs);        
            })
            .catch(err => {
                console.log('Error getting documents', err);
                this.setState({ readError: err.message });
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

