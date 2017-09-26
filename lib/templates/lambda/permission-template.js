'use strict';

const Template = require('../template');
const _lambdaUtils = require('../../utils/lambda-utils');
const _cloudwatchEventUtils = require('../../utils/cloudwatch-event-utils');

/**
 * Specialized method template class that adds permissions to individual lambda
 * functions, allowing them to be invoked by other entities.
 *
 * @extends {Template}
 */
class PermissionTemplate extends Template {
    /**
     * @param {String} key A key that uniquely identifies the template
     * @param {String} functionName The name of the lambda function that will
     *        handle the emitted events.
     * @param {String} [alias=undefined] An optional alias to attach to the lambda
     *        function.
     */
    constructor(key, functionName, alias) {
        if (typeof functionName !== 'string' || functionName.length <= 0) {
            throw new Error('Invalid functionName specified (arg #1)');
        }

        super(key, 'AWS::Lambda::Permission', {
            Action: undefined,
            EventSourceToken: undefined,
            FunctionName: _lambdaUtils.getLambdaUri(functionName, alias),
            Principal: undefined,
            SourceAccount: undefined,
            SourceArn: undefined
        });
    }

    /**
     * Sets the action that is allowed by this permission setting.
     *
     * @param {String} action The lambda action that is allowed. Can be a wild
     *        card, but must not include the 'lambda:' prefix which will
     *        automatically be injected.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setAction(action) {
        if (typeof action !== 'string' || action.length <= 0) {
            throw new Error('Invalid action specified (arg #1)');
        }

        this.properties.Action = `lambda:${action}`;
        return this;
    }

    /**
     * Sets the event source token that is provided by the invoking principal.
     *
     * @param {String} token The event source token.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setEventSourceToken(token) {
        if (token && (typeof token !== 'string' || token.length <= 0)) {
            throw new Error('Invalid token specified (arg #1)');
        }
        this.properties.EventSourceToken = token;
        return this;
    }

    /**
     * Sets the principal that will be granted permissions to invoke the
     * function.
     *
     * @param {String} principal The principal that will assume permissions.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setPrincipal(principal) {
        if (typeof principal !== 'string' || principal.length <= 0) {
            throw new Error('Invalid principal specified (arg #1)');
        }

        this.properties.Principal = principal;
        return this;
    }

    /**
     * Sets the account id of the source account that will be accessing the
     * lambda function. This only applies in cases where cross account
     * permissions are being configured.
     *
     * @param {String} sourceAccount The source account id, without hyphens.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setSourceAccount(sourceAccount) {
        if (sourceAccount && (typeof sourceAccount !== 'string' || sourceAccount.length <= 0)) {
            throw new Error('Invalid sourceAccount specified (arg #1)');
        }

        this.properties.SourceAccount = sourceAccount;
        return this;
    }

    /**
     * Sets the ARN of the resource that will be accessing the lambda function.
     * This can be used to narrow down the sources (ex: specific S3 bucket)
     * that can access the lambda function.
     *
     * It is recommended that specialized calls (ex: setEventRuleSource) be used instead
     * of this method.
     *
     * @param {String} sourceArn The source arn
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setSourceArn(sourceArn) {
        if (sourceArn && (typeof sourceArn !== 'string' || sourceArn.length <= 0)) {
            throw new Error('Invalid sourceArn specified (arg #1)');
        }

        this.properties.SourceArn = sourceArn;
        return this;
    }

    /**
     * Sets the source of invocation to a cloudwatch event rule.
     *
     * @param {String} ruleName The name of the rule. An ARN string will be
     *        generated for this value.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setEventRuleSource(ruleName) {
        if (typeof ruleName !== 'string' || ruleName.length <= 0) {
            throw new Error('Invalid ruleName specified (arg #1)');
        }

        this.properties.SourceArn = _cloudwatchEventUtils.getEventRuleUri(ruleName);
        return this;
    }
}

module.exports = PermissionTemplate;
