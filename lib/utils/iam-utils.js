'use strict';

/**
 * A module that exposes utility methods related to IAM objects.
 */
const iamUtils = {

    /**
     * Gets an IAM role URI based on the role name. If the role value is
     * prefixed with "$REGION", the generated role name will be prefixed
     * with the current region.
     *
     * @param {String} role The name of the role.
     *
     * @return {Object} A cloud formation template snippet that represents the
     *         role uri.
     */
    getRoleUri: function(role) {
        if (typeof role !== 'string' || role.length <= 0) {
            throw new Error('Invalid role name specified (arg #1)');
        }
        const injectRegion = (role.indexOf('$REGION') !== -1);

        let regionToken = '';
        let roleName = role;
        if (role.indexOf('$REGION') >= 0) {
            regionToken = {
                Ref: 'AWS::Region'
            };
            roleName = role.replace('$REGION', '');
        }
        return {
            'Fn::Join': ['', [
                'arn:aws:iam::', {
                    Ref: 'AWS::AccountId'
                },
                ':role/',
                regionToken,
                roleName
            ]]
        };
    },

    /**
     * Gets an AWS managed policy URI based on the policy name.
     *
     * @param {String} policyName The name of the policy.
     *
     * @return {String} The IAM policy uri.
     */
    getAwsPolicyUri: function(policyName) {
        if (typeof policyName !== 'string' || policyName.length <= 0) {
            throw new Error('Invalid policy name specified (arg #1)');
        }
        return `arn:aws:iam::aws:policy/${policyName}`;
    },

    /**
     * Gets a user managed policy URI based on the policy name.
     *
     * @param {String} policyName The name of the policy.
     *
     * @return {Object} A cloud formation template snippet that represents the
     *         policy uri.
     */
    getUserPolicyUri: function(policyName) {
        if (typeof policyName !== 'string' || policyName.length <= 0) {
            throw new Error('Invalid policy name specified (arg #1)');
        }
        return {
            'Fn::Join': ['', [
                'arn:aws:iam::', {
                    Ref: 'AWS::AccountId'
                },
                ':policy/',
                policyName
            ]]
        };
    },

    /**
     * Gets an IAM user URI based on the user name.
     *
     * @param {String} username The username of the user
     *
     * @return {Object} A cloud formation template snippet that represents the
     *         user uri.
     */
    getUserUri: function(username) {
        if (typeof username !== 'string' || username.length <= 0) {
            throw new Error('Invalid username specified (arg #1)');
        }
        return {
            'Fn::Join': ['', [
                'arn:aws:iam::', {
                    Ref: 'AWS::AccountId'
                },
                ':',
                username
            ]]
        };
    }
};

module.exports = iamUtils;
