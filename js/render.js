// =============================================================================
// File: render.js
// Description: Chứa các hàm render giao diện cho từng view.
// =============================================================================

// ----- HÀM TIỆN ÍCH CHUNG -----

// Thiết lập modal cho cả Thêm mới và Chỉnh sửa
function setupModal(config) {
    const { addBtnId, modalId, cancelBtnId, formId, apiEndpoint, onFormSubmitSuccess, populateFormFn } = config;

    const addBtn = document.getElementById(addBtnId);
    const modal = document.getElementById(modalId);
    const cancelBtn = document.getElementById(cancelBtnId);
    const form = document.getElementById(formId);
    const modalTitle = modal.querySelector('h2');

    if (!addBtn || !modal || !cancelBtn || !form || !modalTitle) return;

    let currentEditId = null; // Biến để lưu ID của đối tượng đang được sửa

    const openModalForCreate = () => {
        currentEditId = null;
        modalTitle.textContent = `Thêm mới`;
        form.reset();
        // Vô hiệu hóa trường khóa chính khi thêm mới nếu cần
        const primaryKeyInput = form.querySelector('input[name*="Ma"]');
        if (primaryKeyInput) primaryKeyInput.disabled = false;
        modal.classList.add('flex');
    };

    const openModalForEdit = (item) => {
        currentEditId = item[Object.keys(item)[0]]; // Lấy giá trị của khóa chính
        modalTitle.textContent = `Chỉnh sửa`;
        form.reset();
        populateFormFn(item); // Hàm để điền dữ liệu vào form
        
        // Vô hiệu hóa trường khóa chính khi chỉnh sửa
        const primaryKeyInput = form.querySelector('input[name*="Ma"]');
        if (primaryKeyInput) primaryKeyInput.disabled = true;

        modal.classList.add('flex');
    };
    
    const closeModal = () => modal.classList.remove('flex');

    addBtn.onclick = openModalForCreate;
    cancelBtn.onclick = closeModal;
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };

    form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Xử lý checkbox
        form.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            data[checkbox.name] = checkbox.checked;
        });

        try {
            if (currentEditId) {
                // Chế độ sửa
                await api.update(apiEndpoint, currentEditId, data);
                showToast(`Cập nhật thành công!`);
            } else {
                // Chế độ thêm mới
                await api.post(apiEndpoint, data);
                showToast(`Thêm thành công!`);
            }
            closeModal();
            form.reset();
            onFormSubmitSuccess();
        } catch (error) {
            showToast(`Lỗi: ${error.message}`, true);
        }
    };
    
    // Trả về hàm mở modal để sửa, để có thể gọi từ bên ngoài
    return { openModalForEdit };
}


function populateSelect(selectId, data, valueField, textField) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '<option value="">-- Chọn --</option>';
    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item[valueField];
        option.textContent = item[textField];
        select.appendChild(option);
    });
}

// Hàm xử lý việc xóa
async function handleDelete(itemId, itemName, apiEndpoint, onFormSubmitSuccess) {
    if (confirm(`Bạn có chắc chắn muốn xóa ${itemName} này không?`)) {
        try {
            await api.remove(apiEndpoint, itemId);
            showToast('Xóa thành công!');
            onFormSubmitSuccess();
        } catch (error) {
            showToast(`Lỗi khi xóa: ${error.message}`, true);
        }
    }
}


// ----- CÁC HÀM RENDER RIÊNG -----

function renderDashboard(data) {
    document.getElementById('total-students').textContent = data.sinhVien?.length || 0;
    document.getElementById('total-lecturers').textContent = data.giangVien?.length || 0;
    document.getElementById('total-subjects').textContent = data.monHoc?.length || 0;
    document.getElementById('total-classes').textContent = data.lopHoc?.length || 0;
}

function renderStudentView(data) {
    const tableBody = document.getElementById('student-table-body');
    if (!tableBody || !data.sinhVien) return;
    
    tableBody.innerHTML = '';
    
    // Setup modal và lấy về hàm mở modal để edit
    const { openModalForEdit } = setupModal({
        addBtnId: 'add-student-btn',
        modalId: 'student-modal',
        cancelBtnId: 'cancel-student-modal',
        formId: 'student-form',
        apiEndpoint: 'students',
        onFormSubmitSuccess: async () => {
            AppData = await api.getAllData();
            renderStudentView(AppData);
        },
        populateFormFn: (sv) => {
            document.querySelector('#student-form input[name="MaSV"]').value = sv.masv;
            document.querySelector('#student-form input[name="HoTenSV"]').value = sv.hotensv;
            document.querySelector('#student-form select[name="MaChuyenNganh"]').value = sv.machuyennganh;
            document.querySelector('#student-form select[name="MaKhoaHoc"]').value = sv.makhoahoc;
            document.querySelector('#student-form select[name="MaLHDT"]').value = sv.malhdt;
        }
    });

    data.sinhVien.forEach(sv => {
        const cn = data.chuyenNganh.find(c => c.machuyennganh === sv.machuyennganh)?.tenchuyennganh || 'N/A';
        const kh = data.khoaHoc.find(k => k.makhoahoc === sv.makhoahoc)?.tenkhoahoc || 'N/A';
        const lhdt = data.loaiHinhDaoTao.find(l => l.malhdt === sv.malhdt)?.tenlhdt || 'N/A';
        const row = document.createElement('tr');
        row.className = 'border-b';
        row.innerHTML = `
            <td class="p-3">${sv.masv}</td>
            <td class="p-3">${sv.hotensv}</td>
            <td class="p-3">${cn}</td>
            <td class="p-3">${kh}</td>
            <td class="p-3">${lhdt}</td>
            <td class="p-3">
                <button class="edit-btn text-blue-500 hover:text-blue-700"><i data-lucide="edit" class="w-5 h-5"></i></button>
                <button class="delete-btn text-red-500 hover:text-red-700 ml-2"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
            </td>
        `;
        row.querySelector('.edit-btn').onclick = () => openModalForEdit(sv);
        row.querySelector('.delete-btn').onclick = () => handleDelete(sv.masv, sv.hotensv, 'students', async () => {
             AppData = await api.getAllData();
             renderStudentView(AppData);
        });
        tableBody.appendChild(row);
    });
    
    lucide.createIcons();
    populateSelect('student-modal-chuyennganh', data.chuyenNganh, 'machuyennganh', 'tenchuyennganh');
    populateSelect('student-modal-khoahoc', data.khoaHoc, 'makhoahoc', 'tenkhoahoc');
    populateSelect('student-modal-lhdt', data.loaiHinhDaoTao, 'malhdt', 'tenlhdt');
}

function renderLecturerView(data) {
    const tableBody = document.getElementById('lecturer-table-body');
    if (!tableBody || !data.giangVien) return;

    tableBody.innerHTML = '';
    
    const { openModalForEdit } = setupModal({
        addBtnId: 'add-lecturer-btn',
        modalId: 'lecturer-modal',
        cancelBtnId: 'cancel-lecturer-modal',
        formId: 'lecturer-form',
        apiEndpoint: 'lecturers',
        onFormSubmitSuccess: async () => {
            AppData = await api.getAllData();
            renderLecturerView(AppData);
        },
        populateFormFn: (gv) => {
            document.querySelector('#lecturer-form input[name="MaGV"]').value = gv.magv;
            document.querySelector('#lecturer-form input[name="HoTenGV"]').value = gv.hotengv;
            document.querySelector('#lecturer-form select[name="MaKhoa"]').value = gv.makhoa;
        }
    });

    data.giangVien.forEach(gv => {
        const khoa = data.khoa.find(k => k.makhoa === gv.makhoa)?.tenkhoa || 'N/A';
        const row = document.createElement('tr');
        row.className = 'border-b';
        row.innerHTML = `
            <td class="p-3">${gv.magv}</td>
            <td class="p-3">${gv.hotengv}</td>
            <td class="p-3">${khoa}</td>
            <td class="p-3">
                <button class="edit-btn text-blue-500 hover:text-blue-700"><i data-lucide="edit" class="w-5 h-5"></i></button>
                <button class="delete-btn text-red-500 hover:text-red-700 ml-2"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
            </td>
        `;
        row.querySelector('.edit-btn').onclick = () => openModalForEdit(gv);
        row.querySelector('.delete-btn').onclick = () => handleDelete(gv.magv, gv.hotengv, 'lecturers', async () => {
             AppData = await api.getAllData();
             renderLecturerView(AppData);
        });
        tableBody.appendChild(row);
    });
    
    lucide.createIcons();
    populateSelect('lecturer-modal-khoa', data.khoa, 'makhoa', 'tenkhoa');
}


function renderSubjectView(data) {
    const tableBody = document.getElementById('subject-table-body');
    if (!tableBody || !data.monHoc) return;
    
    tableBody.innerHTML = '';

    const { openModalForEdit } = setupModal({
        addBtnId: 'add-subject-btn',
        modalId: 'subject-modal',
        cancelBtnId: 'cancel-subject-modal',
        formId: 'subject-form',
        apiEndpoint: 'subjects',
        onFormSubmitSuccess: async () => {
            AppData = await api.getAllData();
            renderSubjectView(AppData);
        },
        populateFormFn: (mh) => {
            document.querySelector('#subject-form input[name="MaMH"]').value = mh.mamh;
            document.querySelector('#subject-form input[name="TenMH"]').value = mh.tenmh;
            document.querySelector('#subject-form input[name="SoTinChi"]').value = mh.sotinchi;
            document.querySelector('#subject-form input[name="SoTiet"]').value = mh.sotiet;
            document.querySelector('#subject-form select[name="MaChuyenNganh"]').value = mh.machuyennganh;
            document.querySelector('#subject-form input[name="LaMonCoBan"]').checked = mh.lamoncoban;
        }
    });

    data.monHoc.forEach(mh => {
        const cn = data.chuyenNganh.find(c => c.machuyennganh === mh.machuyennganh)?.tenchuyennganh || 'N/A';
        const row = document.createElement('tr');
        row.className = 'border-b';
        row.innerHTML = `
            <td class="p-3">${mh.mamh}</td>
            <td class="p-3">${mh.tenmh}</td>
            <td class="p-3 text-center">${mh.sotinchi}</td>
            <td class="p-3">${cn}</td>
            <td class="p-3">${mh.lamoncoban ? 'Có' : 'Không'}</td>
            <td class="p-3">
                <button class="edit-btn text-blue-500 hover:text-blue-700"><i data-lucide="edit" class="w-5 h-5"></i></button>
                <button class="delete-btn text-red-500 hover:text-red-700 ml-2"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
            </td>
        `;
        row.querySelector('.edit-btn').onclick = () => openModalForEdit(mh);
        row.querySelector('.delete-btn').onclick = () => handleDelete(mh.mamh, mh.tenmh, 'subjects', async () => {
             AppData = await api.getAllData();
             renderSubjectView(AppData);
        });
        tableBody.appendChild(row);
    });

    lucide.createIcons();
    populateSelect('subject-modal-chuyennganh', data.chuyenNganh, 'machuyennganh', 'tenchuyennganh');
}


function renderClassView(data) {
    const tableBody = document.getElementById('class-table-body');
    if (!tableBody || !data.lopHoc) return;
    
    tableBody.innerHTML = '';
    
    const { openModalForEdit } = setupModal({
        addBtnId: 'add-class-btn',
        modalId: 'class-modal',
        cancelBtnId: 'cancel-class-modal',
        formId: 'class-form',
        apiEndpoint: 'classes',
        onFormSubmitSuccess: async () => {
            AppData = await api.getAllData();
            renderClassView(AppData);
        },
        populateFormFn: (lh) => {
            document.querySelector('#class-form input[name="MaLop"]').value = lh.malop;
            document.querySelector('#class-form select[name="MaMH"]').value = lh.mamh;
            document.querySelector('#class-form select[name="MaHocKy"]').value = lh.mahocky;
            document.querySelector('#class-form select[name="MaGV"]').value = lh.magv;
            document.querySelector('#class-form select[name="MaPhong"]').value = lh.maphong;
            document.querySelector('#class-form input[name="Thu"]').value = lh.thu;
            document.querySelector('#class-form input[name="TietBatDau"]').value = lh.tietbatdau;
            document.querySelector('#class-form input[name="SoTietHoc"]').value = lh.sotiet;
        }
    });

    data.lopHoc.forEach(lh => {
        const mh = data.monHoc.find(m => m.mamh === lh.mamh)?.tenmh || 'N/A';
        const gv = data.giangVien.find(g => g.magv === lh.magv)?.hotengv || 'N/A';
        const row = document.createElement('tr');
        row.className = 'border-b';
        row.innerHTML = `
            <td class="p-3">${lh.malop}</td>
            <td class="p-3">${mh}</td>
            <td class="p-3">${gv}</td>
            <td class="p-3">${lh.maphong}</td>
            <td class="p-3">Thứ ${lh.thu}, Tiết ${lh.tietbatdau}</td>
            <td class="p-3">
                <button class="edit-btn text-blue-500 hover:text-blue-700"><i data-lucide="edit" class="w-5 h-5"></i></button>
                <button class="delete-btn text-red-500 hover:text-red-700 ml-2"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
            </td>
        `;
        row.querySelector('.edit-btn').onclick = () => openModalForEdit(lh);
        row.querySelector('.delete-btn').onclick = () => handleDelete(lh.malop, `Lớp ${mh}`, 'classes', async () => {
             AppData = await api.getAllData();
             renderClassView(AppData);
        });
        tableBody.appendChild(row);
    });
    
    lucide.createIcons();
    populateSelect('class-modal-hocky', data.hocKy, 'mahocky', 'tenhocky');
    populateSelect('class-modal-monhoc', data.monHoc, 'mamh', 'tenmh');
    populateSelect('class-modal-giangvien', data.giangVien, 'magv', 'hotengv');
    populateSelect('class-modal-phonghoc', data.phongHoc, 'maphong', 'maphong');
}

function renderFacultyView(data) {
    const tableBody = document.getElementById('faculty-table-body');
    if (!tableBody || !data.khoa) return;

    tableBody.innerHTML = '';
    
    const { openModalForEdit } = setupModal({
        addBtnId: 'add-faculty-btn',
        modalId: 'faculty-modal',
        cancelBtnId: 'cancel-faculty-modal',
        formId: 'faculty-form',
        apiEndpoint: 'faculties',
        onFormSubmitSuccess: async () => {
            AppData = await api.getAllData();
            renderFacultyView(AppData);
        },
        populateFormFn: (k) => {
            document.querySelector('#faculty-form input[name="MaKhoa"]').value = k.makhoa;
            document.querySelector('#faculty-form input[name="TenKhoa"]').value = k.tenkhoa;
        }
    });

    data.khoa.forEach(k => {
        const row = document.createElement('tr');
        row.className = 'border-b';
        row.innerHTML = `
            <td class="p-3">${k.makhoa}</td>
            <td class="p-3">${k.tenkhoa}</td>
            <td class="p-3">
                <button class="edit-btn text-blue-500 hover:text-blue-700"><i data-lucide="edit" class="w-5 h-5"></i></button>
                <button class="delete-btn text-red-500 hover:text-red-700 ml-2"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
            </td>
        `;
        row.querySelector('.edit-btn').onclick = () => openModalForEdit(k);
        row.querySelector('.delete-btn').onclick = () => handleDelete(k.makhoa, k.tenkhoa, 'faculties', async () => {
             AppData = await api.getAllData();
             renderFacultyView(AppData);
        });
        tableBody.appendChild(row);
    });
    
    lucide.createIcons();
}

function renderSemesterView(data) {
    const tableBody = document.getElementById('semester-table-body');
    if (!tableBody || !data.hocKy) return;

    tableBody.innerHTML = '';

    const { openModalForEdit } = setupModal({
        addBtnId: 'add-semester-btn',
        modalId: 'semester-modal',
        cancelBtnId: 'cancel-semester-modal',
        formId: 'semester-form',
        apiEndpoint: 'semesters',
        onFormSubmitSuccess: async () => {
            AppData = await api.getAllData();
            renderSemesterView(AppData);
        },
        populateFormFn: (hk) => {
            document.querySelector('#semester-form input[name="MaHocKy"]').value = hk.mahocky;
            document.querySelector('#semester-form input[name="TenHocKy"]').value = hk.tenhocky;
        }
    });
    
    data.hocKy.forEach(hk => {
        const row = document.createElement('tr');
        row.className = 'border-b';
        row.innerHTML = `
            <td class="p-3">${hk.mahocky}</td>
            <td class="p-3">${hk.tenhocky}</td>
            <td class="p-3">
                <button class="edit-btn text-blue-500 hover:text-blue-700"><i data-lucide="edit" class="w-5 h-5"></i></button>
                <button class="delete-btn text-red-500 hover:text-red-700 ml-2"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
            </td>
        `;
        row.querySelector('.edit-btn').onclick = () => openModalForEdit(hk);
        row.querySelector('.delete-btn').onclick = () => handleDelete(hk.mahocky, hk.tenhocky, 'semesters', async () => {
             AppData = await api.getAllData();
             renderSemesterView(AppData);
        });
        tableBody.appendChild(row);
    });
    
    lucide.createIcons();
}

