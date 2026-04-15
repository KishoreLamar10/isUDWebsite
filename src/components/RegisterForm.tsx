'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, ShieldCheck, Loader2 } from 'lucide-react';
import Button from './ui/Button';

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    emailAddress: '',
    telephone: '',
    jobTitle: '',
    company: '',
    role: 'Project Architect/Design Team',
    reason: 'Just browsing / Interested in Universal Design',
    password: '',
    confirmPassword: '',
    securityQuestion: 'What was the name of your first pet?',
    securityAnswer: '',
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Something went wrong during registration");
      }

      // Success - Redirect to login with a message
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-primary tracking-tight">Create a New Free Account</h2>
        <p className="text-sm font-medium text-muted">
          to browse all 500 solutions, and select and save the ones you want in your project
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium rounded-r-md">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-8">
        
        {/* Row 1: First and Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted uppercase tracking-wider block">
              First Name<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:ring-2 focus:ring-secondary outline-none transition-all focus:border-secondary"
              required
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted uppercase tracking-wider block">
              Last Name<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:ring-2 focus:ring-secondary outline-none transition-all focus:border-secondary"
              required
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Row 2: Email and Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted uppercase tracking-wider block">
              E-mail Address<span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                name="emailAddress"
                placeholder="E-mail Address"
                className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:ring-2 focus:ring-secondary outline-none transition-all focus:border-secondary pr-10"
                required
                onChange={handleInputChange}
              />
              <Mail className="absolute right-3 top-3.5 text-slate-400" size={18} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted uppercase tracking-wider block">
              Telephone<span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                name="telephone"
                placeholder="(201) 555-5555"
                className="w-full border border-slate-300 rounded-sm px-10 py-3 text-sm focus:ring-2 focus:ring-secondary outline-none transition-all focus:border-secondary"
                required
                onChange={handleInputChange}
              />
              <Phone className="absolute left-3 top-3.5 text-slate-400" size={18} />
            </div>
          </div>
        </div>

        {/* Row 3: Job Title and Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted uppercase tracking-wider block">Job Title</label>
            <div className="relative">
              <input
                type="text"
                name="jobTitle"
                placeholder="Job Title"
                className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:ring-2 focus:ring-secondary outline-none transition-all focus:border-secondary"
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted uppercase tracking-wider block">Company</label>
            <div className="relative">
              <input
                type="text"
                name="company"
                placeholder="Name of your Organization"
                className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:ring-2 focus:ring-secondary outline-none transition-all focus:border-secondary"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Selection Fields */}
        <div className="space-y-6 pt-4 border-t border-slate-100">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted uppercase tracking-wider block leading-relaxed max-w-lg">
              Which of the following best describes your role on a Universal Design project?<span className="text-red-500 ml-1">*</span>
            </label>
            <select
              name="role"
              className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:ring-2 focus:ring-secondary outline-none transition-all bg-white"
              required
              onChange={handleInputChange}
            >
              <option>Project Architect/Design Team</option>
              <option>Consultant</option>
              <option>Real Estate Development</option>
              <option>Ownership/Management</option>
              <option>Human Resources</option>
              <option>Community Advocate</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted uppercase tracking-wider block leading-relaxed max-w-lg">
              What is your primary reason for creating an account today?<span className="text-red-500 ml-1">*</span>
            </label>
            <select
              name="reason"
              className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:ring-2 focus:ring-secondary outline-none transition-all bg-white"
              required
              onChange={handleInputChange}
            >
              <option>Just browsing / Interested in Universal Design</option>
              <option>Currently working on a Universal Design project</option>
              <option>Anticipating starting a Universal Design project in the next few months</option>
              <option>Anticipating starting a Universal Design project in the next few years</option>
              <option>Interested in benchmarking an existing building or past project</option>
            </select>
          </div>
        </div>

        {/* Security Fields */}
        <div className="space-y-6 pt-4 border-t border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted uppercase tracking-wider block">
                Password<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:ring-2 focus:ring-secondary outline-none transition-all focus:border-secondary"
                required
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted uppercase tracking-wider block">
                Confirm Password<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:ring-2 focus:ring-secondary outline-none transition-all focus:border-secondary"
                required
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted uppercase tracking-wider block">
                Security Question<span className="text-red-500 ml-1">*</span>
              </label>
              <select
                name="securityQuestion"
                className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:ring-2 focus:ring-secondary outline-none transition-all bg-white"
                required
                onChange={handleInputChange}
              >
                <option>What was the name of your first pet?</option>
                <option>What was the make of your first car?</option>
                <option>In what city or town did you live when you started high school?</option>
                <option>What is your mother’s birth year?</option>
                <option>What is your oldest sibling’s middle name?</option>
                <option>What was the name of your wedding first dance song?</option>
                <option>What was the first name of your first boyfriend/girlfriend?</option>
                <option>What was the last name of your first grade teacher?</option>
                <option>What was the first name of the boss at your first job?</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted uppercase tracking-wider block">
                Security Answer<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="securityAnswer"
                placeholder="Security Answer"
                className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:ring-2 focus:ring-secondary outline-none transition-all focus:border-secondary"
                required
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* reCAPTCHA Placeholder */}
        <div className="flex justify-center sm:justify-start">
          <div className="bg-[#f9f9f9] border border-[#d3d3d3] rounded px-4 py-4 flex items-center gap-4 w-[300px]">
             <div className="w-8 h-8 border-2 border-slate-300 rounded bg-white flex items-center justify-center">
                 <div className="w-1 h-3 border-r-2 border-b-2 border-green-600 rotate-45 transform -translate-y-1 ml-1 scale-125 opacity-0"></div>
             </div>
             <span className="text-[14px] font-medium text-[#444]">I'm not a robot</span>
             <div className="ml-auto flex flex-col items-center">
                <ShieldCheck size={28} className="text-primary" />
                <span className="text-[8px] text-muted font-bold leading-none uppercase pt-1">reCAPTCHA</span>
                <span className="text-[8px] text-muted font-bold leading-none py-1">Privacy • Terms</span>
             </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-8">
          <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            className="w-full sm:w-auto px-16 bg-[#002a54] hover:bg-[#001d3d] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
