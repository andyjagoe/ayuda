import React, { useContext, useState, useEffect, useRef } from 'react';
import Button from '@material-ui/core/Button';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Alert from '@material-ui/lab/Alert';
import Collapse from '@material-ui/core/Collapse';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import CircularProgress from '@material-ui/core/CircularProgress';
import { green } from '@material-ui/core/colors';
import CurrencyTextField from '@unicef/material-ui-currency-textfield'
import TextField from '@material-ui/core/TextField';
import { UserContext } from "../providers/UserProvider";
import { navigate } from "@reach/router";
import firebase from 'firebase/app';
import { firestore } from "../firebase"
import 'firebase/functions';


const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  wrapper: {
    margin: theme.spacing(3, 0, 2),
    position: 'relative',
    width: '100%',
  },
  buttonSuccess: {
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700],
    },
  },
  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
}));


const filter = createFilterOptions();


export default function RateChooser(props) {
  const classes = useStyles();
  const user = useContext(UserContext);
  const {uid} = user;

  const [rateDetails, setRateDetails] = useState(null);
  const [rateName, setRateName] = useState("")
  const [rateNameError, setRateNameError] = useState(null)
  const [rates, setRates] = useState([])

  const [alertMessage, setAlertMessage] = useState('Payments not set up');
  const [showAlert, setShowAlert] = useState(false);

  const firstRender = useRef(true)
  const [gotRateRecord, setGotRateRecord] = useState(false)
  const [disable, setDisabled] = useState(true)
    

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const buttonClassname = clsx({
    [classes.buttonSuccess]: success,
  });


  // Share payer selected data with parent object
  const sendData = (data) => {
    props.parentCallback(data);
  }
  


  useEffect(() => {
    setDisabled(formValidation())

    if (firstRender.current) {
      if (props.addJob === true) {
        getRateList()
      }
      firstRender.current = false
      return
    }

    if (props.initialRateId != null) {
      if (gotRateRecord) {return}
      getRateList()
      setGotRateRecord(true)
    }

  }, [rateDetails, rateName, props.initialRateId])



  const formValidation = () => {
    sendData(rateDetails)

    if (rateName === "") {
        setRateNameError('Name is required')
    } else {
        setRateNameError (null)
    }  

    if (rateName === ""
        ) {
      return true
    } else {
      return false
    }
  }


  // Handle adding new customers
  const [openRateDialog, toggleOpenRateDialog] = React.useState(false);

  const handleCloseRateDialog = () => {
    setShowAlert(false)
    setRateDialogValue({
      name: '',        
      rate: '',
      id: '',
      currency: '',
    });

    toggleOpenRateDialog(false);
  };

  const [rateDialogValue, setRateDialogValue] = React.useState({
    name: '',        
    rate: '',
    id: '',
    currency: '',
  });

  function sanitizeRateInput(newValue) {
    let sanitized = newValue.replace('-', '')
    if (parseFloat(newValue) > 1000) {
        return 1000
    }
    return sanitized
  }

  async function handleSubmitRateDialog (event) {    
    event.preventDefault();
    event.stopPropagation()

    setShowAlert(false)
    setDisabled(true)

    if (!loading) {
      setSuccess(false);
      setLoading(true);
    }

    
    // Add new rate to Firestore
    try {
      const dbRef = await firestore.collection('/users')
        .doc(uid)
        .collection('rates')
        .add({
            name: rateDialogValue.name,
            rate: parseFloat(rateDialogValue.name),
            currency: rateDialogValue.currency,
            t: firebase.firestore.Timestamp.fromDate(new Date()),
        })
      let newRate = {
        name: rateDialogValue.name,
        rate: parseFloat(rateDialogValue.name),
        currency: rateDialogValue.currency,
        id: dbRef.id,
      };
      setRateDetails(newRate);
      let tempRates = rates;
      tempRates.push(newRate);
      tempRates.sort((a, b) => (a.rate > b.rate) ? 1 : -1)
      setRates(tempRates);

      setDisabled(false)
      setSuccess(true);
      setLoading(false);

    } catch (error) {
      console.error("Error: ", error.message);
      if (error.code === 'permission-denied') {
        setShowAlert(true)
      }
      setDisabled(false)
      setSuccess(false);
      setLoading(false);

      return null
    } 

    handleCloseRateDialog();
  };  



  async function getRateList() {
      
    let rate_records = []
    await firestore
    .collection("/users")
    .doc(uid)
    .collection('rates')
    .orderBy('rate')
    .get()
    .then(snapshot => {
        if (snapshot.empty) {
            console.log('No matching documents.');
            return rate_records;
        }
        snapshot.forEach(doc => {
            let rate = doc.data();
            rate.id = doc.id;
            rate_records.push(rate);
        });
        return rate_records;
    })
    .then(rate_records => {
        setRates(rate_records);
        //console.log(rate_records)
        
        //Choose selected rate if available
        if (props.initialRateId != null) {
            let rateIndex = rate_records.findIndex(x => x.id === props.initialRateId);
            setRateDetails(rate_records[rateIndex])
            sendData(rate_records[rateIndex])
        }
    })
    .catch(err => {
        console.log('Error getting documents', err);
    });            

  }

  return (
    <React.Fragment>
                <Autocomplete
                  value={rateDetails}
                  disabled={props.disabled}
                  onChange={(event, newValue) => {
                    if (typeof newValue === 'string') {
                        // timeout to avoid instant validation of the dialog's form.
                      setTimeout(() => {
                        toggleOpenRateDialog(true);
                        setRateName(newValue);
                        setRateDialogValue({
                          name: newValue,
                          rate: parseFloat(newValue),
                          id: '',
                          currency: 'usd',
                        });
                      });
                      return;
                    }
          
                    if (newValue && newValue.inputValue) {
                      toggleOpenRateDialog(true);
                      setRateName(newValue.inputValue);
                      setRateDialogValue({
                        name: newValue.inputValue,
                        rate: parseFloat(newValue.inputValue),
                        id: '',
                        currency: 'usd',
                      });
          
                      return;
                    }
          
                    setRateDetails(newValue);
                  }}
                  filterOptions={(options, params) => {
                    const filtered = filter(options, params);
          
                    if (params.inputValue !== '') {
                      filtered.push({
                        inputValue: params.inputValue,
                        name: `Add "${params.inputValue}"`,
                        });
                    }
          
                    return filtered;
                  }}
                  renderOption={(option) => option.name}          
                  options={rates}
                  getOptionLabel={(option) => {
                    // e.g value selected with enter, right from the input
                    if (typeof option === 'string') {
                        return option.name;
                    }
                    if (option.inputValue) {
                      return option.inputValue;
                    }

                    return option.name;
                  }}
                  selectOnFocus
                  freeSolo
                  id="rateDetails"
                  renderInput={(params) => (
                    <TextField {...params} 
                    label="Hourly rate" 
                    variant="outlined"
                    required 
                    fullWidth
                    type="number"
                    onInput = {(e) =>{
                        e.target.value = sanitizeRateInput(e.target.value)
                    }}
                    />
                  )}                                      
                />

          <Dialog open={openRateDialog} 
            onClose={handleCloseRateDialog} 
            aria-labelledby="form-dialog-add-customer"
            fullWidth
            maxWidth="xs"
          >
          <form onSubmit={handleSubmitRateDialog}>
            <DialogTitle id="form-dialog-add-customer-title">Add new rate</DialogTitle>
            <DialogContent>
              <DialogContentText>
                <Collapse in={showAlert}>
                  <Alert severity="error" action={
                    <Button color="inherit" size="small" onClick={() => { navigate('/setup-payments'); }} >
                      ENABLE PAYMENTS
                    </Button>
                  }>
                    {alertMessage}
                  </Alert>
                </Collapse>
              </DialogContentText>
              <div>
              <CurrencyTextField
                autoFocus
                required
                margin="dense"
                id="name"
                fullWidth
                currencySymbol="$"
                minimumValue="0"
                maximumValue="1000"
                outputFormat="string"
                decimalPlaces={0}
		            decimalCharacter="."
                digitGroupSeparator=","
                textAlign="left"
                value={rateDialogValue.rate}
                onChange={(event) => {
                    setRateDialogValue({ ...rateDialogValue, 
                        name: event.target.value,
                        rate: parseFloat(event.target.value)});
                    setRateName(event.target.value);
                }
                }
                label="Hourly rate"
              />
              </div>

            </DialogContent>
            <DialogActions>
            <div className={classes.root}>
              <div className={classes.wrapper}>
                <Button onClick={handleCloseRateDialog} color="primary">
                  Cancel
                </Button>
                </div>
            </div>
              <div className={classes.root}>
                <div className={classes.wrapper}>
                  <Button
                    type="submit"
                    color="primary"
                    className={buttonClassname}
                    disabled={disable}
                  >
                    Add
                  </Button>
                  {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
                </div>
              </div>
            </DialogActions>
          </form>
        </Dialog>

    </React.Fragment>

  );
}
