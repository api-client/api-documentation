export declare const initializeOauth1Model: unique symbol;

declare function ApiOauth1MethodMixin<T extends new (...args: any[]) => {}>(base: T): T & ApiOauth1MethodMixinConstructor;
export declare interface ApiOauth1MethodMixinConstructor {
  new(...args: any[]): ApiOauth1MethodMixin;
}


export declare interface ApiOauth1MethodMixin {
  [initializeOauth1Model](): void;
}
