const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const files = [
  'Bills.jsx', 'CallRecords.jsx', 'Complaints.jsx', 
  'Customers.jsx', 'Payments.jsx', 'Plans.jsx', 'SimCards.jsx'
];

const replacements = [
  { from: /px-4 py-4 whitespace-nowrap text-sm text-gray-500 px-4 py-4 whitespace-nowrap text-sm text-gray-500/g, to: 'px-4 py-4 whitespace-nowrap text-sm text-gray-500' }
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
