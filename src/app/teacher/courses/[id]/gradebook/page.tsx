'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, OfferingGradebook, Assessment } from '@/lib/api/api-client';
import {
  Award,
  ArrowLeft,
  Plus,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  TrendingUp,
  X,
} from 'lucide-react';

export default function TeacherGradebookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const offeringId = resolvedParams.id;

  const [gradebook, setGradebook] = useState<OfferingGradebook | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingAssessmentId, setSavingAssessmentId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Mark editing state: [assessmentId_studentId]: obtainedMarks
  const [marksState, setMarksState] = useState<Record<string, number>>({});

  // Create assessment modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('ASSIGNMENT');
  const [newTotalMarks, setNewTotalMarks] = useState(100);
  const [newWeightage, setNewWeightage] = useState(20);
  const [newDueDate, setNewDueDate] = useState('');
  const [creatingAssessment, setCreatingAssessment] = useState(false);

  useEffect(() => {
    loadGradebook();
  }, [offeringId]);

  const loadGradebook = async () => {
    try {
      setLoading(true);
      const res = await api.teacherPortal.getCourseGradebook(offeringId);
      setGradebook(res);

      // Populate marks state
      const initialMarks: Record<string, number> = {};
      res.students.forEach((st) => {
        st.marks.forEach((m) => {
          if (m.obtainedMarks !== null) {
            initialMarks[`${m.assessmentId}_${st.studentId}`] = m.obtainedMarks;
          }
        });
      });
      setMarksState(initialMarks);
    } catch (err: any) {
      console.error('Failed to load gradebook', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (assessmentId: string, studentId: string, value: string) => {
    const num = parseFloat(value) || 0;
    setMarksState((prev) => ({
      ...prev,
      [`${assessmentId}_${studentId}`]: num,
    }));
  };

  const handleSaveGrades = async (assessmentId: string, publish: boolean) => {
    if (!gradebook) return;
    try {
      setSavingAssessmentId(assessmentId);
      setSaveSuccess(false);

      const grades = gradebook.students.map((st) => ({
        studentId: st.studentId,
        obtainedMarks: marksState[`${assessmentId}_${st.studentId}`] ?? 0,
      }));

      await api.teacherPortal.recordGrades(assessmentId, { grades, publish });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
      await loadGradebook();
    } catch (err: any) {
      alert(err.message || 'Failed to save grades');
    } finally {
      setSavingAssessmentId(null);
    }
  };

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreatingAssessment(true);
      await api.teacherPortal.createAssessment({
        offeringId,
        title: newTitle,
        type: newType,
        totalMarks: Number(newTotalMarks),
        weightage: Number(newWeightage),
        dueDate: newDueDate || undefined,
        isPublished: false,
      });

      setIsModalOpen(false);
      setNewTitle('');
      await loadGradebook();
    } catch (err: any) {
      alert(err.message || 'Failed to create assessment component');
    } finally {
      setCreatingAssessment(false);
    }
  };

  const totalCurrentWeight = (gradebook?.assessments || []).reduce(
    (sum, a) => sum + Number(a.weightage),
    0
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/teacher/courses"
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900">
                Course Gradebook
              </h1>
              <p className="text-xs text-slate-500">
                {gradebook?.offering?.course?.name} ({gradebook?.offering?.code}) • Section: {gradebook?.offering?.section}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#006838] hover:bg-[#00502a] text-white text-xs font-black shadow-md transition-all flex items-center gap-2 cursor-pointer self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Add Assessment Component</span>
          </button>
        </div>

        {saveSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-bold">Grades successfully saved and recorded!</p>
          </div>
        )}

        {/* Assessment Weightage Summary Banner */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Assessment Allocation Weight
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900">{totalCurrentWeight}%</span>
              <span className="text-xs text-slate-500 font-semibold">of 100% total course marks</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {(gradebook?.assessments || []).map((ass) => (
              <div
                key={ass.id}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-center gap-2"
              >
                <span className="font-bold text-slate-800">{ass.title}</span>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black">
                  {ass.weightage}%
                </span>
                <span
                  className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                    ass.isPublished ? 'bg-emerald-700 text-white' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {ass.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Gradebook Matrix Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4 sticky left-0 bg-slate-50 z-10">Student</th>
                  {(gradebook?.assessments || []).map((ass) => (
                    <th key={ass.id} className="py-3.5 px-4 min-w-36 text-center">
                      <div>
                        <p className="font-black text-slate-900">{ass.title}</p>
                        <p className="text-[10px] text-slate-400 font-normal">
                          Max: {ass.totalMarks} • Wt: {ass.weightage}%
                        </p>
                      </div>
                    </th>
                  ))}
                  <th className="py-3.5 px-4 text-center">Total Score</th>
                  <th className="py-3.5 px-4 text-center">Grade</th>
                  <th className="py-3.5 px-4 text-center">GPA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">Loading gradebook matrix...</td>
                  </tr>
                ) : !gradebook?.students || gradebook.students.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">No students enrolled yet.</td>
                  </tr>
                ) : (
                  gradebook.students.map((st) => (
                    <tr key={st.studentId} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 sticky left-0 bg-white z-10 font-medium">
                        <p className="font-bold text-slate-900">{st.fullName}</p>
                        <p className="text-[11px] font-mono text-emerald-800">{st.registrationNumber}</p>
                      </td>

                      {/* Marks inputs for each assessment */}
                      {(gradebook.assessments || []).map((ass) => {
                        const key = `${ass.id}_${st.studentId}`;
                        const currentVal = marksState[key] ?? '';

                        return (
                          <td key={ass.id} className="py-3.5 px-4 text-center">
                            <input
                              type="number"
                              min="0"
                              max={ass.totalMarks}
                              step="0.5"
                              value={currentVal}
                              onChange={(e) => handleMarkChange(ass.id, st.studentId, e.target.value)}
                              className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-center font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                            />
                          </td>
                        );
                      })}

                      {/* Total Score */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-900 text-sm">
                        {st.totalWeightedScore}%
                      </td>

                      {/* Letter Grade */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs">
                          {st.letterGrade}
                        </span>
                      </td>

                      {/* GPA */}
                      <td className="py-3.5 px-4 text-center font-black text-emerald-800">
                        {st.gpa.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Action Footer for Saving each assessment */}
          {gradebook?.assessments && gradebook.assessments.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
              <span className="text-xs text-slate-500 font-semibold mr-auto">
                Save or Publish component marks:
              </span>
              {gradebook.assessments.map((ass) => (
                <div key={ass.id} className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-700 px-2">{ass.title}:</span>
                  <button
                    onClick={() => handleSaveGrades(ass.id, false)}
                    disabled={savingAssessmentId === ass.id}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold cursor-pointer transition-all"
                  >
                    Save Draft
                  </button>
                  <button
                    onClick={() => handleSaveGrades(ass.id, true)}
                    disabled={savingAssessmentId === ass.id}
                    className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold cursor-pointer transition-all shadow-xs"
                  >
                    Publish
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Assessment Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900">Add Assessment Component</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAssessment} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Midterm Exam, Assignment 1"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
                    >
                      <option value="ASSIGNMENT">Assignment</option>
                      <option value="QUIZ">Quiz</option>
                      <option value="MIDTERM">Midterm</option>
                      <option value="FINAL">Final Exam</option>
                      <option value="PROJECT">Project</option>
                      <option value="PARTICIPATION">Participation</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Total Marks</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newTotalMarks}
                      onChange={(e) => setNewTotalMarks(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Weightage (%)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max={100 - totalCurrentWeight}
                      value={newWeightage}
                      onChange={(e) => setNewWeightage(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                    <span className="text-[10px] text-slate-400">
                      Remaining max: {100 - totalCurrentWeight}%
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingAssessment}
                    className="px-5 py-2 rounded-xl bg-[#006838] hover:bg-[#00502a] text-white text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {creatingAssessment ? 'Creating...' : 'Create Component'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
