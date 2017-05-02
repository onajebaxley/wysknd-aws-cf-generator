'use strict';

const Template = require('../template');
const PolicyDocument = require('../iam/policy-document');

/**
 * Abstraction for an elastic search domain.
 */
class EsDomainTemplate extends Template {
    /**
     * @param {String} key A key that uniquely identifies the template
     * @param {String} domainName The name of the elastic search domain.
     * @param {String} [version='5.1'] The version of elastic search to use.
     */
    constructor(key, domainName, version) {
        if (typeof domainName !== 'string' || domainName.length <= 0) {
            throw new Error('Invalid domainName specified (arg #2)');
        }
        if (typeof version !== 'string' || version.length <= 0) {
            version = '5.1';
        }
        const advancedOptions = (version === '5.1') ? {
            'rest.action.multi.allow_explicit_index': 'true',
            'indices.fielddata.cache.size': ''
        } : {};
        super(key, 'AWS::Elasticsearch::Domain', {
            DomainName: domainName,
            ElasticsearchVersion: version,
            AccessPolicies: undefined,
            AdvancedOptions: advancedOptions,
            SnapshotOptions: {},
            EBSOptions: {
                EBSEnabled: false
            },
            ElasticsearchClusterConfig: {
                DedicatedMasterEnabled: false,
                InstanceCount: 1,
                InstanceType: 'm3.medium.elasticsearch',
                ZoneAwarenessEnabled: false
            }
        });
    }

    /**
     * Gets a reference to the backing object that contains the document
     * definition.
     *
     * @return {Object} An object that contains the document definition.
     */
    get properties() {
        return this._properties;
    }

    /**
     * Sets the access policy to the ES domain.
     *
     * @param {Object} document Reference to a policy document builder object.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setAccessPolicy(document) {
        if (!(document instanceof PolicyDocument)) {
            throw new Error('Invalid policy document specified (arg #1)');
        }
        this.properties.AccessPolicies = document.properties;

        return this;
    }

    /**
     * Sets an advanced option setting on the domain.
     *
     * @param {String} key The advanced option key.
     * @param {String} value The advanced option value.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setAdvancedOption(key, value) {
        if (typeof key !== 'string' || key.length <= 0) {
            throw new Error('Invalid key specified (arg #1)');
        }
        if (typeof value !== 'string' || value.length <= 0) {
            throw new Error('Invalid value specified (arg #2)');
        }

        this.properties.AdvancedOptions[key] = value;

        return this;
    }

    /**
     * Sets the hour at which an automatic snapshot of the ES indices will be
     * captured.
     *
     * @param {Number} hour The UTC hour (0 - 23) at which the snapshot will be
     *        captured.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setAutomatedSnapshotHour(hour) {
        if (typeof hour !== 'number' || hour < 0 || hour > 23) {
            throw new Error('Invalid hour specified (arg #1). Must be between 0 and 23');
        }
        hour = Math.floor(hour);
        this.properties.SnapshotOptions.AutomatedSnapshotStartHour = hour;

        return this;
    }

    /**
     * Disables elastic block store for data nodes.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    disableEbs() {
        this.properties.EBSOptions = {
            EBSEnabled: false
        };
        return this;
    }

    /**
     * Enables standard magnetic elastic block store volumes attached to data
     * nodes in the elastic search domain.
     *
     * @param {Number} volumeSize The size of the volume in GB
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    enableStandardEbs(volumeSize) {
        if (typeof volumeSize !== 'number' || volumeSize < 10 || volumeSize > 1536) {
            throw new Error('Invalid volumeSize specified (arg #1). Must be between 10 and 1536');
        }

        this.properties.EBSOptions = {
            EBSEnabled: true,
            VolumeSize: volumeSize,
            VolumeType: 'standard'
        };
        return this;
    }

    /**
     * Enables solid state drive elastic block store volumes attached to data
     * nodes in the elastic search domain.
     *
     * @param {Number} volumeSize The size of the volume in GB
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    enableSsdEbs(volumeSize) {
        if (typeof volumeSize !== 'number' || volumeSize < 10 || volumeSize > 1536) {
            throw new Error('Invalid volumeSize specified (arg #1). Must be between 10 and 1536');
        }

        this.properties.EBSOptions = {
            EBSEnabled: true,
            VolumeSize: volumeSize,
            VolumeType: 'gp2'
        };
        return this;
    }

    /**
     * Enables provisioned IOPS elastic block store volumes attached to data
     * nodes in the elastic search domain.
     *
     * @param {Number} volumeSize The size of the volume in GB
     * @param {Number} iops The size of the volume in GB
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    enableIopsEbs(volumeSize, iops) {
        if (typeof volumeSize !== 'number' || volumeSize < 10 || volumeSize > 1536) {
            throw new Error('Invalid volumeSize specified (arg #1). Must be between 10 and 1536');
        }
        if (typeof iops !== 'number' || iops < 1000 || iops > 16000) {
            throw new Error('Invalid iops specified (arg #2). Must be between 1000 and 16000');
        }

        this.properties.EBSOptions = {
            EBSEnabled: true,
            VolumeSize: volumeSize,
            Iops: iops,
            VolumeType: 'io1'
        };
        return this;
    }

    /**
     * Disables a dedicated master node for the cluster.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    disableDedicatedMaster() {
        this.properties.ElasticsearchClusterConfig.DedicatedMasterEnabled = false;
        delete this.properties.ElasticsearchClusterConfig.DedicatedMasterCount;
        delete this.properties.ElasticsearchClusterConfig.DedicatedMasterType;

        return this;
    }

    /**
     * Sets the number of dedicated master nodes for the elastic search
     * cluster.
     *
     * @param {Number} count The number of dedicated master nodes to assign.
     * @param {String} instanceType The instance type to use for the dedicated
     *        master node.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setDedicatedMaster(count, instanceType) {
        if (typeof count !== 'number' || count <= 1) {
            throw new Error('Invalid count specified (arg #1). Must be greater than 1.');
        }
        if (typeof instanceType !== 'string' || instanceType.length <= 0 ||
            !instanceType.match(/\.elasticsearch$/)) {
            throw new Error('Invalid instanceType specified (arg #2)');
        }

        this.properties.ElasticsearchClusterConfig.DedicatedMasterEnabled = true;
        this.properties.ElasticsearchClusterConfig.DedicatedMasterCount = count;
        this.properties.ElasticsearchClusterConfig.DedicatedMasterType = instanceType;

        return this;
    }

    /**
     * Sets the count and type of instances in the elastic search cluster.
     *
     * @param {Number} count The number of nodes to create in the cluster.
     * @param {String} instanceType The instance type to use for the nodes.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setInstances(count, instanceType) {
        if (typeof count !== 'number' || count <= 0) {
            throw new Error('Invalid count specified (arg #1)');
        }
        if (typeof instanceType !== 'string' || instanceType.length <= 0 ||
            !instanceType.match(/\.elasticsearch$/)) {
            throw new Error('Invalid instanceType specified (arg #2)');
        }

        this.properties.ElasticsearchClusterConfig.InstanceCount = count;
        this.properties.ElasticsearchClusterConfig.InstanceType = instanceType;

        return this;
    }

    /**
     * Enables zone awareness for the cluster
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    enableZoneAwareness() {
        this.properties.ElasticsearchClusterConfig.ZoneAwarenessEnabled = true;
        return this;
    }

    /**
     * Disables zone awareness for the cluster
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    disableZoneAwareness() {
        this.properties.ElasticsearchClusterConfig.ZoneAwarenessEnabled = false;
        return this;
    }
}

module.exports = EsDomainTemplate;
