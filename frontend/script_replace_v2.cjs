const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const files = [
  'Bills.jsx', 'CallRecords.jsx', 'Complaints.jsx', 
  'Customers.jsx', 'Payments.jsx', 'Plans.jsx', 'SimCards.jsx'
];

const replacements = [
  { from: /text-gray-900/g, to: 'text-zinc-100 tracking-tight' },
  { from: /text-gray-500/g, to: 'text-zinc-400' },
  { from: /bg-white/g, to: 'bg-[#18181b]' },
  { from: /bg-gray-50/g, to: 'bg-zinc-900' },
  { from: /border-gray-200/g, to: 'border-zinc-800/80' },
  { from: /border-gray-300/g, to: 'border-zinc-700' },
  { from: /text-indigo-600/g, to: 'text-indigo-400' },
  { from: /text-indigo-700/g, to: 'text-indigo-300' },
  { from: /bg-indigo-50/g, to: 'bg-indigo-500/10' },
  
  // Custom structural class swaps
  { from: /bg-\[#18181b\] shadow-sm ring-1 ring-gray-900\/5/g, to: 'bg-[#18181b] border border-zinc-800/80' },
  { from: /px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors/g, to: 'px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all' },
  { from: /px-3 py-1.5 bg-\[#18181b\] border border-zinc-700 text-gray-700 rounded-md text-sm font-medium hover:bg-zinc-900 transition-colors/g, to: 'px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors' },
  { from: /px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-md text-sm font-medium transition-colors/g, to: 'px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-sm font-medium transition-colors' },
  { from: /overflow-x-auto min-w-full/g, to: 'overflow-x-auto min-w-full rounded-b-lg' },
  { from: /px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider/g, to: 'px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider' },
  { from: /px-4 py-4 whitespace-nowrap/g, to: 'px-6 py-4 whitespace-nowrap' },
  
  // Forms
  { from: /block w-full rounded-md border-0 py-1.5 px-3 text-zinc-100 tracking-tight shadow-sm ring-1 ring-inset ring-zinc-700 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-400 sm:text-sm sm:leading-6/g, to: 'block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors' },
  { from: /block w-full rounded-md border-0 py-1.5 px-3 text-zinc-100 tracking-tight shadow-sm ring-1 ring-inset ring-zinc-700 focus:ring-2 focus:ring-inset focus:ring-indigo-400 sm:text-sm sm:leading-6 bg-\[#18181b\] cursor-pointer/g, to: 'block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors cursor-pointer appearance-none' },

];

files.forEach(file => {
  const filePath = path.join(pagesDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // First pass generic colors
    content = content.replace(/text-gray-900/g, 'text-zinc-100 tracking-tight');
    content = content.replace(/text-gray-500/g, 'text-zinc-400');
    content = content.replace(/bg-white/g, 'bg-[#18181b]');
    content = content.replace(/bg-gray-50/g, 'bg-zinc-900');
    content = content.replace(/border-gray-200/g, 'border-zinc-800/80');
    content = content.replace(/border-gray-300/g, 'border-zinc-700');
    content = content.replace(/text-indigo-600/g, 'text-indigo-400');
    content = content.replace(/text-indigo-700/g, 'text-indigo-300');
    content = content.replace(/bg-indigo-50/g, 'bg-indigo-500/10');
    
    // Second pass complex structural strings
    content = content.replace(/bg-\[#18181b\] shadow-sm ring-1 ring-zinc-100 tracking-tight\/5 rounded-lg/g, 'bg-[#18181b] border border-zinc-800/80 rounded-2xl');
    content = content.replace(/px-4 py-2 bg-indigo-500\/100 text-\[#18181b\]/g, 'px-4 py-2 bg-indigo-500 text-white'); // Fix accidental replace
    content = content.replace(/px-4 py-2 bg-indigo-[0-9]+\/?[0-9]* text-\[#18181b\] rounded-md text-sm font-medium hover:bg-indigo-[0-9]+\/?[0-9]* shadow-sm transition-colors/g, 'px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all');
    content = content.replace(/px-3 py-1\.5 bg-\[#18181b\] border border-zinc-700 text-gray-700 rounded-md text-sm font-medium hover:bg-zinc-900 transition-colors/g, 'px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors');
    content = content.replace(/px-3 py-1\.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-md text-sm font-medium transition-colors/g, 'px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-sm font-medium transition-colors');
    content = content.replace(/overflow-x-auto min-w-full/g, 'overflow-x-auto min-w-full rounded-b-2xl');
    
    // Header formatting
    content = content.replace(/px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider/g, 'px-6 py-5 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider');
    content = content.replace(/px-4 py-4 whitespace-nowrap/g, 'px-6 py-5 whitespace-nowrap');
    
    // Forms
    content = content.replace(/block w-full rounded-md border-0 py-1\.5 px-3 text-zinc-100 tracking-tight shadow-sm ring-1 ring-inset ring-zinc-700 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-400 sm:text-sm sm:leading-6/g, 'block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors');
    content = content.replace(/block w-full rounded-md border-0 py-1\.5 px-3 text-zinc-100 tracking-tight shadow-sm ring-1 ring-inset ring-zinc-700 focus:ring-2 focus:ring-inset focus:ring-indigo-400 sm:text-sm sm:leading-6 bg-\[#18181b\] cursor-pointer/g, 'block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors cursor-pointer');

    fs.writeFileSync(filePath, content);
    console.log('Fixed ' + file);
  }
});
