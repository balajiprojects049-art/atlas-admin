const prisma = require('../config/db');
const emailService = require('./email.service');

class MemberService {
    // Generate unique member ID (MEM-XXXX format)
    async generateMemberId() {
        const lastMember = await prisma.member.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { memberId: true },
        });

        if (!lastMember) {
            return 'AFE-001';
        }

        const parts = lastMember.memberId.split('-');
        const lastNumber = parseInt(parts[parts.length - 1]);
        const newNumber = (lastNumber + 1).toString().padStart(3, '0');
        return `AFE-${newNumber}`;
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
                // Only overwrite duration if NOT Custom Plan
                if (plan.name !== 'Custom Plan') {
                    duration = plan.duration;
                }
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

        const newMember = await prisma.member.create({
            data: {
                memberId,
                name: data.name,
                email: data.email,
                phone: data.phone,
                gender: data.gender?.toUpperCase(),
                dob: dob,
                address: data.address,
                status: data.status?.toUpperCase() || 'ACTIVE',
                height: data.height,
                weight: data.weight,
                workoutType: data.workoutType,
                photo: data.photo,
                // Membership Details
                planId: planId,
                planStartDate: startDate,
                planEndDate: endDate,
            },
            include: {
                plan: true,
            },
        });

        // Send Welcome Email
        console.log(`📧 Triggering welcome email for: ${newMember.email}`);
        try {
            await emailService.sendWelcomeEmail(newMember);
        } catch (err) {
            console.error('Email error:', err);
        }

        return newMember;
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
        const updateData = {};

        // Map fields that are allowed to be updated
        if (data.name) updateData.name = data.name;
        if (data.email) updateData.email = data.email;
        if (data.phone) updateData.phone = data.phone;
        if (data.gender) updateData.gender = data.gender.toUpperCase();
        if (data.address !== undefined) updateData.address = data.address;
        if (data.photo) updateData.photo = data.photo;
        if (data.height !== undefined) updateData.height = data.height;
        if (data.weight !== undefined) updateData.weight = data.weight;
        if (data.workoutType !== undefined) updateData.workoutType = data.workoutType;
        if (data.status) updateData.status = data.status.toUpperCase();

        // Handle date parsing
        if (data.dob) {
            updateData.dob = new Date(data.dob);
        } else if (data.dob === null || data.dob === '') {
            updateData.dob = null;
        }

        return await prisma.member.update({
            where: { id },
            data: updateData,
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
