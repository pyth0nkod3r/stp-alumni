"use client";

import React from "react";
import { useNavbar } from "@/contexts/NavbarContext";

export default function AccessibilityStatementPage() {
  const { size: { height } } = useNavbar();

  return (
    <div 
      className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 flex justify-center"
      style={{ marginTop: `${height}px` }}
    >
      <div className="max-w-3xl w-full bg-white rounded-3xl border border-slate-100 p-8 sm:p-12 shadow-xl shadow-slate-200/50">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Accessibility Statement</h1>
        <p className="text-slate-400 text-sm mb-8">Last Updated: June 15, 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-600 leading-relaxed">
          <p>
            At <strong>BlazingTorrent</strong>, we are committed to ensuring digital accessibility for people with disabilities. We are continuously improving the user experience for everyone and applying the relevant accessibility standards to make our platform accessible to all.
          </p>

          <h2 className="text-xl font-bold text-slate-800 pt-4 border-t border-slate-100">1. Conformance Status</h2>
          <p>
            The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA. 
          </p>
          <p>
            BlazingTorrent is committed to aligning its services with <strong>WCAG 2.1 Level AA</strong> standards. We are actively working to audit and optimize our components, color contrasts, and keyboard navigation to achieve complete conformance.
          </p>

          <h2 className="text-xl font-bold text-slate-800 pt-4 border-t border-slate-100">2. Accessibility Features on Our Platform</h2>
          <p>
            We implement design patterns to support accessibility, including:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Alt Text:</strong> Providing descriptive alternative text for key images, icons, and logo assets.</li>
            <li><strong>Contrast:</strong> Ensuring text and background color combinations meet minimum contrast ratios for visibility.</li>
            <li><strong>Semantic HTML:</strong> Structuring page elements using appropriate HTML5 tags to support screen reader tools.</li>
            <li><strong>Keyboard Navigation:</strong> Structuring interactive elements to ensure clear focus indicators and logical tab sequences.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 pt-4 border-t border-slate-100">3. Feedback and Contact</h2>
          <p>
            We welcome your feedback on the accessibility of the BlazingTorrent platform. If you encounter any accessibility barriers, please let us know by contacting our Support Team:
          </p>
          <p>
            <a href="mailto:support@blazingtorrent.org" className="text-indigo-600 hover:text-indigo-800 font-medium mt-1 inline-block">
              support@blazingtorrent.org
            </a>
          </p>
          <p>
            We aim to respond to accessibility feedback within 2-3 business days.
          </p>
        </div>
      </div>
    </div>
  );
}
