import React, { useState, useEffect, useRef } from 'react';
import { CURRICULUM, CLASSES } from './constants';
import { FormData, MindMapResult } from './types';
import { generateMindMap } from './services/geminiService';
import Loading from './components/Loading';

// Icons
const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-700">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
  </svg>
);

const DownloadMapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
  </svg>
);

const ZoomInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
);

const ZoomOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
  </svg>
);

const GraduationCapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
    <path d="M6 12v5c3 0 6-2 6-5.5"/>
  </svg>
);

// Subject styling logic
const getSubjectStyles = (subject: string) => {
  if (!subject) return 'bg-white border-gray-200';
  const sub = subject.toLowerCase();
  
  if (sub.includes('math')) return 'bg-blue-50 border-blue-200 text-blue-800';
  if (sub.includes('science') && !sub.includes('social')) return 'bg-emerald-50 border-emerald-200 text-emerald-800';
  if (sub.includes('english')) return 'bg-orange-50 border-orange-200 text-orange-800';
  // Default/Social Science/Others
  return 'bg-red-50 border-red-200 text-red-800'; 
};

export default function App() {
  const [formData, setFormData] = useState<FormData>({
    selectedClass: '',
    selectedSubject: '',
    selectedChapter: '',
    customInstructions: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MindMapResult | null>(null);
  const [zoom, setZoom] = useState(1);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('mindmap_prefs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({
          ...prev,
          selectedClass: parsed.selectedClass || '',
          selectedSubject: parsed.selectedSubject || '',
          selectedChapter: parsed.selectedChapter || '',
        }));
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('mindmap_prefs', JSON.stringify({
      selectedClass: formData.selectedClass,
      selectedSubject: formData.selectedSubject,
      selectedChapter: formData.selectedChapter
    }));
  }, [formData.selectedClass, formData.selectedSubject, formData.selectedChapter]);

  const subjects = formData.selectedClass ? Object.keys(CURRICULUM[formData.selectedClass] || {}) : [];
  const chapters = (formData.selectedClass && formData.selectedSubject) 
    ? CURRICULUM[formData.selectedClass][formData.selectedSubject] || [] 
    : [];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'selectedClass') {
        newData.selectedSubject = '';
        newData.selectedChapter = '';
      }
      if (field === 'selectedSubject') {
        newData.selectedChapter = '';
      }
      return newData;
    });
  };

  const validateForm = (): boolean => {
    if (!formData.selectedClass) return false;
    if (!formData.selectedSubject) return false;
    if (!formData.selectedChapter) return false;
    if (formData.customInstructions.length > 50) return false;
    return true;
  };

  const handleGenerate = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    setZoom(1);

    try {
      const data = await generateMindMap(formData);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadImage = async () => {
    // Select the specific SVG inside the generated container
    const svgElement = document.querySelector('#generated-mindmap-container svg');
    if (!svgElement) {
        alert("Map not found");
        return;
    }

    try {
        // Create SVG Blob
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);
        const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            // Get accurate bounding box of the element
            const bbox = svgElement.getBoundingClientRect();
            
            // Normalize resolution: 
            // Divide by current zoom to get original size, then scale up for quality (2x)
            const baseScale = 2;
            const effectiveScale = baseScale / zoom; 
            
            canvas.width = bbox.width * effectiveScale;
            canvas.height = bbox.height * effectiveScale;
            
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // White background
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw image filling the canvas
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                const pngUrl = canvas.toDataURL('image/png');
                
                const a = document.createElement('a');
                a.href = pngUrl;
                a.download = `${formData.selectedChapter.replace(/[^a-z0-9]/gi, '_')}_MindMap.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
            URL.revokeObjectURL(url);
        };
        img.onerror = () => {
             alert("Failed to render image");
             URL.revokeObjectURL(url);
        };
        img.src = url;
    } catch (e) {
        console.error("Image download failed", e);
        alert("Failed to download image.");
    }
  };

  const handleDownloadNotes = () => {
      if (!result?.markdown) return;
      
      const blob = new Blob([result.markdown], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formData.selectedChapter.replace(/[^a-z0-9]/gi, '_')}_Notes.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const handleRegenerate = () => {
    setResult(null);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const renderContent = (text: string) => {
    // Advanced parsing to remove markdown artifacts and style HTML
    let cleanedText = text
      .replace(/^# .*$/gm, '')
      .replace(/^## (.*$)/gm, '<h3 class="text-lg font-bold text-red-900 mt-5 mb-2 pb-1 border-b border-red-100">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-red-700 font-bold">$1</strong>')
      .replace(/^\* (.*$)/gm, '<div class="flex items-start gap-2 mb-2"><span class="text-yellow-600 mt-1.5 text-[10px]">●</span><span class="text-gray-700 text-sm leading-relaxed">$1</span></div>')
      .replace(/^(\d+)\. (.*$)/gm, '<div class="flex items-start gap-2 mb-2"><span class="bg-red-50 text-red-800 text-xs font-bold px-1.5 py-0.5 rounded border border-red-100 min-w-[20px] text-center">$1</span><span class="text-gray-700 text-sm leading-relaxed">$2</span></div>');

    return (
      <div 
        className="font-sans"
        dangerouslySetInnerHTML={{ __html: cleanedText }} 
      />
    );
  };

  return (
    // Background gradient: Gray-50 -> Red-50 -> Yellow-50
    <div className="min-h-screen pb-32 relative bg-gradient-to-br from-gray-50 via-red-50 to-yellow-50">
      
      <main className="max-w-md mx-auto px-4 pt-8">
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 shadow-sm">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        {/* Global Title - Visible on both screens */}
        <div className="text-center mb-6">
           <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">AI Study Mind Map</h1>
           
           {/* Tagline - Visible only on Home Screen (when no result) */}
           {!result && !isLoading && (
              <p className="text-gray-500 text-sm px-4 font-medium animate-in fade-in slide-in-from-top-1">
                 Generate comprehensive study mind maps for your subjects
              </p>
           )}
        </div>

        {/* Input Form Section */}
        {!result && !isLoading && (
          <div ref={formRef} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 input-section">
            
            {/* Class Selection - Styled as yellow buttons */}
            <div className="bg-white p-5 rounded-2xl shadow-xl border border-gray-100">
              <label className="block text-sm font-bold text-gray-900 mb-3 ml-1">
                Select Class <span className="text-red-500">●</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {CLASSES.map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => handleInputChange('selectedClass', cls)}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 border-2 ${
                      formData.selectedClass === cls
                        ? 'bg-yellow-400 border-yellow-400 text-red-900 shadow-md transform scale-105'
                        : 'bg-white border-gray-100 text-gray-500 hover:border-red-100 hover:bg-red-50'
                    }`}
                  >
                    <GraduationCapIcon />
                    <span>Class {cls}th</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Selection */}
            <div className={`transition-all duration-300 ${!formData.selectedClass ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
              <div className="bg-white p-5 rounded-2xl shadow-xl border border-gray-100">
                <label className="block text-sm font-bold text-gray-900 mb-3 ml-1">
                  Select Subject <span className="text-red-500">●</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.selectedSubject}
                    onChange={(e) => handleInputChange('selectedSubject', e.target.value)}
                    className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 block p-4 appearance-none font-medium transition-shadow"
                    disabled={!formData.selectedClass}
                  >
                    <option value="">Choose a subject...</option>
                    {subjects.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Chapter Selection */}
            <div className={`transition-all duration-300 ${!formData.selectedSubject ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
              <div className="bg-white p-5 rounded-2xl shadow-xl border border-gray-100">
                <label className="block text-sm font-bold text-gray-900 mb-3 ml-1">
                   Select Chapter <span className="text-red-500">●</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.selectedChapter}
                    onChange={(e) => handleInputChange('selectedChapter', e.target.value)}
                    className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 block p-4 appearance-none font-medium transition-shadow"
                    disabled={!formData.selectedSubject}
                  >
                    <option value="">Choose a chapter...</option>
                    {chapters.map(chap => (
                      <option key={chap} value={chap}>{chap}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Instructions */}
            <div className="bg-white p-5 rounded-2xl shadow-xl border border-gray-100">
              <label className="block text-sm font-bold text-gray-900 mb-2 ml-1">
                Custom Focus <span className="text-gray-400 font-normal text-xs ml-1">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.customInstructions}
                onChange={(e) => handleInputChange('customInstructions', e.target.value)}
                maxLength={50}
                placeholder="e.g. Focus on hard formulas"
                className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 block p-4 transition-shadow"
              />
              <div className="flex justify-end mt-1">
                <span className={`text-xs font-medium ${formData.customInstructions.length >= 50 ? 'text-red-500' : 'text-gray-400'}`}>
                  {formData.customInstructions.length}/50
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && <div className="loading-state"><Loading /></div>}

        {/* Result Display */}
        {result && (
          <div className="animate-in fade-in zoom-in duration-300 result-container pb-10">
            
            {/* Header for Print only */}
            <div className="print-header">
              {formData.selectedChapter}
            </div>

            {/* Subject Tag */}
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 shadow-sm ${getSubjectStyles(formData.selectedSubject)}`}>
              {formData.selectedClass}th • {formData.selectedSubject}
            </div>

            {/* SVG Visual Map */}
            {result.svg && (
              <div className="relative bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden mb-6 mindmap-svg-container">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Visual Map</h2>
                  <div className="text-red-700 opacity-80">
                     <BrainIcon />
                  </div>
                </div>

                {/* Zoom Controls */}
                <div className="absolute top-14 right-4 flex flex-col gap-2 z-10 no-print" data-html2canvas-ignore>
                   <button 
                    onClick={() => setZoom(z => Math.min(z + 0.2, 3))}
                    className="bg-white shadow-md border border-gray-200 w-8 h-8 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:text-red-700 transition-colors"
                    aria-label="Zoom In"
                   >
                     <ZoomInIcon />
                   </button>
                   <button 
                    onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}
                    className="bg-white shadow-md border border-gray-200 w-8 h-8 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:text-red-700 transition-colors"
                    aria-label="Zoom Out"
                   >
                     <ZoomOutIcon />
                   </button>
                </div>

                <div className="p-4 overflow-auto flex justify-center bg-white min-h-[300px] touch-pan-x touch-pan-y">
                  <div 
                    id="generated-mindmap-container"
                    className="w-full h-auto transition-transform duration-200 origin-top-center"
                    style={{ transform: `scale(${zoom})` }}
                    dangerouslySetInnerHTML={{ __html: result.svg }} 
                  />
                </div>
              </div>
            )}

            {/* Markdown Summary */}
            <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-red-50 px-5 py-3 border-b border-red-100 flex justify-between items-center">
                <h2 className="font-bold text-red-900 text-sm uppercase tracking-wide">Quick Notes</h2>
                <div className="flex items-center gap-2">
                   <button 
                    onClick={handleDownloadNotes}
                    className="bg-white hover:bg-red-100 text-red-600 border border-red-200 rounded p-1 transition-colors"
                    title="Download Notes"
                   >
                      <DownloadIcon />
                   </button>
                   <div className="bg-white px-2 py-1 rounded-md border border-red-100 text-xs text-red-600 font-bold shadow-sm">
                     Exam Ready
                   </div>
                </div>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar bg-white">
                {renderContent(result.markdown)}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-200 p-4 z-20 action-buttons" data-html2canvas-ignore>
        <div className="max-w-md mx-auto">
          {!result ? (
            <button
              onClick={handleGenerate}
              type="button"
              disabled={!validateForm() || isLoading}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-xl ${
                !validateForm() || isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                  : 'bg-red-700 text-white hover:bg-red-800 hover:shadow-red-200'
              }`}
            >
              <SparklesIcon />
              {isLoading ? 'Generating...' : 'Generate Mind Map'}
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleRegenerate}
                className="col-span-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-gray-700 bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:scale-95 transition-all"
              >
                <RefreshIcon />
                <span>Regenerate</span>
              </button>

              <button
                onClick={handleDownloadImage}
                className="col-span-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-red-700 hover:bg-red-800 shadow-lg shadow-red-200 active:scale-95 transition-all"
              >
                <DownloadMapIcon />
                <span>Download Map</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}