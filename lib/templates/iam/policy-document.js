'use strict';

const PolicyStatement = require('./policy-statement');

/**
 * Abstraction for a policy document.
 */
class PolicyDocument {
    /**
     */
    constructor() {
        this._properties = {
            Version: '2012-10-17',
            Statement: []
        };
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
     * Adds a statement to the document.
     *
     * @param {Object} statement Reference to a statement builder object.
     *
     * @return {Object} A reference to the current object. Can be used to
     *         chain multiple calls.
     */
    addStatement(statement) {
        if (!(statement instanceof PolicyStatement)) {
            throw new Error('Invalid policy statement specified (arg #1)');
        }
        this.properties.Statement.push(statement.properties);

        return this;
    }
}

module.exports = PolicyDocument;
