'use strict';

module.exports = {

    async receive(context) {
        const { apiKey } = context.auth;
        const { title, body } = context.messages.in.content;
        const url = context.config.baseUrl + '/api/posts?apiKey=' + apiKey;
        const { data } = await context.httpRequest.post(url, { title, body }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return context.sendJson(data, 'out');
    }
};
