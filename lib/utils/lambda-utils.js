'use strict';

/**
 * A module that exposes utility methods related to lambda functions.
 */
const lambdaUtils = {

    /**
     * Gets a URI that uniquely references the lambda function.
     *
     * @param {String} lambdaFunction The name of the lambda function.
     * @param {String} [alias=''] An optional alias parameter that can be used
     *        as a qualifier for the lambda function.
     *
     * @return {String} The lambda function invocation uri.
     */
    getLambdaUri: function(lambdaFunction, alias) {
        if (typeof lambdaFunction !== 'string' || lambdaFunction.length <= 0) {
            throw new Error('Invalid lambda function specified (arg #1)');
        }
        if (typeof alias !== 'string') {
            alias = '';
        } else {
            alias = `:${alias}`;
        }
        return {
            'Fn::Join': ['', [
                'arn:aws:lambda:', {
                    'Ref': 'AWS::Region'
                },
                ':', {
                    'Ref': 'AWS::AccountId'
                },
                `:function:${lambdaFunction}${alias}`
            ]]
        };
    }
};

module.exports = lambdaUtils;
