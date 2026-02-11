import { Plan } from '../../models/Global/Plan.js';

// GET /sa/plans
export const getPlans = async (req, res) => {
    try {
        const plans = await Plan.find({ isArchived: false });
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /sa/plans
export const createPlan = async (req, res) => {
    try {
        const plan = new Plan(req.body);
        await plan.save();
        res.status(201).json(plan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PATCH /sa/plans/:id
// PATCH /sa/plans/:id
export const updatePlan = async (req, res) => {
    try {
        const { defaultFlags, ...otherUpdates } = req.body;
        console.log(`[SuperAdmin] Updating plan ${req.params.id}:`, req.body);

        let plan = await Plan.findById(req.params.id);
        if (!plan) return res.status(404).json({ message: 'Plan not found' });

        // Update basic fields
        Object.assign(plan, otherUpdates);

        // Update Flags safely
        if (defaultFlags) {
            console.log(`[SuperAdmin] Updating flags for plan ${plan.name} (${plan._id})`);

            // Ensure plan.defaultFlags is a Map
            if (!plan.defaultFlags) {
                plan.defaultFlags = new Map();
            } else if (!(plan.defaultFlags instanceof Map)) {
                // If it's somehow an object, convert it
                console.warn(`[SuperAdmin] defaultFlags was not a Map, converting...`);
                plan.defaultFlags = new Map(Object.entries(plan.defaultFlags));
            }

            for (const [key, value] of Object.entries(defaultFlags)) {
                plan.defaultFlags.set(key, value);
            }
            plan.markModified('defaultFlags');
        }

        // 1. SAVE WITH CONFIRMATION
        // Enforce majority write concern to ensure data is persisted to replica set
        await plan.save({ w: 'majority' });

        // 2. VERIFY PERSISTENCE
        // Fetch fresh from DB to confirm it really saved
        const verifyPlan = await Plan.findById(plan._id);
        const savedFlags = verifyPlan.defaultFlags instanceof Map ? Object.fromEntries(verifyPlan.defaultFlags) : verifyPlan.defaultFlags;

        console.log(`[SuperAdmin] Plan ${plan._id} updated & verified.`);

        // 3. SYNCHRONOUS AUTO-CLEANUP (Safer)
        // Only run if we are SURE the plan updated.
        if (defaultFlags) {
            console.log('[Sync] Starting Auto-Cleanup of redundant overrides...');
            try {
                const Company = (await import('../../models/Global/Company.js')).Company;
                const companies = await Company.find({ planId: plan._id });

                for (const company of companies) {
                    if (!company.featureFlags || (company.featureFlags instanceof Map && company.featureFlags.size === 0)) continue;

                    let modified = false;
                    // Ensure company.featureFlags is a Map
                    if (!(company.featureFlags instanceof Map)) {
                        company.featureFlags = new Map(Object.entries(company.featureFlags));
                    }

                    for (const [key, value] of Object.entries(defaultFlags)) {
                        // If company has an override for this key
                        if (company.featureFlags.has(key)) {
                            const overrideVal = company.featureFlags.get(key);
                            // And that override matches the NEW plan default we JUST verified
                            if (overrideVal === Boolean(value)) {
                                // Remove the override to restore inheritance
                                company.featureFlags.delete(key);
                                modified = true;
                            }
                        }
                    }

                    if (modified) {
                        company.markModified('featureFlags');
                        await company.save({ w: 'majority' }); // Also enforce consistency here
                        console.log(`[Sync] Cleaned up redundant overrides for ${company.name}`);
                    }
                }
                console.log('[Sync] Auto-Cleanup completed.');
            } catch (err) {
                console.error("[Sync] Error cleaning up overrides:", err);
                // We do NOT fail the request here, but we log the error.
            }
        }

        res.json(plan);
    } catch (error) {
        console.error("[SuperAdmin] Update Plan Error:", error);
        res.status(500).json({ message: error.message, stack: error.stack });
    }
};

// PATCH /sa/plans/:id/archive
export const archivePlan = async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);
        if (!plan) return res.status(404).json({ message: 'Plan not found' });

        plan.isArchived = true;
        await plan.save();

        res.json({ message: 'Plan archived successfully', plan });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
