/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Modifications copyright (C) 2023 client IO s.r.o.
 */

// Just for demo purposes to show how the app looks like without Appmixer embedded.
if ((location + '').indexOf('without-appmixer') !== -1) {
    document.querySelector('#main-header > nav > a[href="#integrations"]').style.display = 'none';
    document.querySelector('#main-header > nav > a[href="#automations"]').style.display = 'none';
}

// Appmixer virtual users will be created under this domain.
var APPMIXER_USER_DOMAIN = 'appmixer-demo-firebase-vanilla.com';
// Replace with your own Appmixer API base URL coming from your Appmixer tenant: https://api.[YOUR_TENANT].appmixer.cloud.
var APPMIXER_BASE_URL = 'https://api.qa.appmixer.com';

/**
 * The ID of the currently signed-in User. We keep track of this to detect Auth state change events that are just
 * programmatic token refresh but not a User status change.
 */
let currentUID;

// Register the initial authentication event.
let appHasAuthState = false;

// Manager Firebase refs.
let listeningFirebaseRefs = [];

// Create a new Appmixer instance.
const appmixer = new Appmixer({
    baseUrl: APPMIXER_BASE_URL,
    theme: {
        variables: {
            font: {
                family: 'Roboto, sans-serif',
                familyMono: 'monospace',
                size: 14
            }
        }
    }
});

const widgets = {
    integrations: null,
    logs: null,
    automations: null,
    designer: null,
    wizard: null
};

const pages = [
    'recent',
    'posts',
    'new-post',
    'integrations',
    'automations',
    'designer'
];

/**
 * Alert the given error.
 */
function onerror(err) {
    alert(err);
}

/**
 * Saves a new post to the Firebase DB.
 */
function writeNewPost(uid, username, picture, title, body) {

    // A post entry.
    var postData = {
        author: username,
        uid: uid,
        body: body,
        title: title,
        starCount: 0,
        authorPic: picture
    };

    // Get a key for a new Post.
    var newPostKey = firebase.database().ref().child('posts').push().key;

    // Write the new post's data simultaneously in the posts list and the user's post list.
    var updates = {};
    updates['/posts/' + newPostKey] = postData;
    updates['/user-posts/' + uid + '/' + newPostKey] = postData;

    return firebase.database().ref().update(updates);
}

/**
 * Writes the user's data to the database.
 */
function writeUserData(userId, name, email, imageUrl) {
    return firebase.database().ref('users/' + userId).update({
        username: name,
        email: email,
        profile_picture : imageUrl
    });
}

/**
 * Creates a post element.
 */
function createPostElement(postId, title, text, author, authorId, authorPic) {

    const uid = firebase.auth().currentUser.uid;

    const postEl = document.createElement('article');
    postEl.setAttribute('data-post-id', postId);
    postEl.innerHTML = `
        <header>
            <h1>${title}</h1>
            <div class="btn-star-count">0</div>
            <button class="btn-star"></button>
            <button class="btn-delete"></button>
        </header>
        <section>
            <img
                src="${authorPic || 'silhouette.jpg'}"
                onerror="this.src='silhouette.jpg';"
            >
            <h2>${author || 'Anonymous'}</h2>
        </section>
        <section>
            <p>${text}</p>
        </section>
        <section>
            <ul class="post-comments"></ul>
        </section>
        <section>
            <form action="#">
                <input type="text" placeholder="Comment ..." required>
                <button type="submit">+</button>
            </form>
        </section>
    `;

    // Listen for comments.
    var commentsRef = firebase.database().ref(`post-comments/${postId}`);
    commentsRef.on('child_added', data => {
        const commentEl = document.createElement('li');
        commentEl.setAttribute('data-comment-id', data.key);
        commentEl.innerHTML = `
            <header>
                <img src="silhouette.jpg">
                <h3>${data.val().author || 'Anonymous'}</h3>
                <button class="btn-delete-comment"></button>
            </header>
            <span>${data.val().text}</span>
        `;
        postEl.querySelector('.post-comments').appendChild(commentEl);
        commentEl.getElementsByClassName('btn-delete-comment')[0]
            .addEventListener('click', () => {
                var commentRef = firebase.database().ref(`post-comments/${postId}/${data.key}`);
                commentRef.remove();
            });
    });
    commentsRef.on('child_changed', data => {
        document.querySelectorAll(`[data-comment-id=${data.key}]`)
            .forEach(commentEl => {
                commentEl.querySelector('h3').innerText = data.val().author;
                commentEl.querySelector('span').innerText = data.val().text;
            });
    });
    commentsRef.on('child_removed', data => {
        document.querySelectorAll(`[data-comment-id=${data.key}]`)
            .forEach(commentEl => commentEl.remove());
    });

    // Listen for newly created comments.
    postEl.querySelector('form').addEventListener('submit', evt => {
        evt.preventDefault();
        const inputEl = evt.target.querySelector('input');
        firebase.database().ref(`post-comments/${postId}`).push({
            text: inputEl.value,
            author: firebase.auth().currentUser.displayName,
            uid
        });
        inputEl.value = '';
    });

    // Listen for likes counts.
    const starCountRef = firebase.database().ref(`posts/${postId}/starCount`);
    starCountRef.on('value', snapshot => {
        postEl.querySelector('.btn-star-count').innerText = snapshot.val();
    });

    // Listen for the starred status.
    const starredStatusRef = firebase.database().ref(`posts/${postId}/stars/${uid}`);
    starredStatusRef.on('value', snapshot => {
        const classNameChange = snapshot.val() ? 'add' : 'remove';
        postEl.querySelector('.btn-star').classList[classNameChange]('is-active');
    });

    // Keep track of all Firebase reference on which we are listening.
    listeningFirebaseRefs.push(commentsRef);
    listeningFirebaseRefs.push(starCountRef);
    listeningFirebaseRefs.push(starredStatusRef);

    // Bind post actions.
    const globalPostRef = firebase.database().ref(`/posts/${postId}`);
    const userPostRef = firebase.database().ref(`/user-posts/${authorId}/${postId}`);
    postEl.getElementsByClassName('btn-star')[0]
        .addEventListener('click', () => {
            [globalPostRef, userPostRef].forEach(postRef => {
                postRef.transaction(post => {
                    if (post) {
                        if (post.stars && post.stars[uid]) {
                            post.starCount--;
                            post.stars[uid] = null;
                        } else {
                            post.starCount++;
                            if (!post.stars) {
                                post.stars = {};
                            }
                            post.stars[uid] = true;
                        }
                    }
                    return post;
                });
            });
        });
    postEl.getElementsByClassName('btn-delete')[0]
        .addEventListener('click', () => {
            globalPostRef.remove();
            userPostRef.remove();
        });

    return postEl;
}

/**
 * Starts listening for new posts and populates posts lists.
 */
function startDatabaseQueries() {

    const myUserId = firebase.auth().currentUser.uid;
    const recentPostsRef = firebase.database().ref('posts').limitToLast(100);
    const userPostsRef = firebase.database().ref('user-posts/' + myUserId);

    const fetchPosts = (postsRef, sectionElement) => {

        postsRef.on('child_added', data => {
            const author = data.val().author || 'Anonymous';
            const containerElement = sectionElement.getElementsByClassName('posts-container')[0];
            containerElement.insertBefore(
                createPostElement(data.key, data.val().title, data.val().body, author, data.val().uid, data.val().authorPic),
                containerElement.firstChild);
        });
        postsRef.on('child_changed', data => {
            document.querySelectorAll(`[data-post-id=${data.key}]`)
                .forEach(postElement => {
                    postElement.querySelector('h1').innerText = data.val().title;
                    postElement.querySelector('h2').innerText = data.val().author;
                    postElement.querySelector('p').innerText = data.val().body;
                    postElement.querySelector('.btn-star-count').innerText = data.val().starCount;
                });
        });
        postsRef.on('child_removed', data => {
            document.querySelectorAll(`[data-post-id=${data.key}]`)
                .forEach(postElement => postElement.remove());
        });
    };

    // Fetching and displaying all posts of each sections.
    fetchPosts(recentPostsRef, document.getElementById('page-recent'));
    fetchPosts(userPostsRef, document.getElementById('page-posts'));

    // Keep track of all Firebase refs we are listening to.
    listeningFirebaseRefs.push(recentPostsRef);
    listeningFirebaseRefs.push(userPostsRef);
}

/**
 * Creates a new post for the current user.
 */
function newPostForCurrentUser(title, text) {

    var userId = firebase.auth().currentUser.uid;
    return firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
        var username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
        return writeNewPost(firebase.auth().currentUser.uid, username,
                            firebase.auth().currentUser.photoURL,
                            title, text);
    });
}

/**
 * Clear all rendered posts.
 */
function clearPosts() {

    const containers = document.querySelectorAll('.posts-container');
    // Remove all previously displayed posts.
    containers.forEach(el => el.innerHTML = '');
}

/**
 * Setup Integrations page.
 */
function setupIntegrationsPage() {

    widgets.integrations.set('options', {
        showHeader: false,
        customFilter: {
            // Show only integration templates shared with users in this demo app.
            'sharedWith.0.domain': APPMIXER_USER_DOMAIN,
            // Show Integration templates only. Template don't have `templateId`,
            // only instances do to reference templates they were created from.
            type: 'integration-template'
        }
    });
}

/**
 * Setup Enabled Integrations page.
 */
function setupEnabledIntegrationsPage() {

    widgets.integrations.set('options', {
        showHeader: false,
        customFilter: {
            // Show only my instances. Not all flows that have been possibly shared with me in the Studio.
            userId: appmixer.get('user').id,
            type: 'integration-instance'
        }
    });
}

/**
 * Setup Automations page.
 */
function setupAutomationsPage() {

    widgets.automations.set('options', {
        customFilter: {
            // Show only my flows.
            userId: appmixer.get('user').id,
            // Filter out integration templates (i.e. flows that have a Wizard defined).
            'wizard.fields': '!'
        },
        menu: [
            { event: 'flow:open', label: 'Open' },
            { event: 'flow:rename', label: 'Rename' },
            { event: 'flow:remove', label: 'Delete' }
        ]
    });
}

/**
 * Setup Designer page.
 */
function setupDesignerPage(route) {

    const [, flowId, componentId] = route.split('/');
    widgets.designer.set('flowId', flowId);
    widgets.designer.set('componentId', componentId);
}


/**
 * Navigate pages and panels.
 */
function navigate() {

    // Deactive anchors.
    const anchors = document.querySelectorAll('a, .page');
    anchors.forEach(el => el.classList.remove('is-active'));

    // Close widgets.
    Object.values(widgets).forEach(w => w.close());

    // Hide pages.
    pages.forEach(page => {
        const el = document.getElementById(`page-${page}`);
        el.classList.remove('is-active');
    });

    // Get navigation details for the route.
    const route = window.location.hash.substring(1);
    const pageIndex = pages.indexOf(route.split('/')[0]);
    const page = pageIndex === -1 ? pages[0] : pages[pageIndex];

    // Show container element of the page.
    const pageContainer = document.getElementById(`page-${page}`);
    pageContainer.classList.add('is-active');

    // Active links that match the route.
    const links = document.querySelectorAll(`a[href$="#${route}"]`);
    links.forEach(el => el.classList.add('is-active'));

    // Setup the page.
    if (route === 'recent') {
        //
    } else if (route === 'posts') {
        //
    } else if (route === 'integrations') {
        setupIntegrationsPage();
    } else if (route === 'integrations/enabled') {
        setupEnabledIntegrationsPage();
    } else if (route === 'automations') {
        setupAutomationsPage();
    } else if (route.startsWith('designer')) {
        setupDesignerPage(route);
    }

    // Open a widget if the page has one.
    const widget = widgets[page];
    if (widget) widget.open();
}

/**
 * Create widgets.
 */
function createWidgets() {

    // Create Integrations Page widget.
    widgets.integrations = appmixer.ui.Integrations({
        el: '#appmixer-integrations'
    });
    widgets.integrations.on('integration:create', templateId => {
        widgets.wizard.close();
        widgets.wizard.set('flowId', templateId);
        widgets.wizard.open();
    });
    widgets.integrations.on('integration:edit', integrationId => {
        widgets.wizard.close();
        widgets.wizard.set('flowId', integrationId);
        widgets.wizard.open();
    });
    widgets.logs = appmixer.ui.InsightsLogs({
        options: {
            showHistogram: true
        }
    });
    widgets.logs.state('filterLayout', 'collapsed');
    widgets.logs.state('query/flowType', 'integration-instance');
    widgets.logs.state('query/userId', appmixer.get('user').id);

    // Create Wizard Page widget.
    widgets.wizard = appmixer.ui.Wizard();
    widgets.wizard.on('flow:start-after', () => widgets.integrations.reload());
    widgets.wizard.on('flow:remove-after', () => {
        widgets.integrations.reload();
        widgets.wizard.close();
    });

    // Create Automations Page widget.
    widgets.automations = appmixer.ui.FlowManager({
        el: '#appmixer-flow-manager',
        theme: {
            mode: 'dark',
            variables: {
                colors: {
                    separator: '#6E8BD3',
                    surfaceLow: '#3265CB',
                    surface: '#3265CB',
                    neutral: '#FFFFFF',
                    primary: '#FFFFFF',
                    onPrimary: '#3265CB'
                }
            }

        },
        l10n: {
            ui: {
                flowManager: {
                    header: {
                        title: 'Automations',
                        buttonCreateFlow: 'Create Automation'
                    }
                }
            }
        }
    });
    widgets.automations.on('flow:open', flowId => {
        location.href = `#designer/${flowId}`;
    });

    // Create Designer Page widget.
    widgets.designer = appmixer.ui.Designer({
        el: '#appmixer-designer',
        theme: {
            variables: {
                colors: {
                    focus: '#3B77E7',
                    neutral: '#323947'
                }
            }
        },
        options: {
            showButtonHome: true,
            menu: [
                { event: 'flow:rename', label: 'Rename' }
            ],
            toolbar: [
                ['undo', 'redo'],
                ['zoom-to-fit', 'zoom-in', 'zoom-out'],
                ['logs']
            ]
        }
    });
    widgets.designer.on('navigate:flows', () => {
        window.location.href = '#automations';
    });
    widgets.designer.on('component:open', evt => {
        const flowId = widgets.designer.get('flowId');
        if (window.history.replaceState) {
            window.history.replaceState({}, null, `#designer/${flowId}/${evt.data.componentId}`);
        }
        evt.next();
    });
    widgets.designer.on('component:close', evt => {
        const flowId = widgets.designer.get('flowId');
        if (window.history.replaceState) {
            window.history.replaceState({}, null, `#designer/${flowId}`);
        }
        evt.next();
    });
}

/**
 * Ensure user API key.
 */
async function ensureUserApiKey(userId) {

    var snapshot = await firebase.database().ref('/users/' + userId).once('value');
    var apiKey = snapshot.val() && snapshot.val().apiKey;
    if (!apiKey) {
        // Generate a random apiKey (used for API and also as the Appmixer virtual user password.
        apiKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        await firebase.database().ref('users/' + userId).update({ apiKey });
    }
    return apiKey;
}

/**
 * Ensure Appmixer Virtual User.
 */
async function ensureAppmixerVirtualUser(userId, apiKey) {

    // Appmixer username can be any, even non-existing, email address. We're using the user ID
    // together with a fictional domain name. Appmixer does not send anything to these email addresses.
    // They are just used as a virtual user credentials pair.
    var appmixerUsername = userId + '@' + APPMIXER_USER_DOMAIN;
    // We use the apiKey as the Appmixer virtual user token (password).
    var appmixerToken = apiKey;

    var auth;
    try {
        auth = await appmixer.api.authenticateUser(appmixerUsername, appmixerToken);
        appmixer.set('accessToken', auth.token);
    } catch (err) {
        if (err.response && err.response.status === 403) {
            // Virtual user not yet created in Appmixer. Create one.
            try {
                auth = await appmixer.api.signupUser(appmixerUsername, appmixerToken);
                appmixer.set('accessToken', auth.token);
            } catch (err) {
                onerror(err);
            }
        } else {
            onerror('Something went wrong.');
        }
    }
}

/**
 * Ensure Appmixer service account.
 */
async function ensureAppmixerServiceAccount(apiKey) {

    // This function makes sure that the user has their own Demo App user account registered with Appmixer. This is useful so that
    // the user does not have to authenticate to Demo App in Appmixer Integrations/Wizard again. This would not make sense since the
    // user is already signed in and so we don't want to request their API key again in Appmixer Wizard. Instead, assuming
    // we know the user API key here, we can automatically inject their account to Appmixer.
    // See https://docs.appmixer.com/appmixer/tutorials/integration-templates#injecting-user-accounts for details.
    const APPMIXER_COMPONENTS_BUNDLE = 'appmixer.demofirebase';
    const serviceAuth = await appmixer.api.getAuth(APPMIXER_COMPONENTS_BUNDLE);
    // Check if the user has a valid account (i.e. if we already injected their account in the past or not).
    const validAccount = serviceAuth.accounts && serviceAuth.accounts[Object.keys(serviceAuth.accounts)[0]].accessTokenValid === true;

    if (!validAccount) {
        await appmixer.api.createAccount(
            // Setting requestProfileInfo to false makes Appmixer bypass requesting user profile from the Demo app REST API.
            // Instead, we provide the user profile info (profileInfo) directly.
            { requestProfileInfo: false },
            {
                name: 'Your Account',
                service: 'appmixer:demofirebase',
                token: { apiKey },
                profileInfo: { id: 'DemoFirebase' }
            }
        );
    }
}

/**
 * Triggers every time there is a change in the Firebase auth state (i.e. user signed-in or user signed out).
 */
async function onAuthStateChanged(user) {

    // We ignore token refresh events.
    if (user && currentUID === user.uid) {
        return;
    }

    // Stop all currently listening Firebase listeners.
    listeningFirebaseRefs.forEach(function(ref) {
        ref.off();
    });
    listeningFirebaseRefs = [];

    // Clear posts.
    clearPosts();

    // Authenticate the user and load the initial state.
    const splashPage = document.getElementById('splash-page');
    if (user) {
        currentUID = user.uid;
        splashPage.style.display = 'none';
        try {
            await writeUserData(user.uid, user.displayName, user.email, user.photoURL);
            const apiKey = await ensureUserApiKey(user.uid);
            await ensureAppmixerVirtualUser(user.uid, apiKey);
            await ensureAppmixerServiceAccount(apiKey);
        } catch {}
        startDatabaseQueries();
    } else {
        // Set currentUID to null.
        currentUID = null;
        // Display the splash page where you can sign-in.
        splashPage.style.display = 'flex';
    }

    // Use the initial event to setup the application.
    if (!appHasAuthState) {
        appHasAuthState = true;
        window.onhashchange = navigate;
        createWidgets();
    }

    navigate();
}

window.addEventListener('load', async () => {

    // Bind Sign in button.
    document.getElementById('sign-in-button')
        .addEventListener('click', () => {
            const authProvider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(authProvider);
        });

    // Bind Sign out button.
    document.getElementById('sign-out-button')
        .addEventListener('click', function() {
            firebase.auth().signOut();
        });

    // Bind New Post form.
    document.getElementById('new-post-form')
        .addEventListener('submit', evt => {
            evt.preventDefault();
            const title = evt.target.querySelector('#new-post-title').value;
            const message = evt.target.querySelector('#new-post-message').value;
            if (title.length && message.length) {
                newPostForCurrentUser(title, message).then(() => {
                    location.href = '#posts';
                });
            }
        });

    // Integration logs in a popup.
    document.getElementById('show-integration-logs')
        .addEventListener('click', function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            widgets.logs.open();
        });

    // Listen for authentication state changes.
    firebase.auth().onAuthStateChanged(onAuthStateChanged);
});
