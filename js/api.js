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
    }
};

