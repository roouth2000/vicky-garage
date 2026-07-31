import http from 'http';
import fs from 'fs';
import path from 'path';

async function testPdfExport() {
  console.log('Testing PDF export endpoint...');

  const sampleHtml = `
    <div id="printable-invoice" class="invoice-document font-text" style="width: 190mm; max-width: 190mm; margin: 0 auto; background-color: #ffffff; padding: 3mm 4mm; border: 2px solid #1a237e; box-sizing: border-box; font-family: 'Bookman Old Style', serif; color: #1a237e; font-size: 14px;">
      <div style="text-align: center; font-weight: bold; font-size: 15px; border-bottom: 1.5px solid #1a237e; padding-bottom: 2px;">BILL</div>
      <div style="display: grid; grid-template-columns: 2.5fr 7fr 2.5fr; border-bottom: 2px solid #1a237e; align-items: center;">
        <div style="border-right: 2px solid #1a237e; padding: 6px 8px;">
          <span style="font-size: 15px; font-weight: bold; display: block;">BILL</span>
          <span style="font-size: 19px; font-weight: 900;">No: <span style="font-family: Arial;">001</span></span>
        </div>
        <div style="text-align: center; padding: 6px 8px;">
          <h1 style="font-size: 34px; font-weight: 900; margin: 0;">VICKY'S GARAGE</h1>
          <p style="font-size: 13px; font-weight: bold; font-style: italic; margin-top: 2px;">Specialized in Royal Enfield</p>
        </div>
        <div style="border-left: 2px solid #1a237e; padding: 6px 8px; text-align: right;">
          <p style="font-size: 10px; font-weight: bold; margin: 0 0 2px 0;">U.Vignesh Kumar</p>
          <p style="font-size: 10px; font-weight: bold; margin: 0;">📞 <span style="font-family: Arial;">+91 99417 49495</span></p>
        </div>
      </div>
      <div style="border-bottom: 2px solid #1a237e; padding: 4px 0; text-align: center; font-size: 12px; font-weight: bold;">
        Old No: 22/2, New No: 53/2, Gangaiamman Koil Street, Choolaimedu, Chennai - 600094
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; border-bottom: 2px solid #1a237e; font-size: 14px; font-weight: bold;">
        <div style="border-right: 2px solid #1a237e; border-bottom: 1px solid #1a237e; padding: 5px 8px;">To: THUNDER BIRD 350</div>
        <div style="border-bottom: 1px solid #1a237e; padding: 5px 8px;">Date: 21-07-2026</div>
        <div style="border-right: 2px solid #1a237e; padding: 5px 8px;">Vehicle No: 5041</div>
        <div style="padding: 5px 8px;">KM: -</div>
      </div>
    </div>
  `;

  const data = JSON.stringify({ html: sampleHtml });

  const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/bills/generate-pdf',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  }, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

    const chunks: Buffer[] = [];
    res.on('data', (chunk) => chunks.push(chunk));
    res.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      console.log(`PDF Generated successfully! Size: ${pdfBuffer.length} bytes`);
      if (pdfBuffer.length > 5000 && pdfBuffer.toString('utf8', 0, 5) === '%PDF-') {
        console.log('PDF Header Valid (%PDF-)');
      } else {
        console.error('PDF Generation check failed, invalid header/buffer size.');
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.write(data);
  req.end();
}

testPdfExport();
