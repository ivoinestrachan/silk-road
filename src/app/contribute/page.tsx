'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ContributeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectName = searchParams.get('project') || '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    project: projectName,
    contributionType: '',
    message: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    setFormData(prev => ({ ...prev, project: projectName }));
  }, [projectName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contribution form submitted:', formData);
    setIsSubmitted(true);

    setTimeout(() => {
      router.push('/map');
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-gradient-to-br from-[#2b4539] to-[#3f6053] p-8 rounded-lg border-2 border-[#F6FAF6]/30 text-center"
          style={{
            boxShadow: '0 12px 40px rgba(0,0,0,0.6), inset 0 2px 4px rgba(246,250,246,0.1)'
          }}
        >
          <div className="mb-6">
            <div className="w-20 h-20 bg-[#F6FAF6]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✓</span>
            </div>
            <h2 className="text-2xl font-serif text-[#F6FAF6] mb-2">Thank You!</h2>
            <p className="text-white/90 text-sm">
              Your contribution request has been submitted successfully.
            </p>
          </div>
          <p className="text-white/70 text-xs italic">
            Redirecting to map...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <img
              src="/telos-house-logo.png"
              alt="Telos House"
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-3xl font-serif text-white tracking-wide mb-2">
            Contribute to the Guild
          </h1>
          <p className="text-white/70 text-sm italic font-serif">
            "Every journey begins with a single step"
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#2b4539] to-[#3f6053] p-8 rounded-lg border-2 border-[#3f6053]/50"
          style={{
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.15)'
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {projectName && (
              <div className="bg-[#F6FAF6]/10 border border-[#F6FAF6]/30 rounded p-4 mb-6">
                <p className="text-xs text-[#F6FAF6]/70 uppercase tracking-wide mb-1">
                  Contributing to
                </p>
                <p className="text-white font-serif text-lg">{projectName}</p>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-serif text-[#F6FAF6] mb-2">
                Your Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#000000]/40 border border-[#F6FAF6]/30 rounded text-white placeholder-white/40 focus:outline-none focus:border-[#F6FAF6] transition-colors"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-serif text-[#F6FAF6] mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#000000]/40 border border-[#F6FAF6]/30 rounded text-white placeholder-white/40 focus:outline-none focus:border-[#F6FAF6] transition-colors"
                placeholder="your.email@example.com"
              />
            </div>

            {!projectName && (
              <div>
                <label htmlFor="project" className="block text-sm font-serif text-[#F6FAF6] mb-2">
                  Project/Initiative *
                </label>
                <input
                  type="text"
                  id="project"
                  name="project"
                  required
                  value={formData.project}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#000000]/40 border border-[#F6FAF6]/30 rounded text-white placeholder-white/40 focus:outline-none focus:border-[#F6FAF6] transition-colors"
                  placeholder="Which project would you like to contribute to?"
                />
              </div>
            )}

            <div>
              <label htmlFor="contributionType" className="block text-sm font-serif text-[#F6FAF6] mb-2">
                How would you like to contribute? *
              </label>
              <select
                id="contributionType"
                name="contributionType"
                required
                value={formData.contributionType}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#000000]/40 border border-[#F6FAF6]/30 rounded text-white focus:outline-none focus:border-[#F6FAF6] transition-colors"
              >
                <option value="">Select a contribution type</option>
                <option value="funding">Funding / Investment</option>
                <option value="technical">Technical Skills</option>
                <option value="design">Design / Creative</option>
                <option value="logistics">Logistics / Operations</option>
                <option value="community">Community Building</option>
                <option value="partnership">Partnership Opportunity</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-serif text-[#F6FAF6] mb-2">
                Tell us more about your contribution *
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#000000]/40 border border-[#F6FAF6]/30 rounded text-white placeholder-white/40 focus:outline-none focus:border-[#F6FAF6] transition-colors resize-none"
                placeholder="Please describe exactly how you would like to contribute, including any relevant experience, resources, or ideas..."
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/map')}
                className="flex-1 py-3 px-6 bg-transparent border-2 border-[#F6FAF6]/30 text-[#F6FAF6] rounded hover:bg-[#F6FAF6]/10 transition-all text-sm uppercase tracking-wide font-serif"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-6 bg-gradient-to-r from-[#F6FAF6] to-[#C4B89D] text-[#2b4539] rounded hover:shadow-lg transition-all text-sm uppercase tracking-wide font-serif font-semibold"
              >
                Submit Contribution
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-white/50 text-xs">
            All contributions are reviewed by the Telos Guild team
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ContributePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-white/70">Loading...</div>
      </div>
    }>
      <ContributeForm />
    </Suspense>
  );
}
