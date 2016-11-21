'use strict';

const SecondaryIndex = require('./secondary-index');

/**
 * Utility class that can be used to build out a local secondary index
 * for a dynamodb table.
 *
 * @extends {SecondaryIndex}
 */
class LocalSecondaryIndex extends SecondaryIndex {
    /**
     * @param {String} indexName The name of the lambda function
     */
    constructor(indexName) {
        super(indexName);
    }
}

module.exports = LocalSecondaryIndex;
