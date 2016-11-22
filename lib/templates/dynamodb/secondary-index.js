'use strict';

const _validationHelper = require('./validation-helper');

/**
 * Utility class that can be used to build out indexes for dynamodb tables.
 */
class SecondaryIndex {
    /**
     * @param {String} indexName The name of the lambda function
     */
    constructor(indexName) {
        if (typeof indexName !== 'string' || indexName.length <= 0) {
            throw new Error('Invalid indexName specified (arg #2)');
        }
        this._properties = {
            IndexName: indexName,
            KeySchema: [],
            Projection: {
                NonKeyAttributes: [],
                ProjectionType: 'KEYS_ONLY'
            }
        };

        this._keyAttributes = {};
    }

    /**
     * Gets a reference to the backing object that contains the index
     * definition.
     *
     * @return {Object} An object that contains the index definition.
     */
    get properties() {
        return this._properties;
    }

    /**
     * Gets a reference to an object that maps key attributes to their
     * types.
     *
     * @return {Object} An object that contains the index definition.
     */
    get keyAttributes() {
        return this._keyAttributes;
    }

    /**
     * Adds a key to the index.
     *
     * @param {String} attributeName The name of the key attribute.
     * @param {String} attributeType The type of the attribute - S, N or B.
     * @param {String} keyType The type of key - HASH or RANGE.
     *
     * @return {Object} A reference to the builder. Can be used to
     *         chain multiple calls.
     */
    addKey(attributeName, attributeType, keyType) {
        if (typeof attributeName !== 'string' || attributeName.length <= 0) {
            throw new Error('Invalid attribute name specified (arg #1)');
        }
        _validationHelper.checkAttributeType(attributeType);
        _validationHelper.checkKeyType(keyType);

        this.keyAttributes[attributeName] = attributeType;
        this.properties.KeySchema.push({
            AttributeName: attributeName,
            KeyType: keyType
        });

        return this;
    }

    /**
     * Sets the projection type on the index.
     *
     * @param {String} projectionType The projection type - KEYS_ONLY
     *        INCLUDE, ALL
     *
     * @return {Object} A reference to the builder. Can be used to
     *         chain multiple calls.
     */
    setProjectionType(projectionType) {
        _validationHelper.checkProjectionType(projectionType);

        this.properties.Projection.ProjectionType = projectionType;

        return this;
    }

    /**
     * Adds a non key attribute to the index projection
     *
     * @param {String} attributeName The non key attribute to add to the
     *        projection.
     *
     * @return {Object} A reference to the builder. Can be used to
     *         chain multiple calls.
     */
    addNonKeyAttribute(attributeName) {
        if (typeof attributeName !== 'string' || attributeName.length <= 0) {
            throw new Error('Invalid attribute name specified (arg #1)');
        }

        this.properties.Projection.NonKeyAttributes.push(attributeName);
        return this;
    }
}

module.exports = SecondaryIndex;
