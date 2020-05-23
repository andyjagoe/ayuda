import React, { useContext, useState, useRef, useEffect } from 'react';
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
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Snackbar from '@material-ui/core/Snackbar';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { navigate } from "@reach/router"
import { makeStyles } from '@material-ui/core/styles';
import { UserContext } from "../providers/UserProvider";
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import CustomerChooser from './CustomerChooser';
import RateChooser from './RateChooser';
import MomentUtils from '@date-io/moment';
import firebase from 'firebase/app';
import 'firebase/functions';
import copy from 'copy-to-clipboard';
var moment = require('moment');


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
  const {displayName, email} = user;

  //TODO: If jobRecord not set then try to retrieve from Firestore using url params
  const jobRecord = props.location.state.jobRecord;

  const firstRender = useRef(true)

  // Handle updateable form elements
  const [disable, setDisabled] = useState(false)
  const [topic, setTopic] = useState(jobRecord.topic);
  const [status, setStatus] = useState('');
  const [payer, setPayer] = useState(null);
  const [rate, setRate] = useState(null);
  const [notes, setNotes] = useState(jobRecord.agenda);
  const [values, setValues] = useState({
    showPassword: false,
  });
  const [start, handleStartDateChange] = useState(moment
    .unix(jobRecord.t.seconds)
    .tz(jobRecord.tz)  
    .toDate()
  );
  const [end, handleEndDateChange] = useState(moment
    .unix(jobRecord.t.seconds)
    .tz(jobRecord.tz)
    .add(jobRecord.d,"m")
    .toDate()
  );
  const [endError, setEndError] = useState(false)
  const [endErrorLabel, setEndErrorLabel] = useState(null)
  

  // Validate data before allowing save/update
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      formatStatus(jobRecord.status);
      return
    }
    setDisabled(formValidation())
    
  }, [payer, rate, topic, start, end])

  const formValidation = () => {
    var startBeforeEnd = moment(end).isBefore(start);
    var startToFinish = moment(end).diff(moment(start), 'hours');

    if (startBeforeEnd) {
      //TODO: to implement in ui
      console.log("Call must start before it ends")
      setEndErrorLabel("Call must start before it ends")
      setEndError(true)
    }

    if (startToFinish > 23) {
      //TODO: to implement in ui
      console.log("Call cannot exceed 24 hours")
      setEndErrorLabel("Call cannot exceed 24 hours")
      setEndError(true)
    }

    if (payer == null
        || topic === ""
        || rate == null
        || startBeforeEnd
        || startToFinish > 23
        ) {
      return true
    } else {
      return false
    }
  }


  // Set max date for start and end dates
  const maxDate = moment().add(1,"Y");
  function round(date, duration, method) {
      return moment(Math[method]((+date) / (+duration)) * (+duration)); 
  } 


  // Handle formatting for status  value
  const formatStatus  = (status) => {
    if (status === 'authorized')  {
      setStatus('Confirmed')
    } else {
      setStatus(jobRecord.status.charAt(0).toUpperCase() + 
      jobRecord.status.substr(1))
    }
  }

  // Adjust end date when user changes start date
  const updateEndDate = (event) => {
    const duration = moment(end).diff(moment(start), 'minutes')
    const updatedEndDate = moment(event).tz(jobRecord.tz).add(duration,"m").toDate()
    handleEndDateChange(updatedEndDate);
  }


  // Handle password show/hide
  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };


  // Handle copying and snackbar messages
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState(false);
  const [snackbarKey, setSnackbarKey] = React.useState(false);
  const handleSnackbarClick = (text, message, key) => {
    copy(text);
    setSnackbarMessage(message);
    setSnackbarKey(key);
    setOpenSnackbar(true);
  };
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };


  // Handle copy invitation
  const [openCopyDialog, toggleOpenCopyDialog] = React.useState(false);
  const [invitation, setInvitation] = useState("")
  const handleOpenCopyDialog = () => {
    setInvitation(getInvitationMarkup())
    toggleOpenCopyDialog(true);
  };
  const handleCloseCopyDialog = () => {
    toggleOpenCopyDialog(false);
  };  
  function getInvitationMarkup () {  
    const formattedstart = moment
      .unix(jobRecord.t.seconds)
      .tz(jobRecord.tz)  
      .format(('MMMM Do, h:mm a'));
    return `${displayName} (${email}) is inviting you to a scheduled Ayuda Zoom meeting.

Topic: ${jobRecord.topic}
Time: ${formattedstart}
    
Join Ayuda Zoom Meeting
${jobRecord.join_url}
    
Meeting ID: ${jobRecord.id}
Password: ${jobRecord.password}
    ` //TODO: remove hardcoding of Ayuda in template
  }


  // Handle remove job
  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  async function removeJob() {
    var removeJob = firebase.functions().httpsCallable('removeJob');
    await removeJob({
      id: props.jobId, 
    })
    .then(function(result) {
        console.log(result.data);
        navigate('/');
    })
    .catch(function(error) {
        console.log(error.message);
        //TODO: Handle user navigation for error state
    });
  }


  // Handle update job
  async function updateJob() {
    try {
      var updateJob = firebase.functions().httpsCallable('updateJob');
      await updateJob({
        job_id: props.jobId, 
        topic: topic,
        payer: payer.name,
        payer_id: payer.id,
        rate_id: rate.id,
        notes: notes,
        zoom_id: jobRecord.id,
        start: start.toISOString(),
        duration: moment(end).diff(moment(start), 'minutes'),
        tz: jobRecord.tz
      })
      navigate('/');
    } catch (error) {
      console.error("Error: ", error);
      return false
    }    
  }


  // Receive customer data from customer child component
  const customerCallbackFunction = (childData) => {
    setPayer(childData)
  }
  // Receive customer data from rates child component
  const rateCallbackFunction = (childData) => {
    setRate(childData)
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
                    autoComplete="topic"
                    name="topic"
                    variant="outlined"
                    required
                    fullWidth
                    id="topic"
                    label="What's the call about?"
                    value={topic}
                    onChange={(event) => {
                      setTopic(event.target.value);
                    }}
                />
                </Grid>
                <Grid item xs={6}>
                <CustomerChooser 
                  parentCallback={customerCallbackFunction} 
                  initialCustomerId={jobRecord.payer_id}
                />
                </Grid>
                <Grid item xs={6}>
                <RateChooser 
                  parentCallback={rateCallbackFunction} 
                  initialRateId={jobRecord.rate_id}
                />
                </Grid>
                <Grid item xs={6}>
                  <MuiPickersUtilsProvider variant="outlined" utils={MomentUtils}>
                    <DateTimePicker 
                      required
                      disablePast
                      maxDate={maxDate}
                      maxDateMessage="Schedule only availble for one year."
                      inputVariant="outlined"
                      label="When does it start?"
                      id="start"
                      name="start"
                      value={start}
                      onChange={val => {
                        updateEndDate(val);
                        handleStartDateChange(val);
                      }}
                      />
                  </MuiPickersUtilsProvider>
                </Grid>
                <Grid item xs={6}>
                  <MuiPickersUtilsProvider utils={MomentUtils}>
                    <DateTimePicker 
                      required
                      disablePast
                      openTo="hours"
                      maxDate={maxDate}
                      maxDateMessage="Schedule only availble for one year."
                      inputVariant="outlined"
                      label="When does it end?"
                      id="end"
                      name="end"
                      value={end}
                      onChange={handleEndDateChange}
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
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                />
                </Grid>
                <Grid item xs={12}>
                <TextField
                    name="status"
                    variant="outlined"
                    disabled
                    fullWidth
                    id="status"
                    label="Status"
                    value={status}
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
                    type={values.showPassword ? 'text' : 'password'}
                    disabled
                    fullWidth
                    id="password"
                    label="Meeting Password"
                    value={jobRecord.password}
                    InputProps={{endAdornment:
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                        >
                          {values.showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    }}  
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
                        <IconButton
                          onClick={() => { handleSnackbarClick(
                            jobRecord.start_url,
                            'Start URL copied',
                            'start_url'); }}
                        >
                          <CopyIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => { window.open(jobRecord.start_url, '_blank'); }}
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
                        <IconButton
                          onClick={() => { handleSnackbarClick(
                            jobRecord.join_url,
                            'Join URL copied',
                            'join_url'); }}
                        >
                          <CopyIcon />                                                  
                        </IconButton>
                        <IconButton
                          onClick={() => { window.open(jobRecord.join_url, '_blank'); }}
                        >
                          <ArrowForwardIosIcon />
                        </IconButton>
                      </InputAdornment>
                    }}
                />
                </Grid>
                <Grid container justify="flex-end">
                  <Grid item>
                  <Link onClick={handleOpenCopyDialog} variant="body2">
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
                onClick={updateJob}
                disabled={disable}
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
                Cancel Job
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

            <Snackbar
              anchorOrigin= {{ vertical: 'top', horizontal: 'center' }}
              key={snackbarKey}
              autoHideDuration={6000}
              open={openSnackbar}
              onClose={handleSnackbarClose}
              message={snackbarMessage}
            />

        </div>

        <Dialog open={openCopyDialog} 
            onClose={handleCloseCopyDialog} 
            aria-labelledby="form-dialog-copy-invitation"
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle id="form-dialog-copy-invitation">Copy meeting invitation</DialogTitle>
            <DialogContent>
              <div>
              <TextField
                    name="invitation"
                    variant="outlined"
                    fullWidth
                    disabled
                    multiline
                    id="invitation"
                    label="Meeting Invitation"
                    value={invitation}
                />
              </div>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => { handleSnackbarClick(
                            invitation,
                            'Invitation copied',
                            'invitation'); }}                             
                color="primary"                
              >
                Copy Invitation
              </Button>
              <Button onClick={handleCloseCopyDialog} color="default">
                Cancel
              </Button>
            </DialogActions>
        </Dialog>

        </Container>
    </React.Fragment>
  ) 
};
export default JobPage;
