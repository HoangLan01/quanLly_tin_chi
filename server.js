// =============================================================================
// File: server.js
// Description: Backend server nâng cấp với đầy đủ API CRUD cho tất cả các đối tượng.
// =============================================================================

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// CẤU HÌNH KẾT NỐI DATABASE
// Thay thế các giá trị dưới đây bằng thông tin database PostgreSQL của bạn
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'qly_tinchi', // <-- THAY TÊN DATABASE CỦA BẠN
  password: 'abc',     // <-- THAY MẬT KHẨU CỦA BẠN
  port: 5432,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Lỗi kết nối tới database:', err.stack);
  }
  client.release();
  console.log('Kết nối tới PostgreSQL thành công!');
});

// =============================================================================
// API TỔNG HỢP (GET ALL DATA)
// =============================================================================
app.get('/api/alldata', async (req, res) => {
    try {
        const [khoa, chuyenNganh, giangVien, khoaHoc, sinhVien, monHoc, hocKy, lopHoc, dangKyHoc, phongHoc, loaiHinhDaoTao] = await Promise.all([
            pool.query('SELECT * FROM "khoa" ORDER BY "makhoa"'),
            pool.query('SELECT * FROM "chuyennganh"'),
            pool.query('SELECT * FROM "giangvien" ORDER BY "magv"'),
            pool.query('SELECT * FROM "khoahoc"'),
            pool.query('SELECT * FROM "sinhvien" ORDER BY "masv"'),
            pool.query('SELECT * FROM "monhoc" ORDER BY "mamh"'),
            pool.query('SELECT * FROM "hocky" ORDER BY "mahocky"'),
            pool.query('SELECT * FROM "lophoc" ORDER BY "malop"'),
            pool.query('SELECT * FROM "dangkyhoc"'),
            pool.query('SELECT * FROM "phonghoc"'),
            pool.query('SELECT * FROM "loaihinhdaotao"')
        ]);
        res.json({
            khoa: khoa.rows,
            chuyenNganh: chuyenNganh.rows,
            giangVien: giangVien.rows,
            khoaHoc: khoaHoc.rows,
            sinhVien: sinhVien.rows,
            monHoc: monHoc.rows,
            hocKy: hocKy.rows,
            lopHoc: lopHoc.rows,
            dangKyHoc: dangKyHoc.rows,
            phongHoc: phongHoc.rows,
            loaiHinhDaoTao: loaiHinhDaoTao.rows
        });
    } catch (err) {
        console.error('Lỗi API /alldata:', err.message);
        res.status(500).send("Lỗi server khi lấy dữ liệu tổng hợp");
    }
});


// =============================================================================
// API CRUD CHO SINH VIÊN (Student)
// =============================================================================
// Thêm SV
app.post('/api/students', async (req, res) => {
    const { MaSV, HoTenSV, MaChuyenNganh, MaKhoaHoc, MaLHDT } = req.body;
    try {
        const newStudent = await pool.query(
            'INSERT INTO "sinhvien" ("masv", "hotensv", "machuyennganh", "makhoahoc", "malhdt") VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [MaSV, HoTenSV, MaChuyenNganh, MaKhoaHoc, MaLHDT]
        );
        res.status(201).json(newStudent.rows[0]);
    } catch (err) { console.error(err.message); res.status(500).json({ error: err.message }); }
});

// Sửa SV
app.put('/api/students/:id', async (req, res) => {
    const { id } = req.params;
    const { HoTenSV, MaChuyenNganh, MaKhoaHoc, MaLHDT } = req.body;
    try {
        const updatedStudent = await pool.query(
            'UPDATE "sinhvien" SET "hotensv" = $1, "machuyennganh" = $2, "makhoahoc" = $3, "malhdt" = $4 WHERE "masv" = $5 RETURNING *',
            [HoTenSV, MaChuyenNganh, MaKhoaHoc, MaLHDT, id]
        );
        res.json(updatedStudent.rows[0]);
    } catch (err) { console.error(err.message); res.status(500).json({ error: err.message }); }
});

// Xóa SV
app.delete('/api/students/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM "sinhvien" WHERE "masv" = $1', [id]);
        res.json({ message: 'Xóa sinh viên thành công' });
    } catch (err) { console.error(err.message); res.status(500).json({ error: err.message }); }
});


// =============================================================================
// API CRUD CHO GIẢNG VIÊN (Lecturer)
// =============================================================================
// Thêm GV
app.post('/api/lecturers', async (req, res) => {
    const { MaGV, HoTenGV, MaKhoa } = req.body;
    try {
        const newLecturer = await pool.query(
            'INSERT INTO "giangvien" ("magv", "hotengv", "makhoa") VALUES ($1, $2, $3) RETURNING *',
            [MaGV, HoTenGV, MaKhoa]
        );
        res.status(201).json(newLecturer.rows[0]);
    } catch (err) { console.error(err.message); res.status(500).json({ error: err.message }); }
});

// Sửa GV
app.put('/api/lecturers/:id', async (req, res) => {
    const { id } = req.params;
    const { HoTenGV, MaKhoa } = req.body;
    try {
        const updatedLecturer = await pool.query(
            'UPDATE "giangvien" SET "hotengv" = $1, "makhoa" = $2 WHERE "magv" = $3 RETURNING *',
            [HoTenGV, MaKhoa, id]
        );
        res.json(updatedLecturer.rows[0]);
    } catch (err) { console.error(err.message); res.status(500).json({ error: err.message }); }
});

// Xóa GV
app.delete('/api/lecturers/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM "giangvien" WHERE "magv" = $1', [id]);
        res.json({ message: 'Xóa giảng viên thành công' });
    } catch (err) { console.error(err.message); res.status(500).json({ error: err.message }); }
});

// =============================================================================
// API CRUD CHO MÔN HỌC (Subject)
// =============================================================================
// Thêm MH
app.post('/api/subjects', async (req, res) => {
    const { MaMH, TenMH, SoTinChi, SoTiet, MaChuyenNganh, LaMonCoBan } = req.body;
    try {
        const newSubject = await pool.query(
            'INSERT INTO "monhoc" ("mamh", "tenmh", "sotinchi", "sotiet", "machuyennganh", "lamoncoban") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [MaMH, TenMH, SoTinChi, SoTiet, MaChuyenNganh, LaMonCoBan]
        );
        res.status(201).json(newSubject.rows[0]);
    } catch (err) { console.error(err.message); res.status(500).json({ error: err.message }); }
});

// Sửa MH
app.put('/api/subjects/:id', async (req, res) => {
    const { id } = req.params;
    const { TenMH, SoTinChi, SoTiet, MaChuyenNganh, LaMonCoBan } = req.body;
    try {
        const updatedSubject = await pool.query(
            'UPDATE "monhoc" SET "tenmh" = $1, "sotinchi" = $2, "sotiet" = $3, "machuyennganh" = $4, "lamoncoban" = $5 WHERE "mamh" = $6 RETURNING *',
            [TenMH, SoTinChi, SoTiet, MaChuyenNganh, LaMonCoBan, id]
        );
        res.json(updatedSubject.rows[0]);
    } catch (err) { console.error(err.message); res.status(500).json({ error: err.message }); }
});

// Xóa MH
app.delete('/api/subjects/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM "monhoc" WHERE "mamh" = $1', [id]);
        res.json({ message: 'Xóa môn học thành công' });
    } catch (err) { console.error(err.message); res.status(500).json({ error: err.message }); }
});

// =============================================================================
// API CRUD CHO LỚP HỌC (Class)
// =============================================================================
// Thêm Lớp
app.post('/api/classes', async (req, res) => {
    const { MaLop, MaMH, MaHocKy, MaGV, MaPhong, Thu, TietBatDau, SoTietHoc } = req.body;
    try {
        const newClass = await pool.query(
            'INSERT INTO "lophoc" ("malop", "mamh", "mahocky", "magv", "maphong", "thu", "tietbatdau", "sotiet") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [MaLop, MaMH, MaHocKy, MaGV, MaPhong, Thu, TietBatDau, SoTietHoc]
        );
        res.status(201).json(newClass.rows[0]);
    } catch (err) { console.error(err.message); res.status(500).json({ error: err.message }); }
});

// Sửa Lớp
app.put('/api/classes/:id', async (req, res) => {
    const { id } = req.params;
    const { MaMH, MaHocKy, MaGV, MaPhong, Thu, TietBatDau, SoTietHoc } = req.body;
    try {
        const updatedClass = await pool.query(
            'UPDATE "lophoc" SET "mamh" = $1, "mahocky" = $2, "magv" = $3, "maphong" = $4, "thu" = $5, "tietbatdau" = $6, "sotiet" = $7 WHERE "malop" = $8 RETURNING *',
            [MaMH, MaHocKy, MaGV, MaPhong, Thu, TietBatDau, SoTietHoc, id]
        );
        res.json(updatedClass.rows[0]);
    } catch (err) { console.error(err.message); res.status(500).json({ error: err.message }); }
});

// Xóa Lớp
app.delete('/api/classes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM "lophoc" WHERE "malop" = $1', [id]);
        res.json({ message: 'Xóa lớp học thành công' });
    } catch (err) { console.error(err.message); res.status(500).json({ error: err.message }); }
});

// =============================================================================
// API CRUD CHO KHOA (Faculty)
// =============================================================================
// Thêm Khoa
app.post('/api/faculties', async (req, res) => {
    const { MaKhoa, TenKhoa } = req.body;
    try {
        const newFaculty = await pool.query(
            'INSERT INTO "khoa" ("makhoa", "tenkhoa") VALUES ($1, $2) RETURNING *',
            [MaKhoa, TenKhoa]
        );
        res.status(201).json(newFaculty.rows[0]);
    } catch (err) { console.error(err.message); res.status(500).json({ error: err.message }); }
});

// Sửa Khoa
app.put('/api/faculties/:id', async (req, res) => {
    const { id } = req.params;
    const { TenKhoa } = req.body;
    try {
        const updatedFaculty = await pool.query(
            'UPDATE "khoa" SET "tenkhoa" = $1 WHERE "makhoa" = $2 RETURNING *',
            [TenKhoa, id]
        );
        res.json(updatedFaculty.rows[0]);
    } catch (err) { console.error(err.message); res.status(500).json({ error: err.message }); }
});

// Xóa Khoa
app.delete('/api/faculties/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM "khoa" WHERE "makhoa" = $1', [id]);
        res.json({ message: 'Xóa khoa thành công' });
    } catch (err) { console.error(err.message); res.status(500).json({ error: err.message }); }
});

// =============================================================================
// API CRUD CHO HỌC KỲ (Semester)
// =============================================================================
// Thêm Học kỳ
app.post('/api/semesters', async (req, res) => {
    const { MaHocKy, TenHocKy } = req.body;
    try {
        const newSemester = await pool.query(
            'INSERT INTO "hocky" ("mahocky", "tenhocky") VALUES ($1, $2) RETURNING *',
            [MaHocKy, TenHocKy]
        );
        res.status(201).json(newSemester.rows[0]);
    } catch (err) { console.error(err.message); res.status(500).json({ error: err.message }); }
});

// Sửa Học kỳ
app.put('/api/semesters/:id', async (req, res) => {
    const { id } = req.params;
    const { TenHocKy } = req.body;
    try {
        const updatedSemester = await pool.query(
            'UPDATE "hocky" SET "tenhocky" = $1 WHERE "mahocky" = $2 RETURNING *',
            [TenHocKy, id]
        );
        res.json(updatedSemester.rows[0]);
    } catch (err) { console.error(err.message); res.status(500).json({ error: err.message }); }
});

// Xóa Học kỳ
app.delete('/api/semesters/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM "hocky" WHERE "mahocky" = $1', [id]);
        res.json({ message: 'Xóa học kỳ thành công' });
    } catch (err) { console.error(err.message); res.status(500).json({ error: err.message }); }
});


app.listen(port, () => {
  console.log(`Backend server đang chạy tại http://localhost:${port}`);
});

