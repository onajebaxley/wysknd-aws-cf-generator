'use strict';

const Template = require('../template');
const _lambdaUtils = require('../../utils/lambda-utils');

/**
 * Specialized method template class for a cloudwatch event rule.
 *
 * @extends {Template}
 */
class EventRuleTemplate extends Template {
    /**
     * @param {String} key A key that uniquely identifies the template
     * @param {String} name The name of the event rule
     */
    constructor(key, name) {
        if (typeof name !== 'string' || name.length <= 0) {
            throw new Error('Invalid name specified (arg #2)');
        }
        super(key, 'AWS::Events::Rule', {
            Name: name,
            Description: '',
            EventPattern: undefined,
            ScheduleExpression: '',
            State: 'ENABLED',
            Targets: []
        });
    }

    /**
     * Sets the schedule expression as a polling rate.
     *
     * @private
     * @param {Number} duration The polling duration as a positive number.
     * @param {String} unit The unit of measurement for the duration.
     */
    _setPollRate(duration, unit) {
        if (typeof duration !== 'number' || duration <= 0) {
            throw new Error('Invalid duration specified (arg #1)');
        }

        const suffix = (duration === 1) ? '' : 's';

        this.properties.ScheduleExpression = `rate(${duration} ${unit}${suffix})`;
        return this;
    }

    /**
     * Sets the description of the event rule
     *
     * @param {String} description The event rule description
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setDescription(description) {
        if (typeof description !== 'string') {
            throw new Error('Invalid description specified (arg #1)');
        }

        this.properties.Description = description;
        return this;
    }

    /**
     * Sets the event pattern for the cloud watch rule. See
     *   http://docs.aws.amazon.com/AmazonCloudWatch/latest/events/CloudWatchEventsandEventPatterns.html
     * for more information
     *
     * @param {Object} pattern The event pattern to set on the rule.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setEventPattern(pattern) {
        if (!pattern || (pattern instanceof Array) || typeof pattern !== 'object') {
            throw new Error('Invalid event pattern specified (arg #1)');
        }

        this.properties.EventPattern = pattern;
        return this;
    }

    /**
     * Enables/disables the current rule.
     *
     * @param {Boolean} enabled If set to true, enables the rule.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setEnabled(enabled) {
        this.properties.State = enabled ? 'ENABLED' : 'DISABLED';

        return this;
    }

    /**
     * Sets the schedule expression for the rule as a rate in minutes.
     *
     * @param {Number} duration The duration in minutes after which the event
     *        rule will trigger.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setPollRateInMinutes(duration) {
        return this._setPollRate(duration, 'minute');
    }

    /**
     * Sets the schedule expression for the rule as a rate in hours.
     *
     * @param {Number} duration The duration in hours after which the event
     *        rule will trigger.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setPollRateInHours(duration) {
        return this._setPollRate(duration, 'hour');
    }

    /**
     * Sets the schedule expression for the rule as a rate in days.
     *
     * @param {Number} duration The duration in days after which the event
     *        rule will trigger.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setPollRateInDays(duration) {
        return this._setPollRate(duration, 'day');
    }

    /**
     * Sets the rule schedule rate as a cron expression. See this link for more
     * information:
     *   http://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html
     *
     * @param {String} cronExpression The cron expression to use for scheduling.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setChronSchedule(cronExpression) {
        if (typeof cronExpression !== 'string' || cronExpression.length <= 0) {
            throw new Error('Invalid cron expression specified (arg #1)');
        }

        this.properties.ScheduleExpression = `cron(${cronExpression})`;
        return this;
    }
    /**
     * Adds a target lambda function for the event rule.
     *
     * @param {String} id A unique identifier for the target.
     * @param {Object|String} lambdaFunction Specifies the target lambda
     *        function to invoke. If specified as a string, it will be used
     *        as the target function. If an object is specified, it can define
     *        two properties:
     *          (1) name - represents the name of the lambda function
     *          (1) suffix - represents the lambda function suffix (ex: version).
     * @param {Object} [inputOpts={
     *                     input: <Optional JSON String>,
     *                     inputPath: <Optional String>
     *                 }] Optional input/input path to pass to the lambda. If
     *                 omitted, the entire event will be passed.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    addTargetLambda(id, lambdaFunction, inputOpts) {
        if (typeof id !== 'string' || id.length <= 0) {
            throw new Error('Invalid id specified (arg #1)');
        }

        if (lambdaFunction && !(lambdaFunction instanceof Array) && typeof lambdaFunction === 'object') {
            if (typeof lambdaFunction.name !== 'string' || lambdaFunction.name.length <= 0) {
                throw new Error('Invalid lambdaFunction.name specified (lambdaFunction.name)');
            }
            if (typeof lambdaFunction.suffix !== 'string' || lambdaFunction.suffix.length <= 0) {
                lambdaFunction.suffix = '';
            }
        } else if (typeof lambdaFunction !== 'string' || lambdaFunction.length <= 0) {
            throw new Error('Invalid lambdaFunction specified (arg #2). Must be string or object.');
        } else {
            lambdaFunction = {
                name: lambdaFunction,
                suffix: ''
            };
        }

        if (!inputOpts || (inputOpts instanceof Array) || typeof inputOpts !== 'object') {
            inputOpts = {};
        }

        const target = Object.assign({
            Id: id,
            Arn: _lambdaUtils.getLambdaUri(lambdaFunction.name, lambdaFunction.suffix)
        }, {
            Input: inputOpts.input,
            InputPath: inputOpts.inputPath
        });

        this.properties.Targets.push(target);
        return this;
    }
}

module.exports = EventRuleTemplate;
