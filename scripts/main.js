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
 * Modifications copyright (C) 2022 client IO s.r.o.
 */
'use strict';


// Shortcuts to DOM Elements.
var messageForm = document.getElementById('message-form');
var messageInput = document.getElementById('new-post-message');
var titleInput = document.getElementById('new-post-title');
var signInButton = document.getElementById('sign-in-button');
var signOutButton = document.getElementById('sign-out-button');
var splashPage = document.getElementById('page-splash');
var addPost = document.getElementById('add-post');
var addButton = document.getElementById('add');
var recentPostsSection = document.getElementById('recent-posts-list');
var userPostsSection = document.getElementById('user-posts-list');
var topUserPostsSection = document.getElementById('top-user-posts-list');
var integrationsSection = document.getElementById('integrations-section');
var automationsSection = document.getElementById('automations-section');
var recentMenuButton = document.getElementById('menu-recent');
var myPostsMenuButton = document.getElementById('menu-my-posts');
var myIntegrationsMenuButton = document.getElementById('menu-my-integrations');
var myAutomationsMenuButton = document.getElementById('menu-my-automations');
var myTopPostsMenuButton = document.getElementById('menu-my-top-posts');
var listeningFirebaseRefs = [];

// Just for demo purposes to show how the app looks like without Appmixer embedded.
if ((location.hash || '').indexOf('#without-appmixer') !== -1) {
    myIntegrationsMenuButton.style.display = 'none';
    myAutomationsMenuButton.style.display = 'none';
}

// Appmixer virtual users will be created under this domain.
var APPMIXER_USER_DOMAIN = 'appmixer-demo-firebase-vanilla.com';
// Replace with your own Appmixer API base URL coming from your Appmixer tenant: https://api.[YOUR_TENANT].appmixer.cloud.
var APPMIXER_BASE_URL = 'https://api.qa.appmixer.com';
var appmixer = new Appmixer({ baseUrl: APPMIXER_BASE_URL });

// See https://docs.appmixer.com/appmixer/customizing-ui/custom-theme
// and https://github.com/clientIO/appmixer-fe/blob/dev/appmixer/sdk/src/assets/data/themes/light.js.
appmixer.set('theme', {
    variables: {
        font: {
            family: 'Roboto,Helvetica,sans-serif',
            familyMono: '\'SF Mono\', \'ui-monospace\', Menlo, monospace',
            weightRegular: 300,
            weightMedium: 400,
            weightSemibold: 500,
            size: 14
        },
        colors: {
            base: '#FFFFFF',
            neutral: '#000000',
            focus: '#039be5',
            error: '#DE3123',
            warning: '#B56C09',
            success: '#00b74a',
            modifier: '#C558CF',
            highlighter: '#FFA500'
        },
        shadows: {
            backdrop: 'rgba(0 0 0 / 6%)',
            popover: '0 3px 9px rgba(0 0 0 / 12%)',
            icon: '0 1px 3px rgb(0 0 0 / 6%)'
        },
        corners: {
            radiusSmall: '2px',
            radiusMedium: '2px',
            radiusLarge: '2px'
        },
        dividers: {
            regular: '1px',
            medium: '2px',
            semibold: '3px',
            bold: '6px',
            extrabold: '9px'
        }
    },
    ui: {
        mixins: {
            '#buttonPrimary': {
                background: '#ffca28',
                color: 'black'
            }
        },
        shapes: {
            action: 'action',
            trigger: 'trigger',
            selection: 'selection'
        },
        '#Wizard': {
            '#modal': {
                '#backdrop': {
                    background: 'rgba(0 0 0 / 70%)'
                }
            }
        },
        '#Integrations': {
            background: '#f5f5f5',
            '#integration': {
                background: '#039be5',
                color: 'white',
                borderRadius: '2px',
                '@hovered': {
                    background: '#b3d4fc'
                },
                '#title': {
                    color: 'white',
                    fontSize: '{{variables.font.size15}}'
                },
                '#description': {
                    color: 'white'
                },
                '#buttonRemove': {
                    color: '#FCBE08'
                }
            },
            '#buttonFlowStage': {
                '#on': {
                    background: 'white',
                    borderColor: 'white',
                    color: '#039BE5',
                    '@hovered': {
                        background: '#CDEBFA',
                        borderColor: '#CDEBFA',
                        color: '#039BE5'
                    },
                    '@disabled': {
                        background: '#90D3F3',
                        borderColor: '#90D3F3',
                        color: '#039BE5'
                    },
                    '@invalid': {
                        background: '#90D3F3',
                        borderColor: '#90D3F3',
                        color: '#039BE5'
                    }
                },
                '#off': {
                    background: 'white',
                    borderColor: 'white',
                    color: '#039BE5',
                    '@hovered': {
                        background: '#CDEBFA',
                        borderColor: '#CDEBFA',
                        color: '#039BE5'
                    },
                    '@disabled': {
                        background: '#90D3F3',
                        borderColor: '#90D3F3',
                        color: '#039BE5'
                    },
                    '@invalid': {
                        background: '#90D3F3',
                        borderColor: '#90D3F3',
                        color: '#039BE5'
                    }
                },
                '#neutral': {
                    background: 'white',
                    borderColor: 'white',
                    color: '#039BE5',
                    '@hovered': {
                        background: '#CDEBFA',
                        borderColor: '#CDEBFA',
                        color: '#039BE5'
                    },
                    '@disabled': {
                        background: '#90D3F3',
                        borderColor: '#90D3F3',
                        color: '#039BE5'
                    },
                    '@invalid': {
                        background: '#90D3F3',
                        borderColor: '#90D3F3',
                        color: '#039BE5'
                    }
                }
            },
        },
        '#FlowManager': {
            background: '#f5f5f5',
            '#buttonFlowStage': {
                '#on': {
                    border: 'white',
                    background: '#FCBE08'
                }
            },
            '#header': {
                '#buttonCreateFlow': {
                    background: '#ffca28',
                    color: 'black',
                    '@hovered': {
                        background: '#ffca28',
                        color: 'black'
                    },
                    '@disabled': {
                        background: '#ffca28',
                        color: 'black'
                    }
                }
            },
            '#grid': {
                '#flow': {
                    background: '#039be5',
                    borderRadius: '2px',
                    '@hovered': {
                        background: '#b3d4fc'
                    },
                    '@disabled': {
                        background: '{{variables.colors.neutral04}}'
                    },
                    '#name': {
                        color: 'white'
                    },
                    '#thumbnail': {
                        background: 'transparent'
                    }
                }
            }
        }
    }
});
// See https://my.appmixer.com/appmixer/package/strings-en.json.
appmixer.set('strings', {
    ui: {
        flowManager: {
            header: {
                title: 'Your Flows',
                buttonCreateFlow: 'Create New Flow'
            }
        }
    }
});
    
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
 * Star/unstar post.
 */
function toggleStar(postRef, uid) {
    postRef.transaction(function(post) {
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
}

/**
 * Delete post.
 */
function deletePost(postRef) {
    postRef.remove();
}

/**
 * Creates a post element.
 */
function createPostElement(postId, title, text, author, authorId, authorPic) {
    var uid = firebase.auth().currentUser.uid;

    var html =
        '<div class="post post-' + postId + ' mdl-cell mdl-cell--12-col ' +
        'mdl-cell--6-col-tablet mdl-cell--4-col-desktop mdl-grid mdl-grid--no-spacing">' +
        '<div class="mdl-card mdl-shadow--2dp">' +
        '<div class="mdl-card__title mdl-color--light-blue-600 mdl-color-text--white">' +
        '<h4 class="mdl-card__title-text"></h4>' +
        '</div>' +
        '<div class="header">' +
        '<div>' +
        '<div class="avatar"></div>' +
        '<div class="username mdl-color-text--black"></div>' +
        '</div>' +
        '</div>' +
        '<span class="star">' +
        '<div class="not-starred material-icons">star_border</div>' +
        '<div class="starred material-icons">star</div>' +
        '<div class="star-count">0</div>' +
        '</span>' +
        '<span class="btn-delete material-icons">delete</span>' +
        '<div class="text"></div>' +
        '<div class="comments-container"></div>' +
        '<form class="add-comment" action="#">' +
        '<div class="mdl-textfield mdl-js-textfield">' +
        '<input class="mdl-textfield__input new-comment" type="text">' +
        '<label class="mdl-textfield__label">Comment...</label>' +
        '</div>' +
        '</form>' +
        '</div>' +
        '</div>';

    // Create the DOM element from the HTML.
    var div = document.createElement('div');
    div.innerHTML = html;
    var postElement = div.firstChild;
    if (componentHandler) {
        componentHandler.upgradeElements(postElement.getElementsByClassName('mdl-textfield')[0]);
    }

    var addCommentForm = postElement.getElementsByClassName('add-comment')[0];
    var commentInput = postElement.getElementsByClassName('new-comment')[0];
    var star = postElement.getElementsByClassName('starred')[0];
    var unStar = postElement.getElementsByClassName('not-starred')[0];
    var deleteBtn = postElement.getElementsByClassName('btn-delete')[0];

    // Set values.
    postElement.getElementsByClassName('text')[0].innerText = text;
    postElement.getElementsByClassName('mdl-card__title-text')[0].innerText = title;
    postElement.getElementsByClassName('username')[0].innerText = author || 'Anonymous';
    postElement.getElementsByClassName('avatar')[0].style.backgroundImage = 'url("' +
        (authorPic || './silhouette.jpg') + '")';

    // Listen for comments.
    var commentsRef = firebase.database().ref('post-comments/' + postId);
    commentsRef.on('child_added', function(data) {
        addCommentElement(postElement, data.key, data.val().text, data.val().author);
    });

    commentsRef.on('child_changed', function(data) {
        setCommentValues(postElement, data.key, data.val().text, data.val().author);
    });

    commentsRef.on('child_removed', function(data) {
        deleteComment(postElement, data.key);
    });

    // Listen for likes counts.
    var starCountRef = firebase.database().ref('posts/' + postId + '/starCount');
    starCountRef.on('value', function(snapshot) {
        updateStarCount(postElement, snapshot.val());
    });

    // Listen for the starred status.
    var starredStatusRef = firebase.database().ref('posts/' + postId + '/stars/' + uid);
    starredStatusRef.on('value', function(snapshot) {
        updateStarredByCurrentUser(postElement, snapshot.val());
    });

    // Keep track of all Firebase reference on which we are listening.
    listeningFirebaseRefs.push(commentsRef);
    listeningFirebaseRefs.push(starCountRef);
    listeningFirebaseRefs.push(starredStatusRef);

    // Create new comment.
    addCommentForm.onsubmit = function(e) {
        e.preventDefault();
        createNewComment(postId, firebase.auth().currentUser.displayName, uid, commentInput.value);
        commentInput.value = '';
        commentInput.parentElement.MaterialTextfield.boundUpdateClassesHandler();
    };

    // Bind starring action.
    var onStarClicked = function() {
        var globalPostRef = firebase.database().ref('/posts/' + postId);
        var userPostRef = firebase.database().ref('/user-posts/' + authorId + '/' + postId);
        toggleStar(globalPostRef, uid);
        toggleStar(userPostRef, uid);
    };
    unStar.onclick = onStarClicked;
    star.onclick = onStarClicked;

    // Bind delete action.
    var onDeleteClicked = function() {
        var globalPostRef = firebase.database().ref('/posts/' + postId);
        var userPostRef = firebase.database().ref('/user-posts/' + authorId + '/' + postId);
        deletePost(globalPostRef);
        deletePost(userPostRef);
    };
    deleteBtn.onclick = onDeleteClicked;

    return postElement;
}

/**
 * Writes a new comment for the given post.
 */
function createNewComment(postId, username, uid, text) {
    firebase.database().ref('post-comments/' + postId).push({
        text: text,
        author: username,
        uid: uid
    });
}

/**
 * Updates the starred status of the post.
 */
function updateStarredByCurrentUser(postElement, starred) {
    if (starred) {
        postElement.getElementsByClassName('starred')[0].style.display = 'inline-block';
        postElement.getElementsByClassName('not-starred')[0].style.display = 'none';
    } else {
        postElement.getElementsByClassName('starred')[0].style.display = 'none';
        postElement.getElementsByClassName('not-starred')[0].style.display = 'inline-block';
    }
}

/**
 * Updates the number of stars displayed for a post.
 */
function updateStarCount(postElement, nbStart) {
    postElement.getElementsByClassName('star-count')[0].innerText = nbStart;
}

/**
 * Creates a comment element and adds it to the given postElement.
 */
function addCommentElement(postElement, id, text, author) {
    var comment = document.createElement('div');
    comment.classList.add('comment-' + id);
    comment.innerHTML = '<span class="username"></span><span class="comment"></span>';
    comment.getElementsByClassName('comment')[0].innerText = text;
    comment.getElementsByClassName('username')[0].innerText = author || 'Anonymous';

    var commentsContainer = postElement.getElementsByClassName('comments-container')[0];
    commentsContainer.appendChild(comment);
}

/**
 * Sets the comment's values in the given postElement.
 */
function setCommentValues(postElement, id, text, author) {
    var comment = postElement.getElementsByClassName('comment-' + id)[0];
    comment.getElementsByClassName('comment')[0].innerText = text;
    comment.getElementsByClassName('fp-username')[0].innerText = author;
}

/**
 * Deletes the comment of the given ID in the given postElement.
 */
function deleteComment(postElement, id) {
    var comment = postElement.getElementsByClassName('comment-' + id)[0];
    comment.parentElement.removeChild(comment);
}

/**
 * Starts listening for new posts and populates posts lists.
 */
function startDatabaseQueries() {
    var myUserId = firebase.auth().currentUser.uid;
    var topUserPostsRef = firebase.database().ref('user-posts/' + myUserId).orderByChild('starCount');
    var recentPostsRef = firebase.database().ref('posts').limitToLast(100);
    var userPostsRef = firebase.database().ref('user-posts/' + myUserId);

    var fetchPosts = function(postsRef, sectionElement) {
        postsRef.on('child_added', function(data) {
            var author = data.val().author || 'Anonymous';
            var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
            containerElement.insertBefore(
                createPostElement(data.key, data.val().title, data.val().body, author, data.val().uid, data.val().authorPic),
                containerElement.firstChild);
        });
        postsRef.on('child_changed', function(data) {
            var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
            var postElement = containerElement.getElementsByClassName('post-' + data.key)[0];
            postElement.getElementsByClassName('mdl-card__title-text')[0].innerText = data.val().title;
            postElement.getElementsByClassName('username')[0].innerText = data.val().author;
            postElement.getElementsByClassName('text')[0].innerText = data.val().body;
            postElement.getElementsByClassName('star-count')[0].innerText = data.val().starCount;
        });
        postsRef.on('child_removed', function(data) {
            var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
            var post = containerElement.getElementsByClassName('post-' + data.key)[0];
            post.parentElement.removeChild(post);
        });
    };

    // Fetching and displaying all posts of each sections.
    fetchPosts(topUserPostsRef, topUserPostsSection);
    fetchPosts(recentPostsRef, recentPostsSection);
    fetchPosts(userPostsRef, userPostsSection);

    // Keep track of all Firebase refs we are listening to.
    listeningFirebaseRefs.push(topUserPostsRef);
    listeningFirebaseRefs.push(recentPostsRef);
    listeningFirebaseRefs.push(userPostsRef);
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
 * Cleanups the UI and removes all Firebase listeners.
 */
function cleanupUi() {
    // Remove all previously displayed posts.
    topUserPostsSection.getElementsByClassName('posts-container')[0].innerHTML = '';
    recentPostsSection.getElementsByClassName('posts-container')[0].innerHTML = '';
    userPostsSection.getElementsByClassName('posts-container')[0].innerHTML = '';

    // Stop all currently listening Firebase listeners.
    listeningFirebaseRefs.forEach(function(ref) {
        ref.off();
    });
    listeningFirebaseRefs = [];
}

/**
 * The ID of the currently signed-in User. We keep track of this to detect Auth state change events that are just
 * programmatic token refresh but not a User status change.
 */
var currentUID;

/**
 * Triggers every time there is a change in the Firebase auth state (i.e. user signed-in or user signed out).
 */
async function onAuthStateChanged(user) {
    // We ignore token refresh events.
    if (user && currentUID === user.uid) {
        return;
    }

    cleanupUi();
    if (user) {
        currentUID = user.uid;
        splashPage.style.display = 'none';
        await writeUserData(user.uid, user.displayName, user.email, user.photoURL);
        var apiKey = await ensureUserApiKey(user.uid);
        await ensureAppmixerVirtualUser(user.uid, apiKey);
        await ensureAppmixerServiceAccount(apiKey);
        startDatabaseQueries();

    } else {
        // Set currentUID to null.
        currentUID = null;
        // Display the splash page where you can sign-in.
        splashPage.style.display = '';
    }
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
 * Displays the given section element and changes styling of the given button.
 */
function showSection(sectionElement, buttonElement) {
    recentPostsSection.style.display = 'none';
    userPostsSection.style.display = 'none';
    topUserPostsSection.style.display = 'none';
    addPost.style.display = 'none';
    integrationsSection.style.display = 'none';
    automationsSection.style.display = 'none';
    addButton.style.display = 'none';
    recentMenuButton.classList.remove('is-active');
    myPostsMenuButton.classList.remove('is-active');
    myTopPostsMenuButton.classList.remove('is-active');
    myIntegrationsMenuButton.classList.remove('is-active');
    myAutomationsMenuButton.classList.remove('is-active');
    addButton.style.display = 'none';

    closeAppmixerWidgets();

    if (sectionElement) {
        sectionElement.style.display = 'block';
    }
    if (buttonElement) {
        buttonElement.classList.add('is-active');
    }
}

// Bindings on load.
window.addEventListener('load', function() {
    // Bind Sign in button.
    signInButton.addEventListener('click', function() {
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider);
    });

    // Bind Sign out button.
    signOutButton.addEventListener('click', function() {
        firebase.auth().signOut();
    });

    // Listen for auth state changes
    firebase.auth().onAuthStateChanged(onAuthStateChanged);

    // Saves message on form submit.
    messageForm.onsubmit = function(e) {
        e.preventDefault();
        var text = messageInput.value;
        var title = titleInput.value;
        if (text && title) {
            newPostForCurrentUser(title, text).then(function() {
                myPostsMenuButton.click();
            });
            messageInput.value = '';
            titleInput.value = '';
        }
    };

    // Bind menu buttons.
    recentMenuButton.onclick = function() {
        showSection(recentPostsSection, recentMenuButton);
        addButton.style.display = 'block';
    };
    myPostsMenuButton.onclick = function() {
        showSection(userPostsSection, myPostsMenuButton);
        addButton.style.display = 'block';
    };
    myTopPostsMenuButton.onclick = function() {
        showSection(topUserPostsSection, myTopPostsMenuButton);
        addButton.style.display = 'block';
    };
    myIntegrationsMenuButton.onclick = function() {
        showSection(integrationsSection, myIntegrationsMenuButton);
        showIntegrations();
    };
    myAutomationsMenuButton.onclick = function() {
        showSection(automationsSection, myAutomationsMenuButton);
        showFlows();
    };
    addButton.onclick = function() {
        showSection(addPost);
        messageInput.value = '';
        titleInput.value = '';
    };
    recentMenuButton.onclick();
}, false);


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

// Appmixer helper functions.
// --------------------------

var appmixerWidgets = {
    designer: null,
    flowManager: null,
    integrationTemplates: null,
    integrationInstances: null,
    wizard: null
};

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

function closeAppmixerWidgets() {
    Object.keys(appmixerWidgets).forEach(function(widget) {
        if (appmixerWidgets[widget]) {
            appmixerWidgets[widget].close();
        }
    });
}

function showIntegrations() {
    appmixerWidgets.integrationTemplates = appmixerWidgets.integrationTemplates || appmixer.ui.Integrations({
        el: '#appmixer-integration-templates',
        options: {
            showHeader: false,
            customFilter: {
                'sharedWith.0.domain': APPMIXER_USER_DOMAIN,     // Show only integration templates shared with users in this demo app.
                'templateId': '!'       // Show Integration templates only. Template don't have `templateId`, only instances do to reference templates they were created from.
            }
        }
    });
    appmixerWidgets.integrationInstances = appmixerWidgets.integrationInstances || appmixer.ui.Integrations({
        el: '#appmixer-integration-instances',
        options: {
            showHeader: false,
            customFilter: {
                userId: appmixer.get('user').id,        // Show only my instances. Not all flows that have been possibly shared with me in the Studio.
                'templateId': '>0'      // Show Integration instances only. Instances have `templateId` to reference the template they were created from.
            }
        }
    });
    appmixerWidgets.wizard = appmixerWidgets.wizard || appmixer.ui.Wizard();
    // Make sure our list of integration instances is refreshed when integration is started or removed.
    // Note that we're using start-after and remove-after events. This is because by default, the wizard
    // does all the API calls to start or remove flows for us. It is also possible to redefine these events start/remove
    // and use the appmixer.api module to start/remove flows manually.
    appmixerWidgets.wizard.on('flow:start-after', () => appmixerWidgets.integrationInstances.reload());
    appmixerWidgets.wizard.on('flow:remove-after', () => {
        appmixerWidgets.integrationInstances.reload();
        appmixerWidgets.wizard.close();
    });
    appmixerWidgets.integrationTemplates.on('integration:create', (templateId) => {
        appmixerWidgets.wizard.close();
        appmixerWidgets.wizard.set('flowId', templateId);
        appmixerWidgets.wizard.open();
    });
    appmixerWidgets.integrationInstances.on('integration:edit', (integrationId) => {
        appmixerWidgets.wizard.close();
        appmixerWidgets.wizard.set('flowId', integrationId);
        appmixerWidgets.wizard.open();
    });
    appmixerWidgets.integrationTemplates.open();
    appmixerWidgets.integrationInstances.open();
}



async function showFlows() {
    appmixerWidgets.flowManager = appmixerWidgets.flowManager || appmixer.ui.FlowManager({
        el: '#appmixer-flowmanager',
        options: {
            showHeader: false,
            menu: [ { label: 'Delete', event: 'flow:remove' } ],
            customFilter: {
                userId: appmixer.get('user').id, // Show only my flows.
                'wizard.fields': '!'     // Filter out integration templates (i.e. flows that have a Wizard defined).
            }
        }
    });
    appmixerWidgets.designer = appmixerWidgets.designer || appmixer.ui.Designer({
        el: '#appmixer-designer',
        options: {
            showHeader: true,
            showButtonHome: false,
            showButtonInsights: false,
            showButtonConnectors: false,
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
    // Note: flow:start, flow:stop, flow:remove is handled implicitely since we're not overriding the behaviour here.
    appmixerWidgets.flowManager.on('flow:create', async () => {
        try {
            appmixerWidgets.flowManager.state('loader', true);
            var flowId = await appmixer.api.createFlow('New flow');
            appmixerWidgets.flowManager.state('loader', false);
            appmixerWidgets.designer.set('flowId', flowId);
            appmixerWidgets.flowManager.close();
            appmixerWidgets.designer.open();
        } catch (err) { onerror(err) }
    });
    appmixerWidgets.flowManager.on('flow:open', (flowId) => {
        appmixerWidgets.designer.set('flowId', flowId);
        appmixerWidgets.flowManager.close();
        appmixerWidgets.designer.open();
    });
    appmixerWidgets.flowManager.open();
}

function onerror(err) {
    alert(err);
}
