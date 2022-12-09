# appmixer-demo-todo-express-vanilla

[Live demo](https://am-demo-firebase-vanilla.web.app/).

![App](assets/app.png?raw=true "App")

A demo app implemented in Firebase (with real-time database) and Vanilla JS on FE showcasing Appmixer embedding. The demo app is based
on the original Firebase Database demo from [https://github.com/firebase/quickstart-js/tree/master/database](https://github.com/firebase/quickstart-js/tree/master/database)
with only a few modifications that embed Appmixer Integrations marketplace and Flow Manager (together with Designer). Also, a REST API was implemented
using Firebase Cloud Functions to be able to build Appmixer connector for the demo app to be used in Appmixer automations and integrations.

The app shows the 3 most common use cases for Appmixer embedding:

## Integration templates

Embed a marketplace of prebuilt integration templates. End user can select a template, fill in the last missing details and run an integration.

![Integrations](assets/integration-marketplace.png?raw=true "Integration Marketplace")
![Wizard](assets/wizard.png?raw=true "Wizard")


## Workflow automation

Embed the full featured workflow designer UI allowing the end user to build custom workflow automations.

![Workflow Designer](assets/designer.png?raw=true "Workflow Designer")
![Workflows](assets/flow-manager.png?raw=true "Flows")


# How to navigate this repository

* `index.html`: Application HTML.
* `scripts/main.js`: Application front-end JavaScript.
* `functions/index.js`: REST API.
* `appmixer-components/`: Appmixer components working against the demo app REST API (defined in `functions/index.js`). See [Appmixer Component Basic Structure](https://docs.appmixer.com/appmixer/component-definition/basic-structure) and [Example Component](https://docs.appmixer.com/appmixer/component-definition/example-component) for more details.


# Deploy

 1. Create your project on the [Firebase Console](https://console.firebase.google.com). Make sure you have at least the Blaze (pay-as-you-go) plan (free but credit card required), otherwise the Firebase Cloud Functions could not be deployed.
 2. Enable the **Google** sign-in provider in the **Authentication > SIGN-IN METHOD** tab.
 3. You must have the Firebase CLI installed. If you don't have it install it with `npm install -g firebase-tools` and then configure it with `firebase login`.
 4. On the command line run `firebase use --add` and select the Firebase project you have created.
 5. On the command line run `firebase deploy` using the Firebase CLI tool to deploy your Firebase app to the cloud.
 6. Configure the `baseUrl` (of this demo REST API endpoint) in your Appmixer Backoffice (https://backoffice.[YOUR_TENANT].appmixer.cloud).
    Go to **Services > Add** and add a new service with ID `appmixer:demofirebase`.
    Then create a key `baseUrl` and set it to the Firebase Cloud Functions endpoint (usually `https://us-central1-[FIREBASE_PROJECT].cloudfunctions.net`).
    This base URL is used throughout the Appmixer components (`appmixer-components/`).


# Publish Appmixer components

See [Appmixer CLI Documentation](https://docs.appmixer.com/appmixer/appmixer-cli/appmixer-cli) for more details.

```
$ appmixer pack appmixer-components
$ appmixer publish appmixer.demofirebase.zip
```

# License


Original Firebase database demo (https://github.com/firebase/quickstart-js/tree/master/database) Copyright:

© Google, 2016. Licensed under an [Apache-2](../LICENSE) license.

Modifications copyright (C) 2022 client IO s.r.o.
