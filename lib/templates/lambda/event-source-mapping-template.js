'use strict';

const STARTING_POSITIONS = ['TRIM_HORIZON', 'LATEST', 'AT_TIMESTAMP'];
const _clone = require('clone');

const Template = require('../template');
const _lambdaUtils = require('../../utils/lambda-utils');

/**
 * Specialized method template class that sets up triggers lambda functions
 * based on events from event streams.
 *
 * @extends {Template}
 */
class EventSourceMappingTemplate extends Template {
    /**
     * @param {String} key A key that uniquely identifies the template
     */
    constructor(key) {
        super(key, 'AWS::Lambda::EventSourceMapping', {
            BatchSize: undefined,
            Enabled: undefined,
            EventSourceArn: undefined,
            FunctionName: undefined,
            StartingPosition: undefined
        });
    }

    /**
     * Sets the batch size allocation for the lambda function. The input must
     * be a number between 1 and 10000.
     *
     * @param {Number} batchSize The number of records that make up a batch
     *        when the lambda is triggered.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setBatchSize(batchSize) {
        if (typeof batchSize !== 'number' ||
            batchSize < 1 ||
            batchSize > 10000) {
            throw new Error('Invalid batchSize specified (arg #1). Must be between 1 and 10000.');
        }
        this.properties.BatchSize = batchSize;

        return this;
    }

    /**
     * Allows the mapping to be enabled or disabled.
     *
     * @param {Boolean} enabled If set to true, enables the event source
     *        mapping.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setEnabled(enabled) {
        this.properties.Enabled = !!enabled;

        return this;
    }

    /**
     * Sets the position in the stream where reading begins. This must be one of:
     * TRIM_HORIZON, LATEST or AT_TIMESTAMP.
     *
     * @param {String} startingPosition The starting position
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setStartingPosition(startingPosition) {
        if (STARTING_POSITIONS.indexOf(startingPosition) < 0) {
            throw new Error(`Invalid starting position specified. Must be one of: [${STARTING_POSITIONS}]`);
        }

        this.properties.StartingPosition = startingPosition;

        return this;
    }

    /**
     * Sets a kinesis pipeline as the event source of the mapping template.
     *
     * @param {String} stream The name of the kinesis stream.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setKinesisSource(stream) {
        if (typeof stream !== 'string' || stream.length <= 0) {
            throw new Error('Invalid stream specified (arg #1)');
        }

        this.properties.EventSourceArn = {
            'Fn::Join': ['', [
                'arn:aws:kinesis:', {
                    Ref: 'AWS::Region'
                },
                ':', {
                    Ref: 'AWS::AccountId'
                },
                `:stream/${stream}`
            ]]
        };

        return this;
    }

    /**
     * Sets a dynamodb table as the event source of the mapping template. This
     * method assumes that the table and stream are created within the current
     * cloud formation template, and expects a key to the dynamodb resource to
     * be passed in as an input.
     *
     * @param {String} tableKey The key of the cloudformation resource that
     *        represents the input source.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setDynamoDbSourceByResource(tableKey) {
        if (typeof tableKey !== 'string' || tableKey.length <= 0) {
            throw new Error('Invalid tableKey specified (arg #1)');
        }

        this.properties.EventSourceArn = {
            'Fn::GetAtt': [`<% ${tableKey} %>`, 'StreamArn']
        };

        return this;
    }

    /**
     * Sets a dynamodb table as the event source of the mapping template. This
     * method assumes that the table and stream are created by an independent
     * process, and accepts string values for both table and stream ids.
     *
     * @param {String} tableName The name of the dynamodb table.
     * @param {String} streamId The id of the dynamodb stream.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setDynamoDbSourceByStreamId(tableName, streamId) {
        if (typeof tableName !== 'string' || tableName.length <= 0) {
            throw new Error('Invalid tableName specified (arg #1)');
        }
        if (typeof streamId !== 'string' || streamId.length <= 0) {
            throw new Error('Invalid streamId specified (arg #2)');
        }

        this.properties.EventSourceArn = {
            'Fn::Join': ['', [
                'arn:aws:dynamodb:', {
                    Ref: 'AWS::Region'
                },
                ':', {
                    Ref: 'AWS::AccountId'
                },
                `:table/${tableName}/stream/${streamId}`
            ]]
        };

        return this;
    }

    /**
     * Sets the lambda function handler of the mapping template.
     *
     * @param {String} functionName The name of the lambda function that will
     *        handle the emitted events.
     * @param {String} [alias=''] An optional alias to attach to the lambda
     *        function.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setFunction(functionName, alias) {
        if (typeof functionName !== 'string' || functionName.length <= 0) {
            throw new Error('Invalid functionName specified (arg #1)');
        }
        if (typeof alias !== 'string') {
            alias = '';
        }

        this.properties.FunctionName = _lambdaUtils.getLambdaUri(functionName, alias);

        return this;
    }
}

module.exports = EventSourceMappingTemplate;
