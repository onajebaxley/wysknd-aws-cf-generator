'use strict';

/**
 * A module that exposes utility methods related to api gateway
 */
const apiGatewayUtils = {

    /**
     * Gets a lambda function URI for integration with the API gateway based on
     * the lambda function name.
     *
     * @param {String} lambdaFunction The name of the lambda function.
     * @param {String} [suffix='${stageVariables.stack}'] Optional placeholder
     *        for a suffix, typically intended for a stage variable or alias.
     *
     * @return {String} The lambda function integration uri.
     */
    getLambdaIntegrationUri: function(lambdaFunction, suffix) {
        if (typeof lambdaFunction !== 'string' || lambdaFunction.length <= 0) {
            throw new Error('Invalid lambda function specified (arg #1)');
        }
        if (typeof suffix !== 'string') {
            suffix = '${stageVariables.stack}';
        }
        return {
            'Fn::Join': ['', [
                'arn:aws:apigateway:', {
                    'Ref': 'AWS::Region'
                },
                ':lambda:path/2015-03-31/functions/arn:aws:lambda:', {
                    'Ref': 'AWS::Region'
                },
                ':', {
                    'Ref': 'AWS::AccountId'
                },
                `:function:${lambdaFunction}${suffix}/invocations`
            ]]
        };
    },

    /**
     * Gets an S3 function URI for integration wtih the API gateway based on
     * the S3 path.
     *
     * @param {String} s3Path The s3 path that the method will integrated with.
     *        The path may include wildcard placeholders. A full URI will be
     *        generated using this value.
     *
     * @return {String} The s3 integration uri.
     */
    getS3IntegrationUri: function(s3Path) {
        if (typeof s3Path !== 'string' || s3Path.length <= 0) {
            throw new Error('Invalid s3 path specified (arg #1)');
        }
        return {
            'Fn::Join': ['', [
                'arn:aws:apigateway:', {
                    'Ref': 'AWS::Region'
                },
                `:s3:path/${s3Path}`
            ]]
        };
    }
};

module.exports = apiGatewayUtils;
