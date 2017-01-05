'use strict';

const DirInfo = require('../dir-info');

/**
 * A module that exposes utility methods related to API gateway resources.
 */
const resourceUtils = {

    /**
     * Gets a cloud formation reference to the rest api for teh current entitiy.
     *
     * @param {Object} dirInfo A directory info object that identifies the
     *        level of the current resource/method.
     * @param {String} [apiId=''] An optional api id that can be used to
     *        identify a specific api. Especially useful if multiple APIs are
     *        defined within a single cloud formation template.
     *
     * @return {Object} A cloud formation reference/get attribute object that
     *        points to the appropriate resource.
     */
    getRestApi: function(dirInfo, apiId) {
        if (!(dirInfo instanceof DirInfo)) {
            throw new Error('Invalid directory info specified (arg #1)');
        }
        if (typeof apiId !== 'string' || apiId.length <= 0) {
            apiId = 'DEFAULT_API';
        }

        return {
            Ref: `<% ${dirInfo.getRootToken(apiId)} %>`
        };
    }
};

module.exports = resourceUtils;
