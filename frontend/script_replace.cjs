const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const files = [
  'Bills.jsx', 'CallRecords.jsx', 'Complaints.jsx', 
  'Customers.jsx', 'Payments.jsx', 'Plans.jsx', 'SimCards.jsx'
];

const replacements = [
  { from: /text-dark-100/g, to: 'text-gray-900' },
  { from: /text-dark-[2345]00/g, to: 'text-gray-500' },
  { from: /text-primary-400/g, to: 'text-indigo-600' },
  { from: /text-emerald-400/g, to: 'text-green-600' },
  { from: /btn-primary/g, to: 'px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors' },
  { from: /btn-secondary/g, to: 'px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors' },
  { from: /btn-danger/g, to: 'px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-md text-sm font-medium transition-colors' },
  { from: /glass-card/g, to: 'bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg' },
  { from: /animate-fade-in-up/g, to: '' },
  { from: /style={{[^}]*animationDelay[^}]*}}/g, to: '' },
  { from: /table-container/g, to: 'overflow-x-auto min-w-full' },
  { from: /data-table/g, to: 'min-w-full divide-y divide-gray-200' },
  { from: /<thead>/g, to: '<thead className="bg-gray-50">' },
  { from: /<th>/g, to: '<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">' },
  { from: /<tbody>/g, to: '<tbody className="divide-y divide-gray-200 bg-white">' },
  { from: /<tr>/g, to: '<tr className="hover:bg-gray-50 transition-colors">' },
  { from: /<td>/g, to: '<td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">' },
  { from: /<td\s+className="/g, to: '<td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 ' },
  // status badges
  { from: /status-active/g, to: 'inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20' },
  { from: /status-open/g, to: 'inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10' },
  { from: /status-inactive/g, to: 'inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10' },
  { from: /status-blocked/g, to: 'inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10' },
  { from: /status-badge/g, to: 'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium' },
  // forms
  { from: /input-field/g, to: 'block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6' },
  { from: /select-field/g, to: 'block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white cursor-pointer' },
  { from: /bg-primary-500\/10/g, to: 'bg-indigo-50' },
  { from: /text-primary-300/g, to: 'text-indigo-700' }
];

files.forEach(file => {
  const filePath = path.join(pagesDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    replacements.forEach(r => {
      content = content.replace(r.from, r.to);
    });

    fs.writeFileSync(filePath, content);
    console.log('Updated ' + file);
  } else {
    console.log('File not found: ' + file);
  }
});
