'use strict';

const Template = require('../template');

/**
 * Specialized method template class for a lambda function
 *
 * @extends {Template}
 */
class StreamTemplate extends Template {
    /**
     * @param {String} key A key that uniquely identifies the template
     * @param {String} streamName The name of the kinesis stream
     * @param {String} shardCount The number of the shards assigned to the stream
     */
    constructor(key, streamName, shardCount) {
        if (typeof streamName !== 'string' || streamName.length <= 0) {
            throw new Error('Invalid streamName specified (arg #2)');
        }
        if (typeof shardCount !== 'number' || shardCount <= 0) {
            throw new Error('Invalid shardCount specified (arg #3)');
        }
        super(key, 'AWS::Kinesis::Stream', {
            Name: streamName,
            ShardCount: shardCount,
            Tags: []
        });
    }

    /**
     * Adds tag to the kinesis stream.
     *
     * @param {name} tag name
     *
     * @param {value} tag value
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    addTag(name, value) {
        if (typeof name !== 'string') {
            throw new Error('Tag name (arg #1) is expected to be a string');
        }

        if (typeof value !== 'string') {
            throw new Error('Tag value (arg #2) is expected to be a string');
        }

        let wasUpdated = false;
        this.properties.Tags.forEach((tag) => {
            if (tag.Name === name) {
                tag.Value = value;
                wasUpdated = true;
            }
        });
        if (!wasUpdated) {
            this.properties.Tags.push({
                Name: name,
                Value: value
            });
        }

        return this;
    }

}

module.exports = StreamTemplate;