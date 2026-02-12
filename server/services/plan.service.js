const prisma = require('../config/db');

class PlanService {
    // Get all plans
    async getAllPlans() {
        return await prisma.plan.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' },
        });
    }

    // Get plan by ID
    async getPlanById(id) {
        return await prisma.plan.findUnique({
            where: { id },
        });
    }

    // Create a new plan (Optional, but good for completeness)
    async createPlan(data) {
        return await prisma.plan.create({
            data: {
                ...data,
                isActive: true
            }
        });
    }

    // Update plan
    async updatePlan(id, data) {
        return await prisma.plan.update({
            where: { id },
            data
        });
    }

    // Soft delete plan (set isActive false)
    async deletePlan(id) {
        return await prisma.plan.update({
            where: { id },
            data: { isActive: false }
        });
    }
}

module.exports = new PlanService();
