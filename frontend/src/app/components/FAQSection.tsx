"use client";

import { useState } from 'react';

export function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How does the AI analyze my resume?",
      answer: "Our AI uses natural language processing to evaluate your resume's content, structure, and keywords against industry standards and job descriptions."
    },
    {
      question: "Is my resume data secure?",
      answer: "Absolutely. We use encryption and never share your data. Your resume information is kept private and secure."
    },
    {
      question: "What file formats do you support?",
      answer: "We support PDF, DOCX, and plain text. You can also paste your resume text directly."
    },
    {
      question: "How accurate is the resume analysis?",
      answer: "Our AI provides highly accurate analysis based on current hiring trends, though we always recommend reviewing suggestions with a human eye."
    }
  ];

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className="w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about AskMyResume
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200 pb-4">
              <button 
                className="cursor-pointer flex justify-between items-center w-full text-left"
                onClick={() => toggleAccordion(index)}
                aria-expanded={activeIndex === index}
                aria-controls={`faq-${index}`}
              >
                <h3 className="text-lg font-medium text-gray-900">
                  {faq.question}
                </h3>
                <svg 
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${activeIndex === index ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div 
                id={`faq-${index}`}
                className={`mt-2 text-gray-600 overflow-hidden transition-all duration-200 ease-in-out ${activeIndex === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="pb-2">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}