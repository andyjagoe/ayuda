import React, { useContext, useState, useEffect, useRef } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import EventIcon from '@material-ui/icons/Event';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { navigate } from "@reach/router"
import { makeStyles } from '@material-ui/core/styles';
import { UserContext } from "../providers/UserProvider";
import MenuAppBar from './MenuAppBar';
import CustomerChooser from './CustomerChooser';
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import firebase from 'firebase/app';
import 'firebase/functions';
var moment = require('moment');


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
}));


export default function AddJobPage(props) {
  const classes = useStyles();
  const user = useContext(UserContext);

  const [didTryrequest, setDidTryrequest] = React.useState(false);
  const [payer, setPayer] = useState("");
  const [payerError, setPayerError] = useState(null)
  const [topic, setTopic] = useState("");
  const [topicError, setTopicError] = useState(null)
  const [start, handleStartDateChange] = useState(
    round(new Date(), moment.duration(60, "minutes"), "ceil")
    .add(1,"d")
    .toDate()
  );
  const [startError, setStartError] = useState(null)
  const [end, handleEndDateChange] = useState(
    round(new Date(), moment.duration(60, "minutes"), "ceil")
    .add(1,"d")
    .add(1,"H")
    .toDate()
  );
  const [endError, setEndError] = useState(false)
  const [endErrorLabel, setEndErrorLabel] = useState(null)
  const [notes, setNotes] = useState("");
  const [notesError, setNotesError] = useState(null)




  const maxDate = moment().add(1,"Y");
  function round(date, duration, method) {
      return moment(Math[method]((+date) / (+duration)) * (+duration)); 
  }

  const firstRender = useRef(true)
  const [disable, setDisabled] = useState(true)
    
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    setDisabled(formValidation())
    
  }, [payer, topic, start, end])


  // here we run any validation, returning true/false
  const formValidation = () => {
    if (payer.name === "") {
      setPayerError('Payer name is required')
    } else {
      setPayerError (null)
    }
    if (topic === "") {
      setTopicError('Topic is required')
    } else {
      setTopicError (null)
    }

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


    if (payer === ""
        || topic === ""
        || startBeforeEnd
        || startToFinish > 23
        ) {
      return true
    } else {
      return false
    }

  }
  
  async function handleSubmit(event) {
    event.preventDefault();

    console.log(`payer: ${payer.name}`);
    console.log(`topic: ${topic}`);
    console.log(`start: ${start}`);
    console.log(`duration: ${moment(end).diff(moment(start), 'minutes')}`);
    console.log(`notes: ${notes}`);

    /* Send to Firebase via cloud function which: 
        1) tries to schedule on zoom
        2) If successful, writes to Firestore, returns success, displays snackbar, show home
        3) If error, displays error message
    */

    if (!didTryrequest) {
        setDidTryrequest(true)
        var addJob = firebase.functions().httpsCallable('addJob');
        await addJob({payer: payer.name,
          payer_id: payer.id, 
          topic: topic,
          start: start.toISOString(),
          duration: moment(end).diff(moment(start), 'minutes'),
          notes: notes,
        })
        .then(function(result) {
            var sanitizedMessage = result.data;
            console.log(result.data);
            //setResultMessage('Stripe connected successfully')
            //setResultSeverity('success')
            //setIsLoading(false)
            navigate('/');
        })
        .catch(function(error) {
            var code = error.code;
            var details = error.details;
            console.log(error.message);
            //setResultMessage(error.message)
            //setResultSeverity('error')
            //setIsLoading(false)
            //TODO: Handle user navigation for error state
        });
    }            

  }

  // Receive customer data from child component
  const callbackFunction = (childData) => {
    console.log(childData.name);
    console.log(childData.id);
    console.log(childData.email);
    console.log(childData.phone);
    setPayer(childData)
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
              Schedule a job
            </Typography>
            <form 
              className={classes.form} 
              noValidate
              onSubmit={handleSubmit}
              >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                  <TextField
                      autoFocus
                      autoComplete="topic"
                      name="topic"
                      variant="outlined"
                      required
                      fullWidth
                      id="topic"
                      label="What's the call about?"
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomerChooser parentCallback={callbackFunction} />
                </Grid>
                <Grid item xs={6}>
                <Autocomplete
                  id="rate"
                  options={rates.map((option) => option.rate_name)}
                  renderInput={(params) => (
                    <TextField {...params} 
                      label="Hourly rate" 
                      variant="outlined"
                      required 
                      fullWidth
                    />
                  )}
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
                      label="Call starts at"
                      id="start"
                      name="start"
                      value={start}
                      //onChange={handleStartDateChange}
                      onChange={val => {
                        handleStartDateChange(val);
                        handleEndDateChange(val);
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
                      label="Call ends at"
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
            </Grid>
            <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={disable}
                className={classes.submit}
            >
                Add Job
            </Button>
            <Grid container justify="flex-end">
                <Grid item>
                <Link href="#" variant="body2">
                    Need help?
                </Link>
                </Grid>
            </Grid>
            </form>
        </div>

        </Container>
    </React.Fragment>

  );
}

const rates = [
  { rate_name: 'Free', rate_id: 0 },
  { rate_name: '$15', rate_id: 1 },
  { rate_name: '$20', rate_id: 2 },
]