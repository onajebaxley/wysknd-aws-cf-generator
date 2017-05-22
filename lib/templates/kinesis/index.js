'use strict';

/**
 * Entry point for lambda templates
 */
const index = {
    /**
     * Reference to the template abstraction for Lambda functions
     */
    StreamTemplate: require('./kinesis-stream-template'),
};

module.exports = index;
