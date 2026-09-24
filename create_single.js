const fs = require('fs');

const dataPath = 'd:/web_phone/js/data.json';
const templatePath = 'd:/web_phone/product-detail.html';

const products = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const templateHtml = fs.readFileSync(templatePath, 'utf8');

const product = products.find(p => p.id === 'iphone-14-pro-max');

if (product) {
    function formatCurrency(amount, currency) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency }).format(amount);
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
            specsRows += `<tr><th>${specLabels[key]}</th><td>${value}</td></tr>\n`;
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

    const productHtml = `
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
            </div>
        </article>
    `;

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
            "url": `https://dien-thoai-geo.vercel.app/iphone-14-pro-max.html`,
            "priceCurrency": product.currency,
            "price": product.price,
            "itemCondition": "https://schema.org/NewCondition",
            "availability": "https://schema.org/InStock"
        }
    };
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": product.faqs.map(faq => ({
            "@type": "Question", "name": faq.question, "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
        }))
    };

    const schemaTags = `
    <script type="application/ld+json">${JSON.stringify(productSchema)}</script>
    <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
    `;

    let newFileContent = templateHtml.replace(
        '<div id="detail-container">',
        `<div id="detail-container">${productHtml}`
    );
    newFileContent = newFileContent.replace('<div class="loading">Đang tải chi tiết sản phẩm...</div>', '');
    newFileContent = newFileContent.replace('</head>', `${schemaTags}\n</head>`);
    newFileContent = newFileContent.replace('<title>Chi tiết sản phẩm - TechStore</title>', `<title>${product.name} - TechStore</title>\n    <meta name="description" content="${product.description}">`);
    
    // Remove the JS files so it doesn't try to dynamically render over the static content
    newFileContent = newFileContent.replace('<script src="js/products.js"></script>', '');

    fs.writeFileSync(`d:/web_phone/iphone-14-pro-max.html`, newFileContent, 'utf8');
    console.log('Created iphone-14-pro-max.html statically.');
}
