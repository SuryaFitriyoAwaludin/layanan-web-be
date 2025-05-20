// Controller untuk menangani logika bisnis

const exampleController = {
  getAll: (req, res) => {
    // Di sini bisa ditambahkan logika untuk mengambil data dari database
    res.json({ message: 'GET semua data', data: [] });
  },
  
  getById: (req, res) => {
    const id = req.params.id;
    // Di sini bisa ditambahkan logika untuk mengambil data berdasarkan ID
    res.json({ message: `GET data dengan ID: ${id}`, data: { id } });
  },
  
  create: (req, res) => {
    const newData = req.body;
    // Di sini bisa ditambahkan logika untuk menyimpan data ke database
    res.status(201).json({ message: 'Data berhasil dibuat', data: newData });
  },
  
  update: (req, res) => {
    const id = req.params.id;
    const updatedData = req.body;
    // Di sini bisa ditambahkan logika untuk mengupdate data di database
    res.json({ message: `Data dengan ID: ${id} berhasil diupdate`, data: updatedData });
  },
  
  delete: (req, res) => {
    const id = req.params.id;
    // Di sini bisa ditambahkan logika untuk menghapus data dari database
    res.json({ message: `Data dengan ID: ${id} berhasil dihapus` });
  }
};

module.exports = exampleController;