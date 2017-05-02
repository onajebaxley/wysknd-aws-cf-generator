'use strict';

const Template = require('../template');
const Netmask = require('netmask').Netmask;

/**
 * Specialized method template class for a VPC definition
 *
 * @extends {Template}
 */
class VpcTemplate extends Template {
    /**
     * @param {String} key A key that uniquely identifies the template.
     */
    constructor(key, vpcName) {
        if (typeof vpcName !== 'string' || vpcName.length <= 0) {
            throw new Error('Invalid VPC Name specified (arg #2)');
        }
        super(key, 'AWS::EC2::VPC', {
            Tags: [{
                Name: vpcName
            }],
            CidrBlock: '',
            EnableDnsSupport: true,
            EnableHostnames: false,
            InstanceTenancy: 'default'
        });
    }

    /**
     * Sets the CIDR block for the VPC.
     *
     * @param {String} cidrBlock The name of the key attribute.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setCidrBlock(cidrBlock) {
        if (typeof cidrBlock !== 'string' || cidrBlock.length <= 0) {
            throw new Error('Invalid cidrBlock specified (arg #1)');
        }
        const mask = new Netmask(cidrBlock);
        this.properties.CidrBlock = `${mask.base}/${mask.bitmask}`;

        return this;
    }

    /**
     * Enables DNS support via AWS DNS.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    enableDnsSupport() {
        this.properties.EnableDnsSupport = true;

        return this;
    }

    /**
     * Disables DNS support.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    disableDnsSupport() {
        this.properties.EnableDnsSupport = false;

        return this;
    }

    /**
     * Enables hostname support for instances within the VPC.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    enableHostnameSupport() {
        this.properties.EnableHostnames = true;

        return this;
    }

    /**
     * Disables hostname support.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    disableHostnameSupport() {
        this.properties.EnableHostnames = false;

        return this;
    }

    /**
     * Sets tenancy mode for instances to 'dedicated'.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setDedicatedTenancy() {
        this.properties.InstanceTenancy = 'dedicated';

        return this;
    }

    /**
     * Sets tenancy mode for instances to 'default'.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setDefaultTenancy() {
        this.properties.InstanceTenancy = 'default';

        return this;
    }
}

module.exports = VpcTemplate;
