import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input, Select, TextArea } from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { memberAPI } from '../services/api';
import toast from 'react-hot-toast';

const EditMember = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        gender: '',
        dob: '',
        address: '',
        planName: '',
        planDuration: '',
        planAmount: '',
        startDate: '',
        status: 'ACTIVE',
        height: '',
        weight: '',
        workoutType: ''
    });

    const gymPlans = [
        { name: '1 Month', duration: 1, price: 2999 },
        { name: '2 Months', duration: 2, price: 5499 },
        { name: '3 Months', duration: 3, price: 8599 },
        { name: '4 Months', duration: 4, price: 9999 },
        { name: '5 Months', duration: 5, price: 12599 },
        { name: '6 Months', duration: 6, price: 14999 },
        { name: '8 Months', duration: 8, price: 21000 },
        { name: '10 Months', duration: 10, price: 25599 },
        { name: '12 Months', duration: 12, price: 28999 },
        { name: '15 Months', duration: 15, price: 34999 },
        { name: '18 Months', duration: 18, price: 39999 },
        { name: '24 Months', duration: 24, price: 55999 },
    ];

    useEffect(() => {
        fetchMemberDetails();
    }, [id]);

    const fetchMemberDetails = async () => {
        try {
            setFetching(true);
            const response = await memberAPI.getById(id);
            if (response.data.success && response.data.member) {
                const member = response.data.member;

                setFormData({
                    name: member.name || '',
                    email: member.email || '',
                    phone: member.phone || '',
                    gender: member.gender || '',
                    dob: member.dob ? member.dob.split('T')[0] : '',
                    address: member.address || '',
                    planName: member.plan?.name || '',
                    planDuration: member.plan?.duration || '',
                    planAmount: member.plan?.price || '',
                    startDate: member.planStartDate ? member.planStartDate.split('T')[0] : '',
                    status: member.status || 'ACTIVE',
                    height: member.height || '',
                    weight: member.weight || '',
                    workoutType: member.workoutType || ''
                });
            } else {
                toast.error('Member not found');
                navigate('/members');
            }
        } catch (error) {
            console.error('Error fetching member:', error);
            toast.error('Failed to load member details');
            navigate('/members');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'planName') {
            const selectedPlan = gymPlans.find(plan => plan.name === value);
            if (selectedPlan) {
                setFormData(prev => ({
                    ...prev,
                    [name]: value,
                    planAmount: selectedPlan.price.toString(),
                    planDuration: selectedPlan.duration.toString()
                }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.phone) {
            toast.error('Please fill in required fields');
            return;
        }

        try {
            setLoading(true);

            // Only send fields that match the Member schema
            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                gender: formData.gender?.toUpperCase(),
                dob: formData.dob ? new Date(formData.dob) : null,
                address: formData.address,
                status: formData.status?.toUpperCase(),
                height: formData.height,
                weight: formData.weight,
                workoutType: formData.workoutType
            };

            await memberAPI.update(id, payload);
            toast.success('Member updated successfully!');
            navigate('/members');
        } catch (error) {
            console.error('Error updating member:', error);
            toast.error('Failed to update member');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
                        Edit Member
                    </h1>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
                        Update member information for {formData.name}
                    </p>
                </div>
                <Button variant="outline" onClick={() => navigate('/members')}>
                    Back to List
                </Button>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-6">
                        Personal Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <Input
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <Input
                            label="Phone Number"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                        <Select
                            label="Gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            options={[
                                { value: 'MALE', label: 'Male' },
                                { value: 'FEMALE', label: 'Female' },
                                { value: 'OTHER', label: 'Other' }
                            ]}
                        />
                        <Input
                            label="Date of Birth"
                            name="dob"
                            type="date"
                            value={formData.dob}
                            onChange={handleChange}
                        />
                        <Select
                            label="Member Status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            options={[
                                { value: 'ACTIVE', label: 'Active' },
                                { value: 'EXPIRED', label: 'Expired' },
                                { value: 'PENDING', label: 'Pending' }
                            ]}
                        />
                        <div className="md:col-span-2">
                            <TextArea
                                label="Address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={3}
                            />
                        </div>
                    </div>

                    <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        Fitness Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Input
                            label="Height"
                            name="height"
                            value={formData.height}
                            onChange={handleChange}
                            placeholder="Optional"
                        />
                        <Input
                            label="Weight"
                            name="weight"
                            value={formData.weight}
                            onChange={handleChange}
                            placeholder="Optional"
                        />
                        <Select
                            label="Workout Type"
                            name="workoutType"
                            value={formData.workoutType}
                            onChange={handleChange}
                            options={[
                                { value: 'Cardio', label: 'Cardio' },
                                { value: 'Strength Training', label: 'Strength Training' },
                                { value: 'Crossfit', label: 'Crossfit' },
                                { value: 'Yoga', label: 'Yoga' },
                                { value: 'Zumba', label: 'Zumba' },
                                { value: 'Personal Training', label: 'Personal Training' }
                            ]}
                        />
                    </div>

                    <div className="mt-8 flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => navigate('/members')}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Update Member'}
                        </Button>
                    </div>
                </Card>
            </form>
        </div>
    );
};

export default EditMember;
