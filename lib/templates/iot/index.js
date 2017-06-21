'use strict';

/**
 * Entry point for lambda templates
 */
const index = {
    /**
     * Reference to the template abstraction for IoT topic rules
     */
    TopicRuleTemplate: require('./topic-rule-template'),
};

module.exports = index;
