'use strict';

const Template = require('../template');

const _validationHelper = require('./validation-helper');
const LocalSecondaryIndex = require('./local-secondary-index');
const GlobalSecondaryIndex = require('./global-secondary-index');

/**
 * Specialized method template class for a dynamo db table.
 *
 * @extends {Template}
 */
class TableTemplate extends Template {
    /**
     * @param {String} key A key that uniquely identifies the template.
     * @param {String} tableName The name of the dynamo db table.
     */
    constructor(key, tableName) {
        if (typeof tableName !== 'string' || tableName.length <= 0) {
            throw new Error('Invalid tableName specified (arg #2)');
        }
        super(key, 'AWS::DynamoDB::Table', {
            TableName: tableName,
            AttributeDefinitions: [],
            KeySchema: [],
            LocalSecondaryIndexes: [],
            GlobalSecondaryIndexes: [],
            ProvisionedThroughput: {
                ReadCapacityUnits: '5',
                WriteCapacityUnits: '5'
            }
        });
    }

    /**
     * Validates arguments and ensures that the specified attribute has been
     * defined for the table.
     *
     * @param {String} attributeName The name of the attribute.
     * @param {String} attributeType The type of the attribute - S, N or B.
     * @param {String} keyType The type of key - HASH or RANGE.
     */
    _ensureKeyAttribute(attributeName, attributeType, keyType) {
        if (typeof attributeName !== 'string' || attributeName.length <= 0) {
            throw new Error('Invalid attributeName specified (arg #1)');
        }
        _validationHelper.checkAttributeType(attributeType);
        _validationHelper.checkKeyType(keyType);

        const attribute = this.properties.AttributeDefinitions.find((attr) => {
            return attr.AttributeName === attributeName;
        });
        if (attribute === undefined) {
            this.properties.AttributeDefinitions.push({
                AttributeName: attributeName,
                AttributeType: attributeType
            });
        }
    }

    /**
     * Adds a key attribute to the table. This method automatically adds an
     * attribute definition for the key, if one does not exist.
     *
     * @param {String} attributeName The name of the key attribute.
     * @param {String} attributeType The type of the attribute - S, N or B.
     * @param {String} keyType The type of key - HASH or RANGE.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    addKey(attributeName, attributeType, keyType) {
        this._ensureKeyAttribute(attributeName, attributeType, keyType);

        this.properties.KeySchema.push({
            AttributeName: attributeName,
            KeyType: keyType
        });

        return this;
    }

    /**
     * Sets the read capacity on the table.
     *
     * @param {Number} capacity The read capacity to set.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setReadCapacity(capacity) {
        if (typeof capacity !== 'number' || capacity <= 0) {
            throw new Error('Invalid read capacity specified (arg #1)');
        }

        this.properties.ProvisionedThroughput.ReadCapacityUnits = capacity.toString();

        return this;
    }

    /**
     * Sets the write capacity on the table.
     *
     * @param {Number} capacity The write capacity to set.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setWriteCapacity(capacity) {
        if (typeof capacity !== 'number' || capacity <= 0) {
            throw new Error('Invalid write capacity specified (arg #1)');
        }

        this.properties.ProvisionedThroughput.WriteCapacityUnits = capacity.toString();

        return this;
    }

    /**
     * Sets the stream specification on the table.
     *
     * @param {String} streamViewType The type of information written to the
     *        stream - KEYS_ONLY, NEW_IMAGE, OLD_IMAGE, NEW_AND_OLD_IMAGES.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setStreamSpecification(streamViewType) {
        _validationHelper.checkStreamViewType(streamViewType);

        this.properties.StreamSpecification = {
            StreamViewType: streamViewType
        };

        return this;
    }

    /**
     * Adds a local secondary index to the table.
     *
     * @param {Object} index A builder object that has index specifications
     *        for the secondary index.
     *
     * @return {Object} Returns an index object that can be used to set
     *         additional properties such as keys, projections, etc.
     */
    addLocalSecondaryIndex(index) {
        if (!(index instanceof LocalSecondaryIndex)) {
            throw new Error('Invalid index specified (arg #1). Must be a builder object for local secondary indexes');
        }

        const indexProps = index.properties;
        const existingIndex = this.properties.LocalSecondaryIndexes.find((index) => {
            return index.IndexName === indexProps.IndexName;
        });
        if (existingIndex !== undefined) {
            throw new Error(`An index with name: ${indexProps.IndexName} has already been added`);
        }

        indexProps.KeySchema.forEach((key) => {
            const attributeName = key.AttributeName;
            const attributeType = index.keyAttributes[attributeName];
            const keyType = key.KeyType;
            this._ensureKeyAttribute(attributeName, attributeType, keyType);
        });
        this.properties.LocalSecondaryIndexes.push(indexProps);

        return this;
    }

    /**
     * Adds a global secondary index to the table.
     *
     * @param {Object} index A builder object that has index specifications
     *        for the secondary index.
     *
     * @return {Object} Returns an index object that can be used to set
     *         additional properties such as keys, projections, etc.
     */
    addGlobalSecondaryIndex(index) {
        if (!(index instanceof GlobalSecondaryIndex)) {
            throw new Error('Invalid index specified (arg #1). Must be a builder object for global secondary indexes');
        }

        const indexProps = index.properties;
        const existingIndex = this.properties.GlobalSecondaryIndexes.find((index) => {
            return index.IndexName === indexProps.IndexName;
        });

        if (existingIndex !== undefined) {
            throw new Error(`An index with name: ${indexProps.IndexName} has already been added`);
        }

        indexProps.KeySchema.forEach((key) => {
            const attributeName = key.AttributeName;
            const attributeType = index.keyAttributes[attributeName];
            const keyType = key.KeyType;
            this._ensureKeyAttribute(attributeName, attributeType, keyType);
        });
        this.properties.GlobalSecondaryIndexes.push(indexProps);

        return this;
    }
}

module.exports = TableTemplate;
