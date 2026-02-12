import React, { useState } from 'react';
import { Input, TextArea } from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const Settings = () => {
    const [gymSettings, setGymSettings] = useState({
        gymName: 'Power Fitness Gym',
        gstNumber: '29ABCDE1234F1Z5',
        address: '123 Gym Street, Fitness City, State - 560001',
        phone: '9876543210',
        email: 'info@powerfitness.com',
    });

    const [smtpSettings, setSmtpSettings] = useState({
        smtpHost: 'smtp.gmail.com',
        smtpPort: '587',
        smtpUser: '',
        smtpPass: '',
    });

    const [razorpaySettings, setRazorpaySettings] = useState({
        keyId: '',
        keySecret: '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [emailNotifications, setEmailNotifications] = useState(true);

    const handleSaveGymSettings = () => {
        toast.success('Gym settings saved successfully!');
    };

    const handleSaveSMTPSettings = () => {
        toast.success('SMTP settings saved successfully!');
    };

    const handleSaveRazorpaySettings = () => {
        toast.success('Razorpay settings saved successfully!');
    };

    const handleChangePassword = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            toast.error('Please fill all password fields');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        try {
            const response = await authAPI.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            if (response.data.success) {
                toast.success('Password changed successfully');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (error) {
            console.error('Change password error:', error);
            toast.error(error.response?.data?.message || 'Failed to change password');
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
                    Settings
                </h1>
                <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
                    Configure your gym and application settings
                </p>
            </div>

            {/* Gym Information */}
            <Card>
                <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                    Gym Information
                </h2>
                <div className="space-y-4">
                    <Input
                        label="Gym Name"
                        value={gymSettings.gymName}
                        onChange={(e) => setGymSettings({ ...gymSettings, gymName: e.target.value })}
                    />
                    <Input
                        label="GST Number"
                        value={gymSettings.gstNumber}
                        onChange={(e) => setGymSettings({ ...gymSettings, gstNumber: e.target.value })}
                    />
                    <TextArea
                        label="Address"
                        value={gymSettings.address}
                        onChange={(e) => setGymSettings({ ...gymSettings, address: e.target.value })}
                        rows={3}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Phone"
                            value={gymSettings.phone}
                            onChange={(e) => setGymSettings({ ...gymSettings, phone: e.target.value })}
                        />
                        <Input
                            label="Email"
                            type="email"
                            value={gymSettings.email}
                            onChange={(e) => setGymSettings({ ...gymSettings, email: e.target.value })}
                        />
                    </div>
                    <Button onClick={handleSaveGymSettings}>
                        Save Gym Settings
                    </Button>
                </div>
            </Card>

            {/* Email Notifications */}
            <Card>
                <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                    Email Notification Settings
                </h2>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="emailNotifications"
                            checked={emailNotifications}
                            onChange={(e) => setEmailNotifications(e.target.checked)}
                            className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
                        />
                        <label htmlFor="emailNotifications" className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                            Enable automatic email notifications (expiry reminders, payment due, overdue alerts)
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="SMTP Host"
                            value={smtpSettings.smtpHost}
                            onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpHost: e.target.value })}
                            placeholder="smtp.gmail.com"
                        />
                        <Input
                            label="SMTP Port"
                            value={smtpSettings.smtpPort}
                            onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpPort: e.target.value })}
                            placeholder="587"
                        />
                        <Input
                            label="SMTP User (Email)"
                            type="email"
                            value={smtpSettings.smtpUser}
                            onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpUser: e.target.value })}
                            placeholder="your-email@gmail.com"
                        />
                        <Input
                            label="SMTP Password"
                            type="password"
                            value={smtpSettings.smtpPass}
                            onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpPass: e.target.value })}
                            placeholder="••••••••"
                        />
                    </div>
                    <Button onClick={handleSaveSMTPSettings}>
                        Save SMTP Settings
                    </Button>
                </div>
            </Card>

            {/* Razorpay Settings */}
            <Card>
                <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                    Razorpay Payment Gateway
                </h2>
                <div className="space-y-4">
                    <Input
                        label="Razorpay Key ID"
                        value={razorpaySettings.keyId}
                        onChange={(e) => setRazorpaySettings({ ...razorpaySettings, keyId: e.target.value })}
                        placeholder="rzp_test_xxxxxxxxxxxxx"
                    />
                    <Input
                        label="Razorpay Key Secret"
                        type="password"
                        value={razorpaySettings.keySecret}
                        onChange={(e) => setRazorpaySettings({ ...razorpaySettings, keySecret: e.target.value })}
                        placeholder="••••••••"
                    />
                    <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
                        Get your API keys from <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Razorpay Dashboard</a>
                    </p>
                    <Button onClick={handleSaveRazorpaySettings}>
                        Save Razorpay Settings
                    </Button>
                </div>
            </Card>

            {/* Security Settings */}
            <Card>
                <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
                    Security Settings
                </h2>
                <div className="space-y-4">
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">
                        Change your admin password
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="Current Password"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            placeholder="Current Password"
                        />
                        <Input
                            label="New Password"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            placeholder="New Password"
                        />
                        <Input
                            label="Confirm New Password"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            placeholder="Confirm New Password"
                        />
                    </div>
                    <Button onClick={handleChangePassword} className="bg-red-600 hover:bg-red-700 text-white">
                        Change Password
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default Settings;
