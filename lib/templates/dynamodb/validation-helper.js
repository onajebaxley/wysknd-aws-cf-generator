'use strict';

const STREAM_VIEW_TYPES = ['KEYS_ONLY', 'NEW_IMAGE', 'OLD_IMAGE', 'NEW_AND_OLD_IMAGES'];
const ATTRIBUTE_TYPES = ['N', 'S', 'B'];
const KEY_TYPES = ['HASH', 'RANGE'];
const PROJECTION_TYPES = ['KEYS_ONLY', 'INCLUDE', 'ALL'];

/**
 * Utility module that can be used to validate inputs relating to dynamodb
 * tables and indexes.
 */
module.exports = {
    /**
     * Checks if the specified attribute type is valid.
     *
     * @param {String} attributeType The type of the attribute.
     */
    checkAttributeType: function(attributeType) {
        if (ATTRIBUTE_TYPES.indexOf(attributeType) < 0) {
            throw new Error(`Invalid attribute type specified. Must be one of: [${ATTRIBUTE_TYPES}]`);
        }
    },

    /**
     * Checks if the specified key type is valid.
     *
     * @param {String} keyType The key type.
     */
    checkKeyType: function(keyType) {
        if (KEY_TYPES.indexOf(keyType) < 0) {
            throw new Error(`Invalid key type specified. Must be one of: [${KEY_TYPES}]`);
        }
    },

    /**
     * Checks if the specified projection type is valid.
     *
     * @param {String} projectionType The projection type.
     */
    checkProjectionType: function(projectionType) {
        if (PROJECTION_TYPES.indexOf(projectionType) < 0) {
            throw new Error(`Invalid projection type specified. Must be one of: [${PROJECTION_TYPES}]`);
        }
    },

    /**
     * Checks if the specified stream view type is valid.
     *
     * @param {String} streamViewType The stream view type.
     */
    checkStreamViewType: function(streamViewType) {
        if (STREAM_VIEW_TYPES.indexOf(streamViewType) < 0) {
            throw new Error(`Invalid stream view type specified. Must be one of: [${STREAM_VIEW_TYPES}]`);
        }
    }
};
