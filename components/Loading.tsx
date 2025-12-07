import React from 'react';

const AdBanner = () => {
  const adSrc = `
    <html>
      <head>
        <style>
          body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; }
        </style>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key' : 'e32d2498283b7d6c732a08a53e0f7c64',
            'format' : 'iframe',
            'height' : 50,
            'width' : 320,
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="//www.highperformanceformat.com/e32d2498283b7d6c732a08a53e0f7c64/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div className="mt-8 w-full flex justify-center">
      <div className="overflow-hidden rounded-lg shadow-sm border border-gray-100 bg-white">
        <iframe 
          title="Advertisement"
          srcDoc={adSrc} 
          width="320" 
          height="50" 
          style={{ border: 'none', display: 'block' }}
          scrolling="no"
        />
      </div>
    </div>
  );
};

const Loading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-red-100 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <h3 className="mt-6 text-lg font-bold text-gray-800 animate-pulse">
        Generating Study Map...
      </h3>
      <p className="mt-2 text-xs text-yellow-700 font-medium text-center bg-yellow-50 px-3 py-1 rounded-full">
        Optimizing for Exam Success
      </p>
      
      <AdBanner />
    </div>
  );
};

export default Loading;