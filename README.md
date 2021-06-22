# Zoom-based business platform. The easiest way to get paid for consulting, coaching or anything you do by Zoom video call.

[Buyer/Seller Transaction Flow](https://miro.com/app/board/o9J_klABOX0=/?moveToWidget=3074457349888715941&cot=12)
[Seller Web App Flow](https://miro.com/app/board/o9J_klABOX0=/?moveToWidget=3074457349911125357&cot=12)

## Use Cases
* Online consulting (medical, legal, financial, therapy, veterinary, spiritual, design, health/beauty)
* Online lessons (music, language, computer, hobby/craft, performing arts, visual arts, cooking)
* Online academic tutoring (k12, college, math, reading, writing, SAT)
* Online coaching (personal trainer, nutrition, golf, yoga)
* Online babysitting / companionship
* Online service/repairs (appliances, plumbing, electrical, construction, DIY)


## Deployment

### `firebase deploy -m "github commit ID"`

## Server (Firebase)

Setup requires setting the following Firebase environment variables prior to deploying:
* ayuda.url
* aws.accesskeyid
* aws.secretaccesskey
* aws.region
* aws.avatarbucket
* gcloud.tasks.serviceaccountemail
* gcloud.tasks.project
* gcloud.tasks.queue
* gcloud.tasks.location
* stripe.secretkey
* stripe.endpointsecret
* zoom.apikey
* zoom.refreshtoken
* zoom.verificationtoken

For example: 
`firebase functions:config:set zoom.jwttoken="JWT token for API access" zoom.refreshtoken="refresh token to create new JWT tokens"`

Valid status settings for jobs:
* pending, authorized -> Confirmed, started, completed, paid, cancelled



## Client (React)

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start build:ayuda-development`

The same as running 'npm start' but loads the .env.ayuda-development firebase config values for the dev environment (https://ayuda-development.web.app)


### `npm start build:ayuda-9ea45`

The same as running 'npm start' but loads the .env.ayuda-9ea45 firebase config values for the production environment (https://ayuda.live)


### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.


### `npm run build:ayuda-development`

The same as running 'npm run build' but loads the .env.ayuda-development firebase config values for the dev environment (https://ayuda-development.web.app)


### `npm run build:ayuda-9ea45`

The same as running 'npm run build' but loads the .env.ayuda-9ea45 firebase config values for the production environment (https://ayuda.live)


### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

