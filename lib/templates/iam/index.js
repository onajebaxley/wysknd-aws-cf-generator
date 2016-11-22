'use strict';

/**
 * Entry point for dynamodb templates
 */
const index = {
    /**
     * Reference to the template abstraction for iam roles
     */
    RoleTemplate: require('./role-template'),

    /**
     * Reference to a builder object for policy documents
     */
    PolicyDocument: require('./policy-document'),

    /**
     * Reference to a builder object for policy statements
     */
    PolicyStatement: require('./policy-statement')
};

module.exports = index;
