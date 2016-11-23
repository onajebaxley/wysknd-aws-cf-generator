'use strict';

const _clone = require('clone');

const Template = require('../template');
const _iamUtils = require('../../utils/iam-utils');

/**
 * Specialized method template class for a lambda function
 *
 * @extends {Template}
 */
class FunctionTemplate extends Template {
    /**
     * @param {String} key A key that uniquely identifies the template
     * @param {String} functionName The name of the lambda function
     * @param {String} handler The name of the lambda function handler.
     */
    constructor(key, functionName, handler) {
        if (typeof functionName !== 'string' || functionName.length <= 0) {
            throw new Error('Invalid functionName specified (arg #2)');
        }
        if (typeof handler !== 'string' || handler.length <= 0) {
            throw new Error('Invalid handler specified (arg #3)');
        }
        const tokens = handler.split('.');
        const handlerName = tokens[tokens.length - 1];
        // TODO: Add support for VPCs
        super(key, 'AWS::Lambda::Function', {
            FunctionName: functionName,
            Code: {
                ZipFile: [`module.exports.${handlerName} = function(event, context, callback) {`,
                    `callback(null, \'${handlerName} executed successfuly\');`,
                    '};'
                ].join(' ')
            },
            Handler: handler,
            MemorySize: 128,
            Role: _iamUtils.getRoleUri('<% lambda_execute_role %>'),
            Description: '',
            Runtime: 'nodejs4.3',
            Timeout: 3
        });
    }

    /**
     * Sets the memory size allocation for the lambda function. The input must
     * be a multiple of 64 that is > 128 and < 1536,
     *
     * @param {Number} memorySize The memory allocated to the lambda function.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setMemorySize(memorySize) {
        if (typeof memorySize !== 'number' ||
            memorySize < 128 ||
            memorySize > 1536 ||
            (memorySize % 64) !== 0) {
            throw new Error('Invalid memorySize specified (arg #1). Must be a multiple of 64 between 127 and 1536.');
        }
        this.properties.MemorySize = memorySize;

        return this;
    }

    /**
     * Sets the timeout duration for the lambdal function. The input must
     * be a positive integer.
     *
     * @param {Number} timeout The lambda timeout duration.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setTimeout(timeout) {
        if (typeof timeout !== 'number' || timeout <= 0) {
            throw new Error('Invalid timeout specified (arg #1)');
        }
        this.properties.Timeout = timeout;

        return this;
    }

    /**
     * Sets the description of the lambda function.
     *
     * @param {String} description The function description
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
     * Sets inline code for the lambda function. Invoking this method will
     * clear out any s3 file settings that may have been specified.
     *
     * @param {String} code The source code to set on the lambda function.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setInlineSourceCode(code) {
        if (typeof code !== 'string' || code.length <= 0) {
            throw new Error('Invalid code specified (arg #1)');
        }
        this.properties.Code = {
            ZipFile: code
        };
        return this;
    }

    /**
     * Sets a reference to an S3 file that contains the source code for the
     * lambda function. Invoking this method will clear out any previous zip
     * file settings that may have been specified.
     *
     * @param {String} bucket The S3 bucket that contains the source code package
     * @param {String} key The key to the source code package in S3
     * @param {String} [version=undefined] An optional S3 version number if
     *                 applicable.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setSourceCode(bucket, key, version) {
        if (typeof bucket !== 'string' || bucket.length <= 0) {
            throw new Error('Invalid bucket specified (arg #1)');
        }
        if (typeof key !== 'string' || key.length <= 0) {
            throw new Error('Invalid key specified (arg #2)');
        }
        if (version !== undefined &&
            (typeof version !== 'string' || version.length <= 0)) {
            throw new Error('Invalid version specified (arg #3)');
        }

        this.properties.Code = {
            S3Bucket: bucket,
            S3Key: key
        };

        if (version) {
            this.properties.Code.S3ObjectVersion = version;
        }
        return this;
    }

    /**
     * Sets the IAM role for lambda execution.
     *
     * @param {String} role The IAM role to use when executing the lambda.
     */
    setRole(role) {
        if (typeof role !== 'string' || role.length <= 0) {
            throw new Error('Invalid role specified (arg #1)');
        }

        this.properties.Role = _iamUtils.getRoleUri(role);
        return this;
    }
}

module.exports = FunctionTemplate;
