'use strict';

const Template = require('../template');
const _resourceUtils = require('../../utils/resource-utils');

/**
 * Specialized method template class for an API Gateway resource.
 *
 * @extends {Template}
 */
class ResourceTemplate extends Template {
    /**
     * @param {String} key A key that uniquely identifies the template
     * @param {String} path The path associated with resource
     * @param {String} [apiId=''] An optional api id that can be used to
     *        identify a specific api. Especially useful if multiple APIs are
     *        defined within a single cloud formation template.
     */
    constructor(key, path, apiId) {
        if (typeof path !== 'string' || path.length <= 0) {
            throw new Error('Invalid api path specified (arg #2)');
        }
        if (typeof apiId !== 'string') {
            apiId = 'DEFAULT_API';
        }

        super(key, 'AWS::ApiGateway::Resource', {
            PathPart: path,
            RestApiId: null,
            ParentId: null
        });

        this._apiId = apiId;
    }

    /**
     * Assigns a reference to the REST API containing this resource, and marks
     * the current resource as a first level resource (directly under the API
     * root). This designation can be overridden by invoking the
     * `setParentResource()` method to assign a parent resource to the current
     * resource.
     *
     * @param {Object} dirInfo An object that contains hierarchical information
     *        for the template.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setRestApiId(dirInfo) {
        this.properties.RestApiId = _resourceUtils.getRestApi(dirInfo, this._apiId);
        this.properties.ParentId = {
            'Fn::GetAtt': [`<% ${dirInfo.getRootToken(this._apiId)} %>`, 'RootResourceId']
        };

        return this;
    }

    /**
     * Assigns a reference to a parent resource, overriding the first level resource
     * designation assigned when `setRestApiId()` is invoked.
     *
     * @param {Object} dirInfo An object that contains hierarchical information
     *        for the template.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setParentResource(dirInfo) {
        this.properties.ParentId = {
            'Ref': `<% ${dirInfo.getParentToken('RES')} %>`
        };

        return this;
    }
}

module.exports = ResourceTemplate;
