import React, { useContext } from "react"
import { UserContext } from "providers/UserProvider";
import SignIn from "views/SignIn";


const PrivateRoute = ({ component: Component, ...props }) => {
    const user = useContext(UserContext);

    return user ? <Component {...props} /> : <SignIn {...props} />;
}
export default PrivateRoute