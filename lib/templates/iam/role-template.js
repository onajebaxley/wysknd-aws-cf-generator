'use strict';

const _clone = require('clone');

const Template = require('../template');
const PolicyDocument = require('./policy-document');
const _iamUtils = require('../../utils/iam-utils');

/**
 * Specialized method template class for an iam role
 *
 * @extends {Template}
 */
class RoleTemplate extends Template {
    /**
     * @param {String} key A key that uniquely identifies the template
     * @param {String} roleName The name of the IAM role. The role name will
     *        be prefixed with the "<Region>.", where <Region> is the current
     *        region for the cloud formation template.
     * @param {Boolean} [ noRegion=false ] If set to true, the role name will
     *        not be prefixed with "<Region>.".
     */
    constructor(key, roleName, noRegion) {
        if (typeof roleName !== 'string' || roleName.length <= 0) {
            throw new Error('Invalid role name specified (arg #2)');
        }
        let regionToken = '';
        if (!noRegion) {
            regionToken = {
                Ref: 'AWS::Region'
            };
            roleName = `.${roleName}`;
        }
        super(key, 'AWS::IAM::Role', {
            RoleName: {
                'Fn::Join': ['', [
                    regionToken,
                    roleName
                ]]
            },
            ManagedPolicyArns: [],
            Policies: []
        });
    }

    /**
     * Sets a policy document that defines permissions for entities that can
     * assume the role.
     *
     * @param {Object} document Reference to a policy document builder object.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setAssumePolicy(document) {
        if (!(document instanceof PolicyDocument)) {
            throw new Error('Invalid policy document specified (arg #1)');
        }
        this.properties.AssumeRolePolicyDocument = document.properties;

        return this;
    }

    /**
     * Sets the role path.
     *
     * @param {String} path The path to assign to the role.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    setPath(path) {
        if (typeof path !== 'string' || path.length <= 0) {
            throw new Error('Invalid path specified (arg #1)');
        }
        this.properties.Path = path;

        return this;
    }

    /**
     * Adds the ARN of an AWS managed policy to the role.
     *
     * @param {String} policyName The name of the policy to add. The template
     *        will automatically generate the ARN based on the policy name.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    addAwsManagedPolicy(policyName) {
        if (typeof policyName !== 'string' || policyName.length <= 0) {
            throw new Error('Invalid policy name specified (arg #1)');
        }
        this.properties.ManagedPolicyArns.push(_iamUtils.getAwsPolicyUri(policyName));

        return this;
    }

    /**
     * Adds the ARN of a user created managed policy to the role.
     *
     * @param {String} policyName The name of the policy to add. The template
     *        will automatically generate the ARN based on the policy name.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    addUserManagedPolicy(policyName) {
        if (typeof policyName !== 'string' || policyName.length <= 0) {
            throw new Error('Invalid policy name specified (arg #1)');
        }
        this.properties.ManagedPolicyArns.push(_iamUtils.getUserPolicyUri(policyName));

        return this;
    }

    /**
     * Adds an inline policy document for the role.
     *
     * @param {String} name The name of the inline policy.
     * @param {Object} document Reference to a policy document builder object.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    addPolicy(name, document) {
        if (typeof name !== 'string' || name.length <= 0) {
            throw new Error('Invalid name specified (arg #1)');
        }
        if (!(document instanceof PolicyDocument)) {
            throw new Error('Invalid policy document specified (arg #2)');
        }
        const existingPolicy = this.properties.Policies.find((policy) => {
            return policy.PolicyName === name;
        });
        if (existingPolicy !== undefined) {
            throw new Error(`A policy with name [${name}] has already been defined`);
        }

        this.properties.Policies.push({
            PolicyName: name,
            PolicyDocument: document.properties
        });

        return this;
    }
}

module.exports = RoleTemplate;
