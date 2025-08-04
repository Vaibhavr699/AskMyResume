"use client";

import { useState, useEffect, useRef } from 'react';
import { FileText, Calendar, MessageCircle } from 'lucide-react';

interface ResumeCardProps {
  resume: {
    id: string;
    filename: string;
    createdAt: string;
    analysis?: {
      overallScore?: number;
      skills?: string[];
    };
  };
  isSelected?: boolean;
  onSelect?: (resumeId: string) => void;
}

export default function ResumeCard({ resume, isSelected, onSelect }: ResumeCardProps) {



  const formatDate = (dateString: string) => {
    try {
      // Handle different date formats that might come from the backend
      let date: Date;
      
      if (dateString) {
        // Try parsing as ISO string first
        date = new Date(dateString);
        
        // Check if the date is valid
        if (isNaN(date.getTime())) {
          // If invalid, try parsing as timestamp
          const timestamp = parseInt(dateString);
          if (!isNaN(timestamp)) {
            date = new Date(timestamp);
          } else {
            // If still invalid, return a fallback
            return 'Date not available';
          }
        }
      } else {
        return 'Date not available';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date not available';
    }
  };

  return (
    <div
      className={`relative bg-white rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-lg' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => onSelect?.(resume.id)}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <MessageCircle className="w-4 h-4 text-white" />
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 truncate max-w-[200px]">
                {resume.filename}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(resume.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Score and Skills */}
        {/* <div className="space-y-3">
          {resume.analysis?.overallScore && (
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-600">
                AI Score: <span className="font-semibold">{resume.analysis.overallScore}/100</span>
              </span>
            </div>
          )}

          {resume.analysis?.skills && resume.analysis.skills.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Key Skills:</p>
              <div className="flex flex-wrap gap-1">
                {resume.analysis.skills.slice(0, 3).map((skill, index) => (
                  <span
                    key={index}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                  >
                    {typeof skill === 'string' ? skill : skill.name}
                  </span>
                ))}
                {resume.analysis.skills.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{resume.analysis.skills.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div> */}

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(resume.id);
            }}
            className={`cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isSelected
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            {isSelected ? 'Selected' : 'Chat'}
          </button>


        </div>
      </div>


    </div>
  );
} 