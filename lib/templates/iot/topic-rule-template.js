'use strict';

const Template = require('../template');
const _iamUtils = require('../../utils/iam-utils');

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
            RuleName: ruleName,
            TopicRulePayload: {
                RuleDisabled: true,
                Sql: undefined,
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

    addKinesisAction(streamName, roleName, partitionKey) {
        if (typeof streamName !== 'string' || streamName.length <= 0) {
            throw new Error('addKinesisAction - Invalid streamName - expected a string.');
        }

        if (typeof roleName !== 'string' || roleName.length <= 0) {
            throw new Error('addKinesisAction - Invalid roleArn - expected a string.');
        }

        if (partitionKey && typeof partitionKey !== 'string') {
            throw new Error('addKinesisAction - Invalid partitionKey - expected a string.');
        }

        const roleArn = _iamUtils.getRoleUri(roleName);
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
     * Sets setting that enables/disables the IoT rule
     *
     * @param {boolean} Setting that detemines of rule is on or off.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setIsDisabled(state) {
        if (typeof state !== 'boolean') {
            throw new Error('setIsEnabled - Invalid streamName - expected a boolean.');
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
        this.properties.TopicRulePayload.Description = desc;
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
        this.properties.TopicRulePayload.Sql = sql;
        return this;
    }
}

module.exports = TopicRuleTemplate;