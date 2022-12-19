# appmixer-demo-todo-express-vanilla

[Live demo](https://am-demo-firebase-vanilla.web.app/).

![App](assets/app.png?raw=true "App")

A demo app implemented in Firebase (with real-time database) and Vanilla JS on FE showcasing Appmixer embedding. The demo app is based
on the original Firebase Database demo from [https://github.com/firebase/quickstart-js/tree/master/database](https://github.com/firebase/quickstart-js/tree/master/database)
with only a few modifications that embed Appmixer Integrations marketplace and Flow Manager (together with Designer). Also, a REST API was implemented
using Firebase Cloud Functions to be able to build Appmixer connector for the demo app to be used in Appmixer automations and integrations.

The app shows the 2 most common use cases for Appmixer embedding:

## Integration templates

Embed a marketplace of prebuilt integration templates. End user can select a template, fill in the required fields and run an integration.

![Integrations](assets/integration-marketplace.png?raw=true "Integration Marketplace")
![Wizard](assets/wizard.png?raw=true "Wizard")


## Workflow automation

Embed the full featured workflow designer UI allowing the end user to build custom workflow automations.

![Workflow Designer](assets/designer.png?raw=true "Workflow Designer")
![Workflows](assets/flow-manager.png?raw=true "Flows")


# How to navigate this repository

* `index.html`: Application HTML.
* `scripts/main.js`: Application front-end JavaScript, containging the entire application FE code.
* `functions/index.js`: REST API. Necessary for Appmixer connector.
* `appmixer-components/`: Appmixer components working against the demo app REST API (defined in `functions/index.js`). See [Appmixer Component Basic Structure](https://docs.appmixer.com/appmixer/component-definition/basic-structure) and [Example Component](https://docs.appmixer.com/appmixer/component-definition/example-component) for more details.


# Deploy

 1. Create your project on the [Firebase Console](https://console.firebase.google.com). Make sure you have at least the Blaze (pay-as-you-go) plan (free but credit card required), otherwise the Firebase Cloud Functions could not be deployed.
 2. Enable the **Google** sign-in provider in the **Authentication > SIGN-IN METHOD** tab.
 3. You must have the Firebase CLI installed. If you don't have it install it with `npm install -g firebase-tools` and then configure it with `firebase login`.
 4. On the command line run `firebase use --add` and select the Firebase project you have created.
 5. Replace the URLs to the Appmixer APIs with your own Appmixer tenant URLs. Replace `https://my.qa.appmixer.com/appmixer/appmixer.js` with `https://my.[YOUR_TENANT].appmixer.cloud/appmixer/appmixer.js` in `index.html` and `https://api.qa.appmixer.com` with `https://api.[YOUR_TENANT].appmixer.cloud` in `scripts/main.js` file.
 6. On the command line run `firebase deploy` using the Firebase CLI tool to deploy your Firebase app to the cloud.
 7. You must have the Appmixer CLI installed. If you don't have it install it with `npm install -g appmixer`. Then set your Appmixer engine base URL with `appmixer url https://api.[YOUR_TENANT].appmixer.cloud` and login with `appmixer login YOUR_ADMIN_USERNAME`.
 8. Publish Appmixer components with `appmixer pack appmixer-components/` followed by `appmixer publish appmixer.demofirebase.zip`.
 9. Configure the `baseUrl` (of this demo REST API endpoint) in your Appmixer Backoffice (`https://backoffice.[YOUR_TENANT].appmixer.cloud`).
    Go to **Services > Add** and add a new service with ID `appmixer:demofirebase`.
    Then create a key `baseUrl` and set it to the Firebase Cloud Functions endpoint (usually `https://us-central1-[FIREBASE_PROJECT].cloudfunctions.net`).
    This base URL is used throughout the Appmixer components (`appmixer-components/`) to locate the API endpoints of this demo app in your own deployment.

# Notes
* Appmixer components are published in a module called "Firebase demo". You can find it under "Applications" in the Connectors section of the designer when designing integration templates:

![Firebase Demo Connector](assets/firebase-demo-connector.png?raw=true "Firebase Demo Connector")

* The Appmixer virtual users in this app are created with the `appmixer-demo-firebase-vanilla.com` domain. The full format of the Appmixer virtual user usernames is `[FIREBASE_UUID]@appmixer-demo-firebase-vanilla.com`. You can see it in your Backoffice interface under Users:

![Backoffice users](assets/backoffice-users.png?raw=true "Backoffice user")

* You can change the Appmixer virtual user's domain by changing the `APPMIXER_USER_DOMAIN` variable in `scripts/main.js` file.
* An example of an integration template that sends a Slack message for new posts created (that you can create in the Appmixer Studio) can look like this:

![Slack Integration Template](assets/integration-template-slack.png?raw=true "Slack Integration Template")

Don't forget to define the Wizard and publish your integration template in the Wizard builder:

![Open Wizard Builder](assets/wizard-builder-open.png?raw=true "Open Wizard Builder")

Define all the sections for the final Wizard, starting with the Slack account that the user needs to connect:

![Wizard Builder Slack Account](assets/wizard-builder-slack-account.png?raw=true "Wizard Builder Slack Account")

Continue with adding a field that lets the user select their Slack channel:

![Wizard Builder Slack Channel](assets/wizard-builder-slack-channel.png?raw=true "Wizard Builder Slack Channel")

And finally add a filed to let the user customize the Slack message (note that you can define the default value in the Designer):

![Wizard Builder Slack Message](assets/wizard-builder-slack-message.png?raw=true "Wizard Builder Slack Message")

Once you Publish this integration template, your end users should see a new tile in the "All Integrations" section of their embedded integration marketplace. Once they click to configure their integration, they should see the Wizard that you just defined for them, with all the fields as configured in the Wizard builder:

![Wizard Slack](assets/wizard-slack.png?raw=true "Wizard Slack")




# License


Original Firebase database demo (https://github.com/firebase/quickstart-js/tree/master/database) Copyright:

© Google, 2016. Licensed under an [Apache-2](../LICENSE) license.

Modifications copyright (C) 2023 client IO s.r.o.
