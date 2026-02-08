import { ReactNode } from 'react';

interface DeviceFrameProps {
  children: ReactNode;
  device: 'none' | 'iphone' | 'ipad' | 'macbook' | 'android';
  className?: string;
}

export function DeviceFrame({ children, device, className = '' }: DeviceFrameProps) {
  if (device === 'none') {
    return <div className={className}>{children}</div>;
  }

  switch (device) {
    case 'iphone':
      return <IPhoneFrame className={className}>{children}</IPhoneFrame>;
    case 'ipad':
      return <IPadFrame className={className}>{children}</IPadFrame>;
    case 'macbook':
      return <MacBookFrame className={className}>{children}</MacBookFrame>;
    case 'android':
      return <AndroidFrame className={className}>{children}</AndroidFrame>;
    default:
      return <div className={className}>{children}</div>;
  }
}

function IPhoneFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="relative">
        {/* Phone Body */}
        <div className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
          {/* Side Buttons */}
          <div className="absolute -left-1 top-24 w-1 h-8 bg-gray-800 rounded-l" />
          <div className="absolute -left-1 top-36 w-1 h-12 bg-gray-800 rounded-l" />
          <div className="absolute -left-1 top-52 w-1 h-12 bg-gray-800 rounded-l" />
          <div className="absolute -right-1 top-32 w-1 h-16 bg-gray-800 rounded-r" />

          {/* Screen Container */}
          <div className="relative bg-black rounded-[2.5rem] overflow-hidden">
            {/* Dynamic Island */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-10" />

            {/* Status Bar */}
            <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-8 z-10 text-white text-xs">
              <span className="font-semibold">9:41</span>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3C8.5 3 5.5 4.5 3.5 7L12 21l8.5-14C18.5 4.5 15.5 3 12 3z" />
                </svg>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2 9h4v12H2V9zm6-4h4v16H8V5zm6 8h4v8h-4v-8zm6-6h4v14h-4V7z" />
                </svg>
                <div className="w-6 h-3 border border-white rounded-sm relative">
                  <div className="absolute inset-0.5 bg-white rounded-sm" style={{ width: '80%' }} />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="w-[375px] h-[812px] overflow-hidden">
              {children}
            </div>

            {/* Home Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/50 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function AndroidFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="relative">
        {/* Phone Body */}
        <div className="relative bg-gray-800 rounded-[2rem] p-2 shadow-2xl">
          {/* Side Buttons */}
          <div className="absolute -right-1 top-24 w-1 h-16 bg-gray-700 rounded-r" />
          <div className="absolute -right-1 top-44 w-1 h-10 bg-gray-700 rounded-r" />

          {/* Screen Container */}
          <div className="relative bg-black rounded-[1.75rem] overflow-hidden">
            {/* Camera Punch Hole */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-900 rounded-full z-10 border-2 border-gray-800" />

            {/* Status Bar */}
            <div className="absolute top-0 left-0 right-0 h-8 flex items-center justify-between px-6 z-10 text-white text-xs">
              <span>10:30</span>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3C8.5 3 5.5 4.5 3.5 7L12 21l8.5-14C18.5 4.5 15.5 3 12 3z" />
                </svg>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2 9h4v12H2V9zm6-4h4v16H8V5zm6 8h4v8h-4v-8z" />
                </svg>
                <span>85%</span>
              </div>
            </div>

            {/* Content */}
            <div className="w-[360px] h-[780px] overflow-hidden">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IPadFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="relative">
        {/* iPad Body */}
        <div className="relative bg-gray-900 rounded-[2rem] p-4 shadow-2xl">
          {/* Camera */}
          <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-gray-700 rounded-full" />

          {/* Screen Container */}
          <div className="relative bg-black rounded-xl overflow-hidden">
            {/* Status Bar */}
            <div className="absolute top-0 left-0 right-0 h-6 flex items-center justify-between px-4 z-10 text-white text-xs bg-black/50">
              <span>iPad</span>
              <span>9:41 AM</span>
              <span>100%</span>
            </div>

            {/* Content */}
            <div className="w-[820px] h-[1180px] overflow-hidden scale-[0.6] origin-top-left">
              <div className="w-[1366px] h-[1966px]">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MacBookFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      {/* Screen */}
      <div className="relative">
        {/* Bezel */}
        <div className="bg-gray-900 rounded-t-xl p-2 pb-4">
          {/* Camera */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-700 rounded-full" />
          <div className="absolute top-1 left-1/2 -translate-x-1/2 translate-x-1 w-1 h-1 bg-green-500 rounded-full animate-pulse" />

          {/* Screen */}
          <div className="relative bg-black rounded-lg overflow-hidden shadow-inner">
            {/* macOS Menu Bar */}
            <div className="absolute top-0 left-0 right-0 h-6 bg-gray-800/90 backdrop-blur flex items-center px-3 z-10 text-white text-xs">
              <div className="flex items-center gap-4">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83" />
                </svg>
                <span className="font-semibold">Finder</span>
                <span>File</span>
                <span>Edit</span>
                <span>View</span>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <span>Fri Jan 24</span>
                <span>9:41 AM</span>
              </div>
            </div>

            {/* Content */}
            <div className="w-[1280px] h-[800px] overflow-hidden">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Base */}
      <div className="relative">
        {/* Hinge */}
        <div className="w-full h-3 bg-gradient-to-b from-gray-700 to-gray-800 rounded-b-sm" />
        {/* Bottom */}
        <div className="w-[120%] h-1 -ml-[10%] bg-gray-800 rounded-b-xl" />
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-2 bg-gray-700 rounded-b-lg" />
      </div>
    </div>
  );
}

// Device selector component
interface DeviceSelectorProps {
  selected: 'none' | 'iphone' | 'ipad' | 'macbook' | 'android';
  onChange: (device: 'none' | 'iphone' | 'ipad' | 'macbook' | 'android') => void;
}

export function DeviceSelector({ selected, onChange }: DeviceSelectorProps) {
  const devices = [
    { id: 'none' as const, label: 'None', icon: '🖥️' },
    { id: 'iphone' as const, label: 'iPhone', icon: '📱' },
    { id: 'android' as const, label: 'Android', icon: '📱' },
    { id: 'ipad' as const, label: 'iPad', icon: '📲' },
    { id: 'macbook' as const, label: 'MacBook', icon: '💻' },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      {devices.map(device => (
        <button
          key={device.id}
          onClick={() => onChange(device.id)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
            selected === device.id
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          title={device.label}
        >
          <span className="mr-1">{device.icon}</span>
          <span className="hidden sm:inline">{device.label}</span>
        </button>
      ))}
    </div>
  );
}
