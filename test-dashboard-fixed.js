const DashboardModel = require('./models/dashboardModel');
const fs = require('fs');

async function testDashboard() {
  let output = '';
  
  try {
    output += 'Testing dashboard data...\n';
    const dashboardData = await DashboardModel.getDashboardData();
    output += 'Dashboard data retrieved successfully!\n';
    
    // Print some key data to verify
    output += '\nTinjauan Penjualan:\n' + JSON.stringify(dashboardData.tinjauan_penjualan, null, 2) + '\n';
    output += '\nTinjauan Pembelian:\n' + JSON.stringify(dashboardData.tinjauan_pembelian, null, 2) + '\n';
    
    output += '\nTest completed successfully!\n';
    
    // Write results to file
    fs.writeFileSync('dashboard-test-results.txt', output);
    console.log('Test results written to dashboard-test-results.txt');
  } catch (error) {
    output += '\nError testing dashboard: ' + error.message + '\n';
    output += error.stack + '\n';
    fs.writeFileSync('dashboard-test-error.txt', output);
    console.error('Error testing dashboard:', error);
  } finally {
    process.exit(0);
  }
}

testDashboard();