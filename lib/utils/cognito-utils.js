'use strict';

/**
 * A module that exposes utility methods related to AWS cognito
 */
const cognitoUtils = {

    /**
     * Gets a cognito user pool URI based on the cognito user pool id.
     *
     * @param {String} userPoolId The cognito user pool id.
     *
     * @return {String} The cognito user pool URI.
     */
    getUserPoolUri: function(userPoolId) {
        if (typeof userPoolId !== 'string' || userPoolId.length <= 0) {
            throw new Error('Invalid user pool id specified (arg #1)');
        }
        return {
            'Fn::Join': ['', [
                'arn:aws:cognito-idp:', {
                    'Ref': 'AWS::Region'
                },
                ':', {
                    'Ref': 'AWS::AccountId'
                },
                `:userpool/${userPoolId}`
            ]]
        };
    }
};

module.exports = cognitoUtils;
