import React from 'react'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import Temp from '@/components/temp'

const Dashboard = async () => {
    const session = await auth.api.getSession({headers: await headers()})

    if (!session){
        redirect("/")
    }
  return (
    <div>
      <Temp />
      <p>Dashboard content goes here</p>
    </div>
  )
}

export default Dashboard