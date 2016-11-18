'use strict';

/**
 * Entry point for lambda templates
 */
const index = {
    /**
     * Reference to the template abstraction for dynamo db tables
     */
    DynamoDbTableTemplate: require('./dynamodb-table-template')
};

module.exports = index;
