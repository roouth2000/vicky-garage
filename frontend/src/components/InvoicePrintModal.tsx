import React, { useState } from 'react';
import { X, Printer, Download, FileText } from 'lucide-react';
import { Bill } from '../types';
import { InvoiceDocument } from './InvoiceDocument';
import { formatBillNo } from '../utils/format';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface InvoicePrintModalProps {
  bill: Bill;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({ bill, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      setIsExporting(true);
      const element = document.getElementById('printable-invoice');
      if (!element) {
        alert('Invoice element not found. Please try again.');
        return;
      }

      // Allow a brief moment for fonts/images to render properly
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Bill_${bill.vehicle_number.replace(/\s+/g, '_')}.pdf`);

    } catch (err) {
      console.error('PDF export error:', err);
      alert('Failed to generate PDF. You can also use the Print button to Save as PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">

        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Invoice Preview - Bill #{formatBillNo(bill.bill_no)}</h2>
              <p className="text-xs text-slate-400">Vehicle: {bill.vehicle_number} | Customer: {bill.customer_name}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:space-x-3 w-full sm:w-auto mt-2 sm:mt-0">
            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            {/* Download PDF */}
            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area Scroll View */}
        <div className="flex-1 overflow-auto p-4 bg-slate-100 min-w-0">
          <InvoiceDocument bill={bill} />
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            <span>Print ready A4 paper format</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-md font-medium transition-colors"
          >
            Close Preview
          </button>
        </div>

      </div>
    </div>
  );
};
