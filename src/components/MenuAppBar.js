import React, { useContext } from "react";
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import { UserContext } from "../providers/UserProvider";
import { navigate } from "@reach/router";
import {signOut} from '../firebase';
import firebase from 'firebase/app';
import 'firebase/functions';


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

export default function MenuAppBar() {
  const classes = useStyles();

  const user = useContext(UserContext);
  const {photoURL, displayName, email} = user;

  const [auth, setAuth] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleChange = (event) => {
    setAuth(event.target.checked);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const goToAccount = async () => {
    handleClose();
    var stripeLoginLink = firebase.functions().httpsCallable('stripeLoginLink');
    await stripeLoginLink()
    .then(function(result) {
        window.open(result.data.url, '_blank');
      })
    .catch(function(error) {
        console.log(error);
        navigate('/setup-payments');
    });
  };

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
          {auth && (
            <div>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={open}
                onClose={handleClose}
              >
                <MenuItem 
                  onClick={() => { handleClose();navigate('/home'); }}
                >Home</MenuItem>
                <MenuItem 
                  onClick={() => { handleClose();navigate('/profile'); }}
                >Profile</MenuItem>
                <MenuItem 
                  onClick={() => { goToAccount(); }}
                >Account</MenuItem>
                <MenuItem onClick={() => {signOut()}}>Sign out</MenuItem>                
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>
    </div>
  );
}
