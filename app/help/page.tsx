"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HelpCircle, MessageSquare, Award, Users, Search } from "lucide-react"
import Link from "next/link"

export default function HelpPage() {
  const faqs = [
    {
      question: "How do I ask a good question?",
      answer:
        "To ask a good question: 1) Search first to see if it's already been asked, 2) Be specific and clear in your title, 3) Provide context and what you've tried, 4) Include relevant code or error messages, 5) Use appropriate tags.",
    },
    {
      question: "How does the voting system work?",
      answer:
        "Users can upvote or downvote questions and answers. Each user can only vote once per post. Upvotes increase karma points, while downvotes decrease them. You need to be signed in to vote.",
    },
    {
      question: "What is karma and how do I earn it?",
      answer:
        "Karma represents your reputation in the community. You earn karma when: your questions/answers get upvoted (+1), your answer is accepted (+15), you receive badges. Karma helps establish trust and unlocks privileges.",
    },
    {
      question: "How do I accept an answer?",
      answer:
        "If you asked the question, you can accept the most helpful answer by clicking the checkmark icon next to it. This awards the answerer 15 karma points and marks your question as resolved.",
    },
    {
      question: "Can I edit my questions and answers?",
      answer:
        "Yes, you can edit your own questions and answers at any time. Look for the edit button on your posts. Editing helps improve clarity and add additional information.",
    },
    {
      question: "What are tags and how should I use them?",
      answer:
        "Tags help categorize your questions and make them discoverable. Use relevant, specific tags that describe your question's topic. You can add up to 5 tags per question.",
    },
    {
      question: "How do I bookmark questions?",
      answer:
        "Click the bookmark icon on any question to save it to your bookmarks. You can view all your bookmarked questions in your profile under the Bookmarks tab.",
    },
    {
      question: "What should I do if I see inappropriate content?",
      answer:
        "Use the flag button to report inappropriate content. Our moderation team will review flagged content and take appropriate action. Help keep our community safe and welcoming.",
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <HelpCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
        <p className="text-xl text-gray-600">Everything you need to know about using StackIt</p>
      </div>

      {/* Quick Start Guide */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Start Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <MessageSquare className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold mb-2">Ask Questions</h3>
              <p className="text-sm text-gray-600 mb-3">Get help from the community by asking detailed questions</p>
              <Link href="/ask">
                <Button size="sm" variant="outline">
                  Ask Now
                </Button>
              </Link>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Search className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold mb-2">Search & Browse</h3>
              <p className="text-sm text-gray-600 mb-3">Find existing questions and answers on various topics</p>
              <Link href="/questions">
                <Button size="sm" variant="outline">
                  Browse
                </Button>
              </Link>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="font-semibold mb-2">Earn Karma</h3>
              <p className="text-sm text-gray-600 mb-3">Build reputation by providing helpful answers</p>
              <Link href="/questions">
                <Button size="sm" variant="outline">
                  Answer
                </Button>
              </Link>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <h3 className="font-semibold mb-2">Join Community</h3>
              <p className="text-sm text-gray-600 mb-3">Connect with other developers and experts</p>
              <Link href="/users">
                <Button size="sm" variant="outline">
                  Explore
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Community Guidelines */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Community Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Badge variant="secondary" className="mt-1">
                1
              </Badge>
              <div>
                <h4 className="font-semibold">Be respectful and constructive</h4>
                <p className="text-sm text-gray-600">
                  Treat all community members with respect. Provide constructive feedback and avoid personal attacks.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Badge variant="secondary" className="mt-1">
                2
              </Badge>
              <div>
                <h4 className="font-semibold">Search before asking</h4>
                <p className="text-sm text-gray-600">
                  Check if your question has already been asked and answered to avoid duplicates.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Badge variant="secondary" className="mt-1">
                3
              </Badge>
              <div>
                <h4 className="font-semibold">Provide clear, detailed questions</h4>
                <p className="text-sm text-gray-600">
                  Include context, what you've tried, and specific details to help others understand your problem.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Badge variant="secondary" className="mt-1">
                4
              </Badge>
              <div>
                <h4 className="font-semibold">Accept helpful answers</h4>
                <p className="text-sm text-gray-600">
                  Mark the most helpful answer as accepted to help future visitors and reward contributors.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Badge variant="secondary" className="mt-1">
                5
              </Badge>
              <div>
                <h4 className="font-semibold">Help others when you can</h4>
                <p className="text-sm text-gray-600">
                  Share your knowledge by answering questions and contributing to the community.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-gray-600">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <div className="text-center mt-12">
        <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
        <p className="text-gray-600 mb-6">Can't find what you're looking for? Get in touch with our support team.</p>
        <div className="flex justify-center space-x-4">
          <Link href="/contact">
            <Button variant="outline">Contact Support</Button>
          </Link>
          <Link href="/feedback">
            <Button className="bg-orange-500 hover:bg-orange-600">Send Feedback</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
