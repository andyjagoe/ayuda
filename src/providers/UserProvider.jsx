import React, { Component, createContext } from "react";
import { auth } from "../firebase";
import firebase from 'firebase/app';
import 'firebase/functions';


export const UserContext = createContext({ user: null });

class UserProvider extends Component {
  state = {
    user: null
  };

  async generateUserDocument(userAuth) {
    var isRegistered = firebase.functions().httpsCallable('isRegistered');
    return isRegistered()
    .then(function(result) {
        userAuth.isRegistered = result.data
        return userAuth;
    })
    .catch(function(error) {
        console.log(error.message);
        return userAuth;
    });
  }

  componentDidMount = () => {
    auth.onAuthStateChanged(async userAuth => {
      if (userAuth != null) {
        const user = await this.generateUserDocument(userAuth);
        this.setState({ user: user});  
      } else {
        this.setState({ user: userAuth});  
      }

    });
  };  
    
  render() {
    return (
      <UserContext.Provider value={this.state.user}>
        {this.props.children}
      </UserContext.Provider>
    );
  }
}
export default UserProvider;