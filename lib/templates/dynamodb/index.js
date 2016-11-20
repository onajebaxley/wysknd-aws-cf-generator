'use strict';

/**
 * Entry point for dynamodb templates
 */
const index = {
    /**
     * Reference to the template abstraction for dynamo db tables
     */
    TableTemplate: require('./table-template')
};

module.exports = index;
