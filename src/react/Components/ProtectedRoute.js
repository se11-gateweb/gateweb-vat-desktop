import {useAppState} from "../Context/context";
import {Navigate} from "react-router-dom";
import {getTokenInfo} from "../Util/authUtils";
import React from 'react'

const ProtectedRoute = ({children}) => {
  const {auth} = useAppState();
  const tokenInfo = getTokenInfo(auth.user.token);

  if (tokenInfo.isExpired) {
    // user is not authenticated
    return <Navigate to="/login"/>;
  }
  return children;
};

export default ProtectedRoute;