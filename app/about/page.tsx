import { Linkedin } from "lucide-react";
import Link from "next/link";

const teamMembers = [
  {
    name: "Vedant Deore",
    role: "Developer",
    avatar:
      "https://media.licdn.com/dms/image/v2/D4D03AQGBczx7Az5SFA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1723009716220?e=1757548800&v=beta&t=BVh-tSj18WH0q1x5cxEpl53MpEZyZ3kpA74p5ebXZDA",
    linkedin: "https://www.linkedin.com/in/vedantdeore/",
  },
  {
    name: "Samyak Raka",
    role: "Developer",
    avatar:
      "https://media.licdn.com/dms/image/v2/D4D03AQHca2m6F2mP4g/profile-displayphoto-shrink_400_400/B4DZXI.qKKG8Ag-/0/1742833624815?e=1757548800&v=beta&t=arWNXIUZtvogXEdAxlmKhGD5nzXvS1vUovPhQQOOkkw",
    linkedin: "https://www.linkedin.com/in/samyakraka/",
  },
  {
    name: "Ritesh Sakhare",
    role: "Developer",
    avatar:
      "https://media.licdn.com/dms/image/v2/D4D03AQGEKYMNsIsKWA/profile-displayphoto-scale_400_400/B4DZexO9FeH4As-/0/1751025178602?e=1757548800&v=beta&t=14qugWTE1AzKwgmRVuOZ0fu9SsZ6RgwLxIqvIsrC5Qk",
    linkedin: "https://www.linkedin.com/in/ritesh-sakhare-559342258/",
  },
  {
    name: "Anup Patil",
    role: "Developer",
    avatar:
      "https://media.licdn.com/dms/image/v2/D4D03AQGMcJ-Hze7Nmg/profile-displayphoto-shrink_400_400/B4DZQYlZWkHcAg-/0/1735579245297?e=1757548800&v=beta&t=9zbxCUEtE6o9_NUxL2mPAJRIUBeq_HVsPkB8C71kaE0",
    linkedin: "https://linkedin.com/in/anuppatil29",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
        Meet the Team
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 max-w-6xl mx-auto">
        {teamMembers.map((member, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center bg-gray-50 p-6 rounded-xl shadow-md"
          >
            <img
              src={member.avatar}
              alt={member.name}
              className="w-32 h-32 rounded-full object-cover mb-4 border-2 border-gray-300 shadow"
            />
            <h2 className="text-xl font-semibold text-gray-800">
              {member.name}
            </h2>
            <p className="text-sm text-gray-500 mb-3">{member.role}</p>
            <a
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 transition"
            >
              <Linkedin className="w-6 h-6" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
