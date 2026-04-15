'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Edit, Send, ClipboardCheck, Loader2 } from 'lucide-react';
import Button from './ui/Button';

interface ChapterScore {
  number: string;
  title: string;
  totalCredits: number;
  earned: number;
}

interface ProjectData {
  id: string;
  projectName: string;
  contactName: string;
  contactEmail: string;
  telephone: string;
  firmName?: string;
  ownerName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country: string;
  buildingArea?: string;
  siteArea?: string;
  certification: string;
  services: string[];
  status: string;
  score: number;
  facilityUses: { id: string; name: string }[];
  chapterScores: ChapterScore[];
  totalEarned: number;
  totalAvailable: number;
  bonus: number;
}

function CircleScore({ earned, total, size = 80 }: { earned: number; total: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? (earned / total) : 0;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e2e8f0" strokeWidth="4" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={progress > 0 ? '#002a54' : '#e2e8f0'}
          strokeWidth="4" fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute text-sm font-bold text-slate-800">{earned}/{total}</span>
    </div>
  );
}

export default function ProjectOverview() {
  const { id } = useParams();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProject(data);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchProject();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-32">
        <p className="text-slate-500">Project not found.</p>
        <Link href="/" className="text-secondary underline mt-4 inline-block">Back to My Projects</Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/" className="text-secondary font-bold hover:underline">My Projects</Link>
        <span className="text-slate-400">›</span>
        <span className="font-bold text-slate-800">Project Overview</span>
      </div>

      {/* Disclaimer */}
      <div className="bg-slate-50 border border-slate-200 rounded px-6 py-4 text-sm text-slate-600 leading-relaxed">
        The scores displayed are preliminary, based only on your isUD Checklist selections, subject to your interpretation.{' '}
        <Link href="/guide" className="text-secondary font-bold underline">Contact us</Link>{' '}
        to work with a Universal Design expert who can guide you through a project, and ensure your project contains all the necessary elements to earn isUD Certification.
      </div>

      {/* Project Title + Actions */}
      <div className="bg-white border border-slate-200 rounded-sm px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <h1 className="text-xl font-bold text-primary tracking-tight">{project.projectName}</h1>
        <div className="flex gap-3 flex-wrap">
          <Link href={`/projects/${id}/checklist`}>
            <Button variant="primary" className="gap-2 text-sm">
              <ClipboardCheck size={16} /> Edit Checklist
            </Button>
          </Link>
          <Link href={`/projects/${id}/edit`}>
            <Button variant="primary" className="gap-2 text-sm">
              <Edit size={16} /> Edit Profile
            </Button>
          </Link>
          <Button variant="primary" className="gap-2 text-sm bg-slate-700 hover:bg-slate-800">
            <Send size={16} /> Submit Project
          </Button>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-3 space-y-6">

          {/* Score */}
          <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-sm">
            <h2 className="text-lg font-bold text-primary mb-4">Score</h2>
            <div className="flex justify-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg width={128} height={128} className="-rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="#e2e8f0" strokeWidth="6" fill="none" />
                  <circle
                    cx="64" cy="64" r="56"
                    stroke="#002a54" strokeWidth="6" fill="none"
                    strokeDasharray={2 * Math.PI * 56}
                    strokeDashoffset={2 * Math.PI * 56 * (1 - (project.totalAvailable > 0 ? project.totalEarned / project.totalAvailable : 0))}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <span className="absolute text-3xl font-bold text-primary">{project.totalEarned}</span>
              </div>
            </div>
          </div>

          {/* Project Information */}
          <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-sm">
            <h2 className="text-lg font-bold text-primary mb-4">Project Information</h2>
            <div className="space-y-2 text-sm">
              <p><span className="font-bold text-slate-700">Title:</span> {project.projectName}</p>
              <p><span className="font-bold text-slate-700">Address:</span> {project.address1 || '—'}</p>
              <p className="text-secondary font-bold">City: <span className="text-slate-800 font-normal">{project.city || '—'}</span></p>
              <p className="text-secondary font-bold">State: <span className="text-slate-800 font-normal">{project.state || '—'}</span></p>
              <p><span className="font-bold text-slate-700">Country:</span> {project.country}</p>
              <p className="text-secondary font-bold">ZIP Code: <span className="text-slate-800 font-normal">{project.zip || '—'}</span></p>
              <p><span className="font-bold text-slate-700">Site Area:</span> {project.siteArea || '0'} acres</p>
              <p><span className="font-bold text-slate-700">Building Area:</span> {project.buildingArea || '0'} sq.ft.</p>
            </div>
            <div className="mt-4 flex justify-end">
              <Link href={`/projects/${id}/edit`} className="text-xs text-secondary flex items-center gap-1 hover:underline">
                <Edit size={12} /> Edit
              </Link>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-sm">
            <h2 className="text-lg font-bold text-primary mb-4">Contact Information</h2>
            <div className="space-y-2 text-sm">
              <p><span className="font-bold text-slate-700">Name:</span> {project.contactName}</p>
              <p><span className="font-bold text-slate-700">Email:</span> {project.contactEmail}</p>
              <p><span className="font-bold text-slate-700">Telephone:</span> {project.telephone}</p>
              <p><span className="font-bold text-slate-700">Project Owner:</span> {project.ownerName || '—'}</p>
              <p><span className="font-bold text-slate-700">Architect:</span> {project.firmName || '—'}</p>
            </div>
            <div className="mt-4 flex justify-end">
              <Link href={`/projects/${id}/edit`} className="text-xs text-secondary flex items-center gap-1 hover:underline">
                <Edit size={12} /> Edit
              </Link>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN */}
        <div className="lg:col-span-6 space-y-6">

          {/* Earned Credits Summary */}
          <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-primary">Earned Credits</h2>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center mb-8">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Earned</p>
                <p className="text-4xl font-bold text-primary">{project.totalEarned}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Available</p>
                <p className="text-4xl font-bold text-primary">{project.totalAvailable}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Bonus</p>
                <p className="text-4xl font-bold text-primary">{project.bonus}</p>
              </div>
            </div>

            {/* Earned Credits by Chapter */}
            <h3 className="text-md font-bold text-primary mb-6">Earned Credits by Chapter</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
              {project.chapterScores.map((ch) => (
                <div key={ch.number} className="flex flex-col items-center gap-2">
                  <CircleScore earned={ch.earned} total={ch.totalCredits} />
                  <p className="text-xs text-center text-slate-600 font-medium leading-tight">{ch.title}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Link href={`/projects/${id}/checklist`} className="text-xs text-secondary flex items-center gap-1 hover:underline">
                <Edit size={12} /> Edit
              </Link>
            </div>
          </div>

          {/* Preliminary Certification Progress */}
          <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-sm">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-primary">Preliminary Certification Progress</h2>
              <button className="text-2xl text-secondary font-bold leading-none">+</button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-3 space-y-6">

          {/* Potential Services Needed */}
          <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-sm">
            <h2 className="text-lg font-bold text-primary mb-4">Potential Services Needed</h2>
            <ul className="space-y-1 text-sm text-slate-700">
              {project.services.length > 0 ? (
                project.services.map((s) => (
                  <li key={s}>• {s}</li>
                ))
              ) : (
                <li className="text-slate-400 italic">No services selected</li>
              )}
            </ul>
          </div>

          {/* Certification */}
          <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-sm">
            <h2 className="text-lg font-bold text-primary mb-2">Certification: <span className="font-normal">{project.certification}</span></h2>
            <div className="mt-3 flex justify-end">
              <Link href={`/projects/${id}/edit`} className="text-xs text-secondary flex items-center gap-1 hover:underline">
                <Edit size={12} /> Edit
              </Link>
            </div>
          </div>

          {/* Contact our UD Team */}
          <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-sm">
            <h2 className="text-lg font-bold text-primary mb-3">Contact our UD Team</h2>
            <div className="space-y-1 text-sm text-slate-700">
              <p>Danise Levine, AIA</p>
              <p>drlevine@buffalo.edu, 1.716.829.5903</p>
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-sm">
            <h2 className="text-lg font-bold text-primary mb-3">Team Members</h2>
            <p className="text-sm text-slate-700">{project.contactName}</p>
            <div className="mt-4 flex justify-end gap-4">
              <button className="text-xs text-secondary flex items-center gap-1 hover:underline">
                <Edit size={12} /> Edit
              </button>
              <button className="text-xs text-secondary flex items-center gap-1 hover:underline">
                + Add Member
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
