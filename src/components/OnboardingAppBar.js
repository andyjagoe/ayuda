import React, { useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { navigate } from "@reach/router"; 
import { UserContext } from "../providers/UserProvider";
import {signOut} from '../firebase';


const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

export default function OnboardingAppBar() {
  const classes = useStyles();
  const user = useContext(UserContext);

  const handleButton = () => {
    user ? signOut() :
    navigate('/')
  }

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          {/* 
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
           */}
          <Typography 
            variant="h6" 
            className={classes.title}
            onClick={() => {
              navigate('/home')
            }}
          >
            Ayuda
          </Typography>
            <Button color="inherit" onClick = {() => {handleButton()}}>
              { user ? 'Sign Out' : 'Sign In'}
            </Button>          
        </Toolbar>
      </AppBar>
    </div>
  );
}
