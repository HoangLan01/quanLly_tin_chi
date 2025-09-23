// =============================================================================
// File: main.js
// Description: Logic chính, xử lý điều hướng và khởi tạo các view.
// =============================================================================

// Biến toàn cục lưu trữ tất cả dữ liệu từ server
let AppData = {};

// Hàm tải nội dung của một view vào #content-container
async function loadView(viewName) {
    try {
        const response = await fetch(`./views/${viewName}.html`);
        if (!response.ok) {
            throw new Error(`Không tìm thấy file view: ${viewName}.html`);
        }
        const html = await response.text();
        document.getElementById('content-container').innerHTML = html;
        lucide.createIcons();
    } catch (error) {
        console.error('Lỗi khi tải view:', error);
        document.getElementById('content-container').innerHTML = 
            `<div class="text-red-500">Lỗi: ${error.message}</div>`;
    }
}

// Hàm điều hướng chính
async function router() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    const viewName = hash.split('/')[0];
    
    await loadView(viewName);

    // Cập nhật tiêu đề và trạng thái active của sidebar
    const sidebar = document.getElementById('sidebar');
    sidebar.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.toggle('active', link.dataset.view === viewName);
        if (link.dataset.view === viewName) {
            document.getElementById('main-title').textContent = link.textContent;
        }
    });

    // Gọi hàm render tương ứng cho view vừa tải
    switch(viewName) {
        case 'dashboard':
            renderDashboard(AppData);
            break;
        case 'student':
            renderStudentView(AppData);
            break;
        case 'lecturer':
            renderLecturerView(AppData);
            break;
        case 'subject':
            renderSubjectView(AppData);
            break;
        case 'class':
            renderClassView(AppData);
            break;
        case 'faculty':
            renderFacultyView(AppData);
            break;
        case 'semester':
            renderSemesterView(AppData);
            break;
        // THÊM MỚI: Gọi hàm render cho các trang báo cáo
        case 'report-student':
            renderStudentReportView(AppData);
            break;
        case 'report-lecturer':
            renderLecturerReportView(AppData);
            break;
        case 'report-classroom':
            renderClassroomReportView(AppData);
            break;
    }
}

// Toast notification
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    toastMessage.textContent = message;
    toast.classList.remove('bg-green-500', 'bg-red-500');
    toast.classList.add(isError ? 'bg-red-500' : 'bg-green-500');
    toast.classList.remove('opacity-0');
    setTimeout(() => {
        toast.classList.add('opacity-0');
    }, 3000);
};

// Khởi chạy ứng dụng
document.addEventListener('DOMContentLoaded', async () => {
    lucide.createIcons();
    
    // Tải dữ liệu ban đầu
    AppData = await api.getAllData();
    if (!AppData) {
        showToast("Không thể tải dữ liệu từ server. Vui lòng kiểm tra backend.", true);
        return;
    }
    
    // Lắng nghe sự kiện thay đổi hash (URL) để điều hướng
    window.addEventListener('hashchange', router);
    
    // Tải view ban đầu
    router();
});
