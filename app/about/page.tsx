import { Button } from "@/components/ui/button";
import {
  Heart,
  Target,
  Lightbulb,
  Shield,
  Rocket,
  Linkedin,
} from "lucide-react";
import Link from "next/link";

const teamMembers = [
  {
    name: "Ritesh Sakhare",
    role: "Full Stack Developer",
    avatar: "/avatars/ritesh.jpg", // Replace with your profile photo path
    linkedin: "https://www.linkedin.com/in/ritesh-sakhare-559342258/",
  },
  {
    name: "Samyak Raka",
    role: "Backend Developer",
    avatar: "/avatars/samyak.jpg", // Replace with Samyak's profile photo path
    linkedin: "https://www.linkedin.com/in/samyakraka/",
  },
  {
    name: "Vedant Deore",
    role: "Frontend Developer",
    avatar: "/avatars/vedant.jpg", // Replace with Vedant's profile photo path
    linkedin: "https://www.linkedin.com/in/vedantdeore/",
  },
  {
    name: "Anup Patil",
    role: "UI/UX Designer",
    avatar: "/avatars/anup.jpg", // Replace with Anup's profile photo path
    linkedin: "https://linkedin.com/in/anuppatil29",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-200 via-white to-pink-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-circle absolute top-32 left-[8%] w-40 h-40 bg-orange-300/15 rounded-full backdrop-blur-sm shadow-lg"></div>
        <div className="floating-circle-delayed absolute top-60 right-[12%] w-28 h-28 bg-pink-300/20 rounded-full backdrop-blur-sm shadow-lg"></div>
        <div className="floating-circle absolute bottom-40 left-[15%] w-24 h-24 bg-orange-200/25 rounded-full backdrop-blur-sm shadow-lg"></div>
        <div className="floating-circle-delayed absolute bottom-32 right-[20%] w-44 h-44 bg-white/30 rounded-full backdrop-blur-sm shadow-lg"></div>
        <div className="floating-circle absolute top-1/2 right-[5%] w-20 h-20 bg-pink-200/30 rounded-full backdrop-blur-sm shadow-lg"></div>
        <div className="floating-circle-delayed absolute top-2/3 left-[3%] w-32 h-32 bg-orange-100/35 rounded-full backdrop-blur-sm shadow-lg"></div>
      </div>

      {/* Header */}
      <header className="relative z-20 px-8 lg:px-16 py-8">
        <nav className="w-full flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl border border-white/50">
              <div className="w-7 h-7 border-2 border-white rounded-lg relative">
                <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-white rounded-full"></div>
                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-white rounded-full"></div>
                <div className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
              Stackit
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-orange-600 font-medium transition-colors text-lg"
            >
              Home
            </Link>
            <button className="text-gray-700 hover:text-orange-600 font-medium transition-colors text-lg">
              Community
            </button>
            <button className="text-gray-700 hover:text-orange-600 font-medium transition-colors text-lg">
              Questions
            </button>
            <Button className="bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 shadow-xl font-semibold">
              Get Started
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-8 lg:px-16 pt-16 pb-24">
        <div className="w-full text-center">
          <h1 className="text-6xl lg:text-8xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-orange-700 bg-clip-text text-transparent mb-8 tracking-tight">
            About Stackit
          </h1>
          <p className="text-2xl lg:text-3xl text-gray-700 mb-8 max-w-4xl mx-auto">
            Building bridges between curious minds and expert knowledge
          </p>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We believe that knowledge should be accessible, collaborative, and
            empowering for everyone.
          </p>
        </div>
      </section>

      {/* Our Mission */}
      <section className="relative z-10 px-8 lg:px-16 pb-24">
        <div className="w-full">
          <div className="glass-card-large">
            <div className="p-16 lg:p-24">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-8">
                    Our Mission
                  </h2>
                  <p className="text-xl text-gray-700 leading-relaxed mb-8">
                    To democratize knowledge sharing and create a world where
                    anyone can learn from anyone, regardless of background,
                    location, or experience level.
                  </p>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    We're building more than just a Q&A platform – we're
                    fostering a global community where curiosity is celebrated
                    and expertise is shared freely.
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className="w-48 h-48 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 shadow-2xl">
                    <Target className="h-24 w-24 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Timeline */}
      <section className="relative z-10 px-8 lg:px-16 pb-24">
        <div className="w-full">
          <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent text-center mb-16">
            Our Story
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="glass-card text-center">
              <div className="p-12">
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mb-4">
                  2020
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  The Beginning
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Started as a small project to help developers share knowledge
                  more effectively.
                </p>
              </div>
            </div>

            <div className="glass-card text-center">
              <div className="p-12">
                <div className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent mb-4">
                  2022
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  Growing Community
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Expanded beyond tech to include design, science, and creative
                  fields.
                </p>
              </div>
            </div>

            <div className="glass-card text-center">
              <div className="p-12">
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  2024
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  Global Impact
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Now serving millions of learners and experts across 150+
                  countries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Team */}
      <section className="relative z-10 px-8 lg:px-16 pb-24">
        <div className="w-full">
          <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent text-center mb-16">
            Meet Our Team
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="glass-card text-center group relative overflow-hidden"
              >
                <div className="p-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white group-hover:scale-110 transition-transform shadow-lg">
                    {member.avatar}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{member.role}</p>

                  {/* LinkedIn Button */}
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-110 shadow-lg"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="relative z-10 px-8 lg:px-16 pb-24">
        <div className="w-full">
          <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent text-center mb-16">
            Our Values
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="glass-card group">
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-lg">
                  <Heart className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  Empathy
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  We understand that everyone is on a learning journey, and we
                  treat each question with respect and care.
                </p>
              </div>
            </div>

            <div className="glass-card group">
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-lg">
                  <Lightbulb className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  Innovation
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  We constantly evolve our platform to make knowledge sharing
                  more intuitive and effective.
                </p>
              </div>
            </div>

            <div className="glass-card group">
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-lg">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Trust</h3>
                <p className="text-gray-600 leading-relaxed">
                  We maintain high standards for content quality and create a
                  safe space for learning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-8 lg:px-16 pb-24">
        <div className="w-full">
          <div className="glass-card-large text-center">
            <div className="p-16 lg:p-24">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Rocket className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-8">
                Join Our Mission
              </h2>
              <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
                Be part of a community that's changing how the world learns and
                grows together.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 px-12 py-6 text-xl font-bold shadow-2xl rounded-2xl"
                >
                  Start Contributing
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-orange-300 hover:bg-orange-50 px-12 py-6 text-xl font-bold bg-white/80 text-orange-600 backdrop-blur-md rounded-2xl shadow-lg"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
