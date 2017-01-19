'use strict';
const _clone = require('clone');
const Template = require('../template');
const _resourceUtils = require('../../utils/resource-utils');
const _cognitoUtils = require('../../utils/cognito-utils');
const _lambdaUtils = require('../../utils/lambda-utils');
const _iamUtils = require('../../utils/iam-utils');

const DEFAULT_SCHEMA_VERSION = 'http://json-schema.org/draft-04/schema#';

/**
 * Specialized template class for an API Gateway custom authorizer object.
 *
 * @extends {Template}
 */
class AuthorizerTemplate extends Template {
    /**
     * @param {String} key A key that uniquely identifies the template
     * @param {String} name The name of the model
     * @param {String} [apiId=''] An optional api id that can be used to
     *        identify a specific api. Especially useful if multiple APIs are
     *        defined within a single cloud formation template.
     */
    constructor(key, name, apiId) {
        if (typeof name !== 'string' || name.length <= 0) {
            throw new Error('Invalid api name specified (arg #2)');
        }
        if (typeof apiId !== 'string') {
            apiId = '';
        }

        super(key, 'AWS::ApiGateway::Authorizer', {
            RestApiId: null,
            Name: name,
            AuthorizerCredentials: undefined,
            AuthorizerUri: undefined,
            AuthorizerResultTtlInSeconds: '300',
            Type: undefined,
            IdentitySource: 'method.request.header.Authorization',
            IdentityValidationExpression: undefined,
            ProviderARNs: []
        });

        this._apiId = apiId;
    }

    /**
     * Assigns a reference to the REST API to the model.
     *
     * @param {Object} dirInfo An object that contains hierarchical information
     *        for the template.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setRestApiId(dirInfo) {
        this.properties.RestApiId = _resourceUtils.getRestApi(dirInfo, this._apiId);

        return this;
    }

    /**
     * Assigns a lambda function to the authorizer template. Invoking this
     * method after initially assigning a cognito user pool will result in
     * an error.
     *
     * @param {String} lambdaFunction The name of the lambda function. A full
     *        URI will be generated using this value.
     * @param {String} [role = '<% authorizer_invoke_role %>'] An optional IAM
     *        role name that will be used to access the authorizer.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setAuthorizerLambda(lambdaFunction, role) {
        const props = this.properties;
        if (props.ProviderARNs.length > 0 ||
            (props.Type !== undefined && props.Type !== 'TOKEN')) {
            throw new Error('Attempt to redefine authorizer type. Currently defined as a user pool authorizer');
        }
        if (typeof lambdaFunction !== 'string' || lambdaFunction.length <= 0) {
            throw new Error('Invalid lambda function specified (arg #1)');
        }
        role = role || '<% authorizer_invoke_role %>';
        props.Type = 'TOKEN';
        props.AuthorizerUri = _lambdaUtils.getLambdaUri(lambdaFunction, '/invocations');
        props.AuthorizerCredentials = _iamUtils.getRoleUri(role);

        return this;
    }

    /**
     * Uses cognito user pools to authorize incoming requests. Invoking this
     * method after initially assigning a lambda function will result in an
     * error.
     *
     * @param {String} userPoolId The id of the user pool to add to the
     *        authorizer.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    addCognitoUserPool(userPoolId) {
        const props = this.properties;
        if (typeof props.AuthorizerUri === 'string' ||
            (props.Type !== undefined && props.Type !== 'TOKEN')) {
            throw new Error('Attempt to redefine authorizer type. Currently defined as a custom token authorizer');
        }
        if (typeof userPoolId !== 'string' || userPoolId.length <= 0) {
            throw new Error('Invalid user pool id specified (arg #1)');
        }
        props.Type = 'COGNITO_USER_POOLS';
        props.ProviderARNs.push(_cognitoUtils.getUserPoolUri(userPoolId));

        return this;
    }
}

module.exports = AuthorizerTemplate;
