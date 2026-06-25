"use client";

import React from "react";
import { useNavbar } from "@/contexts/NavbarContext";

export default function GDPRCompliancePage() {
  const { size: { height } } = useNavbar();

  return (
    <div 
      className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 flex justify-center"
      style={{ marginTop: `${height}px` }}
    >
      <div className="max-w-3xl w-full bg-white rounded-3xl border border-slate-100 p-8 sm:p-12 shadow-xl shadow-slate-200/50">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">GDPR Compliance</h1>
        <p className="text-slate-400 text-sm mb-8">Last Updated: June 15, 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-600 leading-relaxed">
          <p>
            <strong>BlazingTorrent</strong> is committed to compliance with the General Data Protection Regulation (GDPR) and regional African data protection laws (such as NDPR, POPIA, etc.) to safeguard the data privacy rights of our global members.
          </p>

          <h2 className="text-xl font-bold text-slate-800 pt-4 border-t border-slate-100">1. Data Controller</h2>
          <p>
            BlazingTorrent acts as the data controller for the personal information collected from members. 
            Our main data processing centers are designed with high security parameters, employing encryption-at-rest and encryption-in-transit protocols.
          </p>

          <h2 className="text-xl font-bold text-slate-800 pt-4 border-t border-slate-100">2. Our Core Privacy Principles</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Lawfulness, Fairness, and Transparency:</strong> We only process personal data when we have a legal basis (e.g. contract performance, legitimate interest, or explicit consent).</li>
            <li><strong>Purpose Limitation:</strong> Personal data is collected for specified, explicit, and legitimate professional purposes and not processed further in a manner incompatible with those purposes.</li>
            <li><strong>Data Minimization:</strong> We only collect the minimal amount of personal data necessary to operate our network services.</li>
            <li><strong>Accuracy:</strong> We take every reasonable step to ensure that personal data is kept up to date.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 pt-4 border-t border-slate-100">3. Your Data Protection Rights Under GDPR</h2>
          <p>
            If you reside within the European Economic Area (EEA), you possess the following rights:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Right of Access:</strong> You can request detailed information on how your data is processed and request a copy of the personal data.</li>
            <li><strong>Right to Rectification:</strong> You can request that we correct any inaccurate or incomplete personal data.</li>
            <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> You can request that we delete your personal data under certain conditions.</li>
            <li><strong>Right to Restrict or Object to Processing:</strong> You can request that we restrict or stop processing your personal data.</li>
            <li><strong>Right to Data Portability:</strong> You can request a copy of your personal data in a structured, machine-readable format.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 pt-4 border-t border-slate-100">4. Exercising Your Rights</h2>
          <p>
            To submit a Data Subject Access Request (DSAR) or to exercise any of your data protection rights, please contact our Compliance Officer at:
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
