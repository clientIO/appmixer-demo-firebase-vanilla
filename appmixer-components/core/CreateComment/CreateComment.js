'use strict';

module.exports = {

    async receive(context) {
        const { apiKey } = context.auth;
        const { postId, text } = context.messages.in.content;
        const url = context.config.baseUrl + '/api/posts/' + postId + '/comments?apiKey=' + apiKey;
        const { data } = await context.httpRequest.post(url, { text }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return context.sendJson(data, 'out');
    }
};
