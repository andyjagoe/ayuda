import React, { useContext, useState, useEffect, useRef } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import { UserContext } from "../providers/UserProvider";
import firebase from 'firebase/app';
import { firestore } from "../firebase"
import 'firebase/functions';
import MuiPhoneNumber from "material-ui-phone-number";



const filter = createFilterOptions();


export default function CustomerChooser(props) {
  const user = useContext(UserContext);
  const {uid} = user;

  const [payerDetails, setPayerDetails] = useState(null);
  const [payerName, setPayerName] = useState("")
  const [payerNameError, setPayerNameError] = useState(null)
  const [payerEmail, setPayerEmail] = useState("")
  const [payerEmailError, setPayerEmailError] = useState(null)

  const [customers, setCustomers] = useState([])

  const firstRender = useRef(true)
  const [disable, setDisabled] = useState(true)
    

  // Share payer selected data with parent object
  const sendData = (data) => {
    if (data == null) {
        return
    }
    props.parentCallback(data);
  }
  

  // Check for valid email
  function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
  }


  useEffect(() => {
    if (firstRender.current) {
        getCustomerList()
        firstRender.current = false
      return
    }
    setDisabled(formValidation())
    
  }, [payerDetails, payerName, payerEmail])


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

    // Add new customer to Firestore
    let newDoc = await firestore.collection('/users')
        .doc(uid)
        .collection('customers')
        .add({
            name: customerDialogValue.name,
            email: customerDialogValue.email,
            phone: customerDialogValue.phone,
            t: firebase.firestore.Timestamp.fromDate(new Date()),
    })
    .then(ref => {        
        //console.log('Added document with ID: ', ref.id);
        let newCust = {
            name: customerDialogValue.name,
            id: ref.id,
            email: customerDialogValue.name,
            phone: customerDialogValue.phone,
        };
        setPayerDetails(newCust);
        let tempCusts = customers;
        tempCusts.push(newCust);
        tempCusts.sort((a, b) => (a.name > b.name) ? 1 : -1)
        setCustomers(tempCusts);
    })
    .catch(error => {
        console.error("Add customer error: ", error);
    });

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
              <Button onClick={handleCloseCustomerDialog} color="primary">
                Cancel
              </Button>
              <Button type="submit" color="primary" disabled={disable}>
                Add
              </Button>
            </DialogActions>
          </form>
        </Dialog>

    </React.Fragment>

  );
}
