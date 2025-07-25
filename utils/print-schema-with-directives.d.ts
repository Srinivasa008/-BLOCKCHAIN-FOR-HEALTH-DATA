import { GraphQLSchema, GraphQLNamedType, DirectiveNode, FieldDefinitionNode, InputValueDefinitionNode, GraphQLArgument, EnumValueDefinitionNode, GraphQLDirective, DirectiveDefinitionNode, SchemaDefinitionNode, SchemaExtensionNode, GraphQLObjectType, ObjectTypeDefinitionNode, GraphQLField, GraphQLInterfaceType, InterfaceTypeDefinitionNode, UnionTypeDefinitionNode, GraphQLUnionType, GraphQLInputObjectType, InputObjectTypeDefinitionNode, GraphQLInputField, GraphQLEnumType, GraphQLEnumValue, EnumTypeDefinitionNode, GraphQLScalarType, ScalarTypeDefinitionNode, DocumentNode } from 'graphql';
import { GetDocumentNodeFromSchemaOptions, PrintSchemaWithDirectivesOptions, Maybe } from './types';
export declare function getDocumentNodeFromSchema(schema: GraphQLSchema, options?: GetDocumentNodeFromSchemaOptions): DocumentNode;
export declare function printSchemaWithDirectives(schema: GraphQLSchema, options?: PrintSchemaWithDirectivesOptions): string;
export declare function astFromSchema(schema: GraphQLSchema, pathToDirectivesInExtensions?: Array<string>): SchemaDefinitionNode | SchemaExtensionNode | null;
export declare function astFromDirective(directive: GraphQLDirective, schema?: GraphQLSchema, pathToDirectivesInExtensions?: Array<string>): DirectiveDefinitionNode;
export declare function getDirectiveNodes(entity: GraphQLSchema | GraphQLNamedType | GraphQLEnumValue, schema: GraphQLSchema, pathToDirectivesInExtensions?: Array<string>): Array<DirectiveNode>;
export declare function getDeprecatableDirectiveNodes(entity: GraphQLArgument | GraphQLField<any, any> | GraphQLInputField, schema?: GraphQLSchema, pathToDirectivesInExtensions?: Array<string>): Array<DirectiveNode>;
export declare function astFromArg(arg: GraphQLArgument, schema?: GraphQLSchema, pathToDirectivesInExtensions?: Array<string>): InputValueDefinitionNode;
export declare function astFromObjectType(type: GraphQLObjectType, schema: GraphQLSchema, pathToDirectivesInExtensions?: Array<string>): ObjectTypeDefinitionNode;
export declare function astFromInterfaceType(type: GraphQLInterfaceType, schema: GraphQLSchema, pathToDirectivesInExtensions?: Array<string>): InterfaceTypeDefinitionNode;
export declare function astFromUnionType(type: GraphQLUnionType, schema: GraphQLSchema, pathToDirectivesInExtensions?: Array<string>): UnionTypeDefinitionNode;
export declare function astFromInputObjectType(type: GraphQLInputObjectType, schema: GraphQLSchema, pathToDirectivesInExtensions?: Array<string>): InputObjectTypeDefinitionNode;
export declare function astFromEnumType(type: GraphQLEnumType, schema: GraphQLSchema, pathToDirectivesInExtensions?: Array<string>): EnumTypeDefinitionNode;
export declare function astFromScalarType(type: GraphQLScalarType, schema: GraphQLSchema, pathToDirectivesInExtensions?: Array<string>): ScalarTypeDefinitionNode;
export declare function astFromField(field: GraphQLField<any, any>, schema: GraphQLSchema, pathToDirectivesInExtensions?: Array<string>): FieldDefinitionNode;
export declare function astFromInputField(field: GraphQLInputField, schema: GraphQLSchema, pathToDirectivesInExtensions?: Array<string>): InputValueDefinitionNode;
export declare function astFromEnumValue(value: GraphQLEnumValue, schema: GraphQLSchema, pathToDirectivesInExtensions?: Array<string>): EnumValueDefinitionNode;
export declare function makeDeprecatedDirective(deprecationReason: string): DirectiveNode;
export declare function makeDirectiveNode(name: string, args: Record<string, any>, directive?: Maybe<GraphQLDirective>): DirectiveNode;
export declare function makeDirectiveNodes(schema: Maybe<GraphQLSchema>, directiveValues: Record<string, any>): Array<DirectiveNode>;
