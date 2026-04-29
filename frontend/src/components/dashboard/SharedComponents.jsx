import React from 'react';

export function SidebarItem({ icon, label, active, className, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
        active 
          ? 'bg-green-50 text-green-700 font-medium' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      } ${className || ''}`}
    >
      {React.cloneElement(icon, { className: `w-5 h-5 ${active ? 'text-green-600' : ''}` })}
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function Card({ children, className }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className || ''}`}>
      {children}
    </div>
  );
}

export function ImpactStat({ icon, label, value }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm">
      <div className="bg-green-50 p-3 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-lg font-bold text-gray-900 leading-tight">{value}</p>
      </div>
    </div>
  );
}

export function RecentDonationItem({ icon, title, org, date, points }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-900">{title}</h4>
          <p className="text-xs text-gray-500 mt-0.5">{org}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-400 mb-0.5">{date}</p>
        <p className="text-sm font-bold text-green-600">{points}</p>
      </div>
    </div>
  );
}

export function Stepper({ steps, currentStep }) {
  return (
    <div className="flex items-center gap-8 border-b border-gray-200 mb-8 mt-2">
      {steps.map((step) => {
        const isActive = step.num === currentStep;
        return (
          <div 
            key={step.num}
            className={`flex items-center gap-2 pb-3 mb-[-1px] font-medium text-sm transition-colors ${
              isActive 
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-gray-400 border-b-2 border-transparent'
            }`}
          >
            <span>{step.num}.</span>
            <span>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
