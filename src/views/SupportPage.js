import React, { useEffect, useRef } from "react";
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import SignedOutAppBar from 'components/SignedOutAppBar';
import Footer from 'components/Footer';
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles((theme) => ({
    '@global': {
        ul: {
            margin: 0,
            padding: 0,
            listStyle: 'none',
        },
    },
    link: {
        margin: theme.spacing(1, 1.5),
    },
    heroContent: {
        padding: theme.spacing(8, 0, 6),
    },
    contactForm: {
        paddingTop: theme.spacing(8),
    },
    footer: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(6),
    },
}));


const SupportPage = () => {
    const classes = useStyles();
    const firstRender = useRef(true)

    useEffect(() => {

        if (firstRender.current) {
            firstRender.current = false
            const script = document.createElement('script');
      
            script.src = '//js.hsforms.net/forms/shell.js';
            script.type = 'text/javascript';
            script.charset = 'utf-8'
            script.addEventListener('load', () => {
                if(window.hbspt) {
                  window.hbspt.forms.create({
                    portalId: "7857404",
                    formId: "c508f1f7-b5c4-4778-8b2e-4d8a14fdbde4",
                    target: '#support_form'
                })
              }
            });
          
            document.body.appendChild(script);

        }
        return

    }, []);

    return (
        <React.Fragment>
            <CssBaseline />
            <SignedOutAppBar />
            <Container maxWidth="sm">
                <div className={classes.heroContent}>
                    <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
                        Request Support
                    </Typography>
                </div>
                <div id="support_form" />
            </Container>            
            <Footer />
        </React.Fragment>
    ) 
};
export default SupportPage;