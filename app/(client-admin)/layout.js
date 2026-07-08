import React from 'react'
import Header from '@/components/HeaderComponents/Header'
import { checkUser } from '@/lib/checkUser'
import { redirect } from 'next/navigation'

const ClientAdminLayout = async ({ children }) => {
    const user = await checkUser();


    if (user && user.role === 'CLIENT_ADMIN') {
        if (!user.ownedBusiness) {
            redirect('/business-profile');
        } else if (user.ownedBusiness.status === 'PENDING') {
            redirect('/pending-approval');
        }
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className='flex-1'>{children}</main>
        </div>
    )
}

export default ClientAdminLayout