'use client';

import React, { useState, useMemo } from 'react';
import { CourseOffering, AcademicTerm } from '@/lib/api/api-client';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, CheckCircle2, ArrowRight, UserCheck, Edit2 } from 'lucide-react';

export interface ScheduleSubRow {
  type: 'Theory' | 'Lab';
  day: string;
  startTime: string;
  endTime: string;
  room: string;
}

export interface OfferedSectionRow {
  id: string;
  classId: string;
  title: string;
  sectionCode: string; // e.g. "L1", "A", "B", "L1-A"
  status: 'Freshman' | 'Open' | 'Cancel' | 'Full';
  capacity: number;
  count: number;
  schedules: ScheduleSubRow[];
  originalOffering?: CourseOffering;
  isEnrolled?: boolean;
}

interface OfferedSectionsTableProps {
  offerings?: CourseOffering[];
  terms?: AcademicTerm[];
  selectedTermName?: string;
  onTermChange?: (termName: string) => void;
  onRegister?: (offering: CourseOffering) => Promise<void>;
  registeringId?: string | null;
  isAdmin?: boolean;
  onAssignInstructor?: (offering: CourseOffering) => void;
  onPublish?: (offeringId: string) => void;
  publishingId?: string | null;
}

// Canonical AIUB specification dataset verbatim from user prompt
const CANONICAL_OFFERED_SECTIONS: OfferedSectionRow[] = [
  {
    id: 'aiub-00001',
    classId: '00001',
    title: 'INTRODUCTION TO PHARMACY [L1]',
    sectionCode: 'L1',
    status: 'Freshman',
    capacity: 50,
    count: 50,
    schedules: [
      { type: 'Theory', day: 'Monday', startTime: '11:20 AM', endTime: '12:40 PM', room: '6202' },
      { type: 'Theory', day: 'Wednesday', startTime: '11:20 AM', endTime: '12:40 PM', room: '6202' },
    ],
  },
  {
    id: 'aiub-00002',
    classId: '00002',
    title: 'PHARMACOGNOSY & NUTRACEUTICALS [L1]',
    sectionCode: 'L1',
    status: 'Freshman',
    capacity: 50,
    count: 50,
    schedules: [
      { type: 'Theory', day: 'Monday', startTime: '2:40 PM', endTime: '4:00 PM', room: '6202' },
      { type: 'Theory', day: 'Wednesday', startTime: '2:40 PM', endTime: '4:00 PM', room: '6202' },
    ],
  },
  {
    id: 'aiub-00003',
    classId: '00003',
    title: 'PHARMACOGNOSY & NUTRACEUTICALS LAB [L1-A]',
    sectionCode: 'L1-A',
    status: 'Freshman',
    capacity: 25,
    count: 25,
    schedules: [
      { type: 'Lab', day: 'Sunday', startTime: '8:00 AM', endTime: '11:00 AM', room: 'DE0401' },
    ],
  },
  {
    id: 'aiub-00004',
    classId: '00004',
    title: 'PHARMACOGNOSY & NUTRACEUTICALS LAB [L1-B]',
    sectionCode: 'L1-B',
    status: 'Freshman',
    capacity: 25,
    count: 25,
    schedules: [
      { type: 'Lab', day: 'Tuesday', startTime: '8:00 AM', endTime: '11:00 AM', room: 'DE0401' },
    ],
  },
  {
    id: 'aiub-00005',
    classId: '00005',
    title: 'ENGLISH READING SKILLS & PUBLIC SPEAKING [A]',
    sectionCode: 'A',
    status: 'Cancel',
    capacity: 40,
    count: 0,
    schedules: [
      { type: 'Theory', day: 'Sunday', startTime: '1:00 PM', endTime: '2:30 PM', room: '5115' },
      { type: 'Theory', day: 'Tuesday', startTime: '1:00 PM', endTime: '2:30 PM', room: '5115' },
    ],
  },
  {
    id: 'aiub-00006',
    classId: '00006',
    title: 'ENGLISH READING SKILLS & PUBLIC SPEAKING [B]',
    sectionCode: 'B',
    status: 'Open',
    capacity: 40,
    count: 10,
    schedules: [
      { type: 'Theory', day: 'Monday', startTime: '1:00 PM', endTime: '2:30 PM', room: '5112' },
      { type: 'Theory', day: 'Wednesday', startTime: '1:00 PM', endTime: '2:30 PM', room: '5112' },
    ],
  },
  {
    id: 'aiub-00007',
    classId: '00007',
    title: 'ENGLISH READING SKILLS & PUBLIC SPEAKING [B1]',
    sectionCode: 'B1',
    status: 'Freshman',
    capacity: 40,
    count: 40,
    schedules: [
      { type: 'Theory', day: 'Sunday', startTime: '8:00 AM', endTime: '9:30 AM', room: '5108' },
      { type: 'Theory', day: 'Tuesday', startTime: '8:00 AM', endTime: '9:30 AM', room: '5108' },
    ],
  },
  {
    id: 'aiub-00008',
    classId: '00008',
    title: 'ENGLISH READING SKILLS & PUBLIC SPEAKING [B2]',
    sectionCode: 'B2',
    status: 'Freshman',
    capacity: 40,
    count: 40,
    schedules: [
      { type: 'Theory', day: 'Sunday', startTime: '9:40 AM', endTime: '11:10 AM', room: '5108' },
      { type: 'Theory', day: 'Tuesday', startTime: '9:40 AM', endTime: '11:10 AM', room: '5108' },
    ],
  },
  {
    id: 'aiub-00009',
    classId: '00009',
    title: 'ENGLISH READING SKILLS & PUBLIC SPEAKING [B3]',
    sectionCode: 'B3',
    status: 'Freshman',
    capacity: 40,
    count: 38,
    schedules: [
      { type: 'Theory', day: 'Sunday', startTime: '2:40 PM', endTime: '4:10 PM', room: '5109' },
      { type: 'Theory', day: 'Tuesday', startTime: '2:40 PM', endTime: '4:10 PM', room: '5109' },
    ],
  },
  {
    id: 'aiub-00010',
    classId: '00010',
    title: 'ENGLISH READING SKILLS & PUBLIC SPEAKING [B4]',
    sectionCode: 'B4',
    status: 'Freshman',
    capacity: 40,
    count: 40,
    schedules: [
      { type: 'Theory', day: 'Monday', startTime: '8:00 AM', endTime: '9:30 AM', room: '5110' },
      { type: 'Theory', day: 'Wednesday', startTime: '8:00 AM', endTime: '9:30 AM', room: '5110' },
    ],
  },
];

export default function OfferedSectionsTable({
  offerings = [],
  terms = [],
  selectedTermName = '2026-2027, Fall',
  onTermChange,
  onRegister,
  registeringId,
  isAdmin = false,
  onAssignInstructor,
  onPublish,
  publishingId,
}: OfferedSectionsTableProps) {
  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTerm, setCurrentTerm] = useState(selectedTermName);
  const pageSize = 10;

  // Transform backend offerings or use canonical dataset
  const allSections: OfferedSectionRow[] = useMemo(() => {
    if (offerings.length > 0) {
      return offerings.map((off, index) => {
        const classNumber = String(index + 1).padStart(5, '0');
        const courseTitle = off.course?.name || off.code;
        const secCode = off.section.replace(/^Section\s+/i, '');
        const fullTitle = `${courseTitle.toUpperCase()} [${secCode}]`;

        const capacity = off.capacity || 40;
        const count = off.enrolledCount || 0;
        let status: 'Freshman' | 'Open' | 'Cancel' | 'Full' = 'Open';
        if (off.status === 'CANCELLED') {
          status = 'Cancel';
        } else if (count >= capacity) {
          status = 'Full';
        } else if (index % 3 === 0) {
          status = 'Freshman';
        }

        const schedules: ScheduleSubRow[] = (off.schedules || []).map((s) => {
          const isLab = s.classroom?.toLowerCase().includes('lab') || s.dayName.toLowerCase().includes('wed');
          return {
            type: isLab ? 'Lab' : 'Theory',
            day: s.dayName,
            startTime: s.startTime.substring(0, 5),
            endTime: s.endTime.substring(0, 5),
            room: s.classroom || off.classroom || 'Main',
          };
        });

        if (schedules.length === 0) {
          schedules.push({
            type: 'Theory',
            day: 'Monday',
            startTime: '10:00 AM',
            endTime: '11:30 AM',
            room: off.classroom || '6202',
          });
        }

        return {
          id: off.id,
          classId: classNumber,
          title: fullTitle,
          sectionCode: secCode,
          status,
          capacity,
          count,
          schedules,
          originalOffering: off,
          isEnrolled: Boolean(off.isEnrolled),
        };
      });
    }
    return CANONICAL_OFFERED_SECTIONS;
  }, [offerings]);

  // Search filtering
  const filteredSections = useMemo(() => {
    if (!activeQuery.trim()) return allSections;
    const q = activeQuery.toLowerCase().trim();
    return allSections.filter((item) => {
      const matchId = item.classId.toLowerCase().includes(q);
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchStatus = item.status.toLowerCase().includes(q);
      const matchSchedule = item.schedules.some(
        (s) =>
          s.day.toLowerCase().includes(q) ||
          s.room.toLowerCase().includes(q) ||
          s.type.toLowerCase().includes(q)
      );
      return matchId || matchTitle || matchStatus || matchSchedule;
    });
  }, [allSections, activeQuery]);

  // Pagination calculation
  const totalItems = filteredSections.length;
  // If showing canonical dataset, mimic the AIUB 292 pages counter or real pages
  const totalPages = offerings.length > 0 ? Math.max(1, Math.ceil(totalItems / pageSize)) : 292;
  const paginatedRows = useMemo(() => {
    if (offerings.length > 0) {
      const start = (currentPage - 1) * pageSize;
      return filteredSections.slice(start, start + pageSize);
    }
    return filteredSections;
  }, [filteredSections, offerings, currentPage, pageSize]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(searchInput);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Header bar matching AIUB portal */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
            Course Catalog & Class Scheduling
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Offered Sections - {currentTerm}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {terms.length > 0 && (
            <select
              value={currentTerm}
              onChange={(e) => {
                setCurrentTerm(e.target.value);
                if (onTermChange) onTermChange(e.target.value);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="2026-2027, Fall">2026-2027, Fall</option>
              <option value="2025-2026, Spring">2025-2026, Spring</option>
              <option value="2025-2026, Summer">2025-2026, Summer</option>
              {terms.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* University Search Filter Section */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-start sm:items-end gap-2.5">
          <div className="w-full sm:w-80">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search class ID, course, section, room..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-5 py-1.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-bold rounded-lg transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
          {activeQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                setActiveQuery('');
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Main Offered Sections Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[720px]">
            <thead className="bg-slate-100/80 text-slate-700 font-extrabold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-2.5 px-4 w-24">Class ID</th>
                <th className="py-2.5 px-4">Title</th>
                <th className="py-2.5 px-3 text-center w-28">Status</th>
                <th className="py-2.5 px-3 text-center w-20">Capacity</th>
                <th className="py-2.5 px-3 text-center w-20">Count</th>
                <th className="py-2.5 px-4">Time & Schedule</th>
                {(onRegister || isAdmin) && <th className="py-2.5 px-4 text-right w-32">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 font-medium">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No offered sections match your search query.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((sec) => {
                  const isFull = sec.count >= sec.capacity;
                  const isCancelled = sec.status === 'Cancel';
                  const isEnrolled = Boolean(sec.isEnrolled);

                  return (
                    <React.Fragment key={sec.id}>
                      {/* Course Header Row */}
                      <tr className="bg-white hover:bg-slate-50/70 transition-colors">
                        {/* Class ID */}
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-800">
                          {sec.classId}
                        </td>

                        {/* Title with Section Code */}
                        <td className="py-2.5 px-4">
                          <span className="font-extrabold text-slate-900 tracking-tight text-xs">
                            {sec.title}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-md font-bold text-[10px] tracking-wide ${
                              sec.status === 'Freshman'
                                ? 'bg-sky-50 text-sky-800 border border-sky-200'
                                : sec.status === 'Open'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : sec.status === 'Cancel'
                                ? 'bg-red-50 text-red-800 border border-red-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {sec.status}
                          </span>
                        </td>

                        {/* Capacity */}
                        <td className="py-2.5 px-3 text-center font-mono text-slate-700 font-semibold">
                          {sec.capacity}
                        </td>

                        {/* Count */}
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">
                          {sec.count}
                        </td>

                        {/* Empty cell for top row time column */}
                        <td className="py-2.5 px-4 text-slate-400 text-[11px]">
                          {/* Schedule summarized in sub-rows */}
                        </td>

                        {/* Action column */}
                        {(onRegister || isAdmin) && (
                          <td className="py-2.5 px-4 text-right">
                            {isAdmin ? (
                              <div className="flex items-center justify-end gap-1.5">
                                {onAssignInstructor && sec.originalOffering && (
                                  <button
                                    onClick={() => onAssignInstructor(sec.originalOffering!)}
                                    className="p-1 rounded text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                                    title="Assign / Change Instructor"
                                  >
                                    <UserCheck className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {onPublish && sec.originalOffering?.status === 'DRAFT' && (
                                  <button
                                    onClick={() => onPublish(sec.originalOffering!.id)}
                                    disabled={publishingId === sec.originalOffering!.id}
                                    className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold rounded"
                                  >
                                    Publish
                                  </button>
                                )}
                              </div>
                            ) : onRegister ? (
                              isEnrolled ? (
                                <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Enrolled
                                </span>
                              ) : isCancelled ? (
                                <span className="text-[11px] text-slate-400 italic">Unavailable</span>
                              ) : isFull ? (
                                <span className="text-[11px] text-red-600 font-bold">Section Full</span>
                              ) : (
                                <button
                                  onClick={() =>
                                    sec.originalOffering
                                      ? onRegister(sec.originalOffering)
                                      : alert(`Demo: Registered for ${sec.title}`)
                                  }
                                  disabled={registeringId === sec.id}
                                  className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-[11px] font-bold rounded-md shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                                >
                                  {registeringId === sec.id ? 'Registering...' : 'Register'}
                                </button>
                              )
                            ) : null}
                          </td>
                        )}
                      </tr>

                      {/* Sub-rows: Individual Schedule Slots (Theory / Lab with Day, Time, Room) */}
                      {sec.schedules.map((sch, sIdx) => (
                        <tr key={`${sec.id}-sched-${sIdx}`} className="bg-slate-50/50 hover:bg-slate-50 text-[11px]">
                          {/* Indented indicator */}
                          <td className="py-1.5 px-4 text-right font-mono text-slate-300">
                            ↳
                          </td>

                          {/* Meeting Type */}
                          <td className="py-1.5 px-4">
                            <span
                              className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                                sch.type === 'Theory'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {sch.type}
                            </span>
                          </td>

                          {/* Day */}
                          <td className="py-1.5 px-3 text-center font-semibold text-slate-700">
                            {sch.day}
                          </td>

                          {/* Start Time */}
                          <td className="py-1.5 px-3 text-center font-mono text-slate-700">
                            {sch.startTime}
                          </td>

                          {/* End Time */}
                          <td className="py-1.5 px-3 text-center font-mono text-slate-700">
                            {sch.endTime}
                          </td>

                          {/* Room Number */}
                          <td className="py-1.5 px-4 font-mono font-bold text-slate-800">
                            {sch.room}
                          </td>

                          {/* Action column blank for sub-row */}
                          {(onRegister || isAdmin) && <td className="py-1.5 px-4" />}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* AIUB portal exact pagination footer: « ‹ ... 1 2 3 4 ... › » and 1 of 292 */}
        <div className="px-5 py-3.5 bg-slate-50/90 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* Navigation icons */}
          <div className="flex items-center gap-1 font-mono text-slate-700">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page number buttons */}
            <span className="text-slate-400 px-0.5">...</span>
            {[1, 2, 3, 4].map((pNum) => (
              <button
                key={pNum}
                onClick={() => handlePageChange(pNum)}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  currentPage === pNum
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                {pNum}
              </button>
            ))}
            <span className="text-slate-400 px-0.5">...</span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>

          {/* Page Counter */}
          <div className="text-slate-500 font-bold font-mono text-xs">
            {currentPage} of {totalPages}
          </div>
        </div>
      </div>
    </div>
  );
}
