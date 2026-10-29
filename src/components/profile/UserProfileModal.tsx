import React, { useState } from 'react';
import { useAuthRole } from '../../context/AuthRoleContext';
import { useOrganization } from '../../context/OrganizationContext';
import { UserRole, UserProfile } from '../../types';
import { User, X, Check, Plus, Shield, Mail, Phone, Building, Briefcase, Award } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, profiles, selectProfile, createProfile, updateProfile } = useAuthRole();
  const { organizations, activeOrgId } = useOrganization();

  const [activeTab, setActiveTab] = useState<'view_edit' | 'create_new'>('view_edit');

  // Edit state for current user
  const [editName, setEditName] = useState(currentUser.name);
  const [editEmail, setEditEmail] = useState(currentUser.email);
  const [editCustomTitle, setEditCustomTitle] = useState(currentUser.customTitle || '');
  const [editRole, setEditRole] = useState<UserRole>(currentUser.role);
  const [editPhone, setEditPhone] = useState(currentUser.phone || '');

  // New Profile state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCustomTitle, setNewCustomTitle] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('project_manager');
  const [newOrgId, setNewOrgId] = useState<string>(activeOrgId);
  const [newPhone, setNewPhone] = useState('');

  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...currentUser,
      name: editName,
      email: editEmail,
      customTitle: editCustomTitle,
      role: editRole,
      phone: editPhone,
    };
    updateProfile(updated);
    setNotification('Profil erfolgreich aktualisiert.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateNewProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    createProfile({
      name: newName,
      email: newEmail || 'user@organization.org',
      customTitle: newCustomTitle,
      role: newRole,
      organizationId: newOrgId,
      phone: newPhone,
    });

    setNotification(`Neues Profil "${newName}" angelegt und aktiviert.`);
    setActiveTab('view_edit');
    setNewName('');
    setNewEmail('');
    setNewCustomTitle('');
    setTimeout(() => setNotification(null), 3000);
  };

  const roleLabels: Record<UserRole, string> = {
    visitor: 'Gast / Externer Bewerber (Visitor)',
    tefa_member: 'Organisations-Mitglied (Member)',
    project_manager: 'Projektleiter / Manager (PM)',
    project_reviewer: 'Gutachter / Reviewer (Evaluator)',
    finance_officer: 'Finanzverantwortlicher (Finance Officer)',
    board_member: 'Vorstandsmitglied / Führung (Board Member)',
    system_admin: 'Systemadministrator (Admin)',
    local_partner: 'Lokaler Partner vor Ort (Local Partner)',
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white text-base shadow-inner">
              {currentUser.avatarInitials}
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Benutzerprofil & Identität</h3>
              <p className="text-xs text-slate-300">
                Verwalten oder erstellen Sie personalisierte Profile für Projektleitung & Governance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('view_edit')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'view_edit'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Aktives Profil & Wechsel
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('create_new')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'create_new'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Neues Profil anlegen
          </button>
        </div>

        {notification && (
          <div className="mx-5 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Tab 1: View & Edit Active Profile */}
        {activeTab === 'view_edit' && (
          <div className="p-5 space-y-5">
            {/* Quick Profile Switcher */}
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                Zu vorhandenem Profil wechseln:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
                {profiles.map((p) => {
                  const isCurrent = p.id === currentUser.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        selectProfile(p.id);
                        setEditName(p.name);
                        setEditEmail(p.email);
                        setEditCustomTitle(p.customTitle || '');
                        setEditRole(p.role);
                        setEditPhone(p.phone || '');
                      }}
                      className={`text-left p-2.5 rounded-lg border text-xs transition-all flex items-center gap-2.5 ${
                        isCurrent
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                        {p.avatarInitials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-slate-900">{p.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{p.customTitle || p.role}</div>
                      </div>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Edit active profile form */}
            <form onSubmit={handleSaveEdit} className="space-y-3.5 pt-2 border-t border-slate-200">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Profilangaben bearbeiten
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Vollständiger Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> E-Mail-Adresse
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Funktion / Titel
                  </label>
                  <input
                    type="text"
                    value={editCustomTitle}
                    onChange={(e) => setEditCustomTitle(e.target.value)}
                    placeholder="z.B. Vorstand, Programmkoordinator..."
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-slate-400" /> System-Berechtigungsrolle
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {Object.entries(roleLabels).map(([rKey, rLabel]) => (
                      <option key={rKey} value={rKey}>
                        {rLabel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Telefon / WhatsApp (optional)
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+49 ... oder +237 ..."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Schließen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Änderungen speichern
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Create Brand-New Profile */}
        {activeTab === 'create_new' && (
          <form onSubmit={handleCreateNewProfile} className="p-5 space-y-4">
            <div className="text-xs text-slate-600 bg-blue-50/70 border border-blue-200 p-3 rounded-xl">
              Erstellen Sie ein neues Benutzerprofil für ein Teammitglied, einen Berater oder einen Partner vor Ort. Das Profil ist sofort einsatzbereit und wird im Workspace gespeichert.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Vollständiger Name *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  placeholder="z.B. Jean-Pierre Mballa"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> E-Mail-Adresse *
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  placeholder="jp.mballa@partner-org.cm"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Funktion / Titel
                </label>
                <input
                  type="text"
                  value={newCustomTitle}
                  onChange={(e) => setNewCustomTitle(e.target.value)}
                  placeholder="z.B. Koordinator vor Ort"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-slate-400" /> Rolle (Berechtigungen) *
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {Object.entries(roleLabels).map(([rKey, rLabel]) => (
                    <option key={rKey} value={rKey}>
                      {rLabel}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" /> Organisation (Workspace)
                </label>
                <select
                  value={newOrgId}
                  onChange={(e) => setNewOrgId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name} ({org.country})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Telefon / WhatsApp
                </label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+49 ... oder +237 ..."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('view_edit')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Zurück
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Profil jetzt anlegen & aktivieren
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
