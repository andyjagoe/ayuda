import React from "react";
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';


const Copyright = () => {
  return (
    <React.Fragment>
      <Typography variant="body2" color="textSecondary" align="center">
        {'Copyright © '}
        {new Date().getFullYear()}
        {' '}
        <Link color="inherit" href="https://ayuda.live/">
          Ayuda Live
        </Link>        
        {'.'}
      </Typography>
    </React.Fragment>
  ) 
};
export default Copyright;
