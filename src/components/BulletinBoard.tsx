'use client';

import { useState } from 'react';
import { allCaravans } from '@/data/mockData';

interface Request {
  id: string;
  type: 'funding' | 'passport' | 'general';
  title: string;
  description: string;
  postedBy: string;
  postedAt: string;
  status: 'open' | 'in-progress' | 'closed';
}

// Sample requests data
const sampleRequests: Request[] = [
  {
    id: 'req-1',
    type: 'funding',
    title: 'Seed Funding for AI Healthcare Startup',
    description: 'Looking for $500K seed round for AI-powered diagnostics platform',
    postedBy: 'Sarah Chen',
    postedAt: '2025-12-15',
    status: 'open'
  },
  {
    id: 'req-2',
    type: 'passport',
    title: 'Emergency Passport Assistance',
    description: 'Need urgent help with passport renewal in Berlin',
    postedBy: 'Alex Kumar',
    postedAt: '2025-12-18',
    status: 'in-progress'
  },
  {
    id: 'req-3',
    type: 'general',
    title: 'Looking for Co-Founder with ML Experience',
    description: 'Seeking technical co-founder for climate tech startup',
    postedBy: 'Maria Rodriguez',
    postedAt: '2025-12-10',
    status: 'open'
  }
];

interface BulletinBoardProps {
  inline?: boolean;
}

export default function BulletinBoard({ inline = false }: BulletinBoardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'requests'>('events');

  // Categorize caravans by status
  const completedEvents = allCaravans.filter(c => c.status === 'completed');
  const currentEvents = allCaravans.filter(c => c.status === 'live');
  const futureEvents = allCaravans.filter(c => c.status === 'upcoming');

  // If inline mode, render only the content without wrapper
  if (inline) {
    return (
      <div className="flex flex-col" style={{ height: '202px' }}>
        {/* Tabs */}
        <div className="flex border-b border-[#3f3f46] bg-[#252526] flex-shrink-0">
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 px-2 py-2.5 text-[10px] uppercase tracking-wide font-semibold transition-colors ${
              activeTab === 'events'
                ? 'bg-[#1e1e1e] text-[#cccccc] border-b-2 border-[#F6FAF6]'
                : 'text-[#888888] hover:text-[#cccccc]'
            }`}
          >
            Events
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 px-2 py-2.5 text-[10px] uppercase tracking-wide font-semibold transition-colors ${
              activeTab === 'requests'
                ? 'bg-[#1e1e1e] text-[#cccccc] border-b-2 border-[#F6FAF6]'
                : 'text-[#888888] hover:text-[#cccccc]'
            }`}
          >
            Requests
          </button>
        </div>

        {/* Content */}
        {activeTab === 'events' ? (
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            {/* Current Events */}
            {currentEvents.length > 0 && (
              <div>
                <h4 className="text-xs uppercase tracking-wider text-green-400 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Current Events
                </h4>
                <div className="space-y-2">
                  {currentEvents.map(event => (
                    <div
                      key={event.id}
                      className="bg-[#252526] border border-green-500/30 rounded p-3 hover:border-green-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h5 className="text-sm font-semibold text-[#cccccc]">{event.name}</h5>
                        <span className="text-[10px] px-2 py-0.5 bg-green-500/20 text-green-400 rounded uppercase">
                          Live
                        </span>
                      </div>
                      <p className="text-xs text-[#888888] mb-2">{event.description}</p>
                      <div className="flex items-center justify-between text-[10px] text-[#6b6b6b]">
                        <span>{event.participants} participants</span>
                        {event.route && (
                          <span>{event.route.start.name} → {event.route.end.name}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Future Events */}
            {futureEvents.length > 0 && (
              <div>
                <h4 className="text-xs uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                  Upcoming Events
                </h4>
                <div className="space-y-2">
                  {futureEvents.map(event => (
                    <div
                      key={event.id}
                      className="bg-[#252526] border border-amber-500/30 rounded p-3 hover:border-amber-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h5 className="text-sm font-semibold text-[#cccccc]">{event.name}</h5>
                        <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded uppercase">
                          Soon
                        </span>
                      </div>
                      <p className="text-xs text-[#888888] mb-2">{event.description}</p>
                      <div className="flex items-center justify-between text-[10px] text-[#6b6b6b]">
                        <span>{event.participants} participants</span>
                        {event.route && (
                          <span>{event.route.start.name} → {event.route.end.name}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Events */}
            {completedEvents.length > 0 && (
              <div>
                <h4 className="text-xs uppercase tracking-wider text-[#6b6b6b] mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#6b6b6b] rounded-full"></span>
                  Completed Events
                </h4>
                <div className="space-y-2">
                  {completedEvents.map(event => (
                    <div
                      key={event.id}
                      className="bg-[#252526] border border-[#3f3f46] rounded p-3 hover:border-[#6b6b6b] transition-colors"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h5 className="text-sm font-semibold text-[#888888]">{event.name}</h5>
                        <span className="text-[10px] px-2 py-0.5 bg-[#3f3f46] text-[#888888] rounded uppercase">
                          Done
                        </span>
                      </div>
                      <p className="text-xs text-[#6b6b6b] mb-2">{event.description}</p>
                      <div className="flex items-center justify-between text-[10px] text-[#6b6b6b]">
                        <span>{event.participants} participants</span>
                        {event.route && (
                          <span>{event.route.start.name} → {event.route.end.name}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Requests Tab
          <div className="p-4 space-y-3 overflow-y-auto flex-1">
            {sampleRequests.map(request => (
              <div
                key={request.id}
                className="bg-[#252526] border border-[#3f3f46] rounded p-3 hover:border-[#6b6b6b] transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-2">
                    <span className="text-base">
                      {request.type === 'funding' ? '💰' : request.type === 'passport' ? '🛂' : '📢'}
                    </span>
                    <div className="flex-1">
                      <h5 className="text-sm font-semibold text-[#cccccc] mb-1">{request.title}</h5>
                      <p className="text-xs text-[#888888] mb-2">{request.description}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded uppercase whitespace-nowrap ml-2 ${
                    request.status === 'open' ? 'bg-green-500/20 text-green-400' :
                    request.status === 'in-progress' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-[#3f3f46] text-[#888888]'
                  }`}>
                    {request.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#6b6b6b] pt-2 border-t border-[#3f3f46]">
                  <span>Posted by {request.postedBy}</span>
                  <span>{new Date(request.postedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}

            {/* Add Request Button */}
            <button className="w-full py-2.5 px-4 bg-[#2b4539] hover:bg-[#3f6053] text-[#F6FAF6] text-center rounded font-semibold text-xs uppercase tracking-wide transition-all border border-[#3f6053]">
              + Post a Request
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed left-[336px] bottom-4 z-[9996]">
      {!isExpanded ? (
        // Collapsed State - Small Button
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-gradient-to-br from-[#2b4539] to-[#3f6053] text-white px-4 py-3 rounded-lg shadow-2xl border-2 border-[#F6FAF6]/30 hover:border-[#F6FAF6]/50 transition-all duration-300 flex items-center gap-2"
          style={{
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 2px rgba(246,250,246,0.1)'
          }}
        >
          <span className="text-xl">📋</span>
          <span className="text-sm font-serif uppercase tracking-wide">Bulletin Board</span>
        </button>
      ) : (
        // Expanded State - Full Board
        <div
          className="bg-[#1e1e1e] rounded-lg border-2 border-[#3f3f46] shadow-2xl overflow-hidden"
          style={{ width: '400px', maxHeight: '600px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#2d2d30] border-b border-[#3f3f46]">
            <div className="flex items-center gap-2">
              <span className="text-xl">📋</span>
              <h3 className="text-sm font-serif text-[#cccccc] uppercase tracking-wide">Bulletin Board</h3>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-[#cccccc] hover:text-white transition-colors text-xl leading-none"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#3f3f46] bg-[#252526]">
            <button
              onClick={() => setActiveTab('events')}
              className={`flex-1 px-4 py-2.5 text-xs uppercase tracking-wide font-semibold transition-colors ${
                activeTab === 'events'
                  ? 'bg-[#1e1e1e] text-[#cccccc] border-b-2 border-[#F6FAF6]'
                  : 'text-[#888888] hover:text-[#cccccc]'
              }`}
            >
              Events
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 px-4 py-2.5 text-xs uppercase tracking-wide font-semibold transition-colors ${
                activeTab === 'requests'
                  ? 'bg-[#1e1e1e] text-[#cccccc] border-b-2 border-[#F6FAF6]'
                  : 'text-[#888888] hover:text-[#cccccc]'
              }`}
            >
              Requests
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto" style={{ maxHeight: '500px' }}>
            {activeTab === 'events' ? (
              <div className="p-4 space-y-4">
                {/* Current Events */}
                {currentEvents.length > 0 && (
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-green-400 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      Current Events
                    </h4>
                    <div className="space-y-2">
                      {currentEvents.map(event => (
                        <div
                          key={event.id}
                          className="bg-[#252526] border border-green-500/30 rounded p-3 hover:border-green-500/50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-1">
                            <h5 className="text-sm font-semibold text-[#cccccc]">{event.name}</h5>
                            <span className="text-[10px] px-2 py-0.5 bg-green-500/20 text-green-400 rounded uppercase">
                              Live
                            </span>
                          </div>
                          <p className="text-xs text-[#888888] mb-2">{event.description}</p>
                          <div className="flex items-center justify-between text-[10px] text-[#6b6b6b]">
                            <span>{event.participants} participants</span>
                            {event.route && (
                              <span>{event.route.start.name} → {event.route.end.name}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Future Events */}
                {futureEvents.length > 0 && (
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                      Upcoming Events
                    </h4>
                    <div className="space-y-2">
                      {futureEvents.map(event => (
                        <div
                          key={event.id}
                          className="bg-[#252526] border border-amber-500/30 rounded p-3 hover:border-amber-500/50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-1">
                            <h5 className="text-sm font-semibold text-[#cccccc]">{event.name}</h5>
                            <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded uppercase">
                              Soon
                            </span>
                          </div>
                          <p className="text-xs text-[#888888] mb-2">{event.description}</p>
                          <div className="flex items-center justify-between text-[10px] text-[#6b6b6b]">
                            <span>{event.participants} participants</span>
                            {event.route && (
                              <span>{event.route.start.name} → {event.route.end.name}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed Events */}
                {completedEvents.length > 0 && (
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-[#6b6b6b] mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#6b6b6b] rounded-full"></span>
                      Completed Events
                    </h4>
                    <div className="space-y-2">
                      {completedEvents.map(event => (
                        <div
                          key={event.id}
                          className="bg-[#252526] border border-[#3f3f46] rounded p-3 hover:border-[#6b6b6b] transition-colors"
                        >
                          <div className="flex items-start justify-between mb-1">
                            <h5 className="text-sm font-semibold text-[#888888]">{event.name}</h5>
                            <span className="text-[10px] px-2 py-0.5 bg-[#3f3f46] text-[#888888] rounded uppercase">
                              Done
                            </span>
                          </div>
                          <p className="text-xs text-[#6b6b6b] mb-2">{event.description}</p>
                          <div className="flex items-center justify-between text-[10px] text-[#6b6b6b]">
                            <span>{event.participants} participants</span>
                            {event.route && (
                              <span>{event.route.start.name} → {event.route.end.name}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Requests Tab
              <div className="p-4 space-y-3">
                {sampleRequests.map(request => (
                  <div
                    key={request.id}
                    className="bg-[#252526] border border-[#3f3f46] rounded p-3 hover:border-[#6b6b6b] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-2">
                        <span className="text-base">
                          {request.type === 'funding' ? '💰' : request.type === 'passport' ? '🛂' : '📢'}
                        </span>
                        <div className="flex-1">
                          <h5 className="text-sm font-semibold text-[#cccccc] mb-1">{request.title}</h5>
                          <p className="text-xs text-[#888888] mb-2">{request.description}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded uppercase whitespace-nowrap ml-2 ${
                        request.status === 'open' ? 'bg-green-500/20 text-green-400' :
                        request.status === 'in-progress' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-[#3f3f46] text-[#888888]'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#6b6b6b] pt-2 border-t border-[#3f3f46]">
                      <span>Posted by {request.postedBy}</span>
                      <span>{new Date(request.postedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}

                {/* Add Request Button */}
                <button className="w-full py-2.5 px-4 bg-[#2b4539] hover:bg-[#3f6053] text-[#F6FAF6] text-center rounded font-semibold text-xs uppercase tracking-wide transition-all border border-[#3f6053]">
                  + Post a Request
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
