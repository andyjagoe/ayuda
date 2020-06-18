import React, { Component, createContext } from "react";
import { auth } from "../firebase";
import { firestore } from "../firebase"
import moment from 'moment-timezone/builds/moment-timezone-with-data-10-year-range';


export const ProfileContext = createContext({ profile: null});

class ProfileProvider extends Component {
    constructor(props) {
        super(props);
    
        this.checkTz = async (profile, uid) => {
            try {
              if (!('tz' in profile)) {
                await firestore.collection('/users').doc(uid).set({
                  tz: moment.tz.guess(),
                }, { merge: true }); 
                console.log("setting tz in profile");
              }       
            } catch (error) {
              console.error("Error: ", error);
            }
        }        
    };

  state = {
    user: JSON.parse(localStorage.getItem('userProfile')),
  };

  componentDidMount = () => {
    auth.onAuthStateChanged(async authUser => {
        try {
            if (authUser !==  null) {
                const result = await firestore.collection("/users").doc(authUser.uid).get()
                localStorage.setItem('userProfile', JSON.stringify(result.data()));
                this.setState({ profile: result.data() });
                this.checkTz(result.data(), authUser.uid)
                this.unsubscribe = firestore
                  .collection("/users")
                  .doc(authUser.uid)
                  .onSnapshot (snapshot =>  {
                    localStorage.setItem('userProfile', JSON.stringify(snapshot.data()));
                    this.setState({ profile: snapshot.data() });  
                  }, err => {
                    console.log(`Error: ${err}`);
                  })
            }    
        } catch (error) {
            console.error(error);
        }
      },
      () => {
        localStorage.removeItem('userProfile');
        this.setState({ profile: null });
        this.unsubscribe && this.unsubscribe();
      }
    );
  };

  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe();
  }
    
  render() {
    return (
      <ProfileContext.Provider value={this.state.profile}>
        {this.props.children}
      </ProfileContext.Provider>
    );
  }
}
export default ProfileProvider;