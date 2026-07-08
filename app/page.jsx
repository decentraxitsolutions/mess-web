import React from 'react'
import Hero from '@/components/HeroComponents/Hero'
import Header from '@/components/HeaderComponents/Header'
import { checkUser } from '@/lib/checkUser'

const HomePage = async () => {
    const user = await checkUser();
    
    return (
        <div className="flex flex-col min-h-screen">
            <Header user={user} />
            <main className='flex-1'>
               <Hero userRole={user?.role} />
            </main>
        </div>
    )
}

export default HomePage
