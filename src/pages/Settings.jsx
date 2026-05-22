import React, { useEffect, useState } from "react";
import { getUser } from "../services/user";
import LoadingScreen from "../components/LoadingScreen";
import { User, Bell, Shield, Palette, ChevronRight, LogOut, Mail, BookOpen, Moon, Sun, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Section = ({ icon: Icon, title, children, accent = "blue" }) => {
  const accentClasses = {
    blue: "bg-blue-50 text-blue",
    orange: "bg-orange/10 text-orange",
    red: "bg-red-50 text-red-500",
    purple: "bg-purple-50 text-purple-500",
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-5">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accentClasses[accent]}`}>
          <Icon size={16} />
        </div>
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  );
};

const SettingRow = ({ label, description, children }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
    <div className="flex-1 pr-4">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
);

const Toggle = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    className={`w-11 h-6 rounded-full transition-colors duration-200 flex items-center px-0.5 cursor-pointer ${
      value ? "bg-blue" : "bg-gray-200"
    }`}
  >
    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${value ? "translate-x-5" : "translate-x-0"}`} />
  </button>
);

const Settings = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [notifications, setNotifications] = useState({
    newSubmissions: true,
    graded: true,
    reminders: false,
    emailDigest: false,
  });

  const [appearance, setAppearance] = useState({
    theme: "light",
    compactMode: false,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUser();
        if (res.status === 200) {
          setUserName(res.data.name ?? "");
          setUserEmail(res.data.email ?? "");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/signin");
  };

  if (isLoading) return <LoadingScreen />;

  const initials = userName
    ? userName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue to-blue-700 px-6 sm:px-10 py-10">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />
        <div className="relative">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">Settings</h2>
          <p className="text-blue-100 text-sm">Manage your account preferences and notifications.</p>
        </div>
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white opacity-5" />
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5 flex items-center gap-5">
          <div className="relative">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName || "User")}&background=1a89cf&color=fff&size=80`}
              alt={userName}
              className="w-16 h-16 rounded-2xl object-cover shadow-sm"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-800 truncate">{userName || "User"}</h3>
            <p className="text-sm text-gray-500 truncate flex items-center gap-1.5 mt-0.5">
              <Mail size={12} /> {userEmail || "No email"}
            </p>
          </div>
          <div className="flex-shrink-0 text-xs text-blue font-medium bg-blue-50 px-3 py-1.5 rounded-xl">
            Active
          </div>
        </div>

        {/* Notifications */}
        <Section icon={Bell} title="Notifications" accent="blue">
          <SettingRow
            label="New Submissions"
            description="Get notified when a student submits a quiz"
          >
            <Toggle
              value={notifications.newSubmissions}
              onChange={(v) => setNotifications((n) => ({ ...n, newSubmissions: v }))}
            />
          </SettingRow>
          <SettingRow
            label="Graded Quizzes"
            description="Receive a notification when your submission is graded"
          >
            <Toggle
              value={notifications.graded}
              onChange={(v) => setNotifications((n) => ({ ...n, graded: v }))}
            />
          </SettingRow>
          <SettingRow
            label="Deadline Reminders"
            description="Remind me 24 hours before a quiz deadline"
          >
            <Toggle
              value={notifications.reminders}
              onChange={(v) => setNotifications((n) => ({ ...n, reminders: v }))}
            />
          </SettingRow>
          <SettingRow
            label="Weekly Email Digest"
            description="Summary of activity sent to your email every Monday"
          >
            <Toggle
              value={notifications.emailDigest}
              onChange={(v) => setNotifications((n) => ({ ...n, emailDigest: v }))}
            />
          </SettingRow>
        </Section>

        {/* Appearance */}
        <Section icon={Palette} title="Appearance" accent="purple">
          <SettingRow label="Theme" description="Choose your preferred color scheme">
            <div className="flex gap-2">
              {[
                { value: "light", icon: Sun, label: "Light" },
                { value: "dark", icon: Moon, label: "Dark" },
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setAppearance((a) => ({ ...a, theme: value }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                    appearance.theme === value
                      ? "bg-blue text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Icon size={12} /> {label}
                </button>
              ))}
            </div>
          </SettingRow>
          <SettingRow
            label="Compact Mode"
            description="Reduce spacing for a denser layout"
          >
            <Toggle
              value={appearance.compactMode}
              onChange={(v) => setAppearance((a) => ({ ...a, compactMode: v }))}
            />
          </SettingRow>
        </Section>

        {/* Quick links */}
        <Section icon={BookOpen} title="Quick Links" accent="orange">
          <div className="space-y-1">
            {[
              { label: "My Quizzes", path: "/quizzes" },
              { label: "Activity Log", path: "/activity" },
              { label: "My Documents", path: "/documents" },
            ].map(({ label, path }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="w-full flex items-center justify-between py-2.5 text-sm text-gray-700 hover:text-blue transition-colors cursor-pointer"
              >
                <span>{label}</span>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            ))}
          </div>
        </Section>

        {/* Danger zone */}
        <Section icon={Shield} title="Account" accent="red">
          <SettingRow label="Sign Out" description="Log out from this device">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-500 text-sm font-medium hover:bg-red-100 transition cursor-pointer"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </SettingRow>
        </Section>

        <p className="text-center text-xs text-gray-400 mt-2">Evalyn — AI-powered Assessment Platform</p>
      </div>
    </div>
  );
};

export default Settings;
