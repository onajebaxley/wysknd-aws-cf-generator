'use strict';

const POLICY_EFFECTS = ['Allow', 'Deny'];
const _iamUtils = require('../../utils/iam-utils');

/**
 * Abstraction for a policy statement.
 */
class PolicyStatement {
    /**
     */
    constructor() {
        this._properties = {
            Effect: 'Allow',
            Action: []
        };
    }

    /**
     * Ensures that the statement defines a principal of the specified type.
     *
     * @private
     * @param {String} type The principal type.
     */
    _ensurePrincipalType(type) {
        if (!this.properties.Principal ||
            !this.properties.Principal[type] ||
            !(this.properties.Principal[type] instanceof Array)) {
            this.properties.Principal = {};
            this.properties.Principal[type] = [];
        }
    }

    /**
     * Gets a reference to the backing object that contains the statement
     * definition.
     *
     * @return {Object} An object that contains the statement definition.
     */
    get properties() {
        return this._properties;
    }

    /**
     * Sets the policy effect.
     *
     * @param {String} effect The policy effect - Allow, Deny.
     *
     * @return {Object} A reference to the current object. Can be used to
     *         chain multiple calls.
     */
    setEffect(effect) {
        if (POLICY_EFFECTS.indexOf(effect) < 0) {
            throw new Error(`Invalid policy effect specified. Must be one of: [${POLICY_EFFECTS}]`);
        }
        this.properties.Effect = effect;

        return this;
    }

    /**
     * Adds a service principal to the statement.
     *
     * @param {String} service The service to add.
     *
     * @return {Object} A reference to the current object. Can be used to
     *         chain multiple calls.
     */
    addServicePrincipal(service) {
        if (typeof service !== 'string' || service.length <= 0) {
            throw new Error('Invalid service specified (arg #1)');
        }
        this._ensurePrincipalType('Service');
        this.properties.Principal.Service.push(service);

        return this;
    }

    /**
     * Adds a canonical user principal to the statement.
     *
     * @param {String} user The canonical user to add.
     *
     * @return {Object} A reference to the current object. Can be used to
     *         chain multiple calls.
     */
    addCanonicalUserPrincipal(user) {
        if (typeof user !== 'string' || user.length <= 0) {
            throw new Error('Invalid canonical user specified (arg #1)');
        }
        this._ensurePrincipalType('CanonicalUser');
        this.properties.Principal.CanonicalUser.push(user);

        return this;
    }

    /**
     * Adds an IAM user principal to the statement.
     *
     * @param {String} username The username of the user to add.
     *
     * @return {Object} A reference to the current object. Can be used to
     *         chain multiple calls.
     */
    addIamUserPrincipal(username) {
        if (typeof username !== 'string' || username.length <= 0) {
            throw new Error('Invalid canonical username specified (arg #1)');
        }
        this._ensurePrincipalType('AWS');
        this.properties.Principal.AWS.push(_iamUtils.getUserUri(`user/${username}`));

        return this;
    }

    /**
     * Adds the AWS account principal to the statement.
     *
     * @return {Object} A reference to the current object. Can be used to
     *         chain multiple calls.
     */
    addAwsAccountPrincipal() {
        this._ensurePrincipalType('AWS');
        this.properties.Principal.AWS.push(_iamUtils.getUserUri('root'));

        return this;
    }

    /**
     * Adds a specified role principal to the statement.
     *
     * @return {Object} A reference to the current object. Can be used to
     *         chain multiple calls.
     */
    addAwsRolePrincipal(role) {
        if (typeof role !== 'string' || role.length <= 0) {
            throw new Error('Invalid role specified (arg #1)');
        }
        this._ensurePrincipalType('AWS');
        this.properties.Principal.AWS.push(_iamUtils.getRoleUri(role));

        return this;
    }

    /**
     * Adds an anonymous user principal to the statement. This method will
     * override previous non AWS principal settings.
     *
     * @return {Object} A reference to the current object. Can be used to
     *         chain multiple calls.
     */
    addAnonymousUserPrincipal() {
        this._ensurePrincipalType('AWS');
        this.properties.Principal.AWS.push('*');

        return this;
    }

    /**
     * Adds an action to the statement.
     *
     * @param {String} action The action to add.
     *
     * @return {Object} A reference to the current object. Can be used to
     *         chain multiple calls.
     */
    addAction(action) {
        if (typeof action !== 'string' || action.length <= 0) {
            throw new Error('Invalid action specified (arg #1)');
        }
        this.properties.Action.push(action);

        return this;
    }

    /**
     * Adds a resource to the statement.
     *
     * This method has been deprecated. Use `addResourceArn()` instead.
     *
     * @deprecated
     * @param {String} resource The resource to add.
     *
     * @return {Object} A reference to the current object. Can be used to
     *         chain multiple calls.
     */
    addResource(resource) {
        if (typeof resource !== 'string' || resource.length <= 0) {
            throw new Error('Invalid resource specified (arg #1)');
        }
        if (!this.properties.Resource) {
            this.properties.Resource = [];
        }
        this.properties.Resource.push(resource);

        return this;
    }

    /**
     * Generates a resource uri and then adds it to the statement. The generated
     * uri will be of the form:
     *
     *   arn:aws:<resourceType>:us-east-1:111111111111:<suffix>
     *
     * @param {String} [resourceType=''] The resource type to add.
     * @param {String} [suffix='*'] The resource suffix.
     *
     * @return {Object} A reference to the current object. Can be used to
     *         chain multiple calls.
     */
    addResourceArn(resourceType, suffix) {
        if (typeof resourceType !== 'string') {
            resourceType = '';
        }
        if (typeof suffix !== 'string') {
            suffix = '*';
        }
        if (!this.properties.Resource) {
            this.properties.Resource = [];
        }
        const resource = {
            'Fn::Join': ['', [
                `arn:aws:${resourceType}:`, {
                    Ref: 'AWS::Region'
                }, ':', {
                    Ref: 'AWS::AccountId'
                },
                ':',
                suffix
            ]]
        };
        this.properties.Resource.push(resource);

        return this;
    }
}

module.exports = PolicyStatement;
