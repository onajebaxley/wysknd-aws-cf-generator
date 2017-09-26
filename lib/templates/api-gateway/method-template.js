'use strict';

const Template = require('../template');
const _resourceUtils = require('../../utils/resource-utils');
const _apiGatewayUtils = require('../../utils/api-gateway-utils');
const _iamUtils = require('../../utils/iam-utils');

/**
 * Specialized method template class for an API Gateway method.
 *
 * @extends {Template}
 */
class MethodTemplate extends Template {
    /**
     * @param {String} key A key that uniquely identifies the template
     * @param {String} [apiId=''] An optional api id that can be used to
     *        identify a specific api. Especially useful if multiple APIs are
     *        defined within a single cloud formation template.
     */
    constructor(key, apiId) {
        if (typeof apiId !== 'string') {
            apiId = 'DEFAULT_API';
        }
        super(key, 'AWS::ApiGateway::Method', {
            RestApiId: null,
            ResourceId: null,
            HttpMethod: null,
            AuthorizationType: null,
            RequestModels: undefined,
            RequestParameters: {},
            Integration: {
                Type: 'AWS',
                IntegrationHttpMethod: 'POST',
                Uri: null,
                Credentials: null,
                PassthroughBehavior: 'NEVER',
                RequestParameters: undefined,
                RequestTemplates: {},
                IntegrationResponses: []
            },
            MethodResponses: []
        });

        this._apiId = apiId;
    }

    /**
     * Sets request parameters on the method (querystring, path, headers).
     *
     * @private
     *
     * @param {String} paramType The type of parameter that is being set.
     * @param {Object} params A key-value mapping of parameter name to a
     *        boolean value that indicates whether or not the parameter is
     *        mandatory.
     */
    _setRequestParameters(paramType, params) {
        const requestParams = this._ensureProperty('RequestParameters', {});
        for (let param in params) {
            const key = `method.request.${paramType}.${param}`;
            requestParams[key] = !!(params[param]);
        }
    }

    /**
     * Sets integration request parameters on the method (querystring, path,
     * headers). This method maps incoming method parameters to parameters sent
     * to the back end.
     *
     * @private
     *
     * @param {String} beParam A string value that defines the back end request
     *        parameter. This should be in the form of (location.paramName).
     * @param {String} requestLocation The location from the incoming request
     *        where the mapped parameter will be obtained from
     *        (header|querystring|path).
     * @param {String} requestParam The name of the request param to use.
     */
    _setBackEndRequestParameters(beParam, requestLocation, requestParam) {
        const beParams = this._ensureProperty('Integration.RequestParameters', {});
        const key = `integration.request.${beParam}`;
        const value = `method.request.${requestLocation}.${requestParam}`;
        beParams[key] = value;
    }

    /**
     * Assigns a reference to the REST API containing this method, and marks
     * the method as a root method by default. This can be overridden by
     * invoking `setResource()` to assign a parent resource to the current
     * method.
     *
     * @param {Object} dirInfo An object that contains hierarchical information
     *        for the template.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setRestApiId(dirInfo) {
        this.properties.RestApiId = _resourceUtils.getRestApi(dirInfo, this._apiId);

        this.properties.ResourceId = {
            'Fn::GetAtt': [`<% ${dirInfo.getRootToken(this._apiId)} %>`, 'RootResourceId']
        };

        return this;
    }

    /**
     * Assigns a reference to a parent resource for this method, overriding the
     * root method designation assigned when `setRestApiId()` was invoked.
     *
     * @param {Object} dirInfo An object that contains hierarchical information
     *        for the template.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setResource(dirInfo) {
        this.properties.ResourceId = {
            'Ref': `<% ${dirInfo.getToken('RES')} %>`
        };

        return this;
    }

    /**
     * Sets the HttpMethod for the template.
     *
     * @param {String} verb The http verb.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setHttpMethod(verb) {
        if (typeof verb !== 'string' || verb.length <= 0) {
            throw new Error('Invalid http verb specified (arg #1)');
        }
        this.properties.HttpMethod = verb.toUpperCase();

        return this;
    }

    /**
     * Sets the authorizer for the template.
     *
     * @param {String} id The id of the authorizer. If a falsy value is
     *        specified, authorization will be disabled.
     * @param {String} [type='CUSTOM'] An optional authorizer type that
     *        specifies the type of authorizer associated with the method. This
     *        value is only considered if a valid authorizer id is specified.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setAuthorizer(id, type) {
        if (!id) {
            this.properties.AuthorizationType = 'NONE';
            return this;
        }

        if (typeof type !== 'string' || type.length <= 0) {
            type = 'CUSTOM';
        }
        this.properties.AuthorizationType = type;
        this.properties.AuthorizerId = {
            Ref: id
        };

        return this;
    }

    /**
     * Use AWS IAM authorizer.
     *
     * @return {Object} A reference to the template.
     */
    useIAMAuthorizer() {
        this.properties.AuthorizationType = 'AWS_IAM';
        this.properties.AuthorizerId = undefined;
        return this;
    }

    /**
     * Assigns a back end lambda function to the template.
     *
     * @param {String} lambdaFunction The name of the lambda function. A full
     *        URI will be generated using this value.
     * @param {String} [role = '$REGION_<% lambda_invoke_role %>'] An optional
     *        IAM role name that will be used by the API gateway to call the
     *        lambda.
     * @param {String} [lambdaFunctionSuffix=undefined] An optional suffix to
     *        add to the lambda function.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setBackendLambda(lambdaFunction, role, lambdaFunctionSuffix) {
        if (typeof lambdaFunction !== 'string' || lambdaFunction.length <= 0) {
            throw new Error('Invalid lambda function specified (arg #1)');
        }
        role = role || '$REGION_<% lambda_invoke_role %>';
        const integration = this._ensureProperty('Integration');
        integration.Uri = _apiGatewayUtils.getLambdaIntegrationUri(lambdaFunction, lambdaFunctionSuffix);
        integration.Credentials = _iamUtils.getRoleUri(role);

        return this;
    }

    /**
     * Assigns a back end S3 integration to the template.
     *
     * @param {String} s3Path The s3 path that the method will integrated with.
     *        The path may include wildcard placeholders. A full URI will be
     *        generated using this value.
     * @param {String} [integrationMethod='GET'] An optional string that
     *        specifies the HTTP method to use for the backend integration.
     *        supported values include 'GET', 'PUT' and 'DELETE'. If omitted,
     *        "GET" will be used.
     * @param {String} [role = '$REGION_<% s3_invoke_role %>'] An optional
     *        IAM role name that will be used by the API gateway to call the
     *        s3 path.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setBackendS3(s3Path, integrationMethod, role) {
        if (typeof s3Path !== 'string' || s3Path.length <= 0) {
            throw new Error('Invalid s3 path specified (arg #2)');
        }
        integrationMethod = integrationMethod || 'GET';
        if (['GET', 'PUT', 'DELETE'].indexOf(integrationMethod) < 0) {
            throw new Error('Invalid back end integration specified. Must be GET, PUT or DELETE.');
        }
        role = role || '$REGION_<% s3_invoke_role %>';
        const integration = this._ensureProperty('Integration');
        integration.Uri = _apiGatewayUtils.getS3IntegrationUri(s3Path);
        integration.IntegrationHttpMethod = integrationMethod;
        integration.Credentials = _iamUtils.getRoleUri(role);
        integration.PassthroughBehavior = 'WHEN_NO_TEMPLATES';

        return this;
    }

    /**
     * Sets integration parameters to indicate a mock back end, meaning that
     * output from the request template transformation will be routed to the
     * response.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setMockBackend() {
        const integration = this._ensureProperty('Integration');
        integration.Type = 'MOCK';
        integration.Uri = undefined;
        integration.Credentials = undefined;

        return this;
    }

    /**
     * Sets a request header parameter on the method template.
     *
     * @param {String} name The name of the parameter
     * @param {Boolean} [required=false] An optional parameter that
     *        determines whether or not the parameter is mandatory.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setRequestHeader(name, required) {
        if (typeof name !== 'string' || name.length <= 0) {
            throw new Error('Invalid name specified (arg #1)');
        }
        const params = {};
        params[name] = !!required;
        this._setRequestParameters('header', params);
        return this;
    }

    /**
     * Sets a request query string parameter on the method template.
     *
     * @param {String} name The name of the parameter
     * @param {Boolean} [required=false] An optional parameter that
     *        determines whether or not the parameter is mandatory.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setRequestQueryString(name, required) {
        if (typeof name !== 'string' || name.length <= 0) {
            throw new Error('Invalid name specified (arg #1)');
        }
        const params = {};
        params[name] = !!required;
        this._setRequestParameters('querystring', params);
        return this;
    }

    /**
     * Sets request path parameters on the method template.
     *
     * @param {String} name The name of the parameter
     * @param {Boolean} [required=false] An optional parameter that
     *        determines whether or not the parameter is mandatory.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setRequestPath(name, required) {
        if (typeof name !== 'string' || name.length <= 0) {
            throw new Error('Invalid name specified (arg #1)');
        }
        const params = {};
        params[name] = !!required;
        this._setRequestParameters('path', params);
        return this;
    }

    /**
     * Maps a parameter from the request to the back end integration request
     * path.
     *
     * @param {String} name The name of the back end header value.
     * @param {String} requestParam The name of the request param to use.
     * @param {String} [requestLocation='path'] The location from the incoming
     *        request where the mapped parameter will be obtained from
     *        (header|querystring|path).
     */
    mapBackEndRequestPath(name, requestParam, requestLocation) {
        if (typeof name !== 'string' || name.length <= 0) {
            throw new Error('Invalid name specified (arg #1)');
        }
        if (typeof requestParam !== 'string' || requestParam.length <= 0) {
            throw new Error('Invalid request parameter name specified (arg #3)');
        }
        if (['header', 'querystring', 'path'].indexOf(requestLocation) < 0) {
            requestLocation = 'path';
        }
        this._setBackEndRequestParameters(`path.${name}`, requestLocation, requestParam);

        return this;
    }

    /**
     * Maps a parameter from the request to the back end integration request
     * querystring.
     *
     * @param {String} name The name of the back end header value.
     * @param {String} requestParam The name of the request param to use.
     * @param {String} [requestLocation='querystring'] The location from the
     *        incoming request where the mapped parameter will be obtained from
     *        (header|querystring|path).
     */
    mapBackEndRequestQueryString(name, requestParam, requestLocation) {
        if (typeof name !== 'string' || name.length <= 0) {
            throw new Error('Invalid name specified (arg #1)');
        }
        if (typeof requestParam !== 'string' || requestParam.length <= 0) {
            throw new Error('Invalid request parameter name specified (arg #3)');
        }
        if (['header', 'querystring', 'path'].indexOf(requestLocation) < 0) {
            requestLocation = 'querystring';
        }
        this._setBackEndRequestParameters(`querystring.${name}`, requestLocation, requestParam);

        return this;
    }

    /**
     * Maps a parameter from the request to the back end integration request
     * header.
     *
     * @param {String} name The name of the back end header value.
     * @param {String} requestParam The name of the request param to use.
     * @param {String} [requestLocation='header'] The location from the incoming
     *        request where the mapped parameter will be obtained from
     *        (header|querystring|path).
     */
    mapBackEndRequestHeader(name, requestParam, requestLocation) {
        if (typeof name !== 'string' || name.length <= 0) {
            throw new Error('Invalid name specified (arg #1)');
        }
        if (typeof requestParam !== 'string' || requestParam.length <= 0) {
            throw new Error('Invalid request parameter name specified (arg #3)');
        }
        if (['header', 'querystring', 'path'].indexOf(requestLocation) < 0) {
            requestLocation = 'header';
        }
        this._setBackEndRequestParameters(`header.${name}`, requestLocation, requestParam);

        return this;
    }

    /**
     * Assigns request templates to the method template.
     *
     * @param {String} template The request template string.
     * @param {String} [contentType='application/json'] An optional content
     *        type parameter for which the template will be applied.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setRequestTemplate(template, contentType) {
        if (typeof template !== 'string' || template.length <= 0) {
            throw new Error('Invalid template specified (arg #1)');
        }
        if (typeof contentType !== 'string' || contentType.length <= 0) {
            contentType = 'application/json';
        }
        const requestTemplates = this._ensureProperty('Integration.RequestTemplates');
        requestTemplates[contentType] = template;

        return this;
    }

    /**
     * Assigns request models to the method template.
     *
     * @param {String} modelName The name of the model to assign.
     * @param {String} [contentType='application/json'] An optional content
     *        type parameter for which the model will be assigned.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setRequestModel(modelName, contentType) {
        if (typeof modelName !== 'string' || modelName.length <= 0) {
            throw new Error('Invalid modelName specified (arg #1)');
        }
        if (typeof contentType !== 'string' || contentType.length <= 0) {
            contentType = 'application/json';
        }

        const requestModels = this._ensureProperty('RequestModels');
        requestModels[contentType] = modelName;

        return this;
    }

    /**
     * Initializes the response integration with default values - response
     * codes and response templates.
     *
     * Assigns a list of standard integration response templates for common
     * response codes, including a dummy place holder for a 200 response code.
     *
     * Response codes for the templates will also be declared if they do not
     * exist.
     *
     * This method will overwrite any existing template assignments, and method
     * response declarations.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setDefaultIntegrationResponses() {
        const integrationResponses = [];
        const methodResponses = [];

        // First add error responses.
        [{
            code: '400',
            pattern: '\\[((SchemaError)|(BadRequest))\\].*'
        }, {
            code: '403',
            pattern: '\\[Unauthorized\\].*'
        }, {
            code: '404',
            pattern: '\\[NotFound\\].*'
        }, {
            code: '500',
            pattern: '\\[Error\\].*|body size is too long'
        }, {
            code: '504',
            pattern: '.*Task timed out.*'
        }].forEach((item) => {
            integrationResponses.push({
                StatusCode: item.code,
                SelectionPattern: item.pattern,
                ResponseTemplates: {
                    'application/json': '{ "message": "$input.path(\'$.errorMessage\')" }'
                }
            });
            methodResponses.push({
                StatusCode: item.code,
                ResponseModels: {
                    'application/json': 'Error'
                }
            });
        });

        // Add the default response (non error)
        integrationResponses.push({
            StatusCode: '200',
            ResponseTemplates: {
                'application/json': '{ "message": "Mapping not defined (200)" }'
            }
        });
        methodResponses.push({
            StatusCode: '200'
        });

        this.properties.MethodResponses = methodResponses;
        this._ensureProperty('Integration').IntegrationResponses = integrationResponses;

        return this;
    }

    /**
     * Initializes the response integration with default values - response
     * codes and response templates, specifically for integration with back
     * end services that respond with binary data.
     *
     * Assigns a list of standard integration response templates for common
     * response codes, including a dummy place holder for a 200 response code.
     *
     * Response codes for the templates will also be declared if they do not
     * exist.
     *
     * This method will overwrite any existing template assignments, and method
     * response declarations.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setBinaryIntegrationResponses() {
        const integrationResponses = [];
        const methodResponses = [];

        // First add error responses.
        [{
            code: '404',
            pattern: '404'
        }, {
            // This is default!
            code: '500',
            pattern: undefined
        }].forEach((item) => {
            integrationResponses.push({
                // TODO: This is not currently supported by cloud formation
                // ContentHandling: 'CONVERT_TO_TEXT',
                StatusCode: item.code,
                SelectionPattern: item.pattern,
                ResponseTemplates: {
                    'application/octet-stream': 'ERROR'
                },
                ResponseParameters: {
                    'method.response.header.content-type': '\'text/html\''
                }
            });

            methodResponses.push({
                StatusCode: item.code,
                ResponseParameters: {
                    'method.response.header.content-type': true
                }
            });
        });

        // Add the non error response
        integrationResponses.push({
            StatusCode: '200',
            SelectionPattern: '2\\d{2}'
        });
        methodResponses.push({
            StatusCode: '200'
        });

        this.properties.MethodResponses = methodResponses;
        this._ensureProperty('Integration').IntegrationResponses = integrationResponses;

        return this;
    }

    /**
     * Initializes or overwrites a previously defined integration response
     * object. This method will also declare a method response for the specified
     * status code if one does not exist.
     *
     * @param {String} statusCode The status code for which the response is being
     *        defined.
     * @param {String} [selectionPattern=undefined] An optional selection pattern
     *        to use when matching responses to error message strings.
     * @param {String} [contentHandling=undefined] An optional parameter that
     *        specifies how the back end content will be handled. If specified,
     *        this parameter must be either 'CONVERT_TO_TEXT' or
     *        'CONVERT_TO_BINARY'.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setIntegrationResponse(statusCode, selectionPattern, contentHandling) {
        if (typeof statusCode !== 'string' || statusCode.length <= 0) {
            throw new Error('Invalid statusCode specified (arg #1)');
        }
        if (typeof contentHandling !== 'undefined' &&
            ['CONVERT_TO_BINARY', 'CONVERT_TO_TEXT'].indexOf(contentHandling) < 0) {
            throw new Error('Invalid content handling specified (arg #3). It must be one of "CONVERT_TO_TEXT" or "CONVERT_TO_BINARY"');
        }
        const integrationResponses = this._ensureProperty('Integration.IntegrationResponses', []);
        let intResp = integrationResponses.find((item) => {
            return item.StatusCode === statusCode;
        });
        if (!intResp) {
            intResp = {};
            integrationResponses.push(intResp);
        }
        intResp.StatusCode = statusCode;
        intResp.SelectionPattern = selectionPattern;
        // TODO: This is not currently supported by cloud formation
        // intResp.ContentHandling = contentHandling;

        const methodResponses = this._ensureProperty('MethodResponses', []);
        let metResp = methodResponses.find((item) => {
            return item.StatusCode === statusCode;
        });
        if (!metResp) {
            metResp = {};
            methodResponses.push(metResp);
        }
        metResp.StatusCode = statusCode;

        return this;
    }

    /**
     * Assigns response headers for specific codes. The method response object
     * for the code must exist. If not, this method will have no effect.
     *
     * @param {String} headerName The name of the header
     * @param {String} headerValue The value to assign to the header.
     * @param {String} [statusCode='200'] The status code to which the
     *        response template will be assigned. This parameter will be
     *        defaulted to '200' if omitted.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setResponseHeader(headerName, headerValue, statusCode) {
        if (typeof headerName !== 'string' || headerName.length <= 0) {
            throw new Error('Invalid headerName specified (arg #1)');
        }
        if (typeof headerValue !== 'string' || headerValue.length <= 0) {
            throw new Error('Invalid headerValue specified (arg #2)');
        }
        if (typeof statusCode !== 'string' || statusCode.length <= 0) {
            statusCode = '200';
        }

        const integrationResponses = this._ensureProperty('Integration.IntegrationResponses', []);
        const methodResponses = this._ensureProperty('MethodResponses', []);

        let intResp = integrationResponses.find((item) => {
            return item.StatusCode === statusCode;
        });
        let metResp = methodResponses.find((item) => {
            return item.StatusCode === statusCode;
        });
        if (intResp && metResp) {
            metResp.ResponseParameters = metResp.ResponseParameters || {};
            metResp.ResponseParameters[`method.response.header.${headerName}`] = true;

            intResp.ResponseParameters = intResp.ResponseParameters || {};
            intResp.ResponseParameters[`method.response.header.${headerName}`] = headerValue;
        }

        return this;
    }

    /**
     * Assigns a response template for a specific code and content type. The
     * integration response object for the code must exist. If not, this method
     * will have no effect.
     *
     * @param {String} template A string that represents the template to be
     *        assigned.
     * @param {String} [contentType='application/json'] An optional content
     *        type parameter for which the template will be applied.
     * @param {String} [statusCode='200'] The status code to which the
     *        response template will be assigned. This parameter will be
     *        defaulted to '200' if omitted.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setResponseTemplate(template, contentType, statusCode) {
        if (typeof template !== 'string' || template.length <= 0) {
            throw new Error('Invalid template specified (arg #1)');
        }
        if (typeof contentType !== 'string' || contentType.length <= 0) {
            contentType = 'application/json';
        }
        if (typeof statusCode !== 'string' || statusCode.length <= 0) {
            statusCode = '200';
        }
        const integrationResponses = this._ensureProperty('Integration.IntegrationResponses', []);
        const response = integrationResponses.find((item) => {
            return item.StatusCode === statusCode;
        });

        if (typeof response === 'object') {
            response.ResponseTemplates = response.ResponseTemplates || {};
            response.ResponseTemplates[contentType] = template;
        }
        return this;
    }

    /**
     * Assigns a response model for a specific status code and content type. The
     * method response object for the code must exist. If not, this method
     * will have no effect.
     *
     * @param {String} modelName The name of the model to assign.
     * @param {String} [contentType='application/json'] An optional content
     *        type parameter for which the model will be assigned.
     * @param {String} [statusCode='200'] The status code to which the
     *        response template will be assigned. This parameter will be
     *        defaulted to '200' if omitted.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setResponseModel(modelName, contentType, statusCode) {
        if (typeof modelName !== 'string' || modelName.length <= 0) {
            throw new Error('Invalid modelName specified (arg #1)');
        }
        if (typeof contentType !== 'string' || contentType.length <= 0) {
            contentType = 'application/json';
        }
        if (typeof statusCode !== 'string' || statusCode.length <= 0) {
            statusCode = '200';
        }

        const methodResponses = this._ensureProperty('MethodResponses', []);
        const response = methodResponses.find((item) => {
            return item.StatusCode === statusCode;
        });

        if (typeof response === 'object') {
            response.ResponseModels = response.ResponseModels || {};
            response.ResponseModels[contentType] = modelName;
        }
        return this;
    }
}

module.exports = MethodTemplate;
