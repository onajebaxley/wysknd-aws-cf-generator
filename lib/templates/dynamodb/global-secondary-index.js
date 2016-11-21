'use strict';

const SecondaryIndex = require('./secondary-index');

/**
 * Utility class that can be used to build out a global secondary index
 * for a dynamodb table.
 *
 * @extends {SecondaryIndex}
 */
class GlobalSecondaryIndex extends SecondaryIndex {
    /**
     * @param {String} indexName The name of the lambda function
     */
    constructor(indexName) {
        super(indexName);
        this.properties.ProvisionedThroughput = {
            ReadCapacityUnits: '5',
            WriteCapacityUnits: '5'
        };
    }

    /**
     * Sets the read capacity on the index.
     *
     * @param {Number} capacity The read capacity to set.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setReadCapacity(capacity) {
        if (typeof capacity !== 'number' || capacity <= 0) {
            throw new Error('Invalid read capacity specified (arg #1)');
        }

        this.properties.ProvisionedThroughput.ReadCapacityUnits = capacity.toString();

        return this;
    }

    /**
     * Sets the write capacity on the index.
     *
     * @param {Number} capacity The write capacity to set.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setWriteCapacity(capacity) {
        if (typeof capacity !== 'number' || capacity <= 0) {
            throw new Error('Invalid write capacity specified (arg #1)');
        }

        this.properties.ProvisionedThroughput.WriteCapacityUnits = capacity.toString();

        return this;
    }
}

module.exports = GlobalSecondaryIndex;
