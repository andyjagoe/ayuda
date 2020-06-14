import React, { useContext, useState, useEffect, useRef } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import CircularProgress from '@material-ui/core/CircularProgress';
import { green } from '@material-ui/core/colors';
import { UserContext } from "../providers/UserProvider";
import firebase from 'firebase/app';
import { firestore } from "../firebase"
import 'firebase/functions';
import MuiPhoneNumber from "material-ui-phone-number";


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


export default function CustomerChooser(props) {
  const classes = useStyles();
  const user = useContext(UserContext);
  const {uid} = user;

  const [payerDetails, setPayerDetails] = useState(null);
  const [payerName, setPayerName] = useState("")
  const [payerNameError, setPayerNameError] = useState(null)
  const [payerEmail, setPayerEmail] = useState("")
  const [payerEmailError, setPayerEmailError] = useState(null)

  const [customers, setCustomers] = useState([])

  const firstRender = useRef(true)
  const [gotCustomerRecord, setGotCustomerRecord] = useState(false)
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
  

  // Check for valid email
  function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
  }


  useEffect(() => {
    setDisabled(formValidation())

    if (firstRender.current) {
      if (props.addJob === true) {
          getCustomerList()
      }
      firstRender.current = false
      return
    }

    if (props.initialCustomerId != null) {
      if (gotCustomerRecord) {return}
      getCustomerList()
      setGotCustomerRecord(true)
    }

  }, [payerDetails, payerName, payerEmail, props.initialCustomerId, props.addJob])


  const formValidation = () => {
    sendData(payerDetails)

    if (payerName === "") {
        setPayerNameError('Name is required')
    } else {
        setPayerNameError (null)
    }  

    if (payerEmail === "") {
        setPayerEmailError('Email is required')
    } else {
        setPayerEmailError (null)
    }  

    let isValidEmail = validateEmail(payerEmail)
    if (!isValidEmail) {
        setPayerEmailError('Invalid email address')
    } else {
        setPayerEmailError (null)
    }  

    if (payerName === ""
        || payerEmail === ""
        || !isValidEmail
        ) {
      return true
    } else {
      return false
    }
  }


  // Handle adding new customers
  const [openCustomerDialog, toggleOpenCustomerDialog] = React.useState(false);

  const handleCloseCustomerDialog = () => {
    setCustomerDialogValue({
      name: '',
      id: '',
      email: '',
      phone: '',
    });

    toggleOpenCustomerDialog(false);
    setSuccess(false);
  };

  const [customerDialogValue, setCustomerDialogValue] = React.useState({
    name: '',
    id: '',
    email: '',
    phone: '',
  });

  async function handleSubmitCustomerDialog (event) {    
    event.preventDefault();
    event.stopPropagation()

    setDisabled(true)

    if (!loading) {
      setSuccess(false);
      setLoading(true);
    }

    // Add new customer    
    var addCustomer = firebase.functions().httpsCallable('addCustomer');
    try {
      const newCustomer = await addCustomer({
        name: customerDialogValue.name,
        email: customerDialogValue.email,
        phone: customerDialogValue.phone,
      })
      let newCust = {
          name: customerDialogValue.name,
          id: newCustomer.data.id,
          email: customerDialogValue.name,
          phone: customerDialogValue.phone,
      };
      setPayerDetails(newCust);
      let tempCusts = customers;
      tempCusts.push(newCust);
      tempCusts.sort((a, b) => (a.name > b.name) ? 1 : -1)
      setCustomers(tempCusts);

      setDisabled(false)
      setSuccess(true);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setDisabled(false)
      setSuccess(false);
      setLoading(false);
    }

    handleCloseCustomerDialog();
  };  



  async function getCustomerList() {
      
    let customer_records = []
    await firestore
    .collection("/users")
    .doc(uid)
    .collection('customers')
    .orderBy('name')
    .get()
    .then(snapshot => {
        if (snapshot.empty) {
            console.log('No matching documents.');
            return customers;
        }  
        snapshot.forEach(doc => {
            let customers = doc.data();
            customers.id = doc.id;
            customer_records.push(customers);
        });
        return customer_records;
    })
    .then(customer_records => {
        setCustomers(customer_records);

        //Choose selected customer if available
        if (props.initialCustomerId != null) {
            let custIndex = customer_records.findIndex(x => x.id === props.initialCustomerId);
            setPayerDetails(customer_records[custIndex])
        }
    })
    .catch(err => {
        console.log('Error getting documents', err);
    });            

  }

  return (
    <React.Fragment>
                <Autocomplete
                  value={payerDetails}
                  disabled={props.disabled}
                  onChange={(event, newValue) => {
                    if (typeof newValue === 'string') {
                        // timeout to avoid instant validation of the dialog's form.
                      setTimeout(() => {
                        toggleOpenCustomerDialog(true);
                        setPayerName(newValue);
                        setCustomerDialogValue({
                          name: newValue,
                          id: '',
                          email: '',
                          phone: '',
                        });
                      });
                      return;
                    }
          
                    if (newValue && newValue.inputValue) {
                      toggleOpenCustomerDialog(true);
                      setPayerName(newValue);
                      setCustomerDialogValue({
                        name: newValue.inputValue,
                        id: '',
                        email: '',
                        phone: '',
                    });
          
                      return;
                    }
          
                    setPayerDetails(newValue);
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
                  onInputChange={(event) => {
                    sendData(payerDetails);
                  }}       
                  options={customers}
                  getOptionLabel={(option) => {
                    // e.g value selected with enter, right from the input
                    if (typeof option === 'string') {
                      return option;
                    }
                    if (option.inputValue) {
                      return option.inputValue;
                    }

                    return option.name;
                  }}
                  selectOnFocus
                  freeSolo
                  id="payerDetails"
                  renderInput={(params) => (
                    <TextField {...params} 
                      label="Who's paying?" 
                      variant="outlined"
                      required 
                      fullWidth
                    />
                  )}
                />

          <Dialog open={openCustomerDialog} 
            onClose={handleCloseCustomerDialog} 
            aria-labelledby="form-dialog-add-customer"
            fullWidth
            maxWidth="xs"
          >
          <form onSubmit={handleSubmitCustomerDialog}>
            <DialogTitle id="form-dialog-add-customer-title">Add new customer</DialogTitle>
            <DialogContent>
              <DialogContentText>
              </DialogContentText>
              <div>
              <TextField
                autoFocus
                required
                margin="dense"
                id="name"
                fullWidth
                value={customerDialogValue.name}
                onChange={(event) => {
                    setCustomerDialogValue({ ...customerDialogValue, 
                        name: event.target.value });
                    setPayerName(event.target.value);
                }
                }
                label="Name"
                type="text"
              />
              </div>

              <div>
              <TextField
                required
                margin="dense"
                id="email"
                type="email"
                fullWidth
                value={customerDialogValue.email}
                onChange={(event) => {
                    setCustomerDialogValue({ ...customerDialogValue, 
                        email: event.target.value });
                        setPayerEmail(event.target.value);
                    }   
                }
                label="Email"
                type="text"
              />
              </div>
              <div>
              <MuiPhoneNumber
                margin="dense"
                id="phone"
                type="tel"
                fullWidth
                defaultCountry={'us'}
                value={customerDialogValue.phone}
                onChange={event => setCustomerDialogValue({ ...customerDialogValue, 
                    phone: event })} 
                label="Phone"
              />
              </div>
            </DialogContent>
            <DialogActions>
              <div className={classes.root}>
                  <div className={classes.wrapper}>
                    <Button onClick={handleCloseCustomerDialog} color="primary">
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
              {/*}
              <Button type="submit" color="primary" disabled={disable}>
                Add
              </Button>
                */}
            </DialogActions>
          </form>
        </Dialog>

    </React.Fragment>

  );
}
