// =============================================================================
// File: api.js
// Description: Chứa các hàm để giao tiếp với backend API.
// =============================================================================

const API_BASE_URL = 'http://localhost:3000/api';

const api = {
    getAllData: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/alldata`);
            if (!response.ok) {
                throw new Error(`Lỗi mạng: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Không thể tải dữ liệu:", error);
            showToast("Không thể tải dữ liệu từ server. Vui lòng kiểm tra kết nối và backend.", true);
            return null;
        }
    },

    post: async (endpoint, data) => {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Thao tác thất bại');
        }
        return await response.json();
    },

    // THÊM MỚI: Hàm update
    update: async (endpoint, id, data) => {
        const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Cập nhật thất bại');
        }
        return await response.json();
    },

    // THÊM MỚI: Hàm remove (delete)
    remove: async (endpoint, id) => {
        const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Xóa thất bại');
        }
        return await response.json();
    },

    // THÊM MỚI: Các hàm gọi API thống kê
    getStudentStats: async (semester = '') => {
        const url = new URL(`${API_BASE_URL}/statistics/student-gpa`);
        if (semester) url.searchParams.append('hocky', semester);
        const response = await fetch(url);
        if (!response.ok) throw new Error('Không thể tải thống kê sinh viên');
        return await response.json();
    },

    getLecturerStats: async (semester) => {
        if (!semester) return []; // Yêu cầu phải có học kỳ
        const url = new URL(`${API_BASE_URL}/statistics/lecturer-workload`);
        url.searchParams.append('hocky', semester);
        const response = await fetch(url);
        if (!response.ok) throw new Error('Không thể tải thống kê giảng viên');
        return await response.json();
    },

    getClassroomStats: async (semester) => {
        if (!semester) return []; // Yêu cầu phải có học kỳ
        const url = new URL(`${API_BASE_URL}/statistics/classroom-usage`);
        url.searchParams.append('hocky', semester);
        const response = await fetch(url);
        if (!response.ok) throw new Error('Không thể tải thống kê phòng học');
        return await response.json();
    },

    getStudents: async (searchTerm = '') => {
        const url = new URL(`${API_BASE_URL}/students`);
        if (searchTerm) url.searchParams.append('search', searchTerm);
        const response = await fetch(url);
        if (!response.ok) throw new Error('Không thể tải danh sách sinh viên');
        return await response.json();
    },
    getSubjects: async (searchTerm = '') => {
        const url = new URL(`${API_BASE_URL}/subjects`);
        if (searchTerm) url.searchParams.append('search', searchTerm);
        const response = await fetch(url);
        if (!response.ok) throw new Error('Không thể tải danh sách môn học');
        return await response.json();
    },
    getClasses: async (searchTerm = '') => {
        const url = new URL(`${API_BASE_URL}/classes`);
        if (searchTerm) url.searchParams.append('search', searchTerm);
        const response = await fetch(url);
        if (!response.ok) throw new Error('Không thể tải danh sách lớp học');
        return await response.json();
    },
    getLecturers: async (searchTerm = '') => {
        const url = new URL(`${API_BASE_URL}/lecturers`);
        if (searchTerm) url.searchParams.append('search', searchTerm);
        const response = await fetch(url);
        if (!response.ok) throw new Error('Không thể tải danh sách giảng viên');
        return await response.json();
    },
};

