'use strict';

const Template = require('../template');

/**
 * Specialized method template class for IoT Topic Rule
 *
 * @extends {Template}
 */
class TopicRuleTemplate extends Template {
    /**
     * @param {String} key A key that uniquely identifies the template
     * @param {String} streamName The name of the kinesis stream
     * @param {String} rulePayloadKey The key of the rule payload object
     */
    constructor(key, ruleName) {
        if (typeof ruleName !== 'string' || ruleName.length <= 0) {
            throw new Error('Invalid ruleName specified (arg #2)');
        }
        super(key, 'AWS::IoT::TopicRule', {
            Name: ruleName,
            TopicRulePayload: {
                RuleDisabled: true,
                SQL: undefined,
                Description: undefined,
                Actions: []
            }
        });
    }

    /**
     * Adds kinesis action to the IoT rule
     *
     * @param {String} The name of the Kinesis stream.
     *
     * @param {String} The ARN of the IAM role that grants access to an Kinesis stream.
     *
     * @param {String} The partition key (the grouping of data by shard within an Kinesis stream).
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */

    addKinesisAction(streamName, roleArn, partitionKey) {
        if (typeof streamName !== 'string' || streamName.length <= 0) {
            throw new Error('addKinesisAction - Invalid streamName - expected a string.');
        }

        if (typeof roleArn !== 'string' || roleArn.length <= 0) {
            throw new Error('addKinesisAction - Invalid roleArn - expected a string.');
        }

        if (partitionKey && typeof partitionKey !== 'string') {
            throw new Error('addKinesisAction - Invalid partitionKey - expected a string.');
        }

        const action = {
            Kinesis: {
                PartitionKey: partitionKey,
                RoleArn: roleArn,
                StreamName: streamName
            }
        };
        this.properties.TopicRulePayload.Actions.push(action);
        return this;
    }

    /**
     * Enables/Disables the IoT rule
     *
     * @param {boolean} Setting that detemines of rule is on or off.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setIsEnabled(state) {
        if (typeof streamName !== 'boolean') {
            throw new Error('Invalid streamName - expected a string.');
        }

        this.properties.TopicRulePayload.RuleDisabled = state;
        return this;
    }

    /**
     * Enables the IoT rule
     *
     * @param {String} Setting that detemines of rule is on or off.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setDescription(desc) {
        this.properties.TopicRulePayload.Description = false;
        return this;
    }

    /**
     * Enables the IoT rule
     *
     * @param {String} The SQL query that will be used by the topic to filter messages.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setSQL(sql) {
        this.properties.TopicRulePayload.SQL = sql;
        return this;
    }
}

module.exports = TopicRuleTemplate;