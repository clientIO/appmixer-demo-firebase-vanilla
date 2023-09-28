'use strict';

module.exports = {

    async receive(context) {
        if (context.messages.webhook) {
            const body = context.messages.webhook.content.data;
            await context.sendJson(body.data, 'out');
            return context.response();
        }
    },

    async start(context) {
        const { apiKey } = context.auth;
        const url = context.config.baseUrl + '/api/webhooks?apiKey=' + apiKey;
        const { myPostsOnly } = context.properties;
        const event = myPostsOnly ? 'my-post-deleted' : 'post-deleted';
        const { data } = await context.httpRequest.post(url, { url: context.getWebhookUrl(), event });
        return context.saveState({ id: data.id, event });
    },

    async stop(context) {
        const { apiKey } = context.auth;
        const url = context.config.baseUrl + '/api/webhooks/' + context.state.event + '/' + context.state.id + '?apiKey=' + apiKey;
        return context.httpRequest.delete(url);
    }
};
