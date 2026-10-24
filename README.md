# Google Drive Video Embedder Pro 🎬

Ứng dụng web React hiện đại giúp tạo mã nhúng (embed code) cho video lưu trữ trên Google Drive vào mọi nền tảng web (HTML, WordPress, Haravan, Shopify, Next.js, React).

## ✨ Tính năng nổi bật

1. **Nhập nhiều link cùng lúc**:
   - Dán nhiều đường dẫn Google Drive (mỗi link 1 dòng).
   - Tự động nhận diện nhiều định dạng link (Link xem, link chia sẻ, iframe có sẵn, hoặc file ID trực tiếp).
2. **Tùy chọn tỉ lệ khung hình linh hoạt**:
   - **Khung dọc 9:16**: Tối ưu cho Shorts, TikTok, Reels (mặc định max-width 360px).
   - **Khung ngang 16:9**: Tối ưu cho YouTube và video chuẩn desktop (mặc định max-width 640px).
   - **Khung vuông 1:1**: Tối ưu cho Instagram feed.
   - **Tùy chỉnh (Custom)**: Tự do nhập tỉ lệ và độ rộng tối đa.
3. **Xem trước trực tiếp (Live Preview)**:
   - Tương tác phát video Google Drive thật ngay trong ứng dụng.
   - Chế độ xem mô phỏng: **Khung điện thoại**, **Khung máy tính**, **Tự do**.
4. **Xuất mã nhúng & Sao chép 1-Click**:
   - **HTML Inline**: Định dạng khớp 100% với mẫu chuẩn bạn cung cấp, dễ dán vào mọi website.
   - **HTML + CSS Clean**: Phù hợp cho code sạch, chia tách file CSS.
   - **React JSX Component**: Sẵn sàng tích hợp vào Next.js, Vite, React app.
   - **Link Preview thuần**: Danh sách URL xem thử nhanh.
   - Nút **Tải file .html** để kiểm tra ngoại tuyến trên trình duyệt ngay lập tức.
   - Hiệu ứng pháo hoa Confetti chúc mừng khi xuất mã thành công.

## 🚀 Khởi chạy dự án

```bash
# Cài đặt thư viện (nếu tải mới về)
npm install

# Khởi chạy máy chủ phát triển
npm run dev

# Đóng gói sản phẩm
npm run build
```

Mở trình duyệt tại: [http://localhost:5173/](http://localhost:5173/)

## ⚠️ Lưu ý về quyền video Google Drive
Để video hiển thị được cho mọi người trên website mà không bị bắt đăng nhập:
1. Mở video trong Google Drive.
2. Bấm **Chia sẻ (Share)**.
3. Chọn quyền truy cập chung: **Bất kỳ ai có đường liên kết (Anyone with the link)** với vai trò **Người xem (Viewer)**.
