import React, { Component, createContext } from "react";
import ReactDOM from 'react-dom'
import { auth } from "../firebase";


export const UserContext = createContext({ user: null});

class UserProvider extends Component {
  state = {
    user: null,
  };

  componentDidMount = () => {
    auth.onAuthStateChanged(async userAuth => {
      this.setState({ user: userAuth });
      document.getElementById('ayudaMain').style.display = 'block';
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