import React, { Component, createContext } from "react";
import { auth } from "../firebase";
import { firestore } from "../firebase"


export const ProfileContext = createContext({ profile: null});

class ProfileProvider extends Component {
  state = {
    user: JSON.parse(localStorage.getItem('userProfile')),
  };

  componentDidMount = () => {
    auth.onAuthStateChanged(async authUser => {
        try {
            if ('uid' in authUser) {
                const result = await firestore.collection("/users").doc(authUser.uid).get()
                localStorage.setItem('userProfile', JSON.stringify(result.data()));
                this.setState({ profile: result.data() });        
            }    
        } catch (error) {
            console.error(error);
        }
      },
      () => {
        localStorage.removeItem('userProfile');
        this.setState({ profile: null });
      }
    );
  };  
    
  render() {
    return (
      <ProfileContext.Provider value={this.state.profile}>
        {this.props.children}
      </ProfileContext.Provider>
    );
  }
}
export default ProfileProvider;