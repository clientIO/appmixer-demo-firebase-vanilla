const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebaseApp = admin.initializeApp();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors({ origin: true }));

const getUserByApiKey = async (apiKey) => {
    const ref = firebaseApp.database().ref('users');
    const snapshot = await ref.orderByChild('apiKey').equalTo(apiKey).once('value');
    const result = snapshot.val();
    const userId = result ? Object.keys(result)[0] : null;
    if (userId) {
        const user = result[userId];
        user.id = userId;
        return user;
    } else {
        return null;
    }
};

app.get('/me', async (req, res) => {
    const user = await getUserByApiKey(req.query.apiKey);
    if (!user) return res.status(401).end();
    res.json(user);
});

app.get('/posts', async (req, res) => {
    const user = await getUserByApiKey(req.query.apiKey);
    if (!user) return res.status(401).end();

    const snapshot = await firebaseApp.database().ref('user-posts/' + user.id).once('value');
    const result = snapshot.val() || {};
    const normalizedPosts = [];
    Object.keys(result).forEach(postId => {
        const post = result[postId];
        post.id = postId;
        normalizedPosts.push(post);
    });
    res.json(normalizedPosts);
});

app.post('/posts', async (req, res) => {
    const user = await getUserByApiKey(req.query.apiKey);
    if (!user) return res.status(401).end();
    const postData = {
        author: user.username,
        uid: user.id,
        body: req.body.body,
        title: req.body.title,
        starCount: 0,
        authorPic: user.profile_picture
    };
    const newPostKey = firebaseApp.database().ref().child('posts').push().key;
    // Write the new post's data simultaneously in the posts list and the user's post list.
    const updates = {};
    updates['/posts/' + newPostKey] = postData;
    updates['/user-posts/' + user.id + '/' + newPostKey] = postData;
    await firebaseApp.database().ref().update(updates);
    res.json({ id: newPostKey });
});

app.post('/posts/:id/comments', async (req, res) => {
    const user = await getUserByApiKey(req.query.apiKey);
    if (!user) return res.status(401).end();
    const commentData = {
        author: user.username,
        uid: user.id,
        text: req.body.text
    };
    firebaseApp.database().ref().child('post-comments/' + req.params.id).push(commentData);
    res.json({});
});

app.post('/webhooks', async (req, res) => {
    const user = await getUserByApiKey(req.query.apiKey);
    if (!user) return res.status(401).end();
    const { url, event } = req.body;
    const newWebhookKey = firebaseApp.database().ref().child('webhooks/' + event).push().key;
    const webhookData = { url: url, uid: user.id };
    const updates = { ['/webhooks/' + event + '/' + newWebhookKey]: webhookData };
    await firebaseApp.database().ref().update(updates);
    res.json({ id: newWebhookKey, event });
});

app.delete('/webhooks/:event/:id', async (req, res) => {
    const user = await getUserByApiKey(req.query.apiKey);
    if (!user) return res.status(401).end();
    const { event, id } = req.params;
    await firebaseApp.database().ref().child('webhooks/' + event + '/' + id).remove();
    res.json({ event, id });
});

exports.api = functions.https.onRequest(app);

exports.onPostCreated = functions.database.ref('/posts/{postId}').onCreate((snapshot, context) => {
    const postId = context.params.postId;
    const post = snapshot.val();
    post.id = postId;
    notifyWebhooks('post-created', post);
    notifyWebhooks('my-post-created', post, post.uid);
});

exports.onPostDeleted = functions.database.ref('/posts/{postId}').onDelete((snapshot, context) => {
    const postId = context.params.postId;
    const post = snapshot.val();
    post.id = postId;
    notifyWebhooks('post-deleted', post);
    notifyWebhooks('my-post-deleted', post, post.uid);
});

exports.onPostUpdated = functions.database.ref('/posts/{postId}').onUpdate((change, context) => {
    const postId = context.params.postId;
    const post = change.after.val();
    post.id = postId;
    notifyWebhooks('post-updated', post);
    notifyWebhooks('my-post-updated', post, post.uid);
});

const notifyWebhooks = async (event, data, userId) => {
    const snapshot = await firebaseApp.database().ref().child('webhooks/' + event).once('value');
    const webhooks = snapshot.val() || {};
    const webhookIds = Object.keys(webhooks);
    for (const webhookId of webhookIds) {
        const webhook = webhooks[webhookId];
        if (userId && userId !== webhook.uid) {
            // User check required (for my-* events) and it's not a post of a user that created the webhook. Skip.
            continue;
        }
        let res;
        try {
            res = await axios.post(webhook.url, { event, data });
        } catch (err) {
            functions.logger.error('Error notifying webhook', webhook.url, 'for event', event, 'with data', data, 'for user', userId, err, 'response', res);
        }
    }
};
