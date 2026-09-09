import { Router, type IRouter } from "express";
import healthRouter from "./health";
import { authRouter } from "./auth";
import categoriesRouter from "./categories";
import medicinesRouter from "./medicines";
import suppliersRouter from "./suppliers";
import purchasesRouter from "./purchases";
import salesRouter from "./sales";
import customersRouter from "./customers";
import dashboardRouter from "./dashboard";
import rolesRouter from "./roles";
import saasRouter from "./saas";
import onboardingRouter from "./onboarding";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(categoriesRouter);
router.use(medicinesRouter);
router.use(suppliersRouter);
router.use(purchasesRouter);
router.use(salesRouter);
router.use(customersRouter);
router.use(dashboardRouter);
router.use(rolesRouter);
router.use(saasRouter);
router.use(onboardingRouter);

export default router;
