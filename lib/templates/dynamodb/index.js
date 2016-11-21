'use strict';

/**
 * Entry point for dynamodb templates
 */
const index = {
    /**
     * Reference to the template abstraction for dynamo db tables
     */
    TableTemplate: require('./table-template'),

    /**
     * Reference to a builder object for local secondary indexes.
     */
    LocalSecondaryIndex: require('./local-secondary-index'),

    /**
     * Reference to a builder object for global secondary indexes.
     */
    GlobalSecondaryIndex: require('./global-secondary-index')
};

module.exports = index;
