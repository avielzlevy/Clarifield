import { Context } from "../deps.ts";

// --- Type Definitions ---
interface Field {
  label: string;
  type: "entity" | "definition";
  fields?: Field[];
}

interface EntityDefinition {
  label: string;
  fields: Field[];
}

// --- Controller Functions ---

export const processPostmanCollection = async (ctx: Context) => {
  try {
    // Get a postman collection data; check for the body key then aggregate the data.
    const body = ctx.request.body({ type: "json",limit: 50_000_000 });
    const data: unknown = await body.value;
    const bodyData = getFinalSchema(data);
    if (!bodyData) {
      ctx.response.status = 400;
      ctx.response.body = { message: "Invalid postman collection data" };
      return;
    }
    ctx.response.body = bodyData;
  } catch (e){
    ctx.response.status = 500;
    console.log(e)
    ctx.response.body = { message: "Internal server error" };
  }
};

export const processSwagger = async (ctx: Context) => {
  try {
    // Get a swagger data; check for the body key then aggregate the data.
    const body = ctx.request.body({ type: "json" });
    const data: unknown = await body.value;
    const bodyData = transformSwagger(data as SwaggerSpec);
    if (!bodyData) {
      ctx.response.status = 400;
      ctx.response.body = { message: "Invalid swagger data" };
      return;
    }
    ctx.response.body = bodyData;
  } catch (_e) {
    ctx.response.status = 500;
    ctx.response.body = { message: "Internal server error" };
  }
};

// --- Helper Functions ---

// --- Postman Collection Processing ---
/**
 * Recursively searches for all "body.raw" keys and JSON‑parses their values.
 */
const recursiveSearchForBodyRaw = (
  data: unknown,
  results: unknown[] = [],
  parentKey: string | null = null
): unknown[] => {
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key in obj) {
      // Check if the current key is "raw" and its parent is "body"
      if (parentKey === "body" && key === "raw") {
        try {
          const rawValue = obj[key];
          if (typeof rawValue === "string") {
            const parsedValue = JSON.parse(rawValue);
            results.push(parsedValue);
          }
        } catch (error) {
          console.error(`Error parsing JSON for body.raw:`, error);
        }
      }
      // Recurse into children, passing the current key as the new parentKey
      recursiveSearchForBodyRaw(obj[key], results, key);
    }
  }
  return results;
};


/**
 * Recursively generates fields from an object.
 * For primitives, it returns a field with type "definition".
 * For objects/arrays, it returns a field with type "entity" and recurses.
 */
const generateFields = (data: unknown): Field[] => {
  if (Array.isArray(data)) {
    // If the array is empty or all items are primitive, return an empty field list.
    if (
      data.length === 0 ||
      data.every((item) => typeof item !== "object" || item === null)
    ) {
      return [];
    }
    // If the array contains objects, merge them into one union object.
    let merged: Record<string, unknown> = {};
    data.forEach((item) => {
      if (item && typeof item === "object") {
        merged = { ...merged, ...(item as Record<string, unknown>) };
      }
    });
    return generateFields(merged);
  } else if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    return Object.keys(obj).map((key) => {
      const value = obj[key];
      // If the value is a non-null object or an array with objects, treat it as an entity.
      if (value && typeof value === "object") {
        return { label: key, type: "entity", fields: generateFields(value) };
      } else {
        // Otherwise, it’s a primitive – mark it as a definition.
        return { label: key, type: "definition" };
      }
    });
  }
  return [];
};

/**
 * Merges two arrays of fields.
 * For fields with the same label that are entities, their nested fields are merged.
 */
const mergeFields = (fields1: Field[], fields2: Field[]): Field[] => {
  const mergedMap: { [key: string]: Field } = {};
  fields1.forEach((field) => (mergedMap[field.label] = field));
  fields2.forEach((field) => {
    if (mergedMap[field.label]) {
      if (mergedMap[field.label].type === "entity" && field.type === "entity") {
        mergedMap[field.label].fields = mergeFields(
          mergedMap[field.label].fields || [],
          field.fields || []
        );
      }
      // For definitions, keep the original.
    } else {
      mergedMap[field.label] = field;
    }
  });
  return Object.values(mergedMap);
};

const isComplex = (value: unknown): boolean => {
  if (Array.isArray(value)) {
    // Array is complex if at least one element is an object.
    return value.some((item) => item && typeof item === "object");
  }
  return value !== null && typeof value === "object";
};

// Merge raw bodies without a dummy root—add only complex keys to entities,
// and add primitives to a separate definitions accumulator.
const generateEntityDefinitions = (
  bodyArray: unknown[]
): {
  entities: Record<string, EntityDefinition>;
  topLevelDefinitions: Record<string, { format: string; description: string }>;
} => {
  const entities: Record<string, EntityDefinition> = {};
  const topLevelDefinitions: Record<
    string,
    { format: string; description: string }
  > = {};

  bodyArray.forEach((item) => {
    if (item && typeof item === "object") {
      const rawObj = item as Record<string, unknown>;

      Object.keys(rawObj).forEach((key) => {
        //skip numbered keys like 0, 1, 2, etc.
        if(!isNaN(Number(key))) return;
        const value = rawObj[key];
        console.log(`Key: ${key}, Value: ${JSON.stringify(value)}`);
        if (isComplex(value)) {
          // Process as entity.
          const newFields = generateFields(value);
          if (entities[key]) {
            entities[key].fields = mergeFields(entities[key].fields, newFields);
          } else {
            entities[key] = { label: key, fields: newFields };
          }
        } else {
          // Process as a definition.
          topLevelDefinitions[key] = { format: "Text", description: "" };
        }
      });
    }
  });
  return { entities, topLevelDefinitions };
};

/**
 * Collects all primitive field definitions into a flat object.
 * Each definition is represented as key: fieldName, value: { format: "Text", description: "" }.
 * Note: definitions do not include nested fields.
 */
const collectDefinitions = (
  schema: Record<string, EntityDefinition>,
  accumulator: Record<string, { format: string; description: string }> = {}
): Record<string, { format: string; description: string }> => {
  Object.keys(schema).forEach((entityName) => {
    const entityDef = schema[entityName];
    entityDef.fields.forEach((f: Field) => {
      if (f.type === "definition") {
        if (!accumulator[f.label]) {
          accumulator[f.label] = { format: "Text", description: "" };
        }
      } else if (f.type === "entity" && f.fields) {
        // Recursively process nested entity fields.
        collectDefinitions(
          { temp: { label: "temp", fields: f.fields } },
          accumulator
        );
      }
    });
  });
  return accumulator;
};

// Then adjust getFinalSchema to merge definitions from within entities as well.
const getFinalSchema = (
  data: unknown
): {
  entities: Record<
    string,
    { fields: Array<{ label: string; type: "entity" | "definition" }> }
  >;
  definitions: Record<string, { format: string; description: string }>;
} | null => {
  const bodies = recursiveSearchForBodyRaw(data);
  if (!bodies || bodies.length === 0) return null;
  const { entities, topLevelDefinitions } = generateEntityDefinitions(bodies);
  const nestedDefinitions = collectDefinitions(entities);
  // Merge top-level primitive definitions with nested ones.
  const definitions = { ...nestedDefinitions, ...topLevelDefinitions };
  return { entities, definitions };
};


// --- Swagger Processing ---
// --- Type Definitions for Swagger Spec ---
interface SwaggerSchema {
    type?: string;
    properties?: Record<string, SwaggerSchema>;
    format?: string;
    description?: string;
    $ref?: string;
  }
  
  interface SwaggerSpec {
    definitions?: Record<string, SwaggerSchema>;
    paths?: Record<string, SwaggerPathItem>;
  }
  
  interface SwaggerPathItem {
    [method: string]: SwaggerOperation;
  }
  
  interface SwaggerOperation {
    parameters?: SwaggerParameter[];
  }
  
  interface SwaggerParameter {
    name: string;
    in: string;
    schema?: SwaggerSchema;
    type?: string;
  }
  
  // --- Type Definitions for Output ---
  interface Field {
    label: string;
    type: "entity" | "definition";
  }
  
  // Our output entity type does not include a label property.
  interface OutputEntity {
    fields: Field[];
  }
  
  interface PrimitiveDefinition {
    format: string;
    description: string;
  }
  
  // --- Helper Functions ---
  
  /**
   * Extracts the reference name from a Swagger $ref string.
   * For example, "#/definitions/Category" returns "Category".
   */
  function getRefName(ref: string): string {
    const parts = ref.split("/");
    return parts[parts.length - 1];
  }
  
  /**
   * Determines if a reference name is actually a container.
   * (e.g. "definitions", "paths", "components", etc.)
   */
  function isContainerRef(refName: string): boolean {
    const containers = ["definitions", "paths", "components", "parameters", "responses"];
    return containers.includes(refName);
  }
  
  /**
   * Adds a primitive definition if not already present.
   */
  function addDefinition(
    definitions: Record<string, PrimitiveDefinition>,
    name: string,
    schema?: SwaggerSchema
  ): void {
    if (!definitions[name]) {
      definitions[name] = {
        format: schema?.format || "Text",
        description: schema?.description || "",
      };
    }
  }
  
  /**
   * Recursively processes an object schema and registers it as an entity.
   * When a property has a $ref, the property name is used for the parent's field,
   * and the referenced schema is resolved as a nested entity.
   *
   * @param entityName The key to use for this entity.
   * @param schema The schema to process.
   * @param entities The mapping of entities.
   * @param definitions The mapping of primitive definitions.
   * @param swaggerDefs Global Swagger definitions for $ref resolution.
   */
  function processEntity(
    entityName: string,
    schema: SwaggerSchema,
    entities: Record<string, OutputEntity>,
    definitions: Record<string, PrimitiveDefinition>,
    swaggerDefs?: Record<string, SwaggerSchema>
  ): void {
    if (entities[entityName]) return; // Already processed.
    entities[entityName] = { fields: [] };
  
    if (!schema.properties) return;
  
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      if (propSchema.$ref) {
        const refName = getRefName(propSchema.$ref);
        // Skip if the $ref points to a container.
        if (isContainerRef(refName)) continue;
        const resolvedSchema = swaggerDefs ? swaggerDefs[refName] : undefined;
        if (resolvedSchema && resolvedSchema.type === "object" && resolvedSchema.properties) {
          // Mark property as nested entity.
          entities[entityName].fields.push({ label: propName, type: "entity" });
          processEntity(propName, resolvedSchema, entities, definitions, swaggerDefs);
        } else {
          entities[entityName].fields.push({ label: propName, type: "definition" });
          addDefinition(definitions, propName, propSchema);
        }
      } else if (propSchema.type === "object" && propSchema.properties) {
        // Inline object schema: treat as a nested entity.
        entities[entityName].fields.push({ label: propName, type: "entity" });
        processEntity(propName, propSchema, entities, definitions, swaggerDefs);
      } else {
        // Primitive property.
        entities[entityName].fields.push({ label: propName, type: "definition" });
        addDefinition(definitions, propName, propSchema);
      }
    }
  }
  
  /**
   * Transforms a Swagger V2 specification into output that separates complex types (entities)
   * from primitive definitions.
   *
   * Only non-body parameters are processed. In this approach, we ignore the global definitions
   * container—only parameters (e.g. header, query, etc.) drive entity creation.
   *
   * @param swagger The Swagger V2 specification.
   * @returns An object with "entities" and "definitions".
   */
  export function transformSwagger(
    swagger: SwaggerSpec
  ): { entities: Record<string, OutputEntity>; definitions: Record<string, PrimitiveDefinition> } {
    const entities: Record<string, OutputEntity> = {};
    const definitions: Record<string, PrimitiveDefinition> = {};
    const swaggerDefs = swagger.definitions;
  
    if (swagger.paths) {
      for (const path in swagger.paths) {
        const pathItem = swagger.paths[path];
        for (const method in pathItem) {
          const operation = pathItem[method];
          if (operation.parameters) {
            for (const param of operation.parameters) {
              // Skip request bodies.
              if (param.in === "body") continue;
              const schema: SwaggerSchema = param.schema || { type: param.type };
              if (schema.$ref) {
                const refName = getRefName(schema.$ref);
                if (isContainerRef(refName)) continue;
                const resolvedSchema = swaggerDefs ? swaggerDefs[refName] : undefined;
                if (resolvedSchema && resolvedSchema.type === "object" && resolvedSchema.properties) {
                  // Use the parameter name as the entity key.
                  processEntity(param.name, resolvedSchema, entities, definitions, swaggerDefs);
                } else {
                  addDefinition(definitions, param.name, schema);
                }
              } else if (schema.type === "object" && schema.properties) {
                processEntity(param.name, schema, entities, definitions, swaggerDefs);
              } else {
                addDefinition(definitions, param.name, schema);
              }
            }
          }
        }
      }
    }
  
    return { entities, definitions };
  }
  