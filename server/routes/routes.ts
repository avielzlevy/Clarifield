import { Router, getLogs } from "../deps.ts";
import { getAddons } from "../controllers/addonsController.ts";
import {
  getFormats,
  addFormat,
  updateFormat,
  deleteFormat,
} from "../controllers/formatController.ts";
import {
  getDefinitions,
  getDefinition,
  addDefinition,
  updateDefinition,
  deleteDefinition,
} from "../controllers/definitionController.ts";
import {
  getAnalytics,
  addAnalytic,
} from "../controllers/analyticsController.ts";
import { getEntities, addEntity,updateEntity,deleteEntity } from "../controllers/entityController.ts";
import {
  getReports,
  addReport,
  deleteReport,
} from "../controllers/reportController.ts";
import { authMiddleware } from "../middlewares/authMiddleware.ts";
import { auditLogger } from "../middlewares/requestLogger.ts";
import { signIn, verifyToken } from "../controllers/authController.ts";
import { getAffected } from "../utils/affected.ts";
import { getChanges } from "../utils/changes.ts";
import { getSettings, updateSettings } from "../utils/settings.ts";
import validate from "../utils/validation.ts";

const router = new Router();

router
  .post("/api/signin", auditLogger, signIn)
  .get("/api/token/verify", auditLogger, authMiddleware, verifyToken)
  .get("/api/formats", getFormats)
  .post("/api/formats", auditLogger, authMiddleware, addFormat)
  .put("/api/formats/:name", auditLogger, authMiddleware, updateFormat)
  .delete("/api/formats/:name", auditLogger, authMiddleware, deleteFormat)
  .get("/api/definitions", getDefinitions)
  .get("/api/definition/:name", getDefinition)
  .post("/api/definitions", auditLogger, authMiddleware, addDefinition)
  .put("/api/definitions/:name", auditLogger, authMiddleware, updateDefinition)
  .delete(
    "/api/definitions/:name",
    auditLogger,
    authMiddleware,
    deleteDefinition
  )
  .get("/api/reports", getReports)
  .post("/api/report/:name", addReport)
  .delete("/api/report/:type/:name", deleteReport)
  .get("/api/changes", getChanges)
  .get("/api/affected", authMiddleware, getAffected)
  .post("/api/validate", auditLogger, validate)
  .get("/api/settings", getSettings)
  .put("/api/settings", auditLogger, updateSettings)
  .get("/api/logs", getLogs)
  .get("/api/analytics", getAnalytics)
  .post("/api/analytic", addAnalytic)
  .get("/api/addons", getAddons)
  .get("/api/entities", getEntities)
  .post("/api/entities",auditLogger,authMiddleware, addEntity)
  .put("/api/entity/:name",auditLogger,authMiddleware, updateEntity)
  .delete("/api/entity/:name",auditLogger,authMiddleware, deleteEntity);

export default router;
