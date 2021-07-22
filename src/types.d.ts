import { ApiExample, ApiParameterRecursive, ApiSecurityRequirementRecursive, ApiShapeUnion } from "@api-client/amf-store";
import { BasicAuthorization, BearerAuthorization, DigestAuthorization, OAuth1Authorization, OAuth2Authorization } from "@advanced-rest-client/arc-types/src/authorization/Authorization";

export declare interface SchemaExample extends ApiExample {
  renderValue?: string;
  label?: string;
}

export declare interface ShapeExampleGeneratorOptions {
  /**
   * All selected unions in the current view.
   */
  selectedUnions?: string[];
}

export interface OperationParameter {
  parameter: ApiParameterRecursive;
  schema?: ApiShapeUnion;
  paramId: string;
  schemaId?: string;
  binding: string;
  source: string;
}

export interface ShapeTemplateOptions {
  nillable?: boolean;
  arrayItem?: boolean;
  index?: number;
  value?: any;
}

export declare interface CredentialSource {
  grantType: string
  credentials: Array<Source>
}

export declare interface Source {
  name: string
  clientId: string | undefined
  clientSecret: string | undefined
}

export interface SecuritySelectorListItem {
  types: string[];
  labels: string[];
  security: ApiSecurityRequirementRecursive;
}
