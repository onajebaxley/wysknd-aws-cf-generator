'use strict';

/**
 * Entry point for dynamodb templates
 */
const index = {
    /**
     * Reference to the template abstraction for an elastic search domain.
     */
    DomainTemplate: require('./domain-template')
};

module.exports = index;
