// Utility to generate and download Salary Statement Report PDF

interface SalaryComponent {
  name: string;
  monthlyAmount: number;
  yearlyAmount: number;
}

interface SalaryReportData {
  companyName: string;
  employeeName: string;
  designation: string;
  dateOfJoining: string;
  salaryEffectiveFrom: string;
  earnings: SalaryComponent[];
  deductions: SalaryComponent[];
}

export function generateSalaryStatementPDF(data: SalaryReportData) {
  // Create a new window for printing
  const printWindow = window.open("", "_blank");
  
  if (!printWindow) {
    alert("Please allow pop-ups to download the PDF");
    return;
  }

  // Calculate totals
  const totalEarningsMonthly = data.earnings.reduce(
    (sum, item) => sum + item.monthlyAmount,
    0
  );
  const totalEarningsYearly = data.earnings.reduce(
    (sum, item) => sum + item.yearlyAmount,
    0
  );
  const totalDeductionsMonthly = data.deductions.reduce(
    (sum, item) => sum + item.monthlyAmount,
    0
  );
  const totalDeductionsYearly = data.deductions.reduce(
    (sum, item) => sum + item.yearlyAmount,
    0
  );
  const netSalaryMonthly = totalEarningsMonthly - totalDeductionsMonthly;
  const netSalaryYearly = totalEarningsYearly - totalDeductionsYearly;

  // HTML content for the PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Salary Statement Report</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 40px;
          background: #000;
          color: #fff;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: #0a0a0a;
          border: 1px solid #333;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .header {
          background: #000;
          padding: 20px 30px;
          border-bottom: 2px solid #1e40af;
        }
        
        .header h1 {
          color: #3b82f6;
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 10px;
        }
        
        .content {
          padding: 30px;
        }
        
        .company-name {
          color: #ef4444;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 5px;
        }
        
        .section-title {
          color: #ef4444;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #333;
        }
        
        .employee-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 30px;
        }
        
        .info-group label {
          display: block;
          color: #ef4444;
          font-size: 12px;
          margin-bottom: 5px;
        }
        
        .info-group span {
          display: block;
          color: #fff;
          font-size: 14px;
        }
        
        .salary-table {
          width: 100%;
          margin-top: 20px;
          border-collapse: collapse;
        }
        
        .salary-table thead th {
          color: #ef4444;
          font-size: 13px;
          font-weight: 600;
          text-align: left;
          padding: 12px;
          border-bottom: 1px solid #333;
        }
        
        .salary-table thead th:nth-child(2),
        .salary-table thead th:nth-child(3) {
          text-align: right;
        }
        
        .section-header td {
          color: #ef4444;
          font-weight: 600;
          font-size: 14px;
          padding: 15px 12px 10px;
        }
        
        .salary-table tbody tr td {
          padding: 8px 12px;
          color: #ccc;
          font-size: 13px;
        }
        
        .salary-table tbody tr td:first-child {
          padding-left: 30px;
        }
        
        .salary-table tbody tr td:nth-child(2),
        .salary-table tbody tr td:nth-child(3) {
          text-align: right;
        }
        
        .ellipsis {
          color: #666;
          text-align: center;
        }
        
        .net-salary {
          border-top: 2px solid #333;
          margin-top: 20px;
        }
        
        .net-salary td {
          color: #ef4444;
          font-weight: 600;
          font-size: 14px;
          padding: 15px 12px;
        }
        
        .net-salary td:nth-child(2),
        .net-salary td:nth-child(3) {
          text-align: right;
        }
        
        @media print {
          body {
            background: #000;
            padding: 0;
          }
          
          .container {
            box-shadow: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Salary Statement Report Print</h1>
        </div>
        
        <div class="content">
          <div class="company-name">[${data.companyName}]</div>
          <div class="section-title">Salary Statement Report</div>
          
          <div class="employee-info">
            <div class="info-group">
              <label>Employee Name</label>
              <span>${data.employeeName}</span>
            </div>
            <div class="info-group">
              <label>Date Of Joining</label>
              <span>${data.dateOfJoining}</span>
            </div>
            <div class="info-group">
              <label>Designation</label>
              <span>${data.designation}</span>
            </div>
            <div class="info-group">
              <label>Salary Effective From</label>
              <span>${data.salaryEffectiveFrom}</span>
            </div>
          </div>
          
          <table class="salary-table">
            <thead>
              <tr>
                <th>Salary Components</th>
                <th>Monthly Amount</th>
                <th>Yearly Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr class="section-header">
                <td>Earnings</td>
                <td></td>
                <td></td>
              </tr>
              ${data.earnings.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>₹ ${item.monthlyAmount.toLocaleString('en-IN')}</td>
                <td>₹ ${item.yearlyAmount.toLocaleString('en-IN')}</td>
              </tr>
              `).join('')}
              <tr>
                <td class="ellipsis">:</td>
                <td class="ellipsis">:</td>
                <td class="ellipsis">:</td>
              </tr>
              <tr>
                <td class="ellipsis">:</td>
                <td class="ellipsis">:</td>
                <td class="ellipsis">:</td>
              </tr>
              
              <tr class="section-header">
                <td>Deduction</td>
                <td></td>
                <td></td>
              </tr>
              ${data.deductions.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>₹ ${item.monthlyAmount.toLocaleString('en-IN')}</td>
                <td>₹ ${item.yearlyAmount.toLocaleString('en-IN')}</td>
              </tr>
              `).join('')}
              <tr>
                <td class="ellipsis">:</td>
                <td class="ellipsis">:</td>
                <td class="ellipsis">:</td>
              </tr>
              <tr>
                <td class="ellipsis">:</td>
                <td class="ellipsis">:</td>
                <td class="ellipsis">:</td>
              </tr>
            </tbody>
            <tfoot class="net-salary">
              <tr>
                <td>Net Salary</td>
                <td>₹ ${netSalaryMonthly.toLocaleString('en-IN')}</td>
                <td>₹ ${netSalaryYearly.toLocaleString('en-IN')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      // Optional: close the window after printing
      // printWindow.close();
    }, 250);
  };
}

// Dummy data for testing
export function getDummySalaryData(
  employeeName: string = "John Doe",
  year: string = "2025"
): SalaryReportData {
  return {
    companyName: "Company Name",
    employeeName: employeeName,
    designation: "Software Engineer",
    dateOfJoining: "01/01/2023",
    salaryEffectiveFrom: `01/01/${year}`,
    earnings: [
      { name: "Basic", monthlyAmount: 50000, yearlyAmount: 600000 },
      { name: "HRA", monthlyAmount: 20000, yearlyAmount: 240000 },
      { name: "Special Allowance", monthlyAmount: 15000, yearlyAmount: 180000 },
      { name: "Transport Allowance", monthlyAmount: 3000, yearlyAmount: 36000 },
    ],
    deductions: [
      { name: "PF", monthlyAmount: 6000, yearlyAmount: 72000 },
      { name: "Professional Tax", monthlyAmount: 200, yearlyAmount: 2400 },
      { name: "Income Tax", monthlyAmount: 5000, yearlyAmount: 60000 },
    ],
  };
}
