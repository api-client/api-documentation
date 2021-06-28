import { TemplateResult } from "lit-html";

export const descriptionFocusHandler: unique symbol;
export const descriptionEditor: unique symbol;
export const descriptionBlurHandler: unique symbol;
export const descriptionInputHandler: unique symbol;
export const updateDescription: unique symbol;
export const descriptionEditorTemplate: unique symbol;
export const descriptionTemplate: unique symbol;
export const descriptionEmptyTemplate: unique symbol;
export const descriptionWrapper: unique symbol;
export const focusMarkdownEditor: unique symbol;

declare interface DescriptionTemplateOptions {
  /**
   * The domain id of the object that has the description.
   * It is set as `data-domain-id` attribute on the editor and the renderer.
   */
  domainId?: string;
  /**
   * The target object that has the description (type, schema, etc)
   * It is set as `data-target` attribute on the editor and the renderer.
   */
  target?: string;
}

export declare function DescriptionEditMixin<T extends new (...args: any[]) => {}>(base: T): T;

export declare interface DescriptionEditMixin {
  new(...args: any[]): DescriptionEditMixin;
  constructor(...args: any[]): DescriptionEditMixin;
  [descriptionEditor]: boolean;
  /**
   * Enables the description markdown editor.
   */
  [descriptionFocusHandler](): Promise<void>;

  /**
   * Focuses on the markdown editor.
   */
  [focusMarkdownEditor](): void;

  /**
   * Updates the description on the editor blur.
   */
  [descriptionBlurHandler](): Promise<void>;

  /**
   * Marks markdown editor as dirty.
   */
  [descriptionInputHandler](e: Event): void;

  /**
   * Updates the description of the edited object.
   * @param md The new markdown to set.
   * @param opts Deserialized template options, if any.
   */
  [updateDescription](md: string, opts?: DescriptionTemplateOptions): Promise<void>;

  /**
   * @param description The description to render.
   * @param opts Optional rendering options.
   * @returns The template for the markdown description.
   */
  [descriptionTemplate](description?: string, opts?: DescriptionTemplateOptions): TemplateResult|string

  /**
   * @param description The description to render.
   * @param opts Optional rendering options.
   * @returns The template for the markdown editor for the description.
   */
  [descriptionEditorTemplate](description?: string, opts?: DescriptionTemplateOptions): TemplateResult|string

  /**
   * @return The template used when the description is missing.
   */
  [descriptionEmptyTemplate](): TemplateResult|string;
  /**
   * @param content The content to insert.
   * @return The template for the description container.
   */
  [descriptionWrapper](content: TemplateResult|TemplateResult[]): TemplateResult;

}
