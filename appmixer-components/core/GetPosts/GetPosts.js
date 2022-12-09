'use strict';

module.exports = {

    async receive(context) {
        const { apiKey } = context.auth;
        const url = context.config.baseUrl + '/api/posts?apiKey=' + apiKey;
        const { data } = await context.httpRequest.get(url);
        return context.sendJson({ posts: data }, 'out');
    }
};
