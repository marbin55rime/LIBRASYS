import React, { useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logo from '../assets/logo.png';

const PdfGenerator = ({ reservationDetails, triggerDownload }) => {
  const pdfContentRef = useRef();

  useEffect(() => {
    if (triggerDownload && reservationDetails) {
      generatePdf();
    }
  }, [triggerDownload, reservationDetails]);

  const generatePdf = async () => {
    const input = pdfContentRef.current;
    if (!input) return;

    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = canvas.height * imgWidth / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`reservation_receipt_${reservationDetails.book.title.replace(/\s/g, '_')}.pdf`);
  };

  if (!reservationDetails) return null;

  return (
    <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
      <div ref={pdfContentRef} style={{ padding: '8mm', fontFamily: 'Arial, sans-serif', fontSize: '7pt', color: '#333', width: '210mm', minHeight: '297mm', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8mm' }}>
          <div style={{ flex: 1 }}>
            <img src={logo} alt="LibraSys Logo" style={{ width: '20mm' }} />
          </div>
          <div style={{ flex: 2, textAlign: 'right' }}>
            <h1 style={{ fontSize: '14pt', margin: '0', color: '#0056b3' }}>Reservation Receipt</h1>
            <p style={{ fontSize: '7pt', margin: '1mm 0 0', color: '#555' }}>A Smarter Way to Manage Books and Borrowers</p>
          </div>
        </div>

        <div style={{ border: '1px solid #eee', borderRadius: '5px', padding: '8mm', marginBottom: '8mm', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '10pt', marginBottom: '6mm', color: '#0056b3' }}>User Details</h2>
          <div style={{ display: 'flex', marginBottom: '6mm' }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 2mm 0' }}><strong>Name:</strong> {reservationDetails.user.firstName} {reservationDetails.user.lastName}</p>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 2mm 0' }}><strong>Email:</strong> {reservationDetails.user.email}</p>
            </div>
          </div>

          <h2 style={{ fontSize: '10pt', marginBottom: '6mm', color: '#0056b3' }}>Reservation Details</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6mm' }}>
            <tbody>
              <tr><td style={{ padding: '1.5mm', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Book Title:</td><td style={{ padding: '1.5mm', borderBottom: '1px solid #eee' }}>{reservationDetails.book.title}</td></tr>
              <tr><td style={{ padding: '1.5mm', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Author:</td><td style={{ padding: '1.5mm', borderBottom: '1px solid #eee' }}>{reservationDetails.book.author}</td></tr>
              <tr><td style={{ padding: '1.5mm', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Reservation Date:</td><td style={{ padding: '1.5mm', borderBottom: '1px solid #eee' }}>{new Date(reservationDetails.reservationDate).toLocaleDateString()}</td></tr>
              <tr><td style={{ padding: '1.5mm', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Duration:</td><td style={{ padding: '1.5mm', borderBottom: '1px solid #eee' }}>{reservationDetails.durationInWeeks} week(s)</td></tr>
              <tr><td style={{ padding: '1.5mm', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Reservation Period:</td><td style={{ padding: '1.5mm', borderBottom: '1px solid #eee' }}>{reservationDetails.reservationStartDate ? `${new Date(reservationDetails.reservationStartDate).toLocaleDateString()} - ${new Date(reservationDetails.reservationEndDate).toLocaleDateString()}` : 'N/A'}</td></tr>
              <tr><td style={{ padding: '1.5mm', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Borrow Expiry Date:</td><td style={{ padding: '1.5mm', borderBottom: '1px solid #eee' }}>{reservationDetails.borrowExpiryDate ? new Date(reservationDetails.borrowExpiryDate).toLocaleDateString() : 'N/A'}</td></tr>
              <tr><td style={{ padding: '1.5mm', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Status:</td><td style={{ padding: '1.5mm', borderBottom: '1px solid #eee' }}>{reservationDetails.status}</td></tr>
            </tbody>
          </table>

          <div style={{ textAlign: 'right', marginTop: '8mm', fontSize: '10pt' }}>
            <p style={{ margin: '0', fontWeight: 'bold' }}>Total Fine: <span style={{ color: reservationDetails.fineAmount > 0 ? 'red' : '#333' }}>৳{reservationDetails.fineAmount ? reservationDetails.fineAmount.toFixed(2) : '0.00'}</span></p>
          </div>
        </div>

        {reservationDetails.fineAmount > 0 && (
          <div style={{ border: '1px solid #ff0000', borderRadius: '5px', padding: '6mm', backgroundColor: '#ffebeb', color: '#ff0000', marginBottom: '8mm' }}>
            <p style={{ margin: '0', fontWeight: 'bold', fontSize: '8pt' }}>Important Notice:</p>
            <p style={{ margin: '1.5mm 0 0 0', fontSize: '7pt' }}>
              Please settle your outstanding fine promptly. Unpaid fines may accrue further charges as per library policy.
            </p>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '10mm', fontSize: '6pt', color: '#888' }}>
          <p>Thank you for using LibraSys. For any queries, please contact support.</p>
          <p>&copy; {new Date().getFullYear()} LibraSys. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default PdfGenerator;
