document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    const pageType = document.body.getAttribute('data-page');
    
    try {
        const response = await fetch('js/data.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        if (pageType === 'home' || pageType === 'products') {
            renderProductList(data);
        } else if (pageType === 'brand-detail') {
            const brand = new URLSearchParams(window.location.search).get('brand');
            document.getElementById('brand-name-title').textContent = brand;
            renderProductList(data.filter(p => p.brand.toLowerCase() === brand.toLowerCase()));
        } else if (pageType === 'detail') {
            renderProductDetail(data);
        }
    } catch (error) {
        console.error("Lỗi fetch dữ liệu:", error);
        showError("Không thể tải dữ liệu sản phẩm.");
    }
}

function renderProductList(products) {
    const listContainer = document.getElementById('product-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    
    if(products.length === 0) {
        listContainer.innerHTML = '<p>Không có sản phẩm nào.</p>';
        return;
    }
    
    products.forEach(product => {
        const priceFmt = formatCurrency(product.price, product.currency);
        const card = document.createElement('a');
        card.href = product.id === 'iphone-14-pro-max' ? 'iphone-14-pro-max.html' : `product-detail.html?id=${product.id}`;
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <div class="price">${priceFmt}</div>
            <span class="btn-detail">Xem chi tiết</span>
        `;
        listContainer.appendChild(card);
    });
}

function renderProductDetail(products) {
    const container = document.getElementById('detail-container');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const product = products.find(p => p.id === productId);

    if (!product) {
        showError("Sản phẩm không tồn tại.");
        return;
    }

    const priceFmt = formatCurrency(product.price, product.currency);

    let specsRows = '';
    const specLabels = {
        screen: "Màn hình", os: "Hệ điều hành", cameraRear: "Camera sau",
        cameraFront: "Camera trước", cpu: "Chip", ram: "RAM",
        storage: "Bộ nhớ trong", battery: "Pin, Sạc"
    };

    for (const [key, value] of Object.entries(product.specs)) {
        if (specLabels[key]) {
            specsRows += `<tr><th>${specLabels[key]}</th><td>${value}</td></tr>`;
        }
    }

    const prosHtml = product.pros.map(p => `<li><span>${p}</span></li>`).join('');
    const consHtml = product.cons.map(c => `<li><span>${c}</span></li>`).join('');

    const faqsHtml = product.faqs.map(faq => `
        <div class="faq-item">
            <h3>Hỏi: ${faq.question}</h3>
            <p>Đáp: ${faq.answer}</p>
        </div>
    `).join('');

    container.innerHTML = `
        <article class="detail-article">
            <header class="detail-header">
                <div class="detail-image"><img src="${product.image}" alt="${product.name}"></div>
                <div class="detail-info">
                    <h1>${product.name}</h1>
                    <div class="price">${priceFmt}</div>
                    <p class="description">${product.description}</p>
                </div>
            </header>
            <div class="detail-content">
                <section class="specs-section">
                    <h2 class="section-heading">Thông số kỹ thuật</h2>
                    <table class="specs-table"><tbody>${specsRows}</tbody></table>
                </section>
                <section class="review-section">
                    <h2 class="section-heading">Đánh giá nhanh</h2>
                    <div class="pros-cons-grid">
                        <div class="pros-list"><h3>Ưu điểm</h3><ul>${prosHtml}</ul></div>
                        <div class="cons-list"><h3>Nhược điểm</h3><ul>${consHtml}</ul></div>
                    </div>
                </section>
                <section class="faq-section">
                    <h2 class="section-heading">Câu hỏi thường gặp</h2>
                    <div class="faq-list">${faqsHtml}</div>
                </section>
                <section class="reference-section" style="grid-column: 1 / -1; margin-top: 2rem; padding: 1.5rem; background: var(--bg-main); border-radius: 8px;">
                    <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem; color: var(--text-muted);">Nguồn tham khảo & Đánh giá uy tín:</h3>
                    <ul style="list-style: disc; padding-left: 1.5rem; color: var(--text-muted); font-size: 0.95rem; line-height: 1.6;">
                        <li>Đánh giá chi tiết từ chuyên trang công nghệ <strong>GSMArena</strong> và <strong>The Verge</strong>.</li>
                        <li>Thông số kỹ thuật được trích xuất từ trang chủ chính thức của <strong>${product.brand}</strong>.</li>
                        <li>Dữ liệu FAQs được tổng hợp dựa trên các câu hỏi phổ biến nhất của người dùng trên <strong>Google Search</strong> và <strong>Bing AI</strong>.</li>
                    </ul>
                </section>
            </div>
        </article>
    `;
    injectGeoSchema(product);
}

function injectGeoSchema(product) {
    const productSchema = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": product.image,
        "description": product.description,
        "sku": product.id,
        "brand": { "@type": "Brand", "name": product.brand },
        "offers": {
            "@type": "Offer",
            "url": window.location.href,
            "priceCurrency": product.currency,
            "price": product.price,
            "itemCondition": "https://schema.org/NewCondition",
            "availability": "https://schema.org/InStock"
        }
    };
    if (product.rating) {
        productSchema.aggregateRating = {
            "@type": "AggregateRating", "ratingValue": product.rating.ratingValue, "reviewCount": product.rating.reviewCount
        };
    }
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": product.faqs.map(faq => ({
            "@type": "Question", "name": faq.question, "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
        }))
    };
    
    const s1 = document.createElement('script'); s1.type = 'application/ld+json'; s1.text = JSON.stringify(productSchema); document.head.appendChild(s1);
    const s2 = document.createElement('script'); s2.type = 'application/ld+json'; s2.text = JSON.stringify(faqSchema); document.head.appendChild(s2);
}

function formatCurrency(amount, currency) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency }).format(amount);
}
function showError(msg) {
    const el = document.querySelector('.loading');
    if (el) { el.style.color = 'red'; el.textContent = msg; }
}
function getFallbackImage(name) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="100%" height="100%" fill="#f5f5f7"/><text x="50%" y="50%" font-family="sans-serif" font-size="28" font-weight="bold" fill="#86868b" dominant-baseline="middle" text-anchor="middle">${name}</text></svg>`;
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}
