// controllers/importController.ts
import { Context } from "../deps.ts";
import { addDefinition } from "../repositories/definitionRepository.ts";
import { addEntity } from "../repositories/entityRepository.ts";
import { Definition } from "../models/definition.ts";
import { Entity } from "../models/entities.ts";


// --- Controller Functions ---

export const Import = async (ctx: Context) => {
  try {
    const body = ctx.request.body({ type: "json" });
    const data: unknown = await body.value;

    // Validate basic structure
    if (!data || typeof data !== "object") {
      ctx.response.status = 400;
      ctx.response.body = { message: "Invalid postman collection data" };
      return;
    }
    const parsedData = data as Record<string, unknown>;
    if (!parsedData.definitions || !parsedData.entities) {
      ctx.response.status = 400;
      ctx.response.body = {
        message: "Data must include 'definitions' and 'entities' keys",
      };
      return;
    }

    // Process definitions
    const definitionResults: Array<{
      name: string;
      status: string;
      error?: string;
    }> = [];
    for (const [name, definition] of Object.entries(parsedData.definitions)) {
      try {
        await addDefinition(name, definition as Definition);
        definitionResults.push({ name, status: "imported" });
      } catch (err) {
        // Report error per definition (for instance, duplicate definition)
        definitionResults.push({
          name,
          status: "error",
          error: (err as Error).message,
        });
      }
    }


    // Process entities
    const entityResults: Array<{
      label: string;
      status: string;
      error?: string;
    }> = [];
    for (const [label, entityData] of Object.entries(parsedData.entities)) {
      try {
        // Remove any label property from entityData to prevent duplicate keys.
        const { label: _, ...restEntity } = entityData as Entity;
        const entity: Entity = { ...restEntity, label };
        await addEntity(entity);
        entityResults.push({ label, status: "imported" });
      } catch (err) {
        entityResults.push({
          label,
          status: "error",
          error: (err as Error).message,
        });
      }
    }

    ctx.response.status = 200;
    ctx.response.body = {
      message: "Import completed",
      definitions: definitionResults,
      entities: entityResults,
    };
  } catch (e) {
    console.error("Error importing postman collection:", e);
    ctx.response.status = 500;
    ctx.response.body = { message: "Internal server error" };
  }
};

