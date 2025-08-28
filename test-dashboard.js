const { db } = require('./config/database');
const DashboardModel = require('./models/dashboardModel');

async function testDashboard() {
  try {
    console.log('Testing dashboard data...');
    const dashboardData = await DashboardModel.getDashboardData();
    console.log('Dashboard data retrieved successfully');
    console.log(JSON.stringify(dashboardData, null, 2));
  } catch (error) {
    console.error('Error getting dashboard data:', error);
  } finally {
    process.exit(0);
  }
}

testDashboard();