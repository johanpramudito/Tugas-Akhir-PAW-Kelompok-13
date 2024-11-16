import { signIn } from 'next-auth/react'
import React from 'react'
import Button from './Button'

export default function Hero() {
  return (
    <section className="bg-gray-50">
  <div className="mx-auto max-w-screen-xl px-5 py-32 lg:flex">
    <div className="mx-auto max-w-xl text-center">
      <h1 className="text-3xl font-extrabold sm:text-5xl">
      Your Finances
        <strong className="font-extrabold text-green-600 sm:block"> in One Place </strong>
      </h1>

      <p className="mt-4 sm:text-xl/relaxed">
      Dive into reports, build budgets, and enjoy automatic categorization.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
      <Button 
            label="Get Started" 
            custom="block w-full rounded bg-green-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-green-800 focus:outline-none focus:ring active:bg-green-800 sm:w-auto" 
            onClick={() => signIn("google")} 
        />    
      </div>
    </div>
  </div>
  </section>
  )
}
