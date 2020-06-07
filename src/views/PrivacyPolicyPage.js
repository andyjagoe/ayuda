import React from "react";
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
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
        padding: theme.spacing(8, 0, 4),
    },
    contactForm: {
        paddingTop: theme.spacing(8),
    },
    footer: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(6),
    },
}));


const PrivacyPolicyPage = () => {
    const classes = useStyles();

    return (
        <React.Fragment>
            <CssBaseline />
            <SignedOutAppBar />
            <Container maxWidth="sm">
                <div className={classes.heroContent}>
                    <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
                        Privacy Policy
                    </Typography>
                </div>
                <Typography variant="body1" >
                <p>Protecting your private information is our priority. This Statement of Privacy applies to https://ayuda.live and Ayuda Live and governs data collection and usage. For the purposes of this Privacy Policy, unless otherwise noted, all references to Ayuda Live include https://ayuda.live. The Ayuda Live website is a business service site. By using the Ayuda Live website, you consent to the data practices described in this statement.</p>                  
                <p>Collection of your Personal Information<br />
                In order to better provide you with products and services offered on our Site, Ayuda Live may collect personally identifiable information, such as your: </p>                  
                <List>                    
                    <ListItem>First and Last Name </ListItem>
                    <ListItem>Mailing Address </ListItem>
                    <ListItem>E-mail Address </ListItem>
                    <ListItem>Phone Number </ListItem>
                </List>
                <p>If you purchase Ayuda Live's products and services, we collect billing and credit card information. This information is used to complete the purchase transaction. </p>                  
                <p>Please keep in mind that if you directly disclose personally identifiable information or personally sensitive data through Ayuda Live's public message boards, this information may be collected and used by others. </p>
                  
                <p>We do not collect any personal information about you unless you voluntarily provide it to us. However, you may be required to provide certain personal information to us when you elect to use certain products or services available on the Site. These may include: (a) registering for an account on our Site; (b) entering a sweepstakes or contest sponsored by us or one of our partners; (c) signing up for special offers from selected third parties; (d) sending us an email message; (e) submitting your credit card or other payment information when ordering and purchasing products and services on our Site. To wit, we will use your information for, but not limited to, communicating with you in relation to services and/or products you have requested from us. We also may gather additional personal or non-personal information in the future. </p>
                  
                <p>Use of your Personal Information </p>
                <p>Ayuda Live collects and uses your personal information to operate its website(s) and deliver the services you have requested. </p>
                  
                <p>Ayuda Live may also use your personally identifiable information to inform you of other products or services available from Ayuda Live and its affiliates. </p>
                  
                <p>Sharing Information with Third Parties </p>
                <p>Ayuda Live does not sell, rent or lease its customer lists to third parties. </p>
                  
                <p>Ayuda Live may share data with trusted partners to help perform statistical analysis, send you email or postal mail, provide customer support, or arrange for deliveries. All such third parties are prohibited from using your personal information except to provide these services to Ayuda Live, and they are required to maintain the confidentiality of your information. </p>
                  
                <p>Ayuda Live may disclose your personal information, without notice, if required to do so by law or in the good faith belief that such action is necessary to: (a) conform to the edicts of the law or comply with legal process served on Ayuda Live or the site; (b) protect and defend the rights or property of Ayuda Live; and/or (c) act under exigent circumstances to protect the personal safety of users of Ayuda Live, or the public. </p>
                  
                <p>Tracking User Behavior </p>
                <p>Ayuda Live may keep track of the websites and pages our users visit within Ayuda Live, in order to determine what Ayuda Live services are the most popular. This data is used to deliver customized content and advertising within Ayuda Live to customers whose behavior indicates that they are interested in a particular subject area. </p>
                  
                <p>Automatically Collected Information </p>
                <p>Information about your computer hardware and software may be automatically collected by Ayuda Live. This information can include: your IP address, browser type, domain names, access times and referring website addresses. This information is used for the operation of the service, to maintain quality of the service, and to provide general statistics regarding use of the Ayuda Live website. </p>
                  
                <p>Use of Cookies </p>
                <p>The Ayuda Live website may use "cookies" to help you personalize your online experience. A cookie is a text file that is placed on your hard disk by a web page server. Cookies cannot be used to run programs or deliver viruses to your computer. Cookies are uniquely assigned to you, and can only be read by a web server in the domain that issued the cookie to you. </p>
                  
                <p>One of the primary purposes of cookies is to provide a convenience feature to save you time. The purpose of a cookie is to tell the Web server that you have returned to a specific page. For example, if you personalize Ayuda Live pages, or register with Ayuda Live site or services, a cookie helps Ayuda Live to recall your specific information on subsequent visits. This simplifies the process of recording your personal information, such as billing addresses, shipping addresses, and so on. When you return to the same Ayuda Live website, the information you previously provided can be retrieved, so you can easily use the Ayuda Live features that you customized. </p>
                  
                <p>You have the ability to accept or decline cookies. Most Web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer. If you choose to decline cookies, you may not be able to fully experience the interactive features of the Ayuda Live services or websites you visit. </p>
                  
                <p>Links </p>
                <p>This website contains links to other sites. Please be aware that we are not responsible for the content or privacy practices of such other sites. We encourage our users to be aware when they leave our site and to read the privacy statements of any other site that collects personally identifiable information. </p>
                  
                <p>Security of your Personal Information </p>
                <p>Ayuda Live secures your personal information from unauthorized access, use, or disclosure. Ayuda Live uses the following methods for this purpose: </p>
                  <List>
                    <ListItem>SSL Protocol </ListItem>
                </List>                
                  
                <p>When personal information (such as a credit card number) is transmitted to other websites, it is protected through the use of encryption, such as the Secure Sockets Layer (SSL) protocol. </p>
                  
                <p>We strive to take appropriate security measures to protect against unauthorized access to or alteration of your personal information. Unfortunately, no data transmission over the Internet or any wireless network can be guaranteed to be 100% secure. As a result, while we strive to protect your personal information, you acknowledge that: (a) there are security and privacy limitations inherent to the Internet which are beyond our control; and (b) security, integrity, and privacy of any and all information and data exchanged between you and us through this Site cannot be guaranteed. </p>
                  
                <p>Right to Deletion </p>
                <p>Subject to certain exceptions set out below, on receipt of a verifiable request from you, we will: </p>
                <List>
                    <ListItem>Delete your personal information from our records; and </ListItem>
                    <ListItem>Direct any service providers to delete your personal information from their records. </ListItem>
                </List>
                  
                <p>Please note that we may not be able to comply with requests to delete your personal information if it is necessary to: </p>
                <List>
                    <ListItem>Complete the transaction for which the personal information was collected, fulfill the terms of a written warranty or product recall conducted in accordance with federal law, provide a good or service requested by you, or reasonably anticipated within the context of our ongoing business relationship with you, or otherwise perform a contract between you and us;</ListItem>
                    <ListItem>Detect security incidents, protect against malicious, deceptive, fraudulent, or illegal activity; or prosecute those responsible for that activity; </ListItem>
                    <ListItem>Debug to identify and repair errors that impair existing intended functionality; </ListItem>
                    <ListItem>Exercise free speech, ensure the right of another consumer to exercise his or her right of free speech, or exercise another right provided for by law;</ListItem>
                    <ListItem>Comply with the California Electronic Communications Privacy Act; </ListItem>
                    <ListItem>Engage in public or peer-reviewed scientific, historical, or statistical research in the public interest that adheres to all other applicable ethics and privacy laws, when our deletion of the information is likely to render impossible or seriously impair the achievement of such research, provided we have obtained your informed consent;</ListItem>
                    <ListItem>Enable solely internal uses that are reasonably aligned with your expectations based on your relationship with us;</ListItem>
                    <ListItem>Comply with an existing legal obligation; or </ListItem>
                    <ListItem>Otherwise use your personal information, internally, in a lawful manner that is compatible with the context in which you provided the information. </ListItem>
                </List>                
                  
                <p>Children Under Thirteen </p>
                <p>Ayuda Live does not knowingly collect personally identifiable information from children under the age of thirteen. If you are under the age of thirteen, you must ask your parent or guardian for permission to use this website. </p>
                  
                <p>E-mail Communications </p>
                <p>From time to time, Ayuda Live may contact you via email for the purpose of providing announcements, promotional offers, alerts, confirmations, surveys, and/or other general communication. In order to improve our Services, we may receive a notification when you open an email from Ayuda Live or click on a link therein. </p>
                  
                <p>If you would like to stop receiving marketing or promotional communications via email from Ayuda Live, you may opt out of such communications by clicking on the UNSUBSCRIBE button.</p>
                  
                <p>External Data Storage Sites </p>
                <p>We may store your data on servers provided by third party hosting vendors with whom we have contracted. </p>
                  
                <p>Changes to this Statement </p>
                <p>Ayuda Live reserves the right to change this Privacy Policy from time to time. We will notify you about significant changes in the way we treat personal information by sending a notice to the primary email address specified in your account, by placing a prominent notice on our site, and/or by updating any privacy information on this page. Your continued use of the Site and/or Services available through this Site after such modifications will constitute your: (a) acknowledgment of the modified Privacy Policy; and (b) agreement to abide and be bound by that Policy. </p>
                  
                <p>Contact Information </p>
                <p>Ayuda Live welcomes your questions or comments regarding this Statement of Privacy. If you believe that Ayuda Live has not adhered to this Statement, please contact Ayuda Live at: </p>
                  
                <p>Ayuda Live </p>
                <p>170 King Street, Suite 801 </p>
                <p>San Francisco, California 94107 </p> 
                  
                <p>Email Address: </p>
                <p>support@ayuda.live </p>
                  
                <p>Effective as of June 05, 2020 </p>

                </Typography>
            </Container>            
            <Footer />
        </React.Fragment>
    ) 
};
export default PrivacyPolicyPage;