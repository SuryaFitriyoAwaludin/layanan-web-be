const { db } = require('../config/database');

class DashboardModel {
  // Mendapatkan data tinjauan penjualan
  static async getTinjauanPenjualan() {
    try {
      // Mendapatkan jumlah pemesanan
      const [pemesananRows] = await db.query(
        'SELECT COUNT(*) as pemesanan FROM transaksi_keluar'
      );
      
      // Mendapatkan total penjualan - menggunakan total_barang yang ada di tabel
      const [penjualanRows] = await db.query(
        'SELECT SUM(total_barang) as penjualan FROM transaksi_keluar'
      );
      
      // Mendapatkan total keuntungan (asumsi: keuntungan adalah 10% dari penjualan)
      const [keuntunganRows] = await db.query(
        'SELECT SUM(total_barang * 0.1) as keuntungan FROM transaksi_keluar'
      );
      
      // Mendapatkan total pemasukan
      const [pemasukanRows] = await db.query(
        'SELECT SUM(total_barang) as pemasukan FROM transaksi_keluar'
      );
      
      return {
        pemesanan: pemesananRows[0].pemesanan || 0,
        penjualan: penjualanRows[0].penjualan || 0,
        keuntungan: keuntunganRows[0].keuntungan || 0,
        pemasukan: pemasukanRows[0].pemasukan || 0
      };
    } catch (error) {
      console.error('Error getting tinjauan penjualan:', error.message);
      throw error;
    }
  }

  // Mendapatkan data tinjauan pembelian
  static async getTinjauanPembelian() {
    try {
      // Mendapatkan jumlah pembelian
      const [pembelianRows] = await db.query(
        'SELECT COUNT(*) as pembelian FROM transaksi_masuk'
      );
      
      // Mendapatkan total biaya - menggunakan total_harga yang ada di tabel
      const [biayaRows] = await db.query(
        'SELECT SUM(total_harga) as biaya FROM transaksi_masuk'
      );
      
      // Mendapatkan jumlah barang yang dibeli
      const [barangRows] = await db.query(
        'SELECT COUNT(DISTINCT id_barang) as barang FROM detail_transaksi_masuk'
      );
      
      // Mendapatkan total pengeluaran
      const [pengeluaranRows] = await db.query(
        'SELECT SUM(total_harga) as pengeluaran FROM transaksi_masuk'
      );
      
      return {
        pembelian: pembelianRows[0].pembelian || 0,
        biaya: biayaRows[0].biaya || 0,
        barang: barangRows[0].barang || 0,
        pengeluaran: pengeluaranRows[0].pengeluaran || 0
      };
    } catch (error) {
      console.error('Error getting tinjauan pembelian:', error.message);
      throw error;
    }
  }

  // Mendapatkan data ringkasan inventaris
  static async getRingkasanInventaris() {
    try {
      // Mendapatkan total kuantitas tersedia
      const [kuantitasRows] = await db.query(
        'SELECT SUM(stok) as kuantitas_tersedia FROM barang'
      );
      
      // Mendapatkan jumlah lokasi barang
      const [lokasiRows] = await db.query(
        'SELECT COUNT(*) as lokasi_barang FROM lokasi'
      );
      
      return {
        kuantitas_tersedia: kuantitasRows[0].kuantitas_tersedia || 0,
        lokasi_barang: lokasiRows[0].lokasi_barang || 0
      };
    } catch (error) {
      console.error('Error getting ringkasan inventaris:', error.message);
      throw error;
    }
  }

  // Mendapatkan data ringkasan produk
  static async getRingkasanProduk() {
    try {
      // Mendapatkan jumlah barang tersedia
      const [tersediaRows] = await db.query(
        'SELECT COUNT(*) as jumlah_tersedia FROM barang WHERE stok > 0'
      );
      
      // Mendapatkan jumlah kategori
      const [kategoriRows] = await db.query(
        'SELECT COUNT(*) as jumlah_kategori FROM kategori'
      );
      
      return {
        jumlah_tersedia: tersediaRows[0].jumlah_tersedia || 0,
        jumlah_kategori: kategoriRows[0].jumlah_kategori || 0
      };
    } catch (error) {
      console.error('Error getting ringkasan produk:', error.message);
      throw error;
    }
  }

  // Mendapatkan data ringkasan pesanan (chart data)
  static async getRingkasanPesanan() {
    try {
      // Mendapatkan data transaksi masuk per bulan (5 bulan terakhir)
      const [masukRows] = await db.query(`
        SELECT 
          MONTH(tanggal_transaksi) as bulan, 
          SUM(total_harga) as total 
        FROM transaksi_masuk 
        WHERE tanggal_transaksi >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH) 
        GROUP BY MONTH(tanggal_transaksi) 
        ORDER BY MONTH(tanggal_transaksi) ASC
      `);
      
      // Mendapatkan data transaksi keluar per bulan (5 bulan terakhir)
      const [keluarRows] = await db.query(`
        SELECT 
          MONTH(tanggal_transaksi) as bulan, 
          SUM(total_barang) as total 
        FROM transaksi_keluar 
        WHERE tanggal_transaksi >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH) 
        GROUP BY MONTH(tanggal_transaksi) 
        ORDER BY MONTH(tanggal_transaksi) ASC
      `);
      
      // Nama bulan dalam bahasa Indonesia
      const namaBulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      
      // Mendapatkan 5 bulan terakhir
      const bulanSekarang = new Date().getMonth();
      const labels = [];
      for (let i = 4; i >= 0; i--) {
        const bulanIndex = (bulanSekarang - i + 12) % 12;
        labels.push(namaBulan[bulanIndex]);
      }
      
      // Menyiapkan data untuk chart
      const masukData = new Array(5).fill(0);
      const keluarData = new Array(5).fill(0);
      
      masukRows.forEach(row => {
        const bulanIndex = (row.bulan - 1 + 12) % 12;
        const chartIndex = labels.indexOf(namaBulan[bulanIndex]);
        if (chartIndex !== -1) {
          masukData[chartIndex] = row.total || 0;
        }
      });
      
      keluarRows.forEach(row => {
        const bulanIndex = (row.bulan - 1 + 12) % 12;
        const chartIndex = labels.indexOf(namaBulan[bulanIndex]);
        if (chartIndex !== -1) {
          keluarData[chartIndex] = row.total || 0;
        }
      });
      
      return {
        data: {
          labels,
          datasets: [
            {
              label: 'Masuk',
              data: masukData,
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4
            },
            {
              label: 'Keluar',
              data: keluarData,
              borderColor: '#F97316',
              backgroundColor: 'rgba(249, 115, 22, 0.1)',
              tension: 0.4
            }
          ]
        }
      };
    } catch (error) {
      console.error('Error getting ringkasan pesanan:', error.message);
      throw error;
    }
  }

  // Mendapatkan data penjualan dan pembelian (chart data)
  static async getPenjualanPembelian() {
    try {
      // Mendapatkan data penjualan per bulan (12 bulan terakhir)
      const [penjualanRows] = await db.query(`
        SELECT 
          MONTH(tanggal_transaksi) as bulan, 
          SUM(total_barang) as total 
        FROM transaksi_keluar 
        WHERE tanggal_transaksi >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH) 
        GROUP BY MONTH(tanggal_transaksi) 
        ORDER BY MONTH(tanggal_transaksi) ASC
      `);
      
      // Mendapatkan data pembelian per bulan (12 bulan terakhir)
      const [pembelianRows] = await db.query(`
        SELECT 
          MONTH(tanggal_transaksi) as bulan, 
          SUM(total_harga) as total 
        FROM transaksi_masuk 
        WHERE tanggal_transaksi >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH) 
        GROUP BY MONTH(tanggal_transaksi) 
        ORDER BY MONTH(tanggal_transaksi) ASC
      `);
      
      // Nama bulan dalam bahasa Indonesia
      const namaBulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      
      // Menyiapkan data untuk chart
      const penjualanData = new Array(12).fill(0);
      const pembelianData = new Array(12).fill(0);
      
      penjualanRows.forEach(row => {
        const bulanIndex = (row.bulan - 1) % 12;
        penjualanData[bulanIndex] = row.total || 0;
      });
      
      pembelianRows.forEach(row => {
        const bulanIndex = (row.bulan - 1) % 12;
        pembelianData[bulanIndex] = row.total || 0;
      });
      
      return {
        data: {
          labels: namaBulan,
          datasets: [
            {
              label: 'Penjualan',
              data: penjualanData,
              backgroundColor: '#3B82F6',
              barPercentage: 0.6,
              categoryPercentage: 0.5
            },
            {
              label: 'Pembelian',
              data: pembelianData,
              backgroundColor: '#10B981',
              barPercentage: 0.6,
              categoryPercentage: 0.5
            }
          ]
        }
      };
    } catch (error) {
      console.error('Error getting penjualan pembelian:', error.message);
      throw error;
    }
  }

  // Mendapatkan data stok terlaris
  static async getStokTerlaris() {
    try {
      const [rows] = await db.query(`
        SELECT 
          b.nama_barang as nama, 
          SUM(dtk.jumlah) as jumlah_terjual, 
          b.stok as jumlah_tersedia,
          CONCAT('Rp ', FORMAT(IFNULL(b.harga_jual, 0), 0)) as harga
        FROM detail_transaksi_keluar dtk
        JOIN barang b ON dtk.id_barang = b.id_barang
        GROUP BY dtk.id_barang
        ORDER BY jumlah_terjual DESC
        LIMIT 3
      `);
      
      return rows;
    } catch (error) {
      console.error('Error getting stok terlaris:', error.message);
      throw error;
    }
  }

  // Mendapatkan data stok menipis
  static async getStokMenipis() {
    try {
      const [rows] = await db.query(`
        SELECT 
          nama_barang as nama, 
          stok as jumlah_stok,
          '/logo_small.png' as gambar
        FROM barang
        WHERE stok <= 15
        ORDER BY stok ASC
        LIMIT 3
      `);
      
      return rows;
    } catch (error) {
      console.error('Error getting stok menipis:', error.message);
      throw error;
    }
  }

  // Mendapatkan semua data dashboard
  static async getDashboardData() {
    try {
      const tinjauan_penjualan = await this.getTinjauanPenjualan();
      const tinjauan_pembelian = await this.getTinjauanPembelian();
      const ringkasan_inventaris = await this.getRingkasanInventaris();
      const ringkasan_produk = await this.getRingkasanProduk();
      const ringkasan_pesanan = await this.getRingkasanPesanan();
      const penjualan_pembelian = await this.getPenjualanPembelian();
      const stok_terlaris = await this.getStokTerlaris();
      const stok_menipis = await this.getStokMenipis();
      
      return {
        tinjauan_penjualan,
        tinjauan_pembelian,
        ringkasan_inventaris,
        ringkasan_produk,
        ringkasan_pesanan,
        penjualan_pembelian,
        stok_terlaris,
        stok_menipis
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error.message);
      throw error;
    }
  }
}

module.exports = DashboardModel;