"use client"

import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">StackIt</span>
            </div>
            <p className="text-gray-600 text-sm">
              A community-driven Q&A platform for developers to ask questions, share knowledge, and grow together.
            </p>
          </div>

          {/* Community */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Community</h3>
            <div className="space-y-2">
              <Link href="/questions" className="block text-sm text-gray-600 hover:text-orange-600">
                Questions
              </Link>
              <Link href="/tags" className="block text-sm text-gray-600 hover:text-orange-600">
                Tags
              </Link>
              <Link href="/users" className="block text-sm text-gray-600 hover:text-orange-600">
                Users
              </Link>
              <Link href="/ask" className="block text-sm text-gray-600 hover:text-orange-600">
                Ask Question
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Support</h3>
            <div className="space-y-2">
              <Link href="/help" className="block text-sm text-gray-600 hover:text-orange-600">
                Help Center
              </Link>
              <Link href="/guidelines" className="block text-sm text-gray-600 hover:text-orange-600">
                Community Guidelines
              </Link>
              <Link href="/contact" className="block text-sm text-gray-600 hover:text-orange-600">
                Contact Us
              </Link>
              <Link href="/feedback" className="block text-sm text-gray-600 hover:text-orange-600">
                Feedback
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Legal</h3>
            <div className="space-y-2">
              <Link href="/privacy" className="block text-sm text-gray-600 hover:text-orange-600">
                Privacy Policy
              </Link>
              <Link href="/terms" className="block text-sm text-gray-600 hover:text-orange-600">
                Terms of Service
              </Link>
              <Link href="/cookies" className="block text-sm text-gray-600 hover:text-orange-600">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600">© 2024 StackIt. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-sm text-gray-600">Made with ❤️ for developers</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
