'use client';

import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { ArrowRightIcon, DocumentIcon, UserGroupIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function HomePage() {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <DocumentIcon className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Dynamic Forms</span>
            </div>
            <div className="flex items-center space-x-4">
              {isSignedIn ? (
                <Link 
                  href="/dashboard" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <div className="space-x-2">
                  <Link 
                    href="/sign-in" 
                    className="text-gray-600 hover:text-gray-900 px-3 py-2"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/sign-up" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Create Dynamic Forms
            <span className="text-blue-600"> in Minutes</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Build flexible, scalable forms for KYC, loans, investments, and more. 
            With our visual form builder, drag-and-drop interface, and powerful validation engine.
          </p>
          
          <div className="flex justify-center space-x-4">
            <Link 
              href={isSignedIn ? "/dashboard" : "/sign-up"}
              className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Started
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              href="/forms" 
              className="inline-flex items-center bg-white text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-gray-300 hover:border-gray-400 transition-colors"
            >
              View Public Forms
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need for Dynamic Forms
          </h2>
          <p className="text-xl text-gray-600">
            Powerful features designed for financial services and beyond
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <DocumentIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Visual Form Builder
            </h3>
            <p className="text-gray-600">
              Drag-and-drop interface with 15+ field types including file uploads, 
              signatures, ratings, and complex validations.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <UserGroupIcon className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Role-Based Access
            </h3>
            <p className="text-gray-600">
              Separate admin and client portals with granular permissions. 
              Admins create forms, clients submit with draft capabilities.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Real-time Notifications
            </h3>
            <p className="text-gray-600">
              Instant email and in-app notifications powered by Celery. 
              Track submissions, approvals, and form analytics.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to streamline your forms?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join hundreds of organizations using our platform
            </p>
            <Link 
              href={isSignedIn ? "/dashboard" : "/sign-up"}
              className="inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Start Building Forms
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <DocumentIcon className="h-6 w-6" />
              <span className="ml-2 font-semibold">Dynamic Forms</span>
            </div>
            <p className="text-gray-400">
              © 2024 Dynamic Forms System. Built with Next.js and Django.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}