'use strict';

/**
 * Entry point for dynamodb templates
 */
const index = {
    /**
     * Reference to the template abstraction for VPCs
     */
    VpcTemplate: require('./vpc-template')
};

module.exports = index;
