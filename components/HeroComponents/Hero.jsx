"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const Hero = ({ userRole }) => {
  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-32 sm:pt-32 sm:pb-40">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-indigo-100 via-background to-background"></div>

      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-indigo-400 to-blue-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex justify-center"
          >
            <span className="rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-600/20">
              New: Modern Dashboard for Admins <span aria-hidden="true">&rarr;</span>
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl text-foreground"
          >
            Manage your <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">Mess Operations</span> seamlessly
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground"
          >
            The all-in-one platform to track meals, manage bills, and streamline communication for your hostel or PG mess. Experience a modern approach to dining management.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {userRole === 'SUPER_ADMIN' ? (
              <Link 
                href="/super-admin"
                className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8 h-14 text-base w-full sm:w-auto shadow-lg hover:shadow-xl transition-all")}
              >
                Go to Admin Console <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            ) : (
              <Link 
                href="/sign-up"
                className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8 h-14 text-base w-full sm:w-auto shadow-lg hover:shadow-xl transition-all")}
              >
                Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            )}
            <Link 
              href="/features"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full px-8 h-14 text-base w-full sm:w-auto border-2")}
            >
              Explore Features
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-muted-foreground font-medium"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-indigo-600" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-indigo-600" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-indigo-600" />
              <span>Cancel anytime</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
        <div className="relative left-[calc(50%+3rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-linear-to-tr from-blue-400 to-indigo-600 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
      </div>
    </section>
  );
};

export default Hero;
