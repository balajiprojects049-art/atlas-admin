const prisma = require('../config/db');

class MemberService {
    // Generate unique member ID (MEM-XXXX format)
    async generateMemberId() {
        const lastMember = await prisma.member.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { memberId: true },
        });

        if (!lastMember) {
            return 'MEM-0001';
        }

        const lastNumber = parseInt(lastMember.memberId.split('-')[1]);
        const newNumber = (lastNumber + 1).toString().padStart(4, '0');
        return `MEM-${newNumber}`;
    }

    // Create a new member
    async createMember(data) {
        const memberId = await this.generateMemberId();

        // Find Plan ID based on Name if not provided
        let planId = data.planId;
        let duration = data.planDuration; // Expecting number of months

        if (!planId && data.planName) {
            const plan = await prisma.plan.findFirst({
                where: { name: data.planName }
            });
            if (plan) {
                planId = plan.id;
                duration = plan.duration;
            }
        }

        // Calculate Plan Dates
        // Frontend sends 'startDate'
        const startDate = data.startDate ? new Date(data.startDate) : new Date();
        const endDate = new Date(startDate);
        if (duration) {
            endDate.setMonth(endDate.getMonth() + parseInt(duration));
        }

        // Validating and Formatting DOB
        let dob = null;
        if (data.dob && data.dob !== '') {
            dob = new Date(data.dob);
        }

        return await prisma.member.create({
            data: {
                memberId,
                name: data.name,
                email: data.email,
                phone: data.phone,
                gender: data.gender?.toUpperCase(),
                dob: dob,
                address: data.address,
                status: data.status?.toUpperCase() || 'ACTIVE',
                // Membership Details
                planId: planId,
                planStartDate: startDate,
                planEndDate: endDate,
            },
            include: {
                plan: true,
            },
        });
    }

    // Get all members with pagination and filters
    async getAllMembers({ page = 1, limit = 10, search = '', status = '' }) {
        const skip = (page - 1) * limit;

        const where = {
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } },
                    { memberId: { contains: search, mode: 'insensitive' } },
                ],
            }),
            ...(status && { status: status.toUpperCase() }),
        };

        const [members, total] = await Promise.all([
            prisma.member.findMany({
                where,
                include: {
                    plan: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.member.count({ where }),
        ]);

        return {
            members,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    // Get member by ID
    async getMemberById(id) {
        return await prisma.member.findUnique({
            where: { id },
            include: {
                plan: true,
                invoices: {
                    include: {
                        plan: true,
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
    }

    // Update member
    async updateMember(id, data) {
        if (data.gender) {
            data.gender = data.gender.toUpperCase();
        }
        if (data.status) {
            data.status = data.status.toUpperCase();
        }

        return await prisma.member.update({
            where: { id },
            data,
            include: {
                plan: true,
            },
        });
    }

    // Delete member
    async deleteMember(id) {
        return await prisma.member.delete({
            where: { id },
        });
    }

    // Get active members count
    async getActiveMembersCount() {
        return await prisma.member.count({
            where: { status: 'ACTIVE' },
        });
    }

    // Get members with expiring plans (within next 7 days)
    async getExpiringMembers() {
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        return await prisma.member.findMany({
            where: {
                planEndDate: {
                    lte: sevenDaysFromNow,
                    gte: new Date(),
                },
                status: 'ACTIVE',
            },
            include: {
                plan: true,
            },
        });
    }
}

module.exports = new MemberService();
