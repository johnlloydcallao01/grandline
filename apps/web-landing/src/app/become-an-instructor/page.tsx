"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function InstructorPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    linkedin: "",
    portfolio: "",
    expertise: "",
    experienceYears: "",
    qualifications: "",
    certifications: "",
    bio: "",
    teachingExperience: "",
    preferredTopics: "",
    availability: "Full-time",
    resumeName: "",
    agree: false,
  });

  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resumeInputKey, setResumeInputKey] = useState(0);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setResumeFile(file || null);
    setFormData((prev) => ({ ...prev, resumeName: file ? file.name : "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const apiBase =
        process.env.NEXT_PUBLIC_CMS_API_URL ||
        "https://cms.grandlinemaritime.com/api";
      const apiUrl = `${apiBase.replace(/\/$/, "")}/instructor-application`;

      const form = new FormData();
      form.set("fullName", formData.fullName);
      form.set("email", formData.email);
      form.set("phone", formData.phone);
      form.set("linkedin", formData.linkedin);
      form.set("portfolio", formData.portfolio);
      form.set("expertise", formData.expertise);
      form.set("experienceYears", formData.experienceYears);
      form.set("qualifications", formData.qualifications);
      form.set("certifications", formData.certifications);
      form.set("preferredTopics", formData.preferredTopics);
      form.set("availability", formData.availability);
      form.set("teachingExperience", formData.teachingExperience);
      form.set("bio", formData.bio);
      form.set("agree", String(formData.agree));
      if (resumeFile) {
        form.set("resume", resumeFile, resumeFile.name);
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        body: form,
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(
          data.message || "Thank you for applying! We'll get back to you soon."
        );
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          linkedin: "",
          portfolio: "",
          expertise: "",
          experienceYears: "",
          qualifications: "",
          certifications: "",
          bio: "",
          teachingExperience: "",
          preferredTopics: "",
          availability: "Full-time",
          resumeName: "",
          agree: false,
        });
        setResumeFile(null);
        setResumeInputKey((k) => k + 1);
      } else {
        setError(
          data.message || "Failed to submit application. Please try again."
        );
      }
    } catch (err) {
      console.error("Instructor application error:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen">
      <Header />

      <section className="pt-24 pb-16 bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="heading-primary text-4xl md:text-6xl mb-6">
              <span className="text-[#F5F5F5]">Become an</span> <span className="text-[#ab3b43]">Instructor</span>
            </h1>
            <p className="text-xl text-[#F5F5F5] max-w-3xl mx-auto">
              Share your expertise and help shape the next generation of maritime professionals.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="heading-secondary text-2xl font-bold text-gray-900 mb-6">Instructor Application</h2>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800">{successMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent placeholder:text-[#777]"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent placeholder:text-[#777]"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent placeholder:text-[#777]"
                      placeholder="+63 900 000 0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile</label>
                    <input
                      type="url"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent placeholder:text-[#777]"
                      placeholder="https://linkedin.com/in/your-profile"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio/Website</label>
                    <input
                      type="url"
                      name="portfolio"
                      value={formData.portfolio}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent placeholder:text-[#777]"
                      placeholder="https://your-portfolio.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Area of Expertise *</label>
                    <input
                      type="text"
                      name="expertise"
                      value={formData.expertise}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent placeholder:text-[#777]"
                      placeholder="e.g., Navigation, Safety, Engineering"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience *</label>
                    <input
                      type="number"
                      name="experienceYears"
                      value={formData.experienceYears}
                      onChange={handleChange}
                      required
                      min={0}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent placeholder:text-[#777]"
                      placeholder="e.g., 5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Availability *</label>
                    <select
                      name="availability"
                      value={formData.availability}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent placeholder:text-[#777]"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Qualifications *</label>
                    <textarea
                      name="qualifications"
                      value={formData.qualifications}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent placeholder:text-[#777]"
                      placeholder="Degrees, licenses, trainings"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
                    <textarea
                      name="certifications"
                      value={formData.certifications}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent"
                      placeholder="Relevant certificates"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Topics</label>
                    <input
                      type="text"
                      name="preferredTopics"
                      value={formData.preferredTopics}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent"
                      placeholder="e.g., Bridge Resource Management, STCW"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Resume/CV</label>
                    <div className="flex items-center gap-3">
                      <input
                        key={resumeInputKey}
                        type="file"
                        name="resume"
                        onChange={handleResumeChange}
                        accept=".pdf,.png,.jpg,.jpeg"
                        className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#201a7c] file:text-white hover:file:bg-[#1a1569]"
                      />
                      {formData.resumeName && (
                        <span className="text-sm text-gray-600">{formData.resumeName}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teaching Experience *</label>
                  <textarea
                    name="teachingExperience"
                    value={formData.teachingExperience}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent placeholder:text-[#777]"
                    placeholder="Describe your teaching background, methods, and achievements"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Professional Bio</label>
                   <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#201a7c] focus:border-transparent placeholder:text-[#777]"
                    placeholder="Short professional summary"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="agree"
                    checked={formData.agree}
                    onChange={handleChange}
                    required
                    className="h-4 w-4 text-[#201a7c] focus:ring-[#201a7c] border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    I confirm that the information provided is accurate and I agree to the platform guidelines.
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full py-4 text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </button>
              </form>
            </div>

            <div className="bg-gradient-to-br from-[#201a7c] to-[#ab3b43] rounded-2xl p-8 text-white shadow-lg">
              <div className="space-y-6">
                <div>
                  <div className="text-2xl font-bold mb-2">Why Teach With Grandline</div>
                  <p className="text-blue-100">Contribute to the development of future maritime professionals through structured, standards-based training supported by a modern learning platform and a professional teaching environment.</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-users"></i>
                    <span>Focused maritime learner base</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <i className="fas fa-chalkboard-teacher"></i>
                    <span>Structured LMS with practical training tools</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <i className="fas fa-award"></i>
                    <span>Professionally delivered courses aligned with industry standards</span>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="text-2xl font-bold mb-2">Application Tips</div>
                  <ul className="list-disc list-inside text-blue-100 space-y-2">
                    <li>Clearly outline your maritime experience, including sea-going roles or instructional background</li>
                    <li>Include relevant maritime certifications, licenses, and formal training credentials</li>
                    <li>Provide a concise professional summary that reflects your areas of expertise and teaching focus</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
