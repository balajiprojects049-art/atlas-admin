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

                if (member.photo) {
                    setPhotoPreview(`http://localhost:5000${member.photo}`);
                }
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

            const data = new FormData();

            // Map consistent fields for Backend
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('phone', formData.phone);
            data.append('gender', formData.gender?.toUpperCase() || '');
            data.append('address', formData.address || '');
            data.append('status', formData.status?.toUpperCase() || 'ACTIVE');
            data.append('height', formData.height || '');
            data.append('weight', formData.weight || '');
            data.append('workoutType', formData.workoutType || '');

            if (formData.dob) {
                data.append('dob', formData.dob);
            }

            if (photo) {
                data.append('photo', photo);
            }

            await memberAPI.update(id, data);
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
                                        <span className="text-xs text-gray-500 mt-2 block">Photo</span>
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
                                Change Photo
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
                                rows={2}
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
