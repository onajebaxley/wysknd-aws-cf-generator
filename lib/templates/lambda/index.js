'use strict';

/**
 * Entry point for lambda templates
 */
const index = {
    /**
     * Reference to the template abstraction for Lambda functions
     */
    FunctionTemplate: require('./function-template'),

    /**
     * Reference to the template abstraction for a lambda function alias.
     */
    AliasTemplate: require('./alias-template'),

    /**
     * Reference to the template abstraction for event source mappings
     */
    EventSourceMappingTemplate: require('./event-source-mapping-template'),

    /**
     * Reference to the template abstraction for a lambda function permissions.
     */
    PermissionTemplate: require('./permission-template'),
};

module.exports = index;
