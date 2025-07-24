import { Button } from '@/components/ui/button'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const InfoPage: React.FC = () => {
  const navigate = useNavigate()

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleGoHome = () => {
    navigate('/') // Redirect to the home page
  }

  return (
    <div className="flex flex-col items-center justify-center   bg-gray-100 dark:bg-black">
      <h1 className="text-center text-6xl font-bold text-green-600">goodbee</h1>
      <h2 className="mt-4 text-2xl font-semibold">Database Editor</h2>
      <p className="mt-2 text-gray-600 dark:text-white">© 2025 My App. All rights reserved.</p>
      <p className="mt-2 text-gray-600 dark:text-white">https://www.oocak.com</p>
      <Button onClick={handleGoHome} className="mt-6">
        Go to Home
      </Button>
    </div>
  )
}

export default InfoPage
