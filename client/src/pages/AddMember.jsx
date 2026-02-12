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
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
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
        const { name, value, files } = e.target;

        if (name === 'photo' && files && files[0]) {
            const file = files[0];
            setPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
            return;
        }

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

            // Use FormData for file upload
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });

            if (photo) {
                data.append('photo', photo);
            }

            // Ensure numeric fields are correctly appended as numbers if needed, 
            // but FormData appends everything as strings, backend will parse.

            await memberAPI.create(data);
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
                    <div className="flex flex-col md:flex-row gap-8 mb-8">
                        {/* Profile Photo Upload */}
                        <div className="flex flex-col items-center space-y-4">
                            <div className="h-40 w-40 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800/50">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="text-center p-4">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-xs text-gray-500 mt-2 block">Upload Photo</span>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                name="photo"
                                onChange={handleChange}
                                accept="image/*"
                                className="hidden"
                                id="photo-upload"
                            />
                            <label
                                htmlFor="photo-upload"
                                className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                            >
                                {photo ? 'Change Photo' : 'Choose File'}
                            </label>
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                                rows={2}
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
