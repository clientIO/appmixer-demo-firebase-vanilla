'use strict';

module.exports = {

    type: 'apiKey',

    definition: {

        auth: {
            apiKey: {
                type: 'text',
                name: 'API Key',
                tooltip: 'Your Firebase app account API key.'
            }
        },

        validate: {
            method: 'GET',
            url: '{{config.baseUrl}}/api/me?apiKey={{apiKey}}'
        }
    }
};
