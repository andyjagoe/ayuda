import React, { useContext } from "react"
import { Redirect } from "@reach/router";
import { UserContext } from "providers/UserProvider";


const PrivateRoute = ({ component: Component, ...props }) => {
    const user = useContext(UserContext);

    return user ? <Component {...props} /> : <Redirect from="" to="/signin" noThrow />;
}
export default PrivateRoute 