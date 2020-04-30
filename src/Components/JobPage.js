import React, { useContext, useState, useEffect, useRef } from 'react';
import MenuAppBar from './MenuAppBar';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import EventIcon from '@material-ui/icons/Event';
import DeleteIcon from '@material-ui/icons/Delete';
import { SvgIcon } from '@material-ui/core';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import SaveIcon from '@material-ui/icons/Save';
import ShareIcon from '@material-ui/icons/Share';
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { navigate } from "@reach/router"
import { makeStyles } from '@material-ui/core/styles';
import { UserContext } from "../providers/UserProvider";
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import firebase from 'firebase/app';
import 'firebase/functions';


function CopyIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
    </SvgIcon>
  );
}


const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  details_container: {
    marginBottom: theme.spacing(3),
  }
}));

const JobPage = (props) => {
  const classes = useStyles();
  const user = useContext(UserContext);
  const jobRecord = props.location.state.jobRecord;
  //TODO: If jobRecord not set then try to retrieve from Firestore using url params
  console.log(jobRecord)

  const [open, setOpen] = React.useState(false);
  
  const handleClickOpen = () => {
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };

  async function removeJob() {
    setOpen(false);

    var removeJob = firebase.functions().httpsCallable('removeJob');
    await removeJob({id: props.jobId, zoom_id: jobRecord.id})
    .then(function(result) {
        var sanitizedMessage = result.data;
        console.log(result.data);
        navigate('/');
    })
    .catch(function(error) {
        var code = error.code;
        var details = error.details;
        console.log(error.message);
        //TODO: Handle user navigation for error state
    });

  }

  return (
    <React.Fragment>
      <MenuAppBar />
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
            <Avatar className={classes.avatar}>
            <EventIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Job details
            </Typography>
            <form 
              className={classes.form} 
              noValidate
              //onSubmit={handleSubmit}
              >
            <Grid container spacing={2} className={classes.details_container}>
                <Grid item xs={12}>
                <TextField
                    autoComplete="payer"
                    name="payer"
                    variant="outlined"
                    required
                    fullWidth
                    id="payer"
                    label="Who's paying?"
                    autoFocus
                    //value={payer}
                    //onChange={e => setPayer(e.target.value)}
                />
                </Grid>
                <Grid item xs={12}>
                <TextField
                    autoComplete="topic"
                    name="topic"
                    variant="outlined"
                    required
                    fullWidth
                    id="topic"
                    label="What's the call about?"
                    value={jobRecord.topic}
                    //onChange={e => setTopic(e.target.value)}
                />
                </Grid>
                <Grid item xs={6}>
                  <MuiPickersUtilsProvider variant="outlined" utils={MomentUtils}>
                    <DateTimePicker 
                      required
                      disablePast
                      //maxDate={maxDate}
                      maxDateMessage="Schedule only availble for one year."
                      inputVariant="outlined"
                      label="When does it start?"
                      id="start"
                      name="start"
                      //value={start}
                      //onChange={val => {
                      //  handleStartDateChange(val);
                      //  handleEndDateChange(val);
                      //}}
                      />
                  </MuiPickersUtilsProvider>
                </Grid>
                <Grid item xs={6}>
                  <MuiPickersUtilsProvider utils={MomentUtils}>
                    <DateTimePicker 
                      required
                      disablePast
                      openTo="hours"
                      //maxDate={maxDate}
                      maxDateMessage="Schedule only availble for one year."
                      inputVariant="outlined"
                      label="When does it end?"
                      id="end"
                      name="end"
                      //value={end}
                      //onChange={handleEndDateChange}
                    />
                  </MuiPickersUtilsProvider>
                </Grid>
                <Grid item xs={12}>
                <TextField
                    autoComplete="notes"
                    name="notes"
                    variant="outlined"
                    fullWidth
                    multiline
                    rowsMax={4}
                    inputProps={{
                      maxLength: 1024
                    }}                           
                    id="notes"
                    label="Notes"
                    value={jobRecord.agenda}
                    //onChange={e => setNotes(e.target.value)}
                />
                </Grid>
                <Grid item xs={12}>
                <TextField
                    name="id"
                    variant="outlined"
                    disabled
                    fullWidth
                    id="id"
                    label="Meeting ID"
                    value={jobRecord.id}
                />
                </Grid>
                <Grid item xs={12}>
                <TextField
                    name="password"
                    variant="outlined"
                    disabled
                    fullWidth
                    id="password"
                    label="Meeting Password"
                    value={jobRecord.password}
                />
                </Grid>
                <Grid item xs={12}>
                <TextField
                    name="start_url"
                    variant="outlined"
                    disabled
                    fullWidth
                    id="start_url"
                    label="Start URL"
                    value={jobRecord.start_url}
                    InputProps={{endAdornment:
                      <InputAdornment>
                        <IconButton>
                          <CopyIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => { navigate(jobRecord.start_url); }}
                        >
                          <ArrowForwardIosIcon />
                        </IconButton>
                      </InputAdornment>
                    }}
                />
                </Grid>
                <Grid item xs={12}>
                <TextField
                    name="join_url"
                    variant="outlined"
                    disabled
                    fullWidth
                    id="join_url"
                    label="Join URL"
                    value={jobRecord.join_url}
                    InputProps={{endAdornment:
                      <InputAdornment>
                        <IconButton>
                          <CopyIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => { navigate(jobRecord.join_url); }}
                        >
                          <ArrowForwardIosIcon />
                        </IconButton>
                      </InputAdornment>
                    }}
                />
                </Grid>
                <Grid container justify="flex-end">
                  <Grid item>
                  <Link href="#" variant="body2">
                      Copy the invitation
                  </Link>
                  </Grid>
                </Grid>

            </Grid>
            <Button
                //type="submit"
                fullWidth
                variant="contained"
                color="default"
                className={classes.submit}
                startIcon={<SaveIcon />}
            >
                Save Job
            </Button>
            <Button
                fullWidth
                variant="contained"
                color="secondary"
                className={classes.submit}
                startIcon={<DeleteIcon />}
                onClick={handleClickOpen}
            >
                Delete Job
            </Button>
            </form>

            <Dialog
              open={open}
              onClose={handleClose}
              aria-labelledby="alert-dialog-delete-job"
              aria-describedby="alert-dialog-delete-job-description"
            >
              <DialogTitle id="alert-dialog-title">{"Delete this job?"}</DialogTitle>
              <DialogActions>
                <Button onClick={handleClose} color="primary">
                  Cancel
                </Button>
                <Button onClick={removeJob} color="primary" autoFocus>
                  OK
                </Button>
              </DialogActions>
            </Dialog>
        </div>
        </Container>
    </React.Fragment>
  ) 
};
export default JobPage;