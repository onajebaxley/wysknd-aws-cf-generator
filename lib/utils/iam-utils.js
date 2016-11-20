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
     * @return {String} The IAM role uri.
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
                Ref: 'AWS:Region'
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
    }
};

module.exports = iamUtils;
