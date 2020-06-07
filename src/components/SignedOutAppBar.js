import React, { useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import { navigate } from "@reach/router"; 
import { UserContext } from "../providers/UserProvider";
import {signOut} from '../firebase';


const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    appBar: {
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    toolbar: {
        flexWrap: 'wrap',
    },
    toolbarTitle: {
        flexGrow: 1,
    },
    link: {
        margin: theme.spacing(1, 1.5),
    },
}));

export default function SignedOutAppBar() {
  const classes = useStyles();
  const user = useContext(UserContext);

  const handleButton = () => {
    user ? signOut() :
    navigate('/')
  }

  return (
    <div className={classes.root}>
        <AppBar position="static" color="default" elevation={0} className={classes.appBar}>
            <Toolbar className={classes.toolbar}>
            <Typography 
                variant="h6" 
                color="inherit" 
                noWrap 
                className={classes.toolbarTitle}
                onClick={() => {
                    navigate('/')
                }}
            >
                Ayuda
            </Typography>
            <nav>
                <Link variant="button" color="textPrimary" href="/#features" className={classes.link}>
                Features
                </Link>
                <Link variant="button" color="textPrimary" href="/pricing" className={classes.link}>
                Pricing
                </Link>
            </nav>
            <Button 
                href="/signin" 
                color="primary" 
                variant="outlined" 
                className={classes.link}
                onClick = {() => {handleButton()}}
            >
              { user ? 'Sign Out' : 'Sign In'}
            </Button>
            </Toolbar>
        </AppBar>
    </div>
  );
}
