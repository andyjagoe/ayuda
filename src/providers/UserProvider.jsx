import React, { Component, createContext } from "react";
import { auth } from "../firebase";


export const UserContext = createContext({ user: null});

class UserProvider extends Component {
  state = {
    user: JSON.parse(localStorage.getItem('authUser')),
  };

  componentDidMount = () => {
    auth.onAuthStateChanged(async authUser => {
        localStorage.setItem('authUser', JSON.stringify(authUser));
        this.setState({ user: authUser });
      },
      () => {
        localStorage.removeItem('authUser');
        this.setState({ authUser: null });
      }
    );
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