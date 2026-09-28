const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function generatePDFs() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  if (!fs.existsSync(edgePath)) {
    console.error('Microsoft Edge not found at:', edgePath);
    process.exit(1);
  }

  console.log('Launching Edge browser at:', edgePath);
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const docsDir = path.resolve(__dirname, '..', 'docs');

  // 1. Generate 60-Page Major Project Report PDF
  const reportHtmlPath = path.join(docsDir, 'PRINT_PROJECT_REPORT.html');
  const reportPdfPath = path.join(docsDir, 'MAJOR_PROJECT_REPORT_60_PAGES.pdf');

  console.log('Rendering Major Project Report to PDF...');
  const page1 = await browser.newPage();
  await page1.goto('file:///' + reportHtmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await page1.pdf({
    path: reportPdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '15mm',
      bottom: '15mm',
      left: '15mm',
      right: '15mm'
    }
  });
  await page1.close();
  console.log('Successfully generated:', reportPdfPath);

  // 2. Generate Viva & Presentation Defense Guide PDF
  const vivaHtmlPath = path.join(docsDir, 'PRINT_VIVA_GUIDE.html');
  const vivaPdfPath = path.join(docsDir, 'PROJECT_VIVA_EXPLANATION_GUIDE.pdf');

  console.log('Rendering Viva Explanation Guide to PDF...');
  const page2 = await browser.newPage();
  await page2.goto('file:///' + vivaHtmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await page2.pdf({
    path: vivaPdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '15mm',
      bottom: '15mm',
      left: '15mm',
      right: '15mm'
    }
  });
  await page2.close();
  console.log('Successfully generated:', vivaPdfPath);

  await browser.close();
  console.log('All PDF files generated successfully!');
}

generatePDFs().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
