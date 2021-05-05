import { ApiExample } from "@api-client/amf-store";

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
