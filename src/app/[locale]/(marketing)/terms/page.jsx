"use client";

import React from "react";
import { useNavbar } from "@/contexts/NavbarContext";

export default function TermsOfServicePage() {
  const { size: { height } } = useNavbar();

  return (
    <div 
      className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 flex justify-center"
      style={{ marginTop: `${height}px` }}
    >
      <div className="max-w-3xl w-full bg-white rounded-3xl border border-slate-100 p-8 sm:p-12 shadow-xl shadow-slate-200/50">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-slate-400 text-sm mb-8">Last Updated: June 15, 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-600 leading-relaxed">
          <p>
            Welcome to <strong>BlazingTorrent</strong>. By accessing or using our website, services, and community portal, you agree to be bound by these Terms of Service. If you do not agree to these terms, you must not access or use the platform.
          </p>

          <h2 className="text-xl font-bold text-slate-800 pt-4 border-t border-slate-100">1. Membership and Eligibility</h2>
          <p>
            BlazingTorrent is a private network exclusively for verified members, alumni, and certified affiliates of the Stanford Seed community. 
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Verification:</strong> Members must complete the official verification process. We reserve the right to refuse or revoke membership at our discretion.</li>
            <li><strong>Account Responsibility:</strong> You are responsible for keeping your credentials confidential and for all actions taken under your account.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 pt-4 border-t border-slate-100">2. Code of Conduct</h2>
          <p>
            Members agree to engage in professional, ethical, and lawful behavior. You must not:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Post misleading, false, or unauthorized content.</li>
            <li>Harvest email addresses or personal data of other members.</li>
            <li>Use the platform for unauthorized advertising, spam, or solicitation outside designated marketplace channels.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 pt-4 border-t border-slate-100">3. Opportunity Marketplace Disclaimer</h2>
          <p>
            BlazingTorrent provides a marketplace for members to share business opportunities, partnerships, and collaborations. 
            <br />
            <strong>Important Legal Notice:</strong> We do not verify, endorse, or guarantee the accuracy, feasibility, or legality of any opportunities shared. Members must perform their own independent due diligence before engaging in any transaction or contract.
          </p>

          <h2 className="text-xl font-bold text-slate-800 pt-4 border-t border-slate-100">4. Intellectual Property</h2>
          <p>
            All platform designs, branding, algorithms, and source code are the exclusive property of BlazingTorrent. Content posted by members remains the property of the respective member, but members grant BlazingTorrent a license to host and distribute the content within the network.
          </p>

          <h2 className="text-xl font-bold text-slate-800 pt-4 border-t border-slate-100">5. Limitation of Liability</h2>
          <p>
            BlazingTorrent is provided on an "as-is" and "as-available" basis. In no event shall BlazingTorrent or its operators be liable for any indirect, incidental, or consequential damages resulting from your use of, or inability to use, the platform.
          </p>

          <h2 className="text-xl font-bold text-slate-800 pt-4 border-t border-slate-100">6. Modifications to Terms</h2>
          <p>
            We may update these Terms of Service from time to time. We will notify you of any material changes by posting the new terms on this page and updating the last updated timestamp.
          </p>

          <h2 className="text-xl font-bold text-slate-800 pt-4 border-t border-slate-100">7. Contact Information</h2>
          <p>
            If you have questions about these Terms of Service, please contact us at:
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
