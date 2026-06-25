"use client";

import React from "react";
import { useNavbar } from "@/contexts/NavbarContext";

export default function PrivacyPolicyPage() {
  const { size: { height } } = useNavbar();

  return (
    <div 
      className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 flex justify-center"
      style={{ marginTop: `${height}px` }}
    >
      <div className="max-w-3xl w-full bg-white rounded-3xl border border-slate-100 p-8 sm:p-12 shadow-xl shadow-slate-200/50">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-slate-400 text-sm mb-8">Last Updated: June 15, 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-600 leading-relaxed">
          <p>
            At <strong>BlazingTorrent</strong>, we are committed to protecting your privacy and ensuring the security of your personal data. This Privacy Policy explains how we collect, use, share, and protect your information when you access or use our platform, services, and mobile applications.
          </p>

          <h2 className="text-xl font-bold text-slate-800 pt-4 border-t border-slate-100">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create an account, fill out your profile, participate in our networking modules, list opportunities, or communicate with support.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Profile Information:</strong> Name, professional background, company name, industries, Stanford Seed cohort details, email address, and telephone number.</li>
            <li><strong>User Content:</strong> Opportunities shared, forum posts, messaging exchanges, and files uploaded.</li>
            <li><strong>Device & Usage Data:</strong> IP addresses, browser types, page interaction statistics, and cookies.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 pt-4 border-t border-slate-100">2. How We Use Your Information</h2>
          <p>
            We use your information to operate and improve the BlazingTorrent platform, authenticate members, match business opportunities, and secure the network against fraudulent activities. We do not sell your personal data to third parties.
          </p>

          <h2 className="text-xl font-bold text-slate-800 pt-4 border-t border-slate-100">3. Data Sharing and Disclosure</h2>
          <p>
            Your profile details and shared opportunities are visible only to verified, logged-in members of the BlazingTorrent network. We may share information with trusted service providers who help us host the service, perform data analysis, or process payments, subject to strict confidentiality agreements.
          </p>

          <h2 className="text-xl font-bold text-slate-800 pt-4 border-t border-slate-100">4. Your Rights and Compliance (GDPR & African Frameworks)</h2>
          <p>
            Depending on your location, you have rights regarding your personal data:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Access & Rectification:</strong> You can review, update, or correct your profile data at any time via your account settings.</li>
            <li><strong>Data Portability & Deletion:</strong> You have the right to request a copy of your personal data or ask for its complete deletion.</li>
            <li><strong>Consent Withdrawal:</strong> You can object to or restrict certain data processing activities.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 pt-4 border-t border-slate-100">5. Security of Your Data</h2>
          <p>
            We implement industry-standard administrative, technical, and physical security measures designed to safeguard your data from unauthorized access, loss, or alteration.
          </p>

          <h2 className="text-xl font-bold text-slate-800 pt-4 border-t border-slate-100">6. Contact Us</h2>
          <p>
            If you have any questions or concerns about our privacy practices, please contact our Data Protection Officer at:
            <br />
            <a href="mailto:support@blazingtorrent.org" className="text-indigo-600 hover:text-indigo-800 font-medium mt-1 inline-block">
              support@blazingtorrent.org
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
