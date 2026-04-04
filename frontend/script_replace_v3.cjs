const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const files = [
  'Bills.jsx', 'CallRecords.jsx', 'Complaints.jsx', 
  'Customers.jsx', 'Payments.jsx', 'Plans.jsx', 'SimCards.jsx'
];

const replacements = [
  { 
    from: /className="block w-full rounded-md border-0 py-1\.5 px-3 text-zinc-100 tracking-tight shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/g, 
    to: 'className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"' 
  },
  { 
    from: /className="block w-full rounded-md border-0 py-1\.5 px-3 text-zinc-100 tracking-tight shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-\[#18181b\] cursor-pointer"/g, 
    to: 'className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 px-3 text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors cursor-pointer appearance-none"' 
  },
  {
    // The previous script accidentally injected text-indigo-600/white text incorrectly.
    from: /px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors/g,
    to: 'px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all'
  }
];

files.forEach(file => {
  const filePath = path.join(pagesDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    replacements.forEach(r => {
      content = content.replace(r.from, r.to);
    });

    fs.writeFileSync(filePath, content);
    console.log('Fixed ' + file);
  }
});
