import React, { useEffect } from "react";
import MenuAppBar from 'components/MenuAppBar';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';
import { navigate } from "@reach/router"
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles((theme) => ({  
  breadcrumb: {
    marginTop: theme.spacing(4),
  },
  spacingFooter: {
    marginTop: theme.spacing(50),
  },
}));


const ProfilePage = () => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <MenuAppBar />
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Breadcrumbs aria-label="breadcrumb" className={classes.breadcrumb} >
          <Link color="inherit" onClick={() => { navigate('/home'); }}>
            Home
          </Link>
          <Typography color="textPrimary">Profile</Typography>
        </Breadcrumbs>
      </Container>  
    </React.Fragment>
  ) 
};
export default ProfilePage;