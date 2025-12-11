'use client';

import { Passport } from '@/types/guild';

interface PassportViewerProps {
  passport: Passport;
  memberName: string;
}

export default function PassportViewer({
  passport,
  memberName,
}: PassportViewerProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).toUpperCase();
  };

  const surname = memberName.split(' ').slice(1).join(' ') || memberName;
  const givenNames = memberName.split(' ')[0];

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Open Passport Book */}
      <div className="flex gap-1 shadow-2xl" style={{ perspective: '2000px' }}>
        {/* Left Cover Page */}
        <div
          className="w-1/2 aspect-[0.7/1] relative rounded-l-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1a4d7a 0%, #2d6a9f 50%, #1a4d7a 100%)',
            boxShadow: 'inset -5px 0 15px rgba(0,0,0,0.3)',
          }}
        >
          {/* Texture overlay */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px),
                  repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)
                `,
              }}
            ></div>
          </div>

          {/* Cover Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-white">
            <div className="text-6xl md:text-7xl mb-6">🏛️</div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-widest text-center mb-2">
              TELOS
            </h1>
            <h2 className="text-xl md:text-2xl font-bold tracking-widest text-center mb-6">
              GUILD
            </h2>
            <div className="h-px w-24 bg-white/30 mb-6"></div>
            <p className="text-sm md:text-base tracking-[0.3em] text-center text-blue-100">
              PASSPORT
            </p>
          </div>

          {/* Decorative border */}
          <div className="absolute inset-4 border-2 border-white/20 rounded-lg"></div>
        </div>

        {/* Right Data Page */}
        <div
          className="w-1/2 aspect-[0.7/1] relative rounded-r-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1e5a8e 0%, #4a90d9 50%, #1e5a8e 100%)',
            boxShadow: 'inset 5px 0 15px rgba(0,0,0,0.3)',
          }}
        >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 40px),
                repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 40px)
              `,
            }}
          ></div>
        </div>

        {/* Stars decoration */}
        <div className="absolute top-6 left-6 flex gap-4 text-white/30 text-4xl">
          <span>★</span>
          <span>★</span>
          <span>★</span>
        </div>

        {/* Header */}
        <div className="absolute top-6 left-0 right-0 text-center">
          <h1
            className="text-white text-2xl md:text-3xl font-bold tracking-widest"
            style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            TELOS GUILD
          </h1>
          <p className="text-blue-100 text-sm md:text-base mt-1 tracking-[0.3em]">
            ★ PASSPORT CARD ★
          </p>
        </div>

        {/* Main content */}
        <div className="absolute inset-0 flex items-center px-6 md:px-10 py-20 md:py-24">
          <div className="flex gap-4 md:gap-6 w-full">
            {/* Photo */}
            <div className="flex-shrink-0">
              <div
                className="w-24 h-32 md:w-32 md:h-40 bg-gradient-to-br from-gray-200 to-gray-300 border-3 border-white/80 flex items-center justify-center relative overflow-hidden"
                style={{
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10"></div>
                <span className="relative text-5xl md:text-6xl opacity-60">👤</span>
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 space-y-2 md:space-y-3 text-white">
              {/* Passport number and type */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-200 text-[10px] md:text-xs uppercase tracking-wider">
                    Passport Card No.
                  </p>
                  <p className="text-lg md:text-xl font-bold font-mono tracking-wider">
                    {passport.id}
                  </p>
                </div>
                <div className="text-right">
                  <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded border border-white/30">
                    <span className="text-xs font-semibold">★★★</span>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <p className="text-blue-200 text-[10px] md:text-xs uppercase tracking-wider">
                  Surname
                </p>
                <p className="text-lg md:text-xl font-bold uppercase tracking-wide">
                  {surname}
                </p>
              </div>

              <div>
                <p className="text-blue-200 text-[10px] md:text-xs uppercase tracking-wider">
                  Given Names
                </p>
                <p className="text-lg md:text-xl font-bold uppercase tracking-wide">
                  {givenNames}
                </p>
              </div>

              {/* Additional info */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <p className="text-blue-200 text-[10px] md:text-xs uppercase tracking-wider">
                    Nationality
                  </p>
                  <p className="text-xs md:text-sm font-semibold">TELOS GUILD</p>
                </div>
                <div>
                  <p className="text-blue-200 text-[10px] md:text-xs uppercase tracking-wider">
                    Guild Rank
                  </p>
                  <p className="text-xs md:text-sm font-semibold">{passport.rank || 'MEMBER'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <p className="text-blue-200 text-[10px] md:text-xs uppercase tracking-wider">
                    Date of Birth
                  </p>
                  <p className="text-xs md:text-sm font-semibold">01 JAN 1990</p>
                </div>
                <div>
                  <p className="text-blue-200 text-[10px] md:text-xs uppercase tracking-wider">
                    Sex
                  </p>
                  <p className="text-xs md:text-sm font-semibold">M</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <p className="text-blue-200 text-[10px] md:text-xs uppercase tracking-wider">
                    Issued On
                  </p>
                  <p className="text-xs md:text-sm font-semibold">
                    {formatDate(passport.issueDate)}
                  </p>
                </div>
                <div>
                  <p className="text-blue-200 text-[10px] md:text-xs uppercase tracking-wider">
                    Expires On
                  </p>
                  <p className="text-xs md:text-sm font-semibold">
                    {passport.expiryDate ? formatDate(passport.expiryDate) : 'LIFETIME'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-3 md:bottom-4 left-0 right-0 text-center">
          <p className="text-white/80 text-[10px] md:text-xs tracking-widest">
            TELOS GUILD DEPARTMENT OF MEMBERSHIP
          </p>
        </div>

        {/* Holographic effect overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%),
              radial-gradient(circle at 70% 70%, rgba(255,255,255,0.08) 0%, transparent 50%)
            `,
          }}
        ></div>
        </div>
      </div>
    </div>
  );
}
