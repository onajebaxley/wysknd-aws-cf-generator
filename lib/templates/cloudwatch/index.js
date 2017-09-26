'use strict';

/**
 * Entry point for cloudwatch templates
 */
const index = {
    /**
     * Reference to the template abstraction for a cloudwatch event rule.
     */
    EventRuleTemplate: require('./event-rule-template')
};

module.exports = index;
