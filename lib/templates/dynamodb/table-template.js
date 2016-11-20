'use strict';

const _clone = require('clone');

const Template = require('../template');
const STREAM_VIEW_TYPES = ['KEYS_ONLY', 'NEW_IMAGE', 'OLD_IMAGE', 'NEW_AND_OLD_IMAGES'];
const ATTRIBUTE_TYPES = ['N', 'S', 'B'];
const KEY_TYPES = ['HASH', 'RANGE'];
const PROJECTION_TYPES = ['KEYS_ONLY', 'INCLUDE', 'ALL'];


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
     * Creates a builder object for local secondary indexes.
     *
     * @param {Object} indexRef Reference to the backing object that contains
     *        index parameters.
     *
     * @return {Object} An object that exposes methods that can be used to
     *         modify the index.
     */
    _createLSIBuilder(indexRef) {
        const builder = {
            /**
             * Returns a reference to the containing template.
             *
             * @return {Object} Reference to the containing template so that
             *         other methods can be chained.
             */
            done: () => {
                return this;
            }
        };

        /**
         * Adds a key to the index.
         *
         * @param {String} attributeName The name of the key attribute.
         * @param {String} attributeType The type of the attribute - S, N or B.
         * @param {String} keyType The type of key - HASH or RANGE.
         *
         * @return {Object} A reference to the builder object. Can be used to
         *         chain multiple calls.
         */
        builder.addKey = (attributeName, attributeType, keyType) => {
            this._ensureKeyAttribute(attributeName, attributeType, keyType);
            indexRef.KeySchema.push({
                AttributeName: attributeName,
                KeyType: keyType
            });

            return builder;
        };

        /**
         * Sets the projection type on the index.
         *
         * @param {String} projectionType The projection type - KEYS_ONLY
         *        INCLUDE, ALL
         *
         * @return {Object} A reference to the builder object. Can be used to
         *         chain multiple calls.
         */
        builder.setProjectionType = (projectionType) => {
            if (PROJECTION_TYPES.indexOf(projectionType) < 0) {
                throw new Error('Invalid project type specified (arg #1)');
            }
            indexRef.Projection.ProjectionType = projectionType;

            return builder;
        };

        /**
         * Sets the non key attributes for the index projection
         *
         * @param {String} attributeName The non key attribute to add to the
         *        projection.
         *
         * @return {Object} A reference to the builder object. Can be used to
         *         chain multiple calls.
         */
        builder.addNonKeyAttribute = (attributeName) => {
            if (typeof attributeName !== 'string' || attributeName.length <= 0) {
                throw new Error('Invalid attribute name specified (arg #1)');
            }

            indexRef.Projection.NonKeyAttributes.push(attributeName);
            return builder;
        };

        return builder;
    }

    /**
     * Creates a builder object for global secondary indexes.
     *
     * @param {Object} indexRef Reference to the backing object that contains
     *        index parameters.
     *
     * @return {Object} An object that exposes methods that can be used to
     *         modify the index.
     */
    _createGSIBuilder(indexRef) {
        const builder = this._createLSIBuilder(indexRef);

        /**
         * Sets the read capacity on the index.
         *
         * @param {Number} capacity The read capacity to set.
         *
         * @return {Object} A reference to the builder object. Can be used to
         *         chain multiple calls.
         */
        builder.setReadCapacity = (capacity) => {
            if (typeof capacity !== 'number' || capacity <= 0) {
                throw new Error('Invalid read capacity specified (arg #1)');
            }

            indexRef.ProvisionedThroughput.ReadCapacityUnits = capacity.toString();

            return builder;
        };

        /**
         * Sets the write capacity on the index.
         *
         * @param {Number} capacity The write capacity to set.
         *
         * @return {Object} A reference to the builder object. Can be used to
         *         chain multiple calls.
         */
        builder.setWriteCapacity = (capacity) => {
            if (typeof capacity !== 'number' || capacity <= 0) {
                throw new Error('Invalid write capacity specified (arg #1)');
            }

            indexRef.ProvisionedThroughput.WriteCapacityUnits = capacity.toString();

            return builder;
        };

        return builder;
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
        if (ATTRIBUTE_TYPES.indexOf(attributeType) < 0) {
            throw new Error(`Invalid attributeType specified (arg #2). Must be one of: [${ATTRIBUTE_TYPES}]`);
        }
        if (KEY_TYPES.indexOf(keyType) < 0) {
            throw new Error(`Invalid keyType specified (arg #3). Must be one of: [${KEY_TYPES}]`);
        }

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
        if (STREAM_VIEW_TYPES.indexOf(streamViewType) < 0) {
            throw new Error(`Invalid stream view type specified (arg #1). Must be one of: [${STREAM_VIEW_TYPES}]`);
        }

        this.properties.StreamSpecification = {
            StreamViewType: streamViewType
        };

        return this;
    }

    /**
     * Adds a local secondary index to the table.
     *
     * @param {String} indexName The name of the index to add.
     *
     * @return {Object} Returns an index object that can be used to set
     *         additional properties such as keys, projections, etc.
     */
    addLocalSecondaryIndex(indexName) {
        if (typeof indexName !== 'string' || indexName.length <= 0) {
            throw new Error('Invalid index name specified (arg #1)');
        }
        const existingIndex = this.properties.LocalSecondaryIndexes.find((index) => {
            return index.IndexName === indexName;
        });
        if (existingIndex !== undefined) {
            throw new Error(`An index with name: ${indexName} has already been added`);
        }
        const index = {
            IndexName: indexName,
            KeySchema: [],
            Projection: {
                NonKeyAttributes: [],
                ProjectionType: 'KEYS_ONLY'
            }
        };

        this.properties.LocalSecondaryIndexes.push(index);

        return this._createLSIBuilder(index);
    }

    /**
     * Adds a global secondary index to the table.
     *
     * @param {String} indexName The name of the index to add.
     *
     * @return {Object} Returns an index object that can be used to set
     *         additional properties such as keys, projections, etc.
     */
    addGlobalSecondaryIndex(indexName) {
        if (typeof indexName !== 'string' || indexName.length <= 0) {
            throw new Error('Invalid index name specified (arg #1)');
        }
        const existingIndex = this.properties.GlobalSecondaryIndexes.find((index) => {
            return index.IndexName === indexName;
        });
        if (existingIndex !== undefined) {
            throw new Error(`An index with name: ${indexName} has already been added`);
        }
        const index = {
            IndexName: indexName,
            KeySchema: [],
            Projection: {
                NonKeyAttributes: [],
                ProjectionType: 'KEYS_ONLY'
            },
            ProvisionedThroughput: {
                ReadCapacityUnits: '5',
                WriteCapacityUnits: '5'
            }
        };

        this.properties.GlobalSecondaryIndexes.push(index);

        return this._createGSIBuilder(index);
    }
}

module.exports = TableTemplate;
