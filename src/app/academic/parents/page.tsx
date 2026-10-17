'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, ParentProfile, Student } from '@/lib/api/api-client';
import {
  HeartHandshake,
  Plus,
  Search,
  UserPlus,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  Mail,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Link as LinkIcon,
  Briefcase,
  Users,
  KeyRound,
} from 'lucide-react';

interface HandoverSlip {
  parentCode: string;
  fullName: string;
  username: string;
  email: string;
  temporaryPassword: string;
  linkedStudents: string[];
}

export default function ParentsDirectoryPage() {
  const [parents, setParents] = useState<ParentProfile[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State: Create Parent
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRelationship, setFormRelationship] = useState('Father');
  const [formOccupation, setFormOccupation] = useState('');
  const [formEmergencyContact, setFormEmergencyContact] = useState('');
  const [formSelectedStudentIds, setFormSelectedStudentIds] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState('');

  // Modal State: Link Student to Existing Parent
  const [linkParent, setLinkParent] = useState<ParentProfile | null>(null);
  const [linkStudentId, setLinkStudentId] = useState('');
  const [linking, setLinking] = useState(false);

  // Modal State: Handover Slip
  const [handoverData, setHandoverData] = useState<HandoverSlip | null>(null);
  const [copied, setCopied] = useState(false);

  // Modal State: Reset Password
  const [resettingParent, setResettingParent] = useState<ParentProfile | null>(null);
  const [resetting, setResetting] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [parentList, studentRes] = await Promise.all([
        api.parents.list(),
        api.students.getAll({ limit: 200 }),
      ]);
      setParents(parentList);
      setStudents(studentRes.data || []);
    } catch (err: any) {
      console.error('Failed to load parent data:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormFullName('');
    setFormEmail('');
    setFormPhone('');
    setFormRelationship('Father');
    setFormOccupation('');
    setFormEmergencyContact('');
    setFormSelectedStudentIds([]);
    setStudentSearch('');
    setErrorMsg(null);
    setIsCreateModalOpen(true);
  };

  const toggleStudentSelection = (studentId: string) => {
    setFormSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await api.parents.create({
        fullName: formFullName.trim(),
        email: formEmail.trim().toLowerCase(),
        phone: formPhone.trim(),
        relationship: formRelationship,
        occupation: formOccupation.trim() || undefined,
        emergencyContact: formEmergencyContact.trim() || undefined,
        studentIds: formSelectedStudentIds.length > 0 ? formSelectedStudentIds : undefined,
      });

      setIsCreateModalOpen(false);
      await loadData();

      const linkedNames = students
        .filter((s) => formSelectedStudentIds.includes(s.id))
        .map((s) => `${s.fullName} (${s.registrationNumber})`);

      if (res.temporaryPassword) {
        setHandoverData({
          parentCode: res.user?.username || 'PRN-ACCOUNT',
          fullName: res.user?.fullName || formFullName,
          username: res.user?.username || res.user?.email || formEmail,
          email: res.user?.email || formEmail,
          temporaryPassword: res.temporaryPassword,
          linkedStudents: linkedNames,
        });
      } else {
        setSuccessMsg(`Parent account for ${formFullName} created.`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create parent account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLinkStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkParent || !linkStudentId) return;
    setErrorMsg(null);
    setLinking(true);

    try {
      await api.parents.linkStudent(linkParent.id, {
        studentId: linkStudentId,
        isPrimaryGuardian: true,
      });
      setSuccessMsg('Student successfully linked to parent profile.');
      setLinkParent(null);
      setLinkStudentId('');
      await loadData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to link student.');
    } finally {
      setLinking(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resettingParent) return;
    try {
      setResetting(true);
      const res = await api.parents.resetPassword(resettingParent.id);
      setResettingParent(null);

      const linkedNames = (resettingParent.studentRelationships || []).map(
        (r) => `${r.student?.fullName} (${r.student?.registrationNumber})`
      );

      setHandoverData({
        parentCode: res.parentCode || resettingParent.user?.username || 'PRN-ACCOUNT',
        fullName: res.fullName || resettingParent.user?.fullName || 'Parent / Guardian',
        username: res.username || resettingParent.user?.username || '',
        email: res.email || resettingParent.user?.email || '',
        temporaryPassword: res.temporaryPassword,
        linkedStudents: res.linkedStudents?.length > 0 ? res.linkedStudents : linkedNames,
      });
    } catch (err: any) {
      alert(err.message || 'Failed to reset parent credentials');
    } finally {
      setResetting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!handoverData) return;
    const slipText = `================================================
FOREVER IT INSTITUTE — PARENT / GUARDIAN PORTAL ACCESS
================================================
Parent / Guardian:  ${handoverData.fullName}
Parent ID / Code:   ${handoverData.parentCode}
Login Username:     ${handoverData.username}
Account Email:      ${handoverData.email}
Temporary Password: ${handoverData.temporaryPassword}
Linked Student(s):  ${handoverData.linkedStudents.join(', ') || 'Pending link'}
Portal URL:         https://portal.foreveritbd.com/login
------------------------------------------------
Instructions:
Parents can view student timetable routines, live attendance,
exam grades, and download official payment receipts.
Permanent password change required upon first login.
================================================`;
    navigator.clipboard.writeText(slipText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const filteredParents = parents.filter((p) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = (p.user?.fullName || '').toLowerCase().includes(q);
    const emailMatch = (p.user?.email || '').toLowerCase().includes(q);
    const codeMatch = (p.user?.username || '').toLowerCase().includes(q);
    const phoneMatch = (p.phone || '').toLowerCase().includes(q);
    const childMatch = p.studentRelationships?.some((rel) =>
      rel.student?.fullName?.toLowerCase().includes(q) ||
      rel.student?.registrationNumber?.toLowerCase().includes(q)
    );
    return nameMatch || emailMatch || codeMatch || phoneMatch || childMatch;
  });

  const availableStudentsForModal = students.filter((s) => {
    if (!studentSearch) return true;
    const q = studentSearch.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.registrationNumber.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <HeartHandshake className="w-5 h-5" />
              </span>
              <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                Parents & Guardians Directory
              </h1>
            </div>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Link guardians to students, manage family portal accounts, and generate login handover slips.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-950/10 transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <UserPlus className="w-4 h-4 stroke-[3]" />
            <span>Add New Parent</span>
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by parent name, PRN code, student name, or registration number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
            />
          </div>
        </div>

        {/* Parents List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-10 bg-gray-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : filteredParents.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-gray-100 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-800">No Parents or Guardians Registered</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {searchQuery
                ? 'No records match your query.'
                : 'Register parent accounts and link them to students so guardians can track attendance and academic progress.'}
            </p>
            {!searchQuery && (
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Register First Parent
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredParents.map((parent) => {
              const children = parent.studentRelationships || [];
              return (
                <div
                  key={parent.id}
                  className="bg-white rounded-2xl border border-gray-200/80 p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                            {parent.user?.username || 'PRN-USER'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider border border-blue-200">
                            {parent.relationship || 'Guardian'}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mt-1.5 group-hover:text-emerald-700 transition-colors">
                          {parent.user?.fullName || 'Guardian'}
                        </h3>
                        {parent.occupation && (
                          <p className="text-xs text-gray-500 font-medium">
                            <Briefcase className="w-3 h-3 inline mr-1 text-gray-400" />
                            {parent.occupation}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{parent.user?.email || 'No email'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{parent.phone}</span>
                      </div>
                    </div>

                    {/* Linked Students Section */}
                    <div className="pt-2 border-t border-gray-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400 font-semibold flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          Linked Children ({children.length})
                        </span>
                        <button
                          onClick={() => {
                            setLinkParent(parent);
                            setLinkStudentId('');
                            setErrorMsg(null);
                          }}
                          className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Link Child</span>
                        </button>
                      </div>

                      {children.length === 0 ? (
                        <p className="text-[11px] text-amber-600 font-medium italic">
                          No student linked yet.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {children.map((rel) => (
                            <span
                              key={rel.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-100 text-gray-800 text-[11px] font-medium border border-gray-200"
                            >
                              <GraduationCap className="w-3 h-3 text-emerald-600" />
                              <span className="font-semibold">{rel.student?.fullName}</span>
                              <span className="text-gray-400 text-[10px]">
                                ({rel.student?.registrationNumber})
                              </span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setLinkParent(parent);
                        setLinkStudentId('');
                        setErrorMsg(null);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Link Child</span>
                    </button>

                    <button
                      onClick={() => setResettingParent(parent)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-all cursor-pointer"
                      title="Reset Parent Portal Credentials"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                      <span>Reset Credentials</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Create Parent */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden my-8">
              <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                    <HeartHandshake className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base">Add Parent / Guardian</h3>
                    <p className="text-[11px] text-gray-500">
                      Creates parent portal account with temporary credentials and links student(s).
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Md. Rafiqul Islam"
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="parent@example.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+8801XXXXXXXXX"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Relationship</label>
                    <select
                      value={formRelationship}
                      onChange={(e) => setFormRelationship(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Brother">Brother</option>
                      <option value="Sister">Sister</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Occupation</label>
                    <input
                      type="text"
                      placeholder="e.g. Businessman / Govt Service"
                      value={formOccupation}
                      onChange={(e) => setFormOccupation(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="Alternate phone number"
                    value={formEmergencyContact}
                    onChange={(e) => setFormEmergencyContact(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Student Linking Section */}
                <div className="pt-2 border-t border-gray-100 space-y-2">
                  <label className="block text-xs font-bold text-gray-800">
                    Link Enrolled Student(s) (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Filter student by name or Reg No..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none"
                  />
                  <div className="max-h-40 overflow-y-auto space-y-1 border border-gray-200 rounded-xl p-2 bg-gray-50/50">
                    {availableStudentsForModal.length === 0 ? (
                      <p className="text-center text-xs text-gray-400 py-3">No matching students</p>
                    ) : (
                      availableStudentsForModal.slice(0, 30).map((st) => {
                        const isSelected = formSelectedStudentIds.includes(st.id);
                        return (
                          <div
                            key={st.id}
                            onClick={() => toggleStudentSelection(st.id)}
                            className={`p-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-emerald-100 text-emerald-900 font-bold'
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            <div>
                              <span>{st.fullName}</span>
                              <span className="text-[10px] text-gray-500 font-mono ml-2">
                                {st.registrationNumber}
                              </span>
                            </div>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="w-4 h-4 text-emerald-600 rounded border-gray-300 pointer-events-none"
                            />
                          </div>
                        );
                      })
                    )}
                  </div>
                  {formSelectedStudentIds.length > 0 && (
                    <p className="text-[11px] text-emerald-700 font-bold">
                      {formSelectedStudentIds.length} student(s) selected to link.
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-gray-600 text-xs font-bold hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-950/10 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Creating Parent...' : 'Create Parent Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Link Student to Existing Parent */}
        {linkParent && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden my-8">
              <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                    <LinkIcon className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base">Link Student to Parent</h3>
                    <p className="text-[11px] text-gray-500">{linkParent.user?.fullName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setLinkParent(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleLinkStudent} className="p-5 space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Select Student *</label>
                  <select
                    required
                    value={linkStudentId}
                    onChange={(e) => setLinkStudentId(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  >
                    <option value="">-- Choose a student to link --</option>
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.fullName} ({st.registrationNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setLinkParent(null)}
                    className="px-4 py-2 rounded-xl text-gray-600 text-xs font-bold hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={linking || !linkStudentId}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-950/10 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {linking ? 'Linking...' : 'Confirm Link'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Confirm Reset Password */}
        {resettingParent && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-gray-100 p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <KeyRound className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-gray-900">Reset Parent Credentials?</h3>
                <p className="text-xs text-gray-500">
                  This will generate a fresh temporary password for{' '}
                  <span className="font-bold text-gray-800">{resettingParent.user?.fullName}</span> (
                  {resettingParent.user?.username || 'PRN-ACCOUNT'}). You will receive a handover slip immediately to
                  provide to the guardian.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResettingParent(null)}
                  disabled={resetting}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={resetting}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-950/10 transition-all disabled:opacity-50"
                >
                  {resetting ? 'Resetting...' : 'Yes, Reset'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Instant Credentials Handover Slip */}
        {handoverData && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden my-8 animate-in fade-in zoom-in-95">
              <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 relative">
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-black uppercase tracking-widest mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Parent Portal Credentials Slip</span>
                </div>
                <h2 className="text-xl font-black text-white">{handoverData.fullName}</h2>
                <p className="text-xs text-emerald-200/90 font-mono mt-0.5">Parent Code: {handoverData.parentCode}</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 text-xs text-emerald-900 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>
                    Provide these credentials to the guardian. The parent portal allows real-time tracking of class
                    routines, per-class attendance, grades, and payment receipts.
                  </span>
                </div>

                <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-200/70 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-gray-200/50">
                    <span className="text-gray-500 font-semibold">Parent Code:</span>
                    <span className="font-mono font-black text-gray-900">{handoverData.parentCode}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-gray-200/50">
                    <span className="text-gray-500 font-semibold">Login Username:</span>
                    <span className="font-mono font-bold text-gray-800">{handoverData.username}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-gray-200/50">
                    <span className="text-gray-500 font-semibold">Email:</span>
                    <span className="font-medium text-gray-800">{handoverData.email}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-gray-200/50">
                    <span className="text-gray-500 font-semibold">Temporary Password:</span>
                    <span className="font-mono font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md text-sm select-all">
                      {handoverData.temporaryPassword}
                    </span>
                  </div>
                  {handoverData.linkedStudents.length > 0 && (
                    <div className="py-1">
                      <span className="text-gray-500 font-semibold block mb-1">Linked Children:</span>
                      <div className="flex flex-wrap gap-1">
                        {handoverData.linkedStudents.map((st, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-[11px] font-bold text-gray-800">
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyCredentials}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-950/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-200" />
                        <span>Credentials Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Handover Slip</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setHandoverData(null)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-100 transition-all cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
