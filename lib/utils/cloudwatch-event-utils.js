'use strict';

/**
 * A module that exposes utility methods related to cloudwatch events.
 */
const cloudwatchEventUtils = {

    /**
     * Gets a URI that uniquely references a cloudwatch event source.
     *
     * @param {String} ruleName The name of the lambda function.
     *
     * @return {String} The lambda function invocation uri.
     */
    getEventRuleUri: function(ruleName) {
        if (typeof ruleName !== 'string' || ruleName.length <= 0) {
            throw new Error('Invalid rule name specified (arg #1)');
        }
        return {
            'Fn::Join': ['', [
                'arn:aws:events:', {
                    'Ref': 'AWS::Region'
                },
                ':', {
                    'Ref': 'AWS::AccountId'
                },
                `:rule/${ruleName}`
            ]]
        };
    }
};

module.exports = cloudwatchEventUtils;
