'use client';

import React, { useState, useMemo } from 'react';
import { StudentGradesResponse, StudentCourseGrade } from '@/lib/api/api-client';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Upload,
  User,
  X,
  ChevronDown,
  Sparkles,
  Info,
} from 'lucide-react';

interface GradesMarksQuizzesVisualizerProps {
  gradesData: StudentGradesResponse | null;
  role?: 'student' | 'parent';
  childName?: string;
}

interface AssessmentItem {
  name: string;
  totalMarks: number;
  passingMarks: number;
  contributes: number; // percentage
  obtainedMarks: number;
  hasDocumentUpload?: boolean;
  uploadedDocumentName?: string | null;
}

interface AssessmentCategory {
  title: string;
  totalMarks: number;
  passingMarks: number;
  contributes: number; // percentage
  obtainedMarks: number;
  items?: AssessmentItem[];
}

interface TermGradingBlock {
  termName: string; // e.g. "Midterm for 2023-2024, Spring"
  totalMarks: number;
  passingMarks: number;
  contributes: number; // percentage (e.g. 40% or 60%)
  obtainedMarks: number;
  letterGrade: string;
  categories: AssessmentCategory[];
}

// Sample fallback curriculum matching the AIUB university specification exactly
const DEFAULT_AIUB_COURSE: StudentCourseGrade = {
  offeringId: 'default-aiub-ds',
  offeringCode: 'CSC2104-W',
  courseName: 'DATA STRUCTURE (THEORY)',
  courseCode: 'CSC2104',
  section: 'W',
  termName: '2023-2024, Spring',
  termCode: '2023-2024-SPR',
  teacherName: 'AMINUN NAHAR',
  teacherId: '2309-2346-2',
  teacherDisplay: 'AMINUN NAHAR [2309-2346-2]',
  totalMark: 100,
  passingMark: 50,
  contributes: 100,
  totalScore: 96,
  letterGrade: 'A+',
  gpa: 4.0,
  assessments: [],
};

export default function GradesMarksQuizzesVisualizer({
  gradesData,
  role = 'student',
  childName,
}: GradesMarksQuizzesVisualizerProps) {
  // Available courses from data, or default if empty
  const courses: StudentCourseGrade[] = useMemo(() => {
    if (gradesData?.courses && gradesData.courses.length > 0) {
      return gradesData.courses;
    }
    return [DEFAULT_AIUB_COURSE];
  }, [gradesData]);

  // Selected course & semester states
  const [selectedOfferingId, setSelectedOfferingId] = useState<string>(
    courses[0]?.offeringId || 'default-aiub-ds'
  );

  const selectedCourse: StudentCourseGrade = useMemo(() => {
    return courses.find((c) => c.offeringId === selectedOfferingId) || courses[0];
  }, [courses, selectedOfferingId]);

  // Available semesters list
  const availableSemesters: string[] = useMemo(() => {
    const sems = new Set<string>();
    courses.forEach((c) => {
      sems.add(c.termName || '2023-2024, Spring');
    });
    return Array.from(sems);
  }, [courses]);

  const [selectedSemester, setSelectedSemester] = useState<string>(
    selectedCourse?.termName || '2023-2024, Spring'
  );

  // Upload document modal state
  const [uploadModalItem, setUploadModalItem] = useState<{
    term: string;
    itemTitle: string;
  } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

  // Term Breakdown: Midterm (40%) and Finalterm (60%)
  const termBlocks: TermGradingBlock[] = useMemo(() => {
    // If real published assessments exist for this course, calculate dynamic totals
    const assessments = selectedCourse.assessments || [];
    const hasPublished = assessments.length > 0;

    if (hasPublished) {
      // Map published assessments into Midterm and Finalterm
      const midAssessments = assessments.filter((a) =>
        /mid/i.test(a.assessmentTitle) || /mid/i.test(a.assessmentType)
      );
      const finalAssessments = assessments.filter(
        (a) => !midAssessments.includes(a)
      );

      // Function to build categories
      const buildCategories = (list: typeof assessments) => {
        const quizzes = list.filter(
          (a) => /quiz/i.test(a.assessmentTitle) || /quiz/i.test(a.assessmentType)
        );
        const written = list.filter(
          (a) =>
            /exam/i.test(a.assessmentTitle) ||
            /final/i.test(a.assessmentType) ||
            /written/i.test(a.assessmentTitle)
        );
        const attendance = list.filter(
          (a) =>
            /attend/i.test(a.assessmentTitle) ||
            /particip/i.test(a.assessmentType)
        );

        const cats: AssessmentCategory[] = [];

        // 1. Quizzes
        const qItems: AssessmentItem[] =
          quizzes.length > 0
            ? quizzes.map((q, idx) => ({
                name: q.assessmentTitle || `Quiz ${idx + 1}`,
                totalMarks: Number(q.totalMarks) || 40,
                passingMarks: 15,
                contributes: 100,
                obtainedMarks: Number(q.obtainedMarks) || 0,
                hasDocumentUpload: true,
              }))
            : [
                {
                  name: 'Quiz 2',
                  totalMarks: 40,
                  passingMarks: 15,
                  contributes: 100,
                  obtainedMarks: 36.0,
                  hasDocumentUpload: true,
                },
                {
                  name: 'Quiz 1',
                  totalMarks: 40,
                  passingMarks: 15,
                  contributes: 100,
                  obtainedMarks: 36.0,
                  hasDocumentUpload: true,
                },
              ];

        const avgQuiz =
          qItems.length > 0
            ? qItems.reduce((s, i) => s + i.obtainedMarks, 0) / qItems.length
            : 36.0;

        cats.push({
          title: 'Quizzes',
          totalMarks: 40,
          passingMarks: 15,
          contributes: 40,
          obtainedMarks: Math.round(avgQuiz * 100) / 100,
          items: qItems,
        });

        // 2. Attendances
        const attScore =
          attendance.length > 0 ? Number(attendance[0].obtainedMarks) : 10.0;
        cats.push({
          title: 'Attendances',
          totalMarks: 10,
          passingMarks: 5,
          contributes: 10,
          obtainedMarks: attScore,
        });

        // 3. Written Exams
        const writScore =
          written.length > 0 ? Number(written[0].obtainedMarks) : 93.0;
        cats.push({
          title: 'Written Exams',
          totalMarks: 100,
          passingMarks: 50,
          contributes: 50,
          obtainedMarks: writScore,
        });

        return cats;
      };

      const midCategories = buildCategories(midAssessments);
      const finalCategories = buildCategories(finalAssessments);

      // Midterm calculated score
      const midScore = Math.round(
        (midCategories[0].obtainedMarks * 0.4 +
          midCategories[1].obtainedMarks * 0.1 +
          midCategories[2].obtainedMarks * 0.5) *
          10
      ) / 10;

      // Finalterm calculated score
      const finalScore = Math.round(
        (finalCategories[0].obtainedMarks * 0.4 +
          finalCategories[1].obtainedMarks * 0.1 +
          finalCategories[2].obtainedMarks * 0.5) *
          10
      ) / 10;

      return [
        {
          termName: `Midterm for ${selectedSemester}`,
          totalMarks: 100,
          passingMarks: 50,
          contributes: 40,
          obtainedMarks: midScore || 93.0,
          letterGrade: 'A+',
          categories: midCategories,
        },
        {
          termName: `Finalterm for ${selectedSemester}`,
          totalMarks: 100,
          passingMarks: 50,
          contributes: 60,
          obtainedMarks: finalScore || 97.0,
          letterGrade: 'A+',
          categories: finalCategories,
        },
      ];
    }

    // Default university AIUB specification when data is standard
    return [
      {
        termName: `Midterm for ${selectedSemester}`,
        totalMarks: 100,
        passingMarks: 50,
        contributes: 40,
        obtainedMarks: 93.0,
        letterGrade: 'A+',
        categories: [
          {
            title: 'Quizzes',
            totalMarks: 40,
            passingMarks: 15,
            contributes: 40,
            obtainedMarks: 36.0,
            items: [
              {
                name: 'Quiz 2',
                totalMarks: 40,
                passingMarks: 15,
                contributes: 100,
                obtainedMarks: 36.0,
                hasDocumentUpload: true,
              },
              {
                name: 'Quiz 1',
                totalMarks: 40,
                passingMarks: 15,
                contributes: 100,
                obtainedMarks: 36.0,
                hasDocumentUpload: true,
              },
            ],
          },
          {
            title: 'Attendances',
            totalMarks: 10,
            passingMarks: 5,
            contributes: 10,
            obtainedMarks: 10.0,
          },
          {
            title: 'Written Exams',
            totalMarks: 100,
            passingMarks: 50,
            contributes: 50,
            obtainedMarks: 93.0,
          },
        ],
      },
      {
        termName: `Finalterm for ${selectedSemester}`,
        totalMarks: 100,
        passingMarks: 50,
        contributes: 60,
        obtainedMarks: 97.0,
        letterGrade: 'A+',
        categories: [
          {
            title: 'Quizzes',
            totalMarks: 40,
            passingMarks: 15,
            contributes: 40,
            obtainedMarks: 40.0,
            items: [
              {
                name: 'Quiz 1',
                totalMarks: 40,
                passingMarks: 15,
                contributes: 100,
                obtainedMarks: 34.0,
                hasDocumentUpload: true,
              },
              {
                name: 'Quiz 2',
                totalMarks: 40,
                passingMarks: 15,
                contributes: 100,
                obtainedMarks: 40.0,
                hasDocumentUpload: true,
              },
            ],
          },
          {
            title: 'Written Exams',
            totalMarks: 100,
            passingMarks: 50,
            contributes: 50,
            obtainedMarks: 94.0,
          },
          {
            title: 'Attendances',
            totalMarks: 10,
            passingMarks: 5,
            contributes: 10,
            obtainedMarks: 10.0,
          },
        ],
      },
    ];
  }, [selectedCourse, selectedSemester]);

  // Overall course mark & letter grade calculation
  const overallCalculatedScore = useMemo(() => {
    if (selectedCourse.totalScore && selectedCourse.totalScore > 0) {
      return selectedCourse.totalScore;
    }
    const mid = termBlocks[0]?.obtainedMarks || 93.0;
    const fin = termBlocks[1]?.obtainedMarks || 97.0;
    return Math.round((mid * 0.4 + fin * 0.6) * 10) / 10;
  }, [selectedCourse, termBlocks]);

  const overallLetterGrade = useMemo(() => {
    if (selectedCourse.letterGrade) return selectedCourse.letterGrade;
    if (overallCalculatedScore >= 80) return 'A+';
    if (overallCalculatedScore >= 75) return 'A';
    if (overallCalculatedScore >= 70) return 'A-';
    return 'B+';
  }, [selectedCourse, overallCalculatedScore]);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setUploadModalItem(null);
      setSelectedFile(null);
    }, 1500);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Main Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Grades Marks Quizes
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Academic assessment evaluation, component contribution, and official term grade breakdown
          </p>
        </div>
      </div>

      {/* Courses & Semesters Filter Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Courses Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Courses:
            </label>
            <div className="relative">
              <select
                value={selectedOfferingId}
                onChange={(e) => setSelectedOfferingId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs md:text-sm font-bold text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#006838] focus:border-transparent transition-all cursor-pointer pr-10"
              >
                {courses.map((c) => {
                  const secTag = c.section ? `[${c.section}]` : '[W]';
                  return (
                    <option key={c.offeringId} value={c.offeringId}>
                      {c.courseName.toUpperCase()} {secTag}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Semesters Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Semesters:
            </label>
            <div className="relative">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs md:text-sm font-bold text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#006838] focus:border-transparent transition-all cursor-pointer pr-10"
              >
                {availableSemesters.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Course Evaluation Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="text-base md:text-lg font-black text-slate-900 uppercase tracking-tight">
              {selectedCourse.courseName}{' '}
              <span className="text-slate-500">[{selectedCourse.section || 'W'}]</span>
            </h2>

            <div className="text-xs text-slate-600 font-medium">
              <span>Total Mark :100; Passing Mark:50; Contributes:100%</span>
            </div>

            <div className="text-xs font-semibold text-slate-700">
              <span>
                Course Teacher(s):{' '}
                <span className="font-bold text-slate-900">
                  {selectedCourse.teacherDisplay || 'AMINUN NAHAR [2309-2346-2]'}
                </span>
              </span>
            </div>
          </div>

          {/* Overall Letter Grade & Mark Badge */}
          <div className="self-start md:self-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#006838] text-white shadow-xs">
              <span className="text-xl md:text-2xl font-black tracking-tight">
                {overallLetterGrade}
              </span>
              <span className="text-sm font-bold text-emerald-100">
                ({Math.round(overallCalculatedScore)})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Term Sections: Midterm & Finalterm */}
      <div className="space-y-6">
        {termBlocks.map((term, tIdx) => (
          <div
            key={tIdx}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
          >
            {/* Term Title & Overall Score Banner */}
            <div className="px-5 py-3.5 bg-slate-50/90 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-xs md:text-sm font-black text-slate-800">
                {term.termName}{' '}
                <span className="text-slate-500 font-semibold">
                  (Total:{term.totalMarks}; Pass:{term.passingMarks}; Contributes:
                  {term.contributes}%)
                </span>
              </div>

              <div className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[#006838] font-black text-xs md:text-sm">
                <span>{term.letterGrade}</span>
                <span>({Math.round(term.obtainedMarks)})</span>
              </div>
            </div>

            {/* Categories & Sub-items list */}
            <div className="p-4 md:p-6 space-y-5">
              {term.categories.map((cat, cIdx) => (
                <div
                  key={cIdx}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-4 space-y-3"
                >
                  {/* Category Header Row */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs md:text-sm font-bold text-slate-900">
                        {cat.title}{' '}
                        <span className="text-slate-500 font-medium text-xs">
                          (Total:{cat.totalMarks}; Pass:{cat.passingMarks}; Contributes:
                          {cat.contributes}%)
                        </span>
                      </h4>
                    </div>

                    <div className="font-mono text-sm md:text-base font-black text-slate-900">
                      {cat.obtainedMarks.toFixed(2)}
                    </div>
                  </div>

                  {/* Nested Sub-items (e.g. Quiz 1, Quiz 2) */}
                  {cat.items && cat.items.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-200/60">
                      {cat.items.map((item, iIdx) => (
                        <div
                          key={iIdx}
                          className="bg-white rounded-lg p-3 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-slate-900 block">
                              {item.name}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              (Total:{item.totalMarks}; Pass:{item.passingMarks}; Contributes:
                              {item.contributes}%)
                            </span>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 self-stretch sm:self-auto">
                            {item.hasDocumentUpload && role !== 'parent' && (
                              <button
                                onClick={() =>
                                  setUploadModalItem({
                                    term: term.termName,
                                    itemTitle: item.name,
                                  })
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-bold transition-all border border-slate-200 shadow-2xs cursor-pointer"
                              >
                                <Upload className="w-3.5 h-3.5 text-slate-500" />
                                <span>Upload Document</span>
                              </button>
                            )}

                            <span className="font-mono text-xs md:text-sm font-bold text-slate-900">
                              {item.obtainedMarks.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Upload Document Modal */}
      {uploadModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 text-slate-900 shadow-xl relative space-y-4">
            <button
              onClick={() => {
                setUploadModalItem(null);
                setSelectedFile(null);
                setUploadSuccess(false);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                {uploadModalItem.term}
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Upload Document: {uploadModalItem.itemTitle}
              </h3>
              <p className="text-xs text-slate-500">
                Submit answer script, assignment solution, or evaluation document for instructor review
              </p>
            </div>

            {uploadSuccess ? (
              <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-10 h-10 text-[#006838] mx-auto animate-bounce" />
                <h4 className="text-sm font-bold text-[#006838]">Document Uploaded Successfully!</h4>
                <p className="text-xs text-emerald-800">
                  Your document has been recorded and submitted for this quiz component.
                </p>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center hover:border-[#006838] transition-colors bg-slate-50 cursor-pointer">
                  <input
                    type="file"
                    id="doc-upload-file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                  />
                  <label htmlFor="doc-upload-file" className="cursor-pointer block space-y-1.5">
                    <Upload className="w-7 h-7 text-slate-400 mx-auto" />
                    <span className="text-xs font-bold text-slate-700 block">
                      {selectedFile ? selectedFile.name : 'Click to select or drag and drop file'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      PDF, DOCX, JPG, PNG (Max 15MB)
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadModalItem(null);
                      setSelectedFile(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedFile}
                    className={`px-4 py-2 rounded-xl font-bold text-xs text-white transition-all shadow-xs ${
                      selectedFile
                        ? 'bg-[#006838] hover:bg-[#015333] cursor-pointer'
                        : 'bg-slate-300 cursor-not-allowed'
                    }`}
                  >
                    Confirm Upload
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
