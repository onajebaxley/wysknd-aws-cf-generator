'use strict';

const Template = require('../template');
const _lambdaUtils = require('../../utils/lambda-utils');

/**
 * Specialized method template class that creates an alias for a lambda
 * function.
 *
 * @extends {Template}
 */
class AliasTemplate extends Template {
    /**
     * @param {String} key A key that uniquely identifies the template
     * @param {String} name The name of the alias
     * @param {String} functionName The name of the lambda function
     */
    constructor(key, name, functionName) {
        if (typeof name !== 'string' || name.length <= 0) {
            throw new Error('Invalid name specified (arg #2)');
        }
        super(key, 'AWS::Lambda::Alias', {
            Name: name,
            Description: undefined,
            FunctionName: _lambdaUtils.getLambdaUri(functionName),
            FunctionVersion: '$LATEST'
        });
    }

    /**
     * Sets the description of the lambda alias.
     *
     * @param {String} description The alias description
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
}

module.exports = AliasTemplate;
