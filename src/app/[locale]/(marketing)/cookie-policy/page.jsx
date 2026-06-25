"use client";

import React from "react";
import { useNavbar } from "@/contexts/NavbarContext";

export default function CookiePolicyPage() {
  const { size: { height } } = useNavbar();

  return (
    <div 
      className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 flex justify-center"
      style={{ marginTop: `${height}px` }}
    >
      <div className="max-w-3xl w-full bg-white rounded-3xl border border-slate-100 p-8 sm:p-12 shadow-xl shadow-slate-200/50">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Cookie Policy</h1>
        <p className="text-slate-400 text-sm mb-8">Last Updated: June 15, 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-600 leading-relaxed">
          <p>
            This Cookie Policy explains how <strong>BlazingTorrent</strong> uses cookies and similar tracking technologies to recognize you when you visit our website and use our platform.
          </p>

          <h2 className="text-xl font-bold text-slate-800 pt-4 border-t border-slate-100">1. What are Cookies?</h2>
          <p>
            Cookies are small data files placed on your computer or mobile device when you visit a website. They are widely used by website owners to make their websites work, improve efficiency, and provide analytics information.
          </p>

          <h2 className="text-xl font-bold text-slate-800 pt-4 border-t border-slate-100">2. Types of Cookies We Use</h2>
          <p>
            We use first-party and third-party cookies for several reasons:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Essential Cookies:</strong> These cookies are strictly necessary to provide you with services available through our platform and to use some of its features, such as accessing secure member areas.</li>
            <li><strong>Analytics Cookies:</strong> These cookies help us understand how our platform is being used, enabling us to customize and improve the user experience.</li>
            <li><strong>Preferences Cookies:</strong> These cookies allow our platform to remember choices you make (such as language preferences or region settings) to provide enhanced personalization.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 pt-4 border-t border-slate-100">3. How Can You Control Cookies?</h2>
          <p>
            You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website, though your access to some functionality and areas of our platform may be restricted.
          </p>

          <h2 className="text-xl font-bold text-slate-800 pt-4 border-t border-slate-100">4. Updates to this Policy</h2>
          <p>
            We may update this Cookie Policy from time to time in order to reflect changes to the cookies we use or for other operational, legal, or regulatory reasons.
          </p>

          <h2 className="text-xl font-bold text-slate-800 pt-4 border-t border-slate-100">5. More Information</h2>
          <p>
            If you have any questions about our use of cookies or other technologies, please email us at:
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
