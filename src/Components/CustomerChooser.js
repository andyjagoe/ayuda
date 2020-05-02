import React, { useContext, useState, useEffect, useRef } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import { navigate } from "@reach/router"
import { makeStyles } from '@material-ui/core/styles';
import { UserContext } from "../providers/UserProvider";
import firebase from 'firebase/app';
import { firestore } from "../firebase"
import 'firebase/functions';
import MuiPhoneNumber from "material-ui-phone-number";


const filter = createFilterOptions();

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


export default function CustomerChooser(props) {
  const classes = useStyles();
  const user = useContext(UserContext);
  const {uid} = user;

  const [didTryrequest, setDidTryrequest] = React.useState(false);
  const [payerDetails, setPayerDetails] = useState(null);
  const [payerError, setPayerError] = useState(null)

  const firstRender = useRef(true)
  const [disable, setDisabled] = useState(true)
    

  // Share payer selected data with parent object
  const sendData = (data) => {
    if (data == null) {
        return
    }
    props.parentCallback(data);
  }
  
  useEffect(() => {
    if (firstRender.current) {
        firstRender.current = false
      return
    }
    setDisabled(formValidation())
    
  }, [payerDetails])


  const formValidation = () => {
    console.log("formValidation");
    sendData(payerDetails)

    if (payerDetails == null) {
        setPayerError('Payer name is required')
        console.log("No value for payerDetails.")
    } else {
      setPayerError (null)
      console.log("payerDetails: " + payerDetails.name)
    }

    if (payerDetails == null
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
        console.log('Added document with ID: ', ref.id);
        setPayerDetails({
            name: customerDialogValue.name,
            id: ref.id,
            email: customerDialogValue.name,
            phone: customerDialogValue.phone,
        });    
    })
    .catch(error => {
        console.error("Add customer error: ", error);
    });

    handleCloseCustomerDialog();
  };  


  return (
    <React.Fragment>
                <Autocomplete
                  value={payerDetails}
                  onChange={(event, newValue) => {
                    console.log("onChange")
                    if (typeof newValue === 'string') {
                        // timeout to avoid instant validation of the dialog's form.
                      setTimeout(() => {
                        toggleOpenCustomerDialog(true);
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
                margin="dense"
                id="name"
                fullWidth
                value={customerDialogValue.name}
                onChange={(event) => setCustomerDialogValue({ ...customerDialogValue, 
                  name: event.target.value })}
                label="Name"
                type="text"
              />
              </div>

              <div>
              <TextField
                margin="dense"
                id="email"
                fullWidth
                value={customerDialogValue.email}
                onChange={(event) => setCustomerDialogValue({ ...customerDialogValue, 
                  email: event.target.value })}
                label="Email"
                type="text"
              />
              </div>
              <div>
              <MuiPhoneNumber
                margin="dense"
                id="phone"
                fullWidth
                defaultCountry={'us'}
                value={customerDialogValue.phone}
                onChange={event => setCustomerDialogValue({ ...customerDialogValue, 
                    phone: event })} 
                label="Phone"
                type="text"
              />
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseCustomerDialog} color="primary">
                Cancel
              </Button>
              <Button type="submit" color="primary">
                Add
              </Button>
            </DialogActions>
          </form>
        </Dialog>

    </React.Fragment>

  );
}

const customers = [
  { name: 'John White', id: '0', email: '123', phone: '234' },
  { name: 'Mary Jones', id: '1', email: '123', phone: 'dwe' },
  { name: 'Mike D', id: '2', email: '123', phone: 'dde' },
]
