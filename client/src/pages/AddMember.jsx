import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Select, TextArea } from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { memberAPI } from '../services/api';
import toast from 'react-hot-toast';

const AddMember = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
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
        startDate: new Date().toISOString().split('T')[0],
        status: 'active',
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Auto-calculate plan amount based on selection
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

        // Basic Validation
        if (!formData.name || !formData.phone || !formData.planName) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);

            // Format data for API
            // Note: In a real app, you might calculate endDate here or let backend do it
            const payload = {
                ...formData,
                planDuration: parseInt(formData.planDuration),
                planAmount: parseFloat(formData.planAmount)
            };

            await memberAPI.create(payload);
            toast.success('Member added successfully!');
            navigate('/members');
        } catch (error) {
            console.error('Error adding member:', error);
            const message = error.response?.data?.message || 'Failed to add member';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
                        Add New Member
                    </h1>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
                        Register a new gym member
                    </p>
                </div>
                <Button variant="outline" onClick={() => navigate('/members')}>
                    Cancel
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
                            placeholder="John Doe"
                        />
                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                        />
                        <Input
                            label="Phone Number"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            placeholder="9876543210"
                        />
                        <Select
                            label="Gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            options={[
                                { value: 'Male', label: 'Male' },
                                { value: 'Female', label: 'Female' },
                                { value: 'Other', label: 'Other' }
                            ]}
                            placeholder="Select Gender"
                        />
                        <Input
                            label="Date of Birth"
                            name="dob"
                            type="date"
                            value={formData.dob}
                            onChange={handleChange}
                        />
                        <div className="md:col-span-2">
                            <TextArea
                                label="Address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Enter full address"
                            />
                        </div>
                    </div>

                    <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        Fitness Details (Optional)
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Input
                            label="Height (e.g. 5'11)"
                            name="height"
                            value={formData.height}
                            onChange={handleChange}
                            placeholder="Optional"
                        />
                        <Input
                            label="Weight (e.g. 75 kg)"
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
                            placeholder="Select Workout Type"
                        />
                    </div>

                    <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        Membership Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                            label="Membership Plan"
                            name="planName"
                            value={formData.planName}
                            onChange={handleChange}
                            required
                            options={gymPlans.map(plan => ({
                                value: plan.name,
                                label: plan.name
                            }))}
                            placeholder="Select Plan"
                        />
                        <Input
                            label="Duration (Months)"
                            name="planDuration"
                            type="number"
                            value={formData.planDuration}
                            onChange={handleChange}
                            disabled
                            placeholder="Auto-filled"
                        />
                        <Input
                            label="Plan Amount (₹)"
                            name="planAmount"
                            type="number"
                            value={formData.planAmount}
                            onChange={handleChange}
                            required
                            placeholder="0.00"
                        />
                        <Input
                            label="Start Date"
                            name="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={handleChange}
                            required
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
                            {loading ? 'Adding Member...' : 'Register Member'}
                        </Button>
                    </div>
                </Card>
            </form>
        </div>
    );
};

export default AddMember;
