const _mappingHelper = require('./mapping-template-helper.js');

/**
 * This is a helper class that can be used to easily contruct request template using
 * mapping-template-helper object.
 */
class RequestTemplateBuilder {
    constructor() {
        this.properties = [];
    }

    /**
     * Adds a property mapping.
     *
     * @private
     * @param {String} input The source of the property.
     * @param {String} output The destination of the property.
     * @param {Object} options Property mapping options.
     */
    _addProperty(input, output, options) {
        if (this.properties.length === 0) {
            options.noComma = true;
        }
        this.properties.push(_mappingHelper.mapProperty(input, output, options));
    }

    /**
     *  Method generates request templates based on added properties
     *
     *  @return {String} request template
     */
    getRequestMap() {
        if (this.properties.length === 0) {
            throw new Error('Template has no properties mapped.');
        }

        /*esfmt-ignore-start*/
        return `{${this.properties.reduce((prev, cur) => {
            return prev.concat(`\n${cur}`);
        }, '')}}`;
        /*esfmt-ignore-end*/
    }

    /**
     * Adds mapping for user object from JWT token
     *
     * @param {Object} map A hash containing a map of user fields to fields
     *        in the JWT token. The key of the hash represents the name of a
     *        field in the user object. The value can be a plain string, or
     *        an object that contains the value and additional attributes that
     *        determine how the value will be mapped.
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    addUserFromJWT(jwtMap) {
        const mapping = jwtMap;
        this.properties.push(_mappingHelper.mapUserFromJwt(mapping));
        return this;
    }

    /**
     * Adds body property mapping
     *
     * @param {String} outputProp The name of the property.
     * @param {String} inputProp The name of the input property
     * @param {Object} [options={
     *                     noQuotes: false,
     *                     noComma: false,
     *                     escapeNL: escape newline characters
     *                     defaultValue: undefined
     *                 }]
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    addBodyProperty(input, output, options) {
        const augmentedOptions = options || {};
        augmentedOptions.source = 'body';
        this._addProperty(`$.${input}`, output, options);
        return this;
    }

    /**
     * Adds URL property mapping
     *
     * @param {String} outputProp The name of the property.
     * @param {String} inputProp The name of the input property
     * @param {Object} [options={
     *                     noQuotes: false,
     *                     noComma: false,
     *                     escapeNL: escape newline characters
     *                 }]
     *
     * @return {Object} A reference to the template. Can be used to
     *         chain multiple calls.
     */
    addURLProperty(input, output, options) {
        const augmentedOptions = options || {};
        augmentedOptions.source = 'url';
        this._addProperty(input, output, augmentedOptions);
        return this;
    }
}

module.exports = RequestTemplateBuilder;
