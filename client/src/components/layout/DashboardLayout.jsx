import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-light-bg-primary dark:bg-dark-bg-primary">
            <div className="print:hidden">
                <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            </div>

            <div className="lg:pl-72 print:pl-0">
                <div className="print:hidden">
                    <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                </div>

                <main className="p-6 print:p-0">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
