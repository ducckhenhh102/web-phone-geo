# Hướng Dẫn Cấu Trúc Dự Án & Tối Ưu GEO (PhoneStore)

Tài liệu này mô tả chi tiết kiến trúc của dự án website bán điện thoại di động và cách hệ thống này đáp ứng các tiêu chuẩn của Generative Engine Optimization (GEO).

## 1. Cấu trúc thư mục (File Architecture)

Dự án được phân tách thành nhiều file chuẩn chỉnh (dựa trên cấu trúc chuẩn của dự án thực tế), giúp dễ bảo trì và mở rộng:

```text
PhoneStore/
│
├── index.html                  # Trang chủ (Banner, danh sách sản phẩm nổi bật)
├── about.html                  # Trang Giới thiệu (Tăng độ Trust cho doanh nghiệp)
├── contact.html                # Trang Liên hệ & Bản đồ
├── faq.html                    # Trang Câu hỏi thường gặp tổng hợp
├── blog.html                   # Danh sách bài viết đánh giá công nghệ
├── blog-detail.html            # Chi tiết bài viết đánh giá/thủ thuật
├── brands.html                 # Danh mục các hãng (Apple, Samsung, Xiaomi...)
├── brand-detail.html           # Danh sách điện thoại theo từng hãng
├── products.html               # Cửa hàng: Tất cả điện thoại (có bộ lọc)
├── product-detail.html         # Trang chi tiết sản phẩm (Nơi tập trung GEO mạnh nhất)
│
├── css/
│   └── style.css               # File CSS duy nhất quản lý toàn bộ giao diện (tối ưu request)
│
├── js/
│   ├── main.js                 # Xử lý hiệu ứng UI chung (Menu, Modal, Slider)
│   ├── products.js             # Logic tải dữ liệu từ JSON, render HTML & sinh Schema
│   └── data.json               # Database tĩnh chứa thông số, giá, FAQ của các điện thoại
│
├── images/                     
│   └── logo.svg                # Logo và tài nguyên hình ảnh (nên dùng định dạng WebP)
│
├── sitemap.xml                 # Sơ đồ trang web để bot AI dễ dàng crawl dữ liệu
├── robots.txt                  # Cấp quyền/Chặn bot truy cập các thư mục
└── hd.md                       # Tài liệu hướng dẫn này
```

## 2. Chiến lược Tối ưu GEO trên từng thành phần

Dự án này đáp ứng 5 tiêu chí GEO thông qua cách phân bổ luồng dữ liệu như sau:

### 2.1. Cấu trúc Dữ liệu Đích (Mục tiêu 01 & 02)
*   **Hiển thị trực quan (HTML):** Trên trang `product-detail.html`, thông số kỹ thuật (RAM, Chip, Pin) **bắt buộc** được render bằng thẻ `<table>`. Ưu/Nhược điểm dùng thẻ `<ul>` và `<li>`. Đây là định dạng mà các mô hình ngôn ngữ lớn (LLM) dễ "đọc hiểu" nhất.
*   **Truy vấn ngôn ngữ tự nhiên (FAQ):** Dữ liệu trong `data.json` sẽ chứa sẵn một mảng `faqs` cho từng dòng máy (Ví dụ: "Pin iPhone 15 Pro Max chơi game được bao lâu?"). File `products.js` sẽ parse dữ liệu này và render ra cuối trang chi tiết.

### 2.2. Schema Markup Tự động (Mục tiêu 03 - Kỹ thuật Cốt lõi)
Thay vì gắn cứng (hardcode) Schema vào từng file HTML, file `products.js` đảm nhiệm việc nội suy dữ liệu tĩnh để phục vụ AI:
*   Khi người dùng vào `product-detail.html?id=samsung-s24`, Javascript sẽ đọc `data.json`.
*   Hàm tạo Schema sẽ tự động build một chuỗi JSON-LD chuẩn SEO.
*   Nó chèn đồng thời 2 loại Schema là **`Product`** (Giá cả, Đánh giá, Tình trạng kho) và **`FAQPage`** (Bộ câu hỏi thường gặp) thẳng vào thẻ `<head>` của DOM.
*   *Lợi ích:* Đảm bảo AI luôn nhận được dữ liệu cấu trúc mới nhất, chính xác nhất mà không cần tốn công sửa code HTML thủ công.

### 2.3. Trải nghiệm người dùng & Tốc độ (Mục tiêu 04)
*   **Không độ trễ Database:** Việc dùng `data.json` kết hợp với Vanilla Javascript (thuần) giúp loại bỏ thời gian chờ đợi phản hồi từ server backend (TTFB cực thấp).
*   **Tối ưu tài nguyên:** Chỉ có 1 file `style.css` và phân tách rõ ràng. Việc triển khai lên các server như Nginx sẽ tận dụng được tối đa caching của trình duyệt. 

### 2.4. Độ tin cậy & Dễ thu thập dữ liệu (Mục tiêu 05 - Trust & Crawlability)
*   Việc giữ lại các file `about.html` và `contact.html` giúp định danh chủ thể website (Entity). Các bot tìm kiếm ưu tiên trích xuất nguồn từ những website minh bạch thông tin.
*   File `sitemap.xml` và `robots.txt` là tấm bản đồ dẫn đường cho các bot AI (như Googlebot-Extended, Perplexity bot) biết trang nào cần quét để lấy dữ liệu huấn luyện.