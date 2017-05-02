'use strict';

/**
 * Main entry point for the library.
 */
const index = {
    /**
     * Utility class that recursively scans the current directory subtree
     * and loads all defined templates.
     */
    TemplateBuilder: require('./template-builder'),

    /**
     * Class that abstracts information about a specific directory in a
     * tmeplate hierarchy.
     */
    DirInfo: require('./dir-info'),

    /**
     * Reference to the cloud formation template abstraction.
     */
    Template: require('./templates/template'),

    /**
     * Reference to a sub library of api gateway specific templates.
     */
    ApiGatewayTemplates: require('./templates/api-gateway'),

    /**
     * Reference to a sub library of lambda function specific templates.
     */
    LambdaTemplates: require('./templates/lambda'),

    /**
     * Reference to a sub library of dynamo db specific templates.
     */
    DynamoDbTemplates: require('./templates/dynamodb'),

    /**
     * Reference to a sub library of iam specific templates.
     */
    IamTemplates: require('./templates/iam'),

    /**
     * Reference to a sub library of elastic search specific templates.
     */
    EsTemplates: require('./templates/es'),

    /**
     * Reference to a sub library of network specific templates.
     */
    NetworkTemplates: require('./templates/network')
};

module.exports = index;
