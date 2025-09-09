let cartCount = 0;

function hideLanding() {
  const landingElement = document.getElementById("landing");
  if (landingElement) {
    landingElement.style.display = "none";
    document.body.classList.add("loaded");
    // إزالة التمرير التلقائي - المستخدم سيبقى في نفس المكان
  }
}

function scrollToShop() {
  const section = document.getElementById("shop");
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
}

function addToCart() {
  // السلة أصبحت ديكورية فقط
  showOrderForm();
}

// إضافة مقاسات للسراويل الموجودة
function addSizesToExistingJeans() {
  const savedProducts = localStorage.getItem("sabwear_products");
  if (!savedProducts) return;

  try {
    const products = JSON.parse(savedProducts);
    let updated = false;

    // تحديث المنتجات من فئة jeans إذا لم تكن تحتوي على مقاسات
    const updatedProducts = products.map((product) => {
      if (product.category === "jeans" && !product.availableSizes) {
        product.availableSizes = JSON.stringify([
          "28",
          "30",
          "32",
          "34",
          "36",
          "38",
        ]);
        updated = true;
        console.log(`تم إضافة مقاسات للجينز: ${product.name}`);
      }
      return product;
    });

    // حفظ التحديثات
    if (updated) {
      localStorage.setItem("sabwear_products", JSON.stringify(updatedProducts));

      // تحديث المنتجات المعروضة
      document.querySelectorAll(".product").forEach((productElement) => {
        if (
          productElement.dataset.category === "jeans" &&
          !productElement.dataset.availableSizes
        ) {
          productElement.dataset.availableSizes = JSON.stringify([
            "28",
            "30",
            "32",
            "34",
            "36",
            "38",
          ]);
        }
      });

      console.log("تم تحديث مقاسات الجينز بنجاح");
    }
  } catch (e) {
    console.error("خطأ في تحديث مقاسات الجينز:", e);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // تحميل المنتجات المحفوظة عند بدء الموقع
  loadProductsFromStorage();

  // إضافة مقاسات للجينز الموجود
  addSizesToExistingJeans();

  document.getElementById("menu-button").addEventListener("click", function () {
    document.getElementById("sidebar").classList.toggle("show");
    document.getElementById("overlay").classList.toggle("show");
  });

  document.getElementById("overlay").addEventListener("click", function () {
    document.getElementById("sidebar").classList.remove("show");
    this.classList.remove("show");
  });

  // إضافة مستمعين لأزرار المقاسات
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("size-btn")) {
      const size = e.target.dataset.size;
      selectSize(size);
    }
  });

  // معاينة الصور المختارة في الأدمين
  const imageInput = document.getElementById("product-images-input");
  if (imageInput) {
    imageInput.addEventListener("change", function (e) {
      try {
        handleFileSelection(e);
      } catch (error) {
        console.error("خطأ في معالجة اختيار الصور:", error);
      }
    });
  }
});

// دالة معالجة اختيار الصور
function handleFileSelection(e) {
  const files = e.target && e.target.files ? e.target.files : [];
  const preview = document.getElementById("image-preview");
  const previewSection = document.getElementById("image-preview-section");

  if (!preview) return;

  // إظهار قسم المعاينة وتحديث العداد
  if (previewSection) {
    previewSection.style.display = files.length > 0 ? "block" : "none";
  }

  // تحديث عداد الصور
  const imagesCount = document.getElementById("images-count");
  if (imagesCount) {
    imagesCount.textContent = files.length;
    imagesCount.style.background =
      files.length > 10 ? "#FFA726" : files.length > 5 ? "#FF9800" : "#4CAF50";
  }

  preview.innerHTML = "";

  if (files.length === 0) return;

  // إنشاء حاوي للصور مع scroll أفقي للعدد الكبير
  const imagesContainer = document.createElement("div");
  imagesContainer.style.cssText = `
    display: flex;
    gap: 12px;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 8px 4px 12px 4px;
    max-width: 100%;
    scroll-snap-type: x mandatory;
    scrollbar-width: thin;
    scrollbar-color: #4CAF50 #333;
  `;

  // إضافة CSS للـ scrollbar
  const scrollStyle = document.createElement("style");
  scrollStyle.textContent = `
    .admin-image-preview::-webkit-scrollbar {
      height: 6px;
    }
    .admin-image-preview::-webkit-scrollbar-track {
      background: #333;
      border-radius: 10px;
    }
    .admin-image-preview::-webkit-scrollbar-thumb {
      background: #4CAF50;
      border-radius: 10px;
    }
    .admin-image-preview::-webkit-scrollbar-thumb:hover {
      background: #45a049;
    }
  `;
  if (!document.getElementById("admin-scrollbar-style")) {
    scrollStyle.id = "admin-scrollbar-style";
    document.head.appendChild(scrollStyle);
  }

  imagesContainer.className = "admin-image-preview";

  Array.from(files).forEach((file, index) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const imgDiv = document.createElement("div");
        imgDiv.style.cssText = `
          position: relative;
          width: 90px;
          height: 90px;
          border: 2px solid ${index === 0 ? "#4CAF50" : "#555"};
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          flex-shrink: 0;
          scroll-snap-align: start;
          background: #1a1a1a;
        `;

        imgDiv.innerHTML = `
          <img src="${e.target.result}" 
               style="width: 100%; height: 100%; object-fit: cover; transition: all 0.3s;">
          <div style="
            position: absolute; 
            top: 6px; 
            right: 6px; 
            background: ${index === 0 ? "linear-gradient(135deg, #4CAF50, #45a049)" : "linear-gradient(135deg, #666, #555)"}; 
            color: white; 
            width: 24px; 
            height: 24px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 12px; 
            font-weight: bold;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">
            ${index === 0 ? "★" : index + 1}
          </div>
          ${
            index === 0
              ? `
            <div style="
              position: absolute; 
              bottom: 4px; 
              left: 4px; 
              right: 4px; 
              background: linear-gradient(135deg, #4CAF50, #45a049); 
              color: white; 
              padding: 2px 4px; 
              border-radius: 4px; 
              font-size: 9px; 
              font-weight: bold;
              text-align: center;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">
              رئيسية
            </div>
          `
              : ""
          }
          <div class="image-overlay" style="
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(76, 175, 80, 0.2);
            opacity: 0;
            transition: opacity 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="
              background: rgba(255,255,255,0.9);
              color: #333;
              padding: 4px 8px;
              border-radius: 8px;
              font-size: 10px;
              font-weight: bold;
            ">👁️ عرض</span>
          </div>
        `;

        // تأثيرات التفاعل المحسنة
        imgDiv.addEventListener("mouseenter", function () {
          this.style.transform = "scale(1.05) translateY(-2px)";
          this.style.borderColor = "#4CAF50";
          this.style.boxShadow = "0 8px 25px rgba(76, 175, 80, 0.4)";
          this.querySelector("img").style.filter = "brightness(1.1)";
          this.querySelector(".image-overlay").style.opacity = "1";
        });

        imgDiv.addEventListener("mouseleave", function () {
          this.style.transform = "scale(1) translateY(0)";
          this.style.borderColor = index === 0 ? "#4CAF50" : "#555";
          this.style.boxShadow = "none";
          this.querySelector("img").style.filter = "brightness(1)";
          this.querySelector(".image-overlay").style.opacity = "0";
        });

        // إمكانية عرض الصورة في نافذة منبثقة
        imgDiv.addEventListener("click", function () {
          showImagePreview(e.target.result, file.name, index + 1, files.length);
        });

        imagesContainer.appendChild(imgDiv);
      };
      reader.readAsDataURL(file);
    }
  });

  preview.appendChild(imagesContainer);

  // رسالة معلوماتية محسنة
  if (files.length > 0) {
    const infoDiv = document.createElement("div");
    const maxRecommended =
      files.length > 10
        ? " - يُنصح بعدم تجاوز 10 صور للحصول على أداء أفضل"
        : "";
    infoDiv.style.cssText = `
      color: #4CAF50; 
      font-size: 14px; 
      margin-top: 15px; 
      text-align: center; 
      font-weight: 500; 
      padding: 15px; 
      background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%); 
      border-radius: 12px; 
      border: 1px solid rgba(76, 175, 80, 0.3);
      position: relative;
      overflow: hidden;
    `;

    infoDiv.innerHTML = `
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(45deg, rgba(255,255,255,0.05) 0%, transparent 50%); pointer-events: none;"></div>
      <div style="position: relative; z-index: 1;">
        <span style="font-size: 18px; margin-right: 8px;">✅</span>
        <strong>تم اختيار ${files.length} صورة بنجاح</strong>
        ${
          files.length > 1
            ? `
          <br>
          <span style="font-size: 12px; color: #81C784; margin-top: 8px; display: inline-block;">
            📌 الصورة الأولى ستكون الرئيسية في العرض
          </span>
        `
            : ""
        }
        ${
          maxRecommended
            ? `
          <br>
          <span style="font-size: 11px; color: #FFA726; margin-top: 4px; display: inline-block;">
            ⚠️ ${maxRecommended}
          </span>
        `
            : ""
        }
      </div>
    `;
    preview.appendChild(infoDiv);
  }
}

// وظيفة عرض معاينة الصورة في نافذة منبثقة
function showImagePreview(imageSrc, fileName, imageIndex, totalImages) {
  const modal = document.createElement("div");
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.95);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    box-sizing: border-box;
  `;

  modal.innerHTML = `
    <div style="
      background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
      border-radius: 15px;
      padding: 20px;
      max-width: 90%;
      max-height: 90%;
      position: relative;
      box-shadow: 0 20px 60px rgba(0,0,0,0.8);
    ">
      <button onclick="this.parentElement.parentElement.remove()" style="
        position: absolute;
        top: 15px;
        right: 20px;
        background: rgba(255,68,68,0.9);
        color: white;
        border: none;
        width: 35px;
        height: 35px;
        border-radius: 50%;
        font-size: 18px;
        cursor: pointer;
        transition: all 0.3s;
      ">✕</button>

      <div style="text-align: center; margin-bottom: 15px;">
        <h3 style="color: white; margin: 0; font-size: 18px;">معاينة الصورة ${imageIndex} من ${totalImages}</h3>
        <p style="color: #ccc; margin: 5px 0 0 0; font-size: 12px;">${fileName}</p>
      </div>

      <img src="${imageSrc}" style="
        max-width: 100%;
        max-height: 70vh;
        object-fit: contain;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      ">
    </div>
  `;

  modal.onclick = function (e) {
    if (e.target === modal) {
      modal.remove();
    }
  };

  document.body.appendChild(modal);
}

// دالة عرض معرض الصور للمنتج
function showProductGallery(productName, images) {
  const modal = document.createElement("div");
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.95);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    box-sizing: border-box;
  `;

  let currentIndex = 0;

  modal.innerHTML = `
    <div style="
      background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
      border-radius: 20px;
      padding: 25px;
      max-width: 90%;
      max-height: 90%;
      position: relative;
      box-shadow: 0 20px 60px rgba(0,0,0,0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
    ">
      <button onclick="this.parentElement.parentElement.remove()" style="
        position: absolute;
        top: 20px;
        right: 25px;
        background: rgba(255,68,68,0.9);
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        font-size: 20px;
        cursor: pointer;
        transition: all 0.3s;
        z-index: 1001;
      ">✕</button>

      <div style="text-align: center; margin-bottom: 20px;">
        <h3 style="color: white; margin: 0; font-size: 20px;">${productName}</h3>
        <p style="color: #4CAF50; margin: 5px 0 0 0; font-size: 14px; font-weight: 600;">معرض الصور (${images.length} صور)</p>
      </div>

      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        ${
          images.length > 1
            ? `
          <button id="prev-gallery-btn" style="
            position: absolute;
            left: -60px;
            background: rgba(76, 175, 80, 0.9);
            color: white;
            border: none;
            width: 45px;
            height: 45px;
            border-radius: 50%;
            font-size: 20px;
            cursor: pointer;
            transition: all 0.3s;
            z-index: 1001;
          ">‹</button>

          <button id="next-gallery-btn" style="
            position: absolute;
            right: -60px;
            background: rgba(76, 175, 80, 0.9);
            color: white;
            border: none;
            width: 45px;
            height: 45px;
            border-radius: 50%;
            font-size: 20px;
            cursor: pointer;
            transition: all 0.3s;
            z-index: 1001;
          ">›</button>
        `
            : ""
        }

        <img id="gallery-main-image" src="${images[0]}" style="
          max-width: 100%;
          max-height: 60vh;
          object-fit: contain;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        ">
      </div>

      ${
        images.length > 1
          ? `
        <div style="
          background: rgba(0,0,0,0.5);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: bold;
          margin: 15px 0;
        ">
          <span id="gallery-counter">1</span> من ${images.length}
        </div>

        <div style="
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 10px;
          max-width: 100%;
          scrollbar-width: thin;
          scrollbar-color: #4CAF50 #333;
        " id="gallery-thumbnails">
          ${images
            .map(
              (img, index) => `
            <img src="${img}" 
                 onclick="changeGalleryImage(${index})" 
                 style="
                   width: 60px;
                   height: 60px;
                   object-fit: cover;
                   border-radius: 8px;
                   cursor: pointer;
                   border: 2px solid ${index === 0 ? "#4CAF50" : "transparent"};
                   transition: all 0.3s;
                   flex-shrink: 0;
                 "
                 data-index="${index}">
          `,
            )
            .join("")}
        </div>
      `
          : ""
      }
    </div>
  `;

  // إضافة وظائف التنقل
  if (images.length > 1) {
    const prevBtn = modal.querySelector("#prev-gallery-btn");
    const nextBtn = modal.querySelector("#next-gallery-btn");

    if (prevBtn) {
      prevBtn.onclick = function () {
        currentIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
        changeGalleryImage(currentIndex);
      };
    }

    if (nextBtn) {
      nextBtn.onclick = function () {
        currentIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
        changeGalleryImage(currentIndex);
      };
    }
  }

  // وظيفة تغيير الصورة
  window.changeGalleryImage = function (index) {
    currentIndex = index;
    const mainImage = modal.querySelector("#gallery-main-image");
    const counter = modal.querySelector("#gallery-counter");
    const thumbnails = modal.querySelectorAll("#gallery-thumbnails img");

    if (mainImage) mainImage.src = images[index];
    if (counter) counter.textContent = index + 1;

    // تحديث الصور المصغرة
    thumbnails.forEach((thumb, i) => {
      thumb.style.border =
        i === index ? "2px solid #4CAF50" : "2px solid transparent";
    });
  };

  modal.onclick = function (e) {
    if (e.target === modal) {
      modal.remove();
    }
  };

  document.body.appendChild(modal);
}

// وظائف التنقل للقوائم
function showAbout() {
  alert(
    "SABWEAR - Modern fashion that reflects your unique personality.\n\nWe are a premium fashion brand specializing in contemporary clothing that combines style with quality.",
  );
}

function showContact() {
  const contactInfo = `Contact SABWEAR:
☎ Phone: +213656614356
📧 Email: contact@sabwear.com
📱 Instagram: @sabwear.dz
🎵 TikTok: @sabwear.dz
💬 WhatsApp: +213656614356`;
  alert(contactInfo);
}

// حفظ المنتجات في Local Storage
function saveProductsToStorage() {
  const products = [];
  document.querySelectorAll(".product").forEach((product) => {
    const name = product.dataset.name;
    const category = product.dataset.category;
    const productId = product.dataset.productId;
    const images = product.dataset.images;
    const availableSizes = product.dataset.availableSizes;
    const availableColors = product.dataset.availableColors;
    const priceElement = product.querySelector("span:not(.sale-tag)");
    const price = priceElement ? priceElement.textContent : "";
    const imgElement = product.querySelector("img");
    const mainImage = imgElement ? imgElement.src : "";
    const soldOut = product.classList.contains("sold-out");

    if (name && category) {
      products.push({
        id:
          productId ||
          `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        category,
        price,
        mainImage,
        images: images || JSON.stringify([mainImage]),
        availableSizes: availableSizes || JSON.stringify(["M"]),
        availableColors: availableColors || JSON.stringify([]),
        soldOut,
        createdAt: new Date().toISOString(),
        isCustom: !!productId, // تمييز المنتجات المخصصة
      });
    }
  });

  localStorage.setItem("sabwear_products", JSON.stringify(products));
  console.log(`تم حفظ ${products.length} منتج في localStorage`);
}

// تحميل المنتجات من Local Storage
function loadProductsFromStorage() {
  const savedProducts = localStorage.getItem("sabwear_products");
  if (!savedProducts) {
    console.log("لا توجد منتجات محفوظة، سيتم إنشاء منتجات افتراضية");
    createDefaultProducts();
    return;
  }

  try {
    const products = JSON.parse(savedProducts);
    const productsContainer = document.getElementById("shop");

    if (!productsContainer) {
      console.error("لم يتم العثور على حاوي المنتجات");
      return;
    }

    // حذف جميع المنتجات الموجودة
    productsContainer.innerHTML = "";

    // إضافة جميع المنتجات المحفوظة
    products.forEach((productData) => {
      createProductFromData(productData, productsContainer);
    });

    console.log(`تم تحميل ${products.length} منتج من localStorage`);
  } catch (e) {
    console.error("خطأ في تحميل المنتجات:", e);
  }
}

// إنشاء منتج من البيانات المحفوظة
function createProductFromData(productData, container) {
  let images = [];
  try {
    images = JSON.parse(productData.images);
  } catch (e) {
    images = [productData.mainImage];
  }

  // استخدام الألوان المحفوظة مع المنتج أولاً، ثم الافتراضية
  let availableColors = [];
  
  // إذا كان المنتج يحتوي على ألوان محفوظة، استخدمها
  if (productData.availableColors && Array.isArray(productData.availableColors)) {
    const colorMap = {
      "white": { name: "أبيض", value: "white", color: "#ffffff" },
      "black": { name: "أسود", value: "black", color: "#000000" },
      "light-blue": { name: "أزرق فاتح", value: "light-blue", color: "#87CEEB" },
      "dark-blue": { name: "أزرق داكن", value: "dark-blue", color: "#1e3a8a" },
      "gray": { name: "رمادي", value: "gray", color: "#6b7280" },
      "brown": { name: "بني", value: "brown", color: "#8B4513" }
    };
    
    availableColors = productData.availableColors
      .filter(colorValue => colorMap[colorValue])
      .map(colorValue => colorMap[colorValue]);
  } else {
    // الألوان الافتراضية حسب الفئة (للمنتجات القديمة)
    if (productData.category === "tshirt") {
      availableColors = [
        { name: "أبيض", value: "white", color: "#ffffff" },
        { name: "أسود", value: "black", color: "#000000" },
      ];
    } else if (
      productData.category === "jean" ||
      productData.category === "jeans"
    ) {
      availableColors = [
        { name: "أزرق فاتح", value: "light-blue", color: "#87CEEB" },
        { name: "أزرق داكن", value: "dark-blue", color: "#1e3a8a" },
        { name: "رمادي", value: "gray", color: "#6b7280" },
        { name: "أسود", value: "black", color: "#000000" },
      ];
    }
  }

  // إنشاء HTML للألوان
  const colorsHTML =
    availableColors.length > 0
      ? `
    <div style="display: flex; justify-content: center; gap: 6px; margin: 5px 0;">
      ${availableColors
        .map(
          (color) => `
        <div style="width: 12px; height: 12px; border-radius: 3px; background-color: ${color.color}; border: 1px solid #555; cursor: pointer; transition: transform 0.2s;" 
             onclick="selectProductColor(this, '${color.value}')" 
             onmouseover="this.style.transform='scale(1.2)'" 
             onmouseout="this.style.transform='scale(1)'"
             title="${color.name}"></div>
      `,
        )
        .join("")}
    </div>
  `
      : "";

  const newProduct = document.createElement("div");
  newProduct.className = "product";
  newProduct.dataset.category = productData.category;
  newProduct.dataset.name = productData.name;
  newProduct.dataset.productId = productData.id;
  newProduct.dataset.images = JSON.stringify(images);
  newProduct.dataset.availableSizes =
    productData.availableSizes || JSON.stringify(["M"]);
  newProduct.dataset.availableColors = JSON.stringify(
    productData.availableColors || availableColors.map((c) => c.value),
  );
  newProduct.style.cssText =
    "background: transparent; transition: 0.3s; display: flex; flex-direction: column; height: 100%;";

  if (productData.soldOut) {
    newProduct.classList.add("sold-out");
  }

  const imageGallery =
    images.length > 1
      ? `<div class="product-image-gallery" style="position: relative;" onclick="showProductGallery('${productData.name.replace(/'/g, "\\'")}', ${JSON.stringify(images).replace(/"/g, "&quot;")})">
      <img src="${images[0]}" alt="${productData.name}" style="width: 100%; max-width: 200px; height: auto; margin: 0 auto; display: block; object-fit: cover; border-radius: 8px; transition: all 0.3s; cursor: pointer;" data-current-image="0">
      <div style="position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 500; backdrop-filter: blur(10px);">1/${images.length}</div>
    </div>`
      : `<img src="${images[0]}" alt="${productData.name}" style="width: 100%; max-width: 200px; height: auto; margin: 0 auto; display: block; object-fit: cover; border-radius: 8px;">`;

  newProduct.innerHTML = `
    <div style="position: relative; padding: 15px; text-align: center; background: transparent;">
      ${imageGallery}
      <span class="sale-tag" style="position: absolute; top: 15px; left: 15px; background-color: #000; color: #fff; padding: 2px 6px; font-size: 9px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; border-radius: 2px;">SALE</span>
    </div>
    <div style="padding: 10px 0; text-align: center; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between;">
      <h3 style="font-size: 13px; font-weight: 500; margin: 0 0 5px 0; color: #fff; line-height: 1.3; font-family: 'Roboto', sans-serif;">${productData.name}</h3>
      
      <!-- قسم الألوان مخفي حسب الطلب -->

      <div style="display: flex; flex-direction: column; align-items: center; gap: 5px; margin: 5px 0 10px 0;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 13px; font-weight: 700; color: #fff;">${productData.price}</span>
        </div>
        <button onclick="showOrderForm('${productData.name.replace(/'/g, "\\'")}', '${productData.price.replace(/'/g, "\\'")}')" style="background: #000; color: #fff; border: none; padding: 8px 20px; font-size: 12px; font-weight: 600; cursor: pointer; margin-top: 5px; width: auto; text-transform: uppercase; letter-spacing: 0.5px; transition: all 0.3s ease;">
          شراء الآن
        </button>
      </div>
    </div>
  `;

  container.appendChild(newProduct);
}

// إنشاء منتجات افتراضية للبداية
function createDefaultProducts() {
  const defaultProducts = [
    {
      id: "default_1",
      name: "T-shirt Oversize",
      price: "€25.00",
      category: "tshirt",
      images: JSON.stringify([
        "./tshirt/photo_2025-08-31_04-51-35.jpg",
        "./tshirt/photo_2025-08-31_04-51-44.jpg",
        "./tshirt/photo_2025-08-31_04-51-51.jpg",
      ]),
      mainImage: "./tshirt/photo_2025-08-31_04-51-35.jpg",
      availableSizes: JSON.stringify(["S", "M", "L", "XL"]),
      availableColors: JSON.stringify(["white", "black"]),
      soldOut: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "default_2",
      name: "Flared Jeans",
      price: "€54.00",
      category: "jean",
      images: JSON.stringify([
        "./JORTS/photo_2025-08-31_04-51-10.jpg",
        "./JORTS/photo_2025-08-31_04-51-14.jpg",
      ]),
      mainImage: "./JORTS/photo_2025-08-31_04-51-10.jpg",
      availableSizes: JSON.stringify(["28", "30", "32", "34", "36"]),
      availableColors: JSON.stringify(["light-blue", "dark-blue"]),
      soldOut: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "default_3",
      name: "JORTS",
      price: "€23.00",
      category: "jean",
      images: JSON.stringify(["./JORTS/photo_2025-08-31_04-51-21.jpg"]),
      mainImage: "./JORTS/photo_2025-08-31_04-51-21.jpg",
      availableSizes: JSON.stringify(["28", "30", "32", "34"]),
      availableColors: JSON.stringify(["gray", "black"]),
      soldOut: false,
      createdAt: new Date().toISOString(),
    },
  ];

  const productsContainer = document.getElementById("shop");
  if (!productsContainer) return;

  defaultProducts.forEach((productData) => {
    createProductFromData(productData, productsContainer);
  });

  // حفظ المنتجات الافتراضية في localStorage
  saveProductsToStorage();
  console.log("تم إنشاء وحفظ المنتجات الافتراضية");
}

function hideLanding() {
  const landingElement = document.getElementById("landing");
  if (landingElement) {
    landingElement.style.display = "none";
    document.body.classList.add("loaded");

    // التمرير إلى قسم المتجر بعد إخفاء شاشة البداية
    setTimeout(() => {
      scrollToShop();
    }, 500);
  }
}

function scrollToShop() {
  const section = document.getElementById("shop");
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
}

function toggleSearch() {
  const searchOverlay = document.getElementById("search-overlay");
  if (!searchOverlay) {
    createSearchOverlay();
  }

  // Re-fetch searchOverlay in case it was just created
  const updatedSearchOverlay = document.getElementById("search-overlay");

  if (
    updatedSearchOverlay.style.display === "none" ||
    updatedSearchOverlay.style.display === ""
  ) {
    updatedSearchOverlay.style.display = "block";
    updatedSearchOverlay.style.animation = "fadeIn 0.3s ease";
    setTimeout(() => {
      const searchInput = document.getElementById("mobile-search-input");
      if (searchInput) {
        searchInput.focus();
      }
    }, 100);
  } else {
    closeSearch();
  }
}

function createSearchOverlay() {
  const overlay = document.createElement("div");
  overlay.id = "search-overlay";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.95);
    z-index: 3000;
    display: none;
    padding: 20px;
    box-sizing: border-box;
  `;

  overlay.innerHTML = `
    <div style="display: flex; align-items: center; gap: 15px; margin-top: 20px;">
      <div style="flex: 1; position: relative;">
        <input
          id="mobile-search-input"
          type="text"
          placeholder="Search"
          style="
            width: 100%;
            padding: 15px 50px 15px 20px;
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 8px;
            color: #fff;
            font-size: 16px;
            outline: none;
            box-sizing: border-box;
          "
          onkeypress="if(event.key==='Enter') performSearch()"
        >
        <button
          onclick="performSearch()"
          style="
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #fff;
            font-size: 18px;
            cursor: pointer;
            padding: 5px;
          "
        ><img src="attached_assets/search_1756517045665.png" alt="Search" style="width: 18px; height: 18px; filter: invert(1);"></button>
      </div>
      <button
        onclick="closeSearch()"
        style="
          background: none;
          border: none;
          color: #fff;
          font-size: 24px;
          cursor: pointer;
          padding: 10px;
        "
      >✕</button>
    </div>
    <div id="search-results" style="margin-top: 20px; color: #fff;"></div>
  `;

  document.body.appendChild(overlay);
}

function closeSearch() {
  const searchOverlay = document.getElementById("search-overlay");
  if (searchOverlay) {
    searchOverlay.style.animation = "fadeOut 0.3s ease";
    setTimeout(() => {
      searchOverlay.style.display = "none";
    }, 300);
  }
}

function performSearch() {
  const searchInput = document.getElementById("mobile-search-input");
  const resultsDiv = document.getElementById("search-results");

  if (!searchInput || !resultsDiv) return;

  const searchTerm = searchInput.value.toLowerCase();

  if (!searchTerm) {
    resultsDiv.innerHTML = "";
    return;
  }

  // البحث في المنتجات
  const products = document.querySelectorAll(".product");
  let results = [];

  products.forEach((product) => {
    const name = product.dataset.name ? product.dataset.name.toLowerCase() : "";
    const category = product.dataset.category
      ? product.dataset.category.toLowerCase()
      : "";

    if (name.includes(searchTerm) || category.includes(searchTerm)) {
      const img = product.querySelector("img");
      const productName = product.querySelector("h3");
      const price = product.querySelector("span:not(.sale-tag)");

      if (img && productName && price) {
        results.push({
          name: productName.textContent,
          price: price.textContent,
          image: img.src,
          element: product,
        });
      }
    }
  });

  // عرض النتائج
  if (results.length > 0) {
    resultsDiv.innerHTML = `
      <div style="font-size: 18px; margin-bottom: 15px; color: #666;">Search Results (${results.length})</div>
      ${results
        .map(
          (product) => `
        <div
          onclick="closeSearch()"
          style="
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px;
            background: #1a1a1a;
            border-radius: 8px;
            margin-bottom: 10px;
            cursor: pointer;
            transition: 0.3s;
          "
          onmouseover="this.style.background='#333'"
          onmouseout="this.style.background='#1a1a1a'"
        >
          <img src="${product.image}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px;">
          <div>
            <div style="font-weight: bold; margin-bottom: 5px;">${product.name}</div>
            <div style="color: #666;">${product.price}</div>
          </div>
        </div>
      `,
        )
        .join("")}
    `;
  } else {
    resultsDiv.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #666;">
        <div style="font-size: 48px; margin-bottom: 15px;">🔍</div>
        <div>No products found for "${searchTerm}"</div>
      </div>
    `;
  }
}

// تحديث عداد السلة
function updateCartDisplay() {
  const cartIcon = document.querySelector(".cart-icon");
  if (!cartIcon) return;

  let cartCountElement = cartIcon.querySelector(".cart-count");

  if (!cartCountElement) {
    cartCountElement = document.createElement("span");
    cartCountElement.className = "cart-count";
    cartIcon.style.position = "relative";
    cartIcon.appendChild(cartCountElement);
  }

  cartCountElement.textContent = cartCount;
  cartCountElement.style.display = cartCount > 0 ? "flex" : "none";
}

// وظيفة تصفية المنتجات
function filterProducts(category) {
  const products = document.querySelectorAll(".product");
  const categories = document.querySelectorAll(".category");

  // إزالة الفئة النشطة من جميع الفئات
  categories.forEach((cat) => cat.classList.remove("active"));

  // إضافة الفئة النشطة للفئة المحددة
  if (event && event.target) {
    event.target.classList.add("active");
  }

  products.forEach((product) => {
    if (category === "all" || product.dataset.category === category) {
      product.style.display = "block";
      product.style.animation = "fadeIn 0.5s ease-in";
    } else {
      product.style.display = "none";
    }
  });
}

// وظيفة البحث في المنتجات
function searchProducts() {
  const searchInput = document.getElementById("search-input");
  const loading = document.getElementById("loading");

  if (!searchInput) return;

  const searchTerm = searchInput.value.toLowerCase();
  const products = document.querySelectorAll(".product");

  if (searchTerm.length === 0) {
    products.forEach((product) => {
      product.style.display = "block";
    });
    return;
  }

  // عرض تأثير التحميل
  if (loading) {
    loading.style.display = "block";
  }

  setTimeout(() => {
    let hasResults = false;

    products.forEach((product) => {
      const productName = product.dataset.name
        ? product.dataset.name.toLowerCase()
        : "";
      if (productName.includes(searchTerm)) {
        product.style.display = "block";
        product.style.animation = "fadeIn 0.5s ease-in";
        hasResults = true;
      } else {
        product.style.display = "none";
      }
    });

    if (loading) {
      loading.style.display = "none";
    }

    if (!hasResults) {
      showNoResults();
    } else {
      hideNoResults();
    }
  }, 800);
}

// عرض رسالة عدم وجود نتائج
function showNoResults() {
  let noResultsDiv = document.getElementById("no-results");
  const shopSection = document.getElementById("shop");

  if (!noResultsDiv && shopSection) {
    noResultsDiv = document.createElement("div");
    noResultsDiv.id = "no-results";
    noResultsDiv.style.cssText =
      "text-align: center; padding: 40px; color: #666; font-size: 1.2rem;";
    noResultsDiv.innerHTML =
      '<p>😔 No matching products found</p><p style="font-size: 1rem; color: #888;">Try searching with different keywords</p>';
    shopSection.appendChild(noResultsDiv);
  }
  if (noResultsDiv) {
    noResultsDiv.style.display = "block";
  }
}

function hideNoResults() {
  const noResultsDiv = document.getElementById("no-results");
  if (noResultsDiv) {
    noResultsDiv.style.display = "none";
  }
}

// نظام الإشعارات
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === "success" ? "#4CAF50" : type === "error" ? "#f44336" : "#666"};
    color: white;
    padding: 15px 20px;
    border-radius: 6px;
    z-index: 3000;
    animation: slideIn 0.3s ease-in;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    max-width: 300px;
    word-wrap: break-word;
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// وظائف السلة (ديكورية)
function showCart() {
  showNotification(
    'السلة هي للديكور فقط - اضغط على "شراء الآن" لطلب المنتج',
    "info",
  );
}

function closeCart() {
  const cartModal = document.getElementById("cart-modal");
  if (cartModal) {
    cartModal.style.display = "none";
  }
}

function checkout() {
  if (cartCount === 0) {
    showNotification("Cart is empty!", "error");
    return;
  }

  showNotification(
    "Thank you! We will contact you soon to complete the order.",
    "success",
  );
  cartCount = 0;
  updateCartDisplay();
  closeCart();
}

// نظام الطلبات
let currentOrderProduct = null;
let selectedSize = "";
let currentQuantity = 1;

function showOrderForm(productName = "منتج مختار", productPrice = "€0.00") {
  // البحث عن المنتج للحصول على صوره والمقاسات والألوان
  const products = document.querySelectorAll(".product");
  let productImages = [];
  let productMainImage = "";
  let availableSizes = ["M"]; // مقاسات افتراضية
  let availableColors = []; // ألوان متاحة
  let productCategory = "tshirt";

  products.forEach((product) => {
    if (product.dataset.name === productName) {
      productCategory = product.dataset.category || "tshirt";

      // الحصول على الصور
      const imagesData = product.dataset.images;
      if (imagesData) {
        try {
          productImages = JSON.parse(imagesData);
          productMainImage = productImages[0] || "";
        } catch (e) {
          const img = product.querySelector("img");
          if (img) {
            productMainImage = img.src;
            productImages = [img.src];
          }
        }
      } else {
        const img = product.querySelector("img");
        if (img) {
          productMainImage = img.src;
          productImages = [img.src];
        }
      }

      // الحصول على المقاسات المتاحة
      const sizesData = product.dataset.availableSizes;
      if (sizesData) {
        try {
          availableSizes = JSON.parse(sizesData);
        } catch (e) {
          availableSizes = ["M"];
        }
      }

      // الحصول على الألوان المتاحة
      const colorsData = product.dataset.availableColors;
      if (colorsData) {
        try {
          availableColors = JSON.parse(colorsData);
        } catch (e) {
          availableColors = [];
        }
      }
    }
  });

  currentOrderProduct = {
    name: productName,
    price: productPrice,
    image: productMainImage,
    images: productImages,
  };

  const orderModal = document.getElementById("order-form-modal");
  if (orderModal) {
    const productNameElement = document.getElementById("order-product-name");
    const productPriceElement = document.getElementById("order-product-price");
    const productImageElement = document.getElementById("modal-product-image");

    if (productNameElement) productNameElement.textContent = productName;
    if (productPriceElement) productPriceElement.textContent = productPrice;
    if (productImageElement) {
      productImageElement.src = productMainImage;
      productImageElement.alt = productName;
      productImageElement.dataset.currentImage = "0";
    }

    // إعداد معرض الصور
    setupModalImageGallery(productImages);

    // إعادة تعيين المتغيرات
    selectedSize = "";
    selectedColor = "";
    currentQuantity = 1;
    const quantityDisplay = document.getElementById("quantity-display");
    if (quantityDisplay) quantityDisplay.textContent = currentQuantity;

    // تحديث خيارات الألوان حسب المنتج
    const colorOptionsContainer = document.getElementById("color-options");
    if (colorOptionsContainer && availableColors.length > 0) {
      colorOptionsContainer.innerHTML = "";

      const colorMap = {
        white: { name: "أبيض", color: "#ffffff" },
        black: { name: "أسود", color: "#000000" },
        "light-blue": { name: "أزرق فاتح", color: "#87CEEB" },
        "dark-blue": { name: "أزرق داكن", color: "#1e3a8a" },
        gray: { name: "رمادي", color: "#6b7280" },
        brown: { name: "بني", color: "#8B4513" },
      };

      availableColors.forEach((colorValue) => {
        const colorInfo = colorMap[colorValue] || {
          name: colorValue,
          color: "#ccc",
        };

        const colorButton = document.createElement("button");
        colorButton.className = "color-btn";
        colorButton.setAttribute("data-color", colorValue);
        colorButton.onclick = () => selectModalColor(colorValue);
        colorButton.style.cssText = `
          display: flex; 
          align-items: center; 
          gap: 8px; 
          background: transparent; 
          border: 2px solid #666; 
          color: white; 
          padding: 8px 16px; 
          border-radius: 20px; 
          cursor: pointer; 
          font-size: 13px; 
          transition: all 0.3s;
        `;

        const colorSquare = document.createElement("div");
        colorSquare.style.cssText = `
          width: 16px; 
          height: 16px; 
          border-radius: 3px; 
          background-color: ${colorInfo.color}; 
          border: 1px solid #555;
        `;

        const colorText = document.createElement("span");
        colorText.textContent = colorInfo.name;

        colorButton.appendChild(colorSquare);
        colorButton.appendChild(colorText);
        colorOptionsContainer.appendChild(colorButton);
      });
    }

    // تحديث أزرار المقاسات حسب المنتج
    const sizeOptionsContainer = document.getElementById("size-options");
    if (sizeOptionsContainer) {
      sizeOptionsContainer.innerHTML = "";

      availableSizes.forEach((size) => {
        const sizeButton = document.createElement("button");
        sizeButton.className = "size-btn";
        sizeButton.setAttribute("data-size", size);
        sizeButton.textContent = size;
        sizeButton.onclick = () => selectSize(size);
        sizeButton.style.cssText =
          "background: transparent; border: 1px solid #666; color: white; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 13px; transition: all 0.3s;";
        sizeOptionsContainer.appendChild(sizeButton);
      });
    }

    // جعل النافذة بملء الشاشة بالكامل
    orderModal.style.display = "flex";
    orderModal.style.position = "fixed";
    orderModal.style.top = "0";
    orderModal.style.left = "0";
    orderModal.style.width = "100vw";
    orderModal.style.height = "100vh";
    orderModal.style.zIndex = "9999";
    orderModal.style.background = "#000";
    orderModal.style.padding = "0";
    orderModal.style.margin = "0";
    orderModal.style.overflow = "hidden";
    orderModal.style.boxSizing = "border-box";

    // تعديل المحتوى الداخلي ليملأ الشاشة بالكامل
    const modalContent = orderModal.querySelector("div");
    if (modalContent) {
      modalContent.style.width = "100vw";
      modalContent.style.height = "100vh";
      modalContent.style.maxWidth = "none";
      modalContent.style.maxHeight = "none";
      modalContent.style.margin = "0";
      modalContent.style.padding = "0";
      modalContent.style.borderRadius = "0";
      modalContent.style.border = "none";
      modalContent.style.background = "#1a1a1a";
      modalContent.style.overflowY = "auto";
      modalContent.style.overflowX = "hidden";
      modalContent.style.boxSizing = "border-box";
    }

    // منع التمرير في الخلفية
    document.body.style.overflow = "hidden";
  }
}

function closeOrderForm() {
  const orderModal = document.getElementById("order-form-modal");
  if (orderModal) {
    orderModal.style.display = "none";
    document.body.style.overflow = "auto";
  }

  const productModal = document.getElementById("product-detail-modal");
  if (productModal) {
    productModal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

// وظائف تحديث المقاسات في الأدمين بانل
function updateSizeOptions(category) {
  const sizeSelectionContainer = document.getElementById("size-selection");
  if (!sizeSelectionContainer) return;

  // تحديد المقاسات حسب الفئة
  let sizes = [];
  if (category === "tshirt" || category === "accessories") {
    sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  } else if (category === "jeans") {
    sizes = ["28", "29", "30", "31", "32", "34", "35", "36", "37", "38"];
  }

  // إفراغ المحتوى الحالي
  sizeSelectionContainer.innerHTML = "";

  // إنشاء أزرار المقاسات الجديدة
  sizes.forEach((size, index) => {
    const label = document.createElement("label");
    label.style.cssText =
      "display: flex; align-items: center; gap: 6px; cursor: pointer; padding: 6px 10px; background: #2a2a2a; border-radius: 6px; transition: all 0.3s;";
    label.onmouseover = function () {
      this.style.background = "#3a3a3a";
    };
    label.onmouseout = function () {
      this.style.background = "#2a2a2a";
    };

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = size;
    checkbox.style.accentColor = "#4CAF50";
    // تفعيل المقاس الوسط افتراضياً
    if (
      (category === "jeans" && size === "32") ||
      (category !== "jeans" && size === "M")
    ) {
      checkbox.checked = true;
    }

    const span = document.createElement("span");
    span.style.cssText = "color: white; font-size: 12px; font-weight: 600;";
    span.textContent = size;

    label.appendChild(checkbox);
    label.appendChild(span);
    sizeSelectionContainer.appendChild(label);
  });

  // تحديث الألوان أيضاً عند تغيير الفئة
  updateColorOptions(category);
}

// وظائف تحديث الألوان في الأدمين بانل
function updateColorOptions(category) {
  const colorSelectionContainer = document.getElementById("color-selection");
  if (!colorSelectionContainer) return;

  // تحديد الألوان حسب الفئة
  let colors = [];
  if (category === "tshirt") {
    colors = [
      { name: "أبيض", value: "white", color: "#ffffff" },
      { name: "أسود", value: "black", color: "#000000" },
    ];
  } else if (category === "jeans") {
    colors = [
      { name: "أزرق فاتح", value: "light-blue", color: "#87CEEB" },
      { name: "أزرق داكن", value: "dark-blue", color: "#1e3a8a" },
      { name: "أسود", value: "black", color: "#000000" },
      { name: "رمادي", value: "gray", color: "#6b7280" },
    ];
  } else if (category === "accessories") {
    colors = [
      { name: "رمادي", value: "gray", color: "#6b7280" },
      { name: "أسود", value: "black", color: "#000000" },
      { name: "بني", value: "brown", color: "#8B4513" },
      { name: "أبيض", value: "white", color: "#ffffff" },
    ];
  }

  // إفراغ المحتوى الحالي
  colorSelectionContainer.innerHTML = "";

  // إنشاء أزرار الألوان الجديدة
  colors.forEach((colorOption, index) => {
    const label = document.createElement("label");
    label.style.cssText =
      "display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px 12px; background: #2a2a2a; border-radius: 8px; transition: all 0.3s;";
    label.onmouseover = function () {
      this.style.background = "#3a3a3a";
    };
    label.onmouseout = function () {
      this.style.background = "#2a2a2a";
    };

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = colorOption.value;
    checkbox.style.accentColor = "#4CAF50";
    // تفعيل اللون الأول افتراضياً
    if (index === 0) {
      checkbox.checked = true;
    }

    const colorCircle = document.createElement("div");
    colorCircle.style.cssText = `
      width: 20px; 
      height: 20px; 
      border-radius: 50%; 
      background-color: ${colorOption.color}; 
      border: 2px solid #555;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    `;

    const span = document.createElement("span");
    span.style.cssText = "color: white; font-size: 12px; font-weight: 600;";
    span.textContent = colorOption.name;

    label.appendChild(checkbox);
    label.appendChild(colorCircle);
    label.appendChild(span);
    colorSelectionContainer.appendChild(label);
  });
}

// متغيرات الألوان
let selectedColor = "";

// وظائف الألوان
function selectProductColor(element, color) {
  selectedColor = color;

  // إزالة التحديد من جميع الألوان في نفس المنتج
  const productElement = element.closest(".product");
  const colorButtons = productElement.querySelectorAll(
    '[onclick*="selectProductColor"]',
  );

  colorButtons.forEach((btn) => {
    btn.style.border = btn.style.border.replace(
      "3px solid #4CAF50",
      "1px solid #ccc",
    );
    btn.style.border = btn.style.border.replace(
      "1px solid #ccc",
      "1px solid #555",
    );
    btn.style.transform = "scale(1)";
    btn.style.boxShadow = "none";
  });

  // تحديد اللون المختار
  element.style.border = "3px solid #4CAF50";
  element.style.transform = "scale(1.3)";
  element.style.boxShadow = "0 0 10px rgba(76, 175, 80, 0.5)";
}

// وظيفة اختيار اللون في النموذج
function selectModalColor(color) {
  selectedColor = color;

  // إزالة التحديد من جميع أزرار الألوان
  const colorButtons = document.querySelectorAll(".color-btn");
  colorButtons.forEach((btn) => {
    btn.style.borderColor = "#666";
    btn.style.backgroundColor = "transparent";
  });

  // تحديد الزر المختار
  const selectedButton = document.querySelector(`[data-color="${color}"]`);
  if (selectedButton) {
    selectedButton.style.borderColor = "#4CAF50";
    selectedButton.style.backgroundColor = "rgba(76, 175, 80, 0.1)";
  }
}

// وظائف المقاسات
function selectSize(size) {
  selectedSize = size;

  // إزالة التحديد من جميع الأزرار
  const sizeButtons = document.querySelectorAll(".size-btn");
  sizeButtons.forEach((btn) => {
    btn.style.background = "transparent";
    btn.style.color = "white";
  });

  // تحديد الزر المختار
  const selectedButton = document.querySelector(`[data-size="${size}"]`);
  if (selectedButton) {
    selectedButton.style.background = "white";
    selectedButton.style.color = "black";
  }
}

// وظائف الكمية
function changeQuantity(change) {
  const newQuantity = currentQuantity + change;
  if (newQuantity >= 1) {
    currentQuantity = newQuantity;
    document.getElementById("quantity-display").textContent = currentQuantity;
  }
}

// وظائف الشراء الجديدة
function addToCart() {
  if (!selectedSize) {
    showNotification("يرجى اختيار المقاس أولاً", "error");
    return;
  }

  if (!selectedColor) {
    showNotification("يرجى اختيار اللون أولاً", "error");
    return;
  }

  // إغلاق نافذة تفاصيل المنتج وفتح نموذج معلومات الزبون
  closeOrderForm();
  showCustomerForm();
}

function showMorePaymentOptions() {
  showNotification("المزيد من خيارات الدفع ستكون متاحة قريباً", "info");
}

// وظائف نموذج معلومات الزبون
function showCustomerForm() {
  const customerModal = document.getElementById("customer-info-modal");
  if (!customerModal) return;

  // تعبئة ملخص الطلب
  const summaryImage = document.getElementById("summary-product-image");
  const summaryName = document.getElementById("summary-product-name");
  const summarySize = document.getElementById("summary-size");
  const summaryColor = document.getElementById("summary-color");
  const summaryQuantity = document.getElementById("summary-quantity");
  const summaryPrice = document.getElementById("summary-price");

  if (currentOrderProduct) {
    if (summaryImage) summaryImage.src = currentOrderProduct.image;
    if (summaryName) summaryName.textContent = currentOrderProduct.name;
    if (summarySize) summarySize.textContent = selectedSize;
    if (summaryColor) {
      const colorMap = {
        white: "أبيض",
        black: "أسود",
        "light-blue": "أزرق فاتح",
        "dark-blue": "أزرق داكن",
        gray: "رمادي",
        brown: "بني",
      };
      summaryColor.textContent = colorMap[selectedColor] || selectedColor;
    }
    if (summaryQuantity) summaryQuantity.textContent = currentQuantity;
    if (summaryPrice) summaryPrice.textContent = currentOrderProduct.price;
  }

  customerModal.style.display = "flex";
  document.body.style.overflow = "hidden";

  // إضافة مستمع للنموذج
  const form = document.getElementById("customer-form");
  if (form) {
    form.onsubmit = handleCustomerFormSubmit;
  }

  // إضافة تأثيرات للأزرار الراديو
  const radioLabels = customerModal.querySelectorAll(
    'label[style*="cursor: pointer"]',
  );
  radioLabels.forEach((label) => {
    const radio = label.querySelector('input[type="radio"]');
    if (radio) {
      radio.addEventListener("change", function () {
        // إزالة التحديد من جميع الخيارات
        radioLabels.forEach((l) => {
          l.style.background = "#333";
          l.style.borderColor = "transparent";
        });

        // تحديد الخيار المختار
        if (this.checked) {
          label.style.background = "#444";
          label.style.border = "2px solid #666";
        }
      });
    }
  });
}

function closeCustomerForm() {
  const customerModal = document.getElementById("customer-info-modal");
  if (customerModal) {
    customerModal.style.display = "none";
    document.body.style.overflow = "auto";

    // إعادة تعيين النموذج
    const form = document.getElementById("customer-form");
    if (form) {
      form.reset();
    }
  }
}

// قاموس البلديات حسب الولاية
const citiesByState = {
  الجزائر: [
    "الجزائر الوسطى",
    "سيدي محمد",
    "المدنية",
    "حسين داي",
    "الرايس حميدو",
    "المحمدية",
    "باب الوادي",
    "القصبة",
    "دار البيضاء",
    "بئر مراد رايس",
    "زرالدة",
    "درارية",
    "الخراطة",
    "سطاوالي",
    "الدويرة",
    "أولاد فايت",
    "أولاد شبل",
    "براقي",
    "حرايرة",
    "رويبة",
    "ريغاية",
    "دار البيضاء",
    "سحاولة",
    "سوق آهراس",
    "بوروبة",
    "حمام الضلعة",
    "الدويرة",
  ],
  وهران: [
    "وهران",
    "السانيا",
    "أرزيو",
    "بطيوة",
    "عين الترك",
    "مرسى الحجاج",
    "بئر الجير",
    "حاسي بونيف",
    "العنصر",
    "حاسي مفسوخ",
    "طفراوي",
    "وادي طلة",
    "حاسي بن عكاشة",
    "بئر الجير",
    "حاسي الغلة",
    "مسرغين",
    "قديل",
    "بوتليليس",
    "مسرغين",
    "عين البية",
    "سيدي الشحمي",
    "حاسي عمامرة",
    "أم الطوب",
    "السيق",
    "عين الكرمة",
    "الكرمة",
  ],
  قسنطينة: [
    "قسنطينة",
    "بني حميدان",
    "الخروب",
    "عين عباسة",
    "ديدوش مراد",
    "زيغود يوسف",
    "بن بادس",
    "حامة بوزيان",
    "مسعود بوجريو",
    "عين اسمارة",
    "سطيف",
  ],
  عنابة: [
    "عنابة",
    "البوني",
    "عين الباردة",
    "سيدي عمار",
    "الحدجار",
    "الشط",
    "عوادية",
  ],
  سطيف: [
    "سطيف",
    "عين الولمان",
    "بني ورثيلان",
    "عين الكبيرة",
    "العلمة",
    "جميلة",
    "مسعود بوجريو",
    "حاسي الطير",
    "قجال",
    "دهاميرة",
    "الداموس",
    "بني فودة الحقانية",
    "تينة",
    "العلايقة",
    "الرصفة",
    "حربيل",
    "ماوكلان",
    "قصر الأبطال",
    "حاسي الطير",
    "برهوم",
    "عموشة",
    "عين الحجر",
    "تيسمسيلت",
    "هيلال",
  ],
  باتنة: [
    "باتنة",
    "عين توتة",
    "عين ياغوت",
    "أريس",
    "بولهيلات",
    "وادي الطاقة",
    "بيطام",
    "غسيرة",
    "شير",
    "لمبيس",
    "مناعة",
    "رأس العيون",
    "عزيل عبد القادر",
    "تكوت",
    "وادي التاغة",
    "عيون العسافير",
    "بغاي",
    "دشرة",
    "بولهلال",
    "عين الجاية",
    "مروانة",
    "كيمال",
    "حجار",
  ],
  "تيزي وزو": [
    "تيزي وزو",
    "عزازقة",
    "العربة نايت إيراثن",
    "تيزي راشد",
    "بوقنون",
    "إفرحونة",
    "معسكر",
    "مقلع",
    "عين الحمام",
    "واضية",
    "أقبو",
    "فريحة",
    "دراع الميزان",
    "مشدلة",
    "إيلولة أومالو",
    "بوجيمة",
    "تيمزريت",
    "تيزي نتلاتا",
    "أيت محمود",
    "أكبيل",
    "صواقي",
    "أولوم",
    "يني",
    "زكري",
    "بني يوبى",
    "أيت تودرت",
    "أيت علي",
    "واقونى",
    "عين زاوية",
    "أولاد ذحمان",
    "إيفيقان",
    "أيت وقردة",
    "المعماين",
    "واسيف",
    "تيمولغا",
    "أغريب",
    "بني ذوعلا",
    "أيت كسيلا",
  ],
  بجاية: [
    "بجاية",
    "أقبو",
    "خراطة",
    "تيشي",
    "أمالو",
    "سوق السبت",
    "إنايتها",
    "أوجانة",
    "تازمالت",
    "فرعون",
    "درقينة",
    "تيمزريت",
    "ولد حبة",
    "سيدي عيش",
    "تيفرة",
    "بربارة",
    "أدكار",
    "شلاطة",
    "بوحمزة",
    "أيت سماعيل",
    "توزمرطين",
    "بوخليفة",
    "أيت راشد",
    "سيدي أعياد",
    "أوقاس",
    "تامريجت",
    "بني جليل",
    "وادي غير",
    "تاسكريوت",
    "مسيسنة",
    "بني ملكية",
    "بني كسيلا",
    "تامقرا",
    "إقروجن",
    "تينبدار",
    "أوزلاقن",
    "بوندومة",
    "أيت دالة",
    "بني فودة",
    "بطة",
    "بني معوش",
    "إسر",
    "بني كدش",
    "آقبيل",
    "تامقرة",
    "أيت إسماعيل",
    "زيديان",
    "أداكار",
    "أيت قاضي",
    "أوريعة",
    "تيشدارين",
  ],
  ورقلة: [
    "ورقلة",
    "حاسي مسعود",
    "تقرت",
    "الطيبات",
    "تمنة",
    "حاسي بن عبد الله",
    "المقارين",
    "تيبست",
    "مناجر",
    "السطيح",
    "عين بايضاء",
    "هشام",
    "سيدي خويلد",
    "عين ميلة",
    "روطان",
    "جعايطة",
    "انغوسة",
  ],
  تلمسان: [
    "تلمسان",
    "المنصورة",
    "شتوان",
    "ندرومة",
    "غزاوات",
    "عين تالوت",
    "عين فزة",
    "الرمشي",
    "واد الخير",
    "سيدي جيلالي",
    "أولاد رياح",
    "عريشة",
    "ماكن",
    "بني صاف",
    "تيانت",
    "سيدي عبد الله",
    "هنين",
    "فلاوسن",
    "بني ورسوس",
    "أولاد ميمون",
    "عريشة",
    "عقاب",
    "الزيتنا",
    "الأطلس",
    "عزيلان",
    "فج حاتة",
    "حبة تمار",
    "العوينة",
    "صبرة",
    "تيرني بني هديل",
    "مغنية",
    "بني بوسعيد",
    "الحنايا",
    "بني مستار",
    "الفريعة",
    "الخبارة",
    "وادي التل",
    "أولاد ريمة",
    "لخضارة",
    "صباطة",
    "بيت الماء",
    "مساكة",
    "سبدو",
    "عريشة",
    "زهانة",
    "الدار البيضاء",
    "باطيوة",
  ],
  بسكرة: [
    "بسكرة",
    "طولقة",
    "الزريبة الوادي",
    "لوطاية",
    "سيدي عقبة",
    "مليلي",
    "قسط",
    "بونوقة",
    "الحاجب",
    "الحوش",
    "المزراق",
    "سيدي خالد",
    "لوطاية",
    "فوغالة",
    "برانيس",
    "شتمة",
    "عجيسة",
    "جمورة",
    "اورلال",
    "أولاد جلال",
    "لماعدر",
    "إشماول",
    "الفيض",
    "محمد بوضياف",
    "الكنتارة",
    "إسماعيل فارس",
    "نابعة الطاقة",
    "الغمارة",
    "بلتمة",
  ],
  "سيدي بلعباس": [
    "سيدي بلعباس",
    "تلاغ",
    "مصطفى بن إبراهيم",
    "سيدي إبراهيم",
    "سيدي لحسن",
    "الداوي",
    "مولاي سليسن",
    "قار بوبة",
    "تسالة",
    "سفيزف",
    "أولاد برحيل",
    "عين ثادارت",
    "الملاح",
    "تيلموني",
    "سيدي يعقوب",
    "عين الكحلة",
    "ماكن اليهودي",
    "تيانت",
    "أولاد ميمون",
    "بوقراطة",
    "أولاد خيراط",
    "تميجة",
    "عين بوحراوة",
    "عين ثريد",
    "سيدي أحمد",
    "الزواطنة",
    "سيدي عوادة",
    "ماطان",
    "البعايرية",
    "بوقراطة",
    "مرعى الزيان",
    "الحمادات",
    "بونوة",
    "بن بادس",
    "مولاي سليسن",
    "أولاد برحيل",
    "حاسي زهانة",
    "أولاد رحماني",
    "البعايرية",
    "القلعة الجديدة",
    "مظفور",
    "بن عيسى",
    "اللحمر",
  ],
  تبسة: [
    "تبسة",
    "الشريعة",
    "بير العاتر",
    "عقلة الحدرة",
    "الاعمياء",
    "الحويجبات",
    "الماء الأبيض",
    "أم علي",
    "الحمامات",
    "نجمة",
    "فركان",
    "بوخارية",
    "قوريقور",
    "الكويف",
    "باتنة التقنيه",
    "المحاجبي",
    "الزالور",
    "أولاد عبد الحدياء",
    "سطحلة",
  ],
  مستغانم: [
    "مستغانم",
    "حجاج",
    "عين تادالس",
    "سيرتا",
    "عين التين",
    "صوالح",
    "أولاد مالك",
    "ماشة",
    "واد الخير",
    "أولاد عبد الله",
    "الهايدة",
    "حسيدا",
    "بوجامعة",
    "زبدا",
    "عين آوذة الشقة",
    "فرناقا",
    "أولاد بوصاري",
    "سيقي",
    "عسيدة",
    "تسارين",
    "حجاج",
    "شليل",
    "عقاب",
    "حسان",
    "ماسر",
    "بغادة",
    "حرا����رة",
    "منونق",
    "صوالح",
    "عضوة",
    "دواوجي",
    "سبحة",
    "العلام",
    "غدراوي",
    "مدينة",
  ],
  البليدة: [
    "البليدة",
    "بن خليل",
    "بوينان",
    "الأفرون",
    "المطامر",
    "بوعرفة",
    "العضوة",
    "الدورية",
    "بني تامو",
    "بوغرة",
    "حمام الرغيبة",
    "أولاد هديبة",
    "مدلة",
    "بن خليل",
    "مفتاح",
    "أولاد عائشة",
    "الأربعة",
    "الصومعة",
    "لارباع",
    "وادي العليق",
    "بني الساقية",
    "أولاد الياس",
    "ثنيا العابد",
    "مخزوة",
    "لاذقية",
    "بني تامو",
  ],
  جيجل: [
    "جيجل",
    "ميلة تيشة",
    "إعقاري بوآزن",
    "واد العجول",
    "طاهير",
    "إعزيب",
    "الطاهير",
    "الصفصر",
    "القنار",
    "كراكرة",
    "سرال ديار",
    "جيجل",
    "أولاد ياجي",
    "بني زرالي",
    "العنصر",
    "إشدين",
    "بني تملولي",
    "بني بدوش",
    "بني ورتلان",
    "واد ضجول",
    "مين",
    "شاطال",
    "برج طاهر",
    "شاطة",
    "زين البانية",
    "عوهردة",
  ],
  سكيكدة: [
    "سكيكدة",
    "القل",
    "عزابة",
    "الحدائق",
    "عين كبر",
    "فاتح عين رعاد",
    "أولاد عطية",
    "المرسى",
    "ظادي الغيان",
    "إموقال",
    "البايد",
    "عين شرجان",
    "ين الزوية",
    "فرار",
    "سيدي مزغيش",
    "سليسن",
    "بن سعادة",
    "تيوة",
    "أولاد حبايب",
    "عين بوزيان",
    "أولاد آطية",
    "بني بشير",
    "حمدي قريو",
    "أولاد محمد",
    "فاحة الرياح",
    "حماري رحوية",
    "مرشة",
    "بوحاتم",
    "عين الزوية",
    "السالمية",
  ],
  الشلف: [
    "الشلف",
    "أبو الحسن",
    "الكريمية",
    "تنس",
    "حمرآلين",
    "الضحايا",
    "أولاد براهم",
    "يتفت",
    "واد السلي",
    "حساوه",
    "بوقيرات",
    "سيدي عكاشة",
    "حرشون",
    "أولاد عباس",
    "بوشراف",
    "سنجاس",
    "بني حواء",
    "دنايو",
    "عموشة",
    "دالت",
    "أولاد علي نيراه",
    "تيفاريط",
    "واد الفضة",
    "رولسوال",
    "ي ارايمان",
    "بغياج",
    "مصدقا",
    "لمازان",
    "فيحاسين",
    "سيدي أكازة",
    "ايدبونة الغليوت",
    "أولاد البسيط",
    "أشواطه",
  ],
  الأغواط: [
    "الأغواط",
    "قصر الحيران",
    "عين ماضي",
    "تاويالة",
    "سيدي مخلوف",
    "حاسي الرمل",
    "عين سيدي علي",
    "حساسنا",
    "تاقيدمت",
    "سيدي بوزيد",
    "أفلو",
    "سيدي بخير",
    "الشيبة",
    "الحيضرة",
    "فاطمة",
    "الفتات",
    "البايض",
    "الطاقة",
    "بولديالة",
    "الشيبة",
    "أولاد مدني",
    "مردنوني",
    "الحوية",
    "طاقي",
  ],
  "أم البواقي": [
    "أم البواقي",
    "عين بابوش",
    "بحير الشرقي",
    "عين كراكة",
    "الضراع",
    "سيدي عامر",
    "الأتصال",
    "المدواق",
    "رحبة",
    "عين فكرونة",
    "عين الحجر",
    "أولاد حملة",
    "اولاد ضرار",
    "الأسطر",
    "زرق العوين",
    "فنوغيل",
  ],
};

function updateCities(selectedState) {
  const citySelect = document.getElementById("customer-city");

  // مسح البلديات الحالية
  citySelect.innerHTML = '<option value="">اختر البلدية</option>';

  // إضافة البلديات للولاية المختارة
  if (selectedState && citiesByState[selectedState]) {
    citiesByState[selectedState].forEach((city) => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      citySelect.appendChild(option);
    });
  }
}

function handleCustomerFormSubmit(event) {
  event.preventDefault();

  // جمع بيانات النموذج
  const formData = {
    product: currentOrderProduct,
    size: selectedSize,
    color: selectedColor,
    quantity: currentQuantity,
    customer: {
      name: document.getElementById("customer-name").value,
      lastname: document.getElementById("customer-lastname").value,
      phone: document.getElementById("customer-phone").value,
      state: document.getElementById("customer-state").value,
      city: document.getElementById("customer-city").value,
      deliveryType: document.querySelector(
        'input[name="delivery-type"]:checked',
      )?.value,
      inquiry: document.getElementById("customer-inquiry").value,
    },
  };

  // معالجة الطلب (يمكن إرساله لخادم أو حفظه محلياً)
  console.log("طلب جديد:", formData);

  // عرض رسالة نجاح
  showNotification("تم إرسال طلبك بنجاح! سنتواصل معك قريباً.", "success");

  // إغلاق النموذج
  closeCustomerForm();

  // تحديث عداد السلة
  cartCount += currentQuantity;
  updateCartDisplay();

  // يمكن إضافة المزيد من المعالجة هنا مثل إرسال البيانات لخادم
  sendOrderToServer(formData);
}

async function sendOrderToServer(orderData) {
  try {
    showNotification('جاري إرسال الطلب...', 'info');
    
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();

    if (result.success) {
      showNotification('تم إرسال طلبك بنجاح! سنتواصل معك قريباً.', 'success');
      
      if (result.telegramSent) {
        console.log('✅ تم إرسال الإشعار عبر التليجرام');
      } else {
        console.log('⚠️ لم يتم إرسال الإشعار عبر التليجرام');
      }
      
      console.log('معرف الطلب:', result.orderId);
    } else {
      throw new Error(result.message || 'فشل في إرسال الطلب');
    }

  } catch (error) {
    console.error('خطأ في إرسال الطلب:', error);
    showNotification('حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى.', 'error');
  }
}

// Admin Functions
let isAdminLoggedIn = false;
let productIdCounter = 5;

function showAdminLogin() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const adminModal = document.getElementById("admin-login-modal");

  if (sidebar) sidebar.classList.remove("show");
  if (overlay) overlay.classList.remove("show");
  if (adminModal) adminModal.style.display = "flex";
}

function closeAdminLogin() {
  const adminModal = document.getElementById("admin-login-modal");
  const loginError = document.getElementById("login-error");
  const adminUsername = document.getElementById("admin-username");
  const adminPassword = document.getElementById("admin-password");

  if (adminModal) adminModal.style.display = "none";
  if (loginError) loginError.style.display = "none";
  if (adminUsername) adminUsername.value = "";
  if (adminPassword) adminPassword.value = "";
}

function adminLogin() {
  const adminUsername = document.getElementById("admin-username");
  const adminPassword = document.getElementById("admin-password");
  const loginError = document.getElementById("login-error");

  if (!adminUsername || !adminPassword) {
    showNotification("Error: Login form not found", "error");
    return;
  }

  if (
    adminUsername.value === "saberuser" &&
    adminPassword.value === "2007saber"
  ) {
    isAdminLoggedIn = true;
    closeAdminLogin();
    showAdminPanel();
    showNotification("Welcome Admin!", "success");
  } else {
    if (loginError) {
      loginError.style.display = "block";
    }
  }
}

function showAdminPanel() {
  const adminPanel = document.getElementById("admin-panel");
  if (adminPanel) {
    // جعل الأدمين بانل بملء الشاشة
    adminPanel.style.display = "block";
    adminPanel.style.position = "fixed";
    adminPanel.style.top = "0";
    adminPanel.style.left = "0";
    adminPanel.style.width = "100vw";
    adminPanel.style.height = "100vh";
    adminPanel.style.zIndex = "9999";
    adminPanel.style.background = "rgba(0,0,0,0.98)";
    adminPanel.style.overflowY = "auto";

    loadAdminProducts();
  }
}

function closeAdminPanel() {
  const adminPanel = document.getElementById("admin-panel");
  if (adminPanel) {
    adminPanel.style.display = "none";
  }
  isAdminLoggedIn = false;
}

function loadAdminProducts() {
  const products = document.querySelectorAll(".product");
  const adminList = document.getElementById("admin-products-list");
  const productsCount = document.getElementById("products-count");

  if (!adminList) return;

  // تحديث عداد المنتجات
  if (productsCount) {
    productsCount.textContent = `${products.length} منتج`;
  }

  adminList.innerHTML = "";

  products.forEach((product, index) => {
    const name = product.dataset.name || "Unknown Product";
    const category = product.dataset.category || "unknown";
    const priceElement = product.querySelector("span:not(.sale-tag)");
    const price = priceElement ? priceElement.textContent : "€0.00";
    const imgElement = product.querySelector("img");
    const img = imgElement ? imgElement.src : "";
    const isSoldOut = product.classList.contains("sold-out");

    // حساب عدد الصور
    const imagesData = product.dataset.images;
    let imagesCount = 1;
    try {
      if (imagesData) {
        const images = JSON.parse(imagesData);
        imagesCount = images.length;
      }
    } catch (e) {
      imagesCount = 1;
    }

    // جلب المقاسات المتوفرة
    const sizesData = product.dataset.availableSizes;
    let availableSizes = ["M"];
    try {
      if (sizesData) {
        availableSizes = JSON.parse(sizesData);
      }
    } catch (e) {
      availableSizes = ["M"];
    }

    const productDiv = document.createElement("div");
    productDiv.style.cssText = `
      background: linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 50%, #333 100%); 
      padding: 20px; 
      margin-bottom: 18px; 
      border-radius: 15px; 
      display: grid; 
      grid-template-columns: 100px 1fr 200px; 
      gap: 20px; 
      align-items: start;
      border: 1px solid rgba(76, 175, 80, 0.1);
      box-shadow: 0 6px 20px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    `;

    productDiv.onmouseover = function () {
      this.style.transform = "translateY(-2px)";
      this.style.boxShadow =
        "0 10px 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(76, 175, 80, 0.2)";
      this.style.borderColor = "rgba(76, 175, 80, 0.2)";
    };

    productDiv.onmouseout = function () {
      this.style.transform = "translateY(0)";
      this.style.boxShadow =
        "0 6px 20px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)";
      this.style.borderColor = "rgba(76, 175, 80, 0.1)";
    };

    productDiv.innerHTML = `
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(45deg, rgba(76, 175, 80, 0.02) 0%, transparent 70%); pointer-events: none; border-radius: 15px;"></div>

      <!-- صورة المنتج مع العدادات -->
      <div style="position: relative; z-index: 1;">
        <div style="position: relative; width: 100px; height: 100px;">
          <img src="${img}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px; border: 2px solid rgba(76, 175, 80, 0.3); box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
          ${
            imagesCount > 1
              ? `
            <div style="
              position: absolute; 
              top: -8px; 
              right: -8px; 
              background: linear-gradient(135deg, #4CAF50, #45a049); 
              color: white; 
              width: 26px; 
              height: 26px; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-size: 11px; 
              font-weight: bold;
              box-shadow: 0 3px 10px rgba(76, 175, 80, 0.4);
              border: 2px solid #2a2a2a;
            ">
              ${imagesCount}
            </div>
          `
              : ""
          }
          ${
            isSoldOut
              ? `
            <div style="
              position: absolute; 
              bottom: -8px; 
              left: -8px; 
              background: linear-gradient(135deg, #ff4444, #cc3333); 
              color: white; 
              padding: 2px 6px; 
              border-radius: 8px; 
              font-size: 9px; 
              font-weight: bold;
              box-shadow: 0 2px 8px rgba(255, 68, 68, 0.4);
              border: 1px solid #2a2a2a;
            ">
              نفد
            </div>
          `
              : ""
          }
        </div>
      </div>

      <!-- معلومات المنتج -->
      <div style="position: relative; z-index: 1; display: flex; flex-direction: column; gap: 12px;">
        <input type="text" value="${name}" onchange="updateProductName(${index}, this.value)" 
               style="width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.03); border: 2px solid rgba(76, 175, 80, 0.2); color: white; border-radius: 12px; margin-bottom: 0; font-size: 16px; font-weight: 500; transition: all 0.3s; box-sizing: border-box;" 
               onfocus="this.style.borderColor='#4CAF50'; this.style.boxShadow='0 0 0 3px rgba(76, 175, 80, 0.1)'; this.style.background='rgba(76, 175, 80, 0.05)'" 
               onblur="this.style.borderColor='rgba(76, 175, 80, 0.2)'; this.style.boxShadow='none'; this.style.background='rgba(255,255,255,0.03)'">

        <div style="display: flex; gap: 12px; align-items: center;">
          <input type="text" value="${price}" onchange="updateProductPrice(${index}, this.value)" 
                 style="flex: 1; padding: 12px 16px; background: rgba(255,255,255,0.03); border: 2px solid rgba(76, 175, 80, 0.2); color: white; border-radius: 12px; font-size: 14px; font-weight: 500; transition: all 0.3s; box-sizing: border-box;" 
                 onfocus="this.style.borderColor='#4CAF50'; this.style.boxShadow='0 0 0 3px rgba(76, 175, 80, 0.1)'; this.style.background='rgba(76, 175, 80, 0.05)'" 
                 onblur="this.style.borderColor='rgba(76, 175, 80, 0.2)'; this.style.boxShadow='none'; this.style.background='rgba(255,255,255,0.03)'">
          <select onchange="updateProductCategory(${index}, this.value)" 
                  style="flex: 1; padding: 12px 16px; background: rgba(255,255,255,0.03); border: 2px solid rgba(76, 175, 80, 0.2); color: white; border-radius: 12px; font-size: 14px; cursor: pointer; transition: all 0.3s; box-sizing: border-box;" 
                  onfocus="this.style.borderColor='#4CAF50'; this.style.background='rgba(76, 175, 80, 0.05)'" onblur="this.style.borderColor='rgba(76, 175, 80, 0.2)'; this.style.background='rgba(255,255,255,0.03)'">
            <option value="tshirt" ${category === "tshirt" ? "selected" : ""}>T-Shirt</option>
            <option value="jeans" ${category === "jeans" ? "selected" : ""}>Jeans</option>
            <option value="accessories" ${category === "accessories" ? "selected" : ""}>Accessories</option>
          </select>
        </div>

        <!-- المقاسات المتوفرة -->
        <div style="
          background: rgba(255,255,255,0.02); 
          border: 1px solid rgba(255,255,255,0.1); 
          padding: 10px 12px; 
          border-radius: 10px;
        ">
          <div style="font-size: 12px; color: #ccc; font-weight: 600; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
            <span>📏</span> المقاسات المتوفرة
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${availableSizes
              .map(
                (size) => `
              <span style="
                background: rgba(255,255,255,0.08); 
                color: #fff; 
                padding: 3px 8px; 
                border-radius: 6px; 
                font-size: 11px; 
                font-weight: bold;
                border: 1px solid rgba(255,255,255,0.2);
              ">${size}</span>
            `,
              )
              .join("")}
          </div>
        </div>

      </div>

      <!-- أزرار التحكم -->
      <div style="display: flex; flex-direction: column; gap: 10px; position: relative; z-index: 1;">
        <button onclick="toggleSoldOut(${index})" 
                style="background: ${isSoldOut ? "linear-gradient(135deg, #4CAF50, #45a049)" : "linear-gradient(135deg, #ff4444, #cc3333)"}; color: white; border: none; padding: 12px 16px; border-radius: 12px; cursor: pointer; font-size: 13px; font-weight: 700; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 15px ${isSoldOut ? "rgba(76, 175, 80, 0.3)" : "rgba(255, 68, 68, 0.3)"}; text-transform: uppercase; letter-spacing: 0.5px;"
                onmouseover="this.style.transform='translateY(-3px) scale(1.02)'; this.style.boxShadow='0 8px 25px ${isSoldOut ? "rgba(76, 175, 80, 0.5)" : "rgba(255, 68, 68, 0.5)"}'" 
                onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 4px 15px ${isSoldOut ? "rgba(76, 175, 80, 0.3)" : "rgba(255, 68, 68, 0.3)"}'">
          <span style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span style="font-size: 14px;">${isSoldOut ? "✅" : "❌"}</span>
            ${isSoldOut ? "متوفر" : "نفد المخزون"}
          </span>
        </button>

        <button onclick="viewProductImages(${index})" 
                style="background: linear-gradient(135deg, #2196F3, #1976D2); color: white; border: none; padding: 12px 16px; border-radius: 12px; cursor: pointer; font-size: 13px; font-weight: 700; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3); text-transform: uppercase; letter-spacing: 0.5px;"
                onmouseover="this.style.transform='translateY(-3px) scale(1.02)'; this.style.boxShadow='0 8px 25px rgba(33, 150, 243, 0.5)'" 
                onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 4px 15px rgba(33, 150, 243, 0.3)'">
          <span style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span style="font-size: 14px;">👁️</span>
            عرض (${imagesCount})
          </span>
        </button>

        <button onclick="removeProduct(${index})" 
                style="background: linear-gradient(135deg, #ff4444, #cc3333); color: white; border: none; padding: 12px 16px; border-radius: 12px; cursor: pointer; font-size: 13px; font-weight: 700; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 15px rgba(255, 68, 68, 0.3); text-transform: uppercase; letter-spacing: 0.5px;"
                onmouseover="this.style.transform='translateY(-3px) scale(1.02)'; this.style.boxShadow='0 8px 25px rgba(255, 68, 68, 0.5)'" 
                onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 4px 15px rgba(255, 68, 68, 0.3)'">
          <span style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span style="font-size: 14px;">🗑️</span>
            حذف المنتج
          </span>
        </button>
      </div>
    `;

    adminList.appendChild(productDiv);
  });
}

function updateProductName(index, newName) {
  const products = document.querySelectorAll(".product");
  const product = products[index];
  if (product) {
    product.dataset.name = newName;
    const nameElement = product.querySelector("h3");
    if (nameElement) {
      nameElement.textContent = newName;
    }
    showNotification("Product name updated", "success");
  }
}

function updateProductPrice(index, newPrice) {
  const products = document.querySelectorAll(".product");
  const product = products[index];
  if (product) {
    const priceElement = product.querySelector("span:not(.sale-tag)");
    if (priceElement) {
      priceElement.textContent = newPrice;
    }
    showNotification("Product price updated", "success");
  }
}

function updateProductCategory(index, newCategory) {
  const products = document.querySelectorAll(".product");
  const product = products[index];
  if (product) {
    product.dataset.category = newCategory;
    showNotification("Product category updated", "success");
  }
}

async function toggleSoldOut(index) {
  const products = document.querySelectorAll(".product");
  const product = products[index];
  if (product) {
    const productId = product.dataset.productId;

    if (productId) {
      // تحديث في قاعدة البيانات
      const updatedProduct = await toggleSoldOutInDB(productId);
      if (updatedProduct) {
        const isSoldOut = updatedProduct.soldOut;

        if (isSoldOut) {
          product.classList.add("sold-out");
          const overlay = document.createElement("div");
          overlay.className = "sold-out-overlay";
          overlay.style.cssText =
            "position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px; z-index: 10;";
          overlay.textContent = "نفد المخزون";
          product.style.position = "relative";
          product.appendChild(overlay);
        } else {
          product.classList.remove("sold-out");
          const overlay = product.querySelector(".sold-out-overlay");
          if (overlay) {
            overlay.remove();
          }
        }

        loadAdminProducts();
      }
    } else {
      // للمنتجات القديمة بدون معرف
      const isSoldOut = product.classList.contains("sold-out");

      if (isSoldOut) {
        product.classList.remove("sold-out");
        const overlay = product.querySelector(".sold-out-overlay");
        if (overlay) {
          overlay.remove();
        }
        showNotification("المنتج متوفر الآن", "success");
      } else {
        product.classList.add("sold-out");
        const overlay = document.createElement("div");
        overlay.className = "sold-out-overlay";
        overlay.style.cssText =
          "position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px; z-index: 10;";
        overlay.textContent = "نفد المخزون";
        product.style.position = "relative";
        product.appendChild(overlay);
        showNotification("تم تعيين المنتج كنفد من المخزون", "success");
      }

      loadAdminProducts();
    }
  }
}

async function removeProduct(index) {
  if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
    try {
      const products = document.querySelectorAll(".product");
      const product = products[index];
      if (product) {
        const productId = product.dataset.productId || product.dataset.id;
        const productName = product.dataset.name || "منتج غير معروف";

        if (productId && productId !== "undefined") {
          // حذف من قاعدة البيانات
          const deleted = await deleteProductFromDB(productId);
          if (deleted) {
            product.remove();
            loadAdminProducts();
          }
        } else {
          // للمنتجات القديمة بدون معرف، احذف باستخدام الفهرس
          const savedProducts = localStorage.getItem("sabwear_products");
          if (savedProducts) {
            const productsArray = JSON.parse(savedProducts);
            productsArray.splice(index, 1);
            localStorage.setItem(
              "sabwear_products",
              JSON.stringify(productsArray),
            );
          }
          product.remove();
          loadAdminProducts();
          showNotification("تم حذف المنتج بنجاح", "success");
        }
      }
    } catch (error) {
      console.error("خطأ في حذف المنتج:", error);
      showNotification("فشل في حذف المنتج", "error");
    }
  }
}

// دالة حذف المنتج من قاعدة البيانات
async function deleteProductFromDB(productId) {
  try {
    // إذا لم يكن هناك معرف، احذف محلياً فقط
    if (!productId || productId === 'undefined') {
      return deleteProductLocally(productId);
    }
    
    // استخدام API.deleteProduct من api.js
    if (window.API && window.API.deleteProduct) {
      const response = await window.API.deleteProduct(productId);
      if (response.success) {
        showNotification(response.message || 'تم حذف المنتج بنجاح', 'success');
        // احذف من التخزين المحلي أيضاً
        deleteProductFromLocalStorage(productId);
        return true;
      } else {
        throw new Error(response.message || 'فشل في حذف المنتج');
      }
    } else {
      // إذا لم يكن API متاحاً، احذف محلياً
      return deleteProductLocally(productId);
    }
  } catch (error) {
    console.error('فشل في حذف المنتج:', error);
    showNotification('فشل في حذف المنتج: ' + error.message, 'error');
    // في حالة فشل الاتصال، احذف محلياً
    return deleteProductLocally(productId);
  }
}

// دالة حذف المنتج محلياً (احتياطي)
function deleteProductLocally(productId) {
  try {
    const savedProducts = localStorage.getItem("sabwear_products");
    if (savedProducts) {
      let productsArray = JSON.parse(savedProducts);
      // ابحث عن المنتج وحذفه
      const originalLength = productsArray.length;
      productsArray = productsArray.filter(p => p.id !== productId);
      
      if (productsArray.length < originalLength) {
        localStorage.setItem("sabwear_products", JSON.stringify(productsArray));
        showNotification("تم حذف المنتج محلياً", "success");
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('خطأ في الحذف المحلي:', error);
    return false;
  }
}

// دالة حذف المنتج من التخزين المحلي
function deleteProductFromLocalStorage(productId) {
  try {
    const savedProducts = localStorage.getItem("sabwear_products");
    if (savedProducts) {
      let productsArray = JSON.parse(savedProducts);
      productsArray = productsArray.filter(p => p.id !== productId);
      localStorage.setItem("sabwear_products", JSON.stringify(productsArray));
    }
  } catch (error) {
    console.error('خطأ في حذف المنتج من التخزين المحلي:', error);
  }
}

function addNewProduct() {
  const nameInput = document.getElementById("new-product-name");
  const priceInput = document.getElementById("new-product-price");
  const categorySelect = document.getElementById("new-product-category");
  const imageFiles = document.getElementById("product-images-input");
  const sizeCheckboxes = document.querySelectorAll(
    '#size-selection input[type="checkbox"]:checked',
  );
  const colorCheckboxes = document.querySelectorAll(
    '#color-selection input[type="checkbox"]:checked',
  );

  if (!nameInput || !priceInput || !categorySelect || !imageFiles) {
    showNotification("خطأ في النموذج", "error");
    return;
  }

  const name = nameInput.value.trim();
  const price = priceInput.value.trim();
  const category = categorySelect.value;
  const availableSizes = Array.from(sizeCheckboxes).map((cb) => cb.value);
  const availableColors = Array.from(colorCheckboxes).map((cb) => cb.value);

  if (!name || !price) {
    showNotification("يرجى ملء اسم المنتج والسعر", "error");
    return;
  }

  if (availableSizes.length === 0) {
    showNotification("يرجى اختيار مقاس واحد على الأقل", "error");
    return;
  }

  if (availableColors.length === 0) {
    showNotification("يرجى اختيار لون واحد على الأقل", "error");
    return;
  }

  if (!imageFiles || !imageFiles.files || imageFiles.files.length === 0) {
    showNotification("يرجى تحميل صورة واحدة على الأقل", "error");
    return;
  }

  console.log(`عدد الصور المحددة: ${imageFiles.files.length}`);

  // التحقق من نوع الملفات
  const invalidFiles = Array.from(imageFiles.files).filter(
    (file) => !file.type.startsWith("image/"),
  );
  if (invalidFiles.length > 0) {
    showNotification(
      `بعض الملفات ليست صوراً: ${invalidFiles.map((f) => f.name).join(", ")}`,
      "error",
    );
    return;
  }

  createProductWithImages(
    name,
    price,
    category,
    imageFiles,
    availableSizes,
    availableColors,
  );
}

async function createProductWithImages(
  name,
  price,
  category,
  imageFiles,
  availableSizes = ["M"],
  availableColors = [],
) {
  try {
    // رفع الصور أولاً إلى الخادم
    const formData = new FormData();
    Array.from(imageFiles.files).forEach((file) => {
      formData.append("images", file);
    });

    showNotification("جاري رفع الصور...", "info");

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("فشل في رفع الصور");
    }

    const uploadResult = await response.json();
    if (!uploadResult.success) {
      throw new Error(uploadResult.message || "فشل في رفع الصور");
    }

    const imageUrls = uploadResult.files.map((file) => file.url);
    showNotification(`تم رفع ${imageUrls.length} صورة بنجاح`, "success");

    // إنشاء بيانات المنتج
    const productData = {
      id: Date.now().toString(),
      name: name,
      price: price,
      category: category,
      images: imageUrls,
      availableSizes: availableSizes,
      availableColors: availableColors,
      soldOut: false,
      createdAt: new Date().toISOString(),
    };

    // إضافة المنتج مباشرة للواجهة والحفظ المحلي
    addProductToUI(productData);
    showNotification(`تم إضافة المنتج "${name}" بنجاح!`, "success");
  } catch (error) {
    console.error("فشل في حفظ المنتج:", error);
    showNotification(`خطأ: ${error.message}`, "error");
  }
}

function addProductToUI(productData) {
  const productsContainer = document.getElementById("shop");
  if (!productsContainer) return;

  const newProduct = document.createElement("div");
  newProduct.className = "product";
  newProduct.dataset.category = productData.category;
  newProduct.dataset.name = productData.name;
  newProduct.dataset.productId = productData.id; // إضافة معرف المنتج
  newProduct.dataset.images = JSON.stringify(productData.images);
  newProduct.dataset.availableSizes = JSON.stringify(
    productData.availableSizes,
  );
  newProduct.dataset.availableColors = JSON.stringify(
    productData.availableColors || [],
  );
  newProduct.style.cssText =
    "background: transparent; transition: 0.3s; display: flex; flex-direction: column; height: 100%;";

  if (productData.soldOut) {
    newProduct.classList.add("sold-out");
  }

  // إنشاء عنصر الصور مع إمكانية التنقل
  const imageGallery =
    productData.images.length > 1
      ? `<div class="product-image-gallery" style="position: relative;" onclick="showProductGallery('${productData.name.replace(/'/g, "\\'")}', ${JSON.stringify(productData.images).replace(/"/g, "&quot;")})">
      <img src="${productData.images[0]}" alt="${productData.name}" style="width: 100%; max-width: 200px; height: auto; margin: 0 auto; display: block; object-fit: cover; border-radius: 8px; transition: all 0.3s; cursor: pointer;" data-current-image="0">
      <div style="position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 500; backdrop-filter: blur(10px);">1/${productData.images.length}</div>
    </div>`
      : `<img src="${productData.images[0]}" alt="${productData.name}" style="width: 100%; max-width: 200px; height: auto; margin: 0 auto; display: block; object-fit: cover; border-radius: 8px;">`;

  newProduct.innerHTML = `
    <div style="position: relative; padding: 15px; text-align: center; background: transparent;">
      ${imageGallery}
      <span class="sale-tag" style="position: absolute; top: 15px; left: 15px; background-color: #000; color: #fff; padding: 2px 6px; font-size: 9px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; border-radius: 2px;">SALE</span>
    </div>
    <div style="padding: 10px 0; text-align: center; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between;">
      <h3 style="font-size: 13px; font-weight: 500; margin: 0 0 5px 0; color: #fff; line-height: 1.3; font-family: 'Roboto', sans-serif;">${productData.name}</h3>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 5px; margin: 5px 0 10px 0;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 13px; font-weight: 700; color: #fff;">${productData.price}</span>
        </div>
        <button onclick="showOrderForm('${productData.name.replace(/'/g, "\\'")}', '${productData.price.replace(/'/g, "\\'")}')" style="background: #000; color: #fff; border: none; padding: 8px 20px; font-size: 12px; font-weight: 600; cursor: pointer; margin-top: 5px; width: auto; text-transform: uppercase; letter-spacing: 0.5px; transition: all 0.3s ease;">
          شراء الآن
        </button>
      </div>
    </div>
  `;

  productsContainer.appendChild(newProduct);

  // حفظ المنتجات في Local Storage
  saveProductsToStorage();

  // Clear form
  const nameInputClear = document.getElementById("new-product-name");
  const priceInputClear = document.getElementById("new-product-price");
  const sizeCheckboxes = document.querySelectorAll(
    '#size-selection input[type="checkbox"]',
  );
  const imageFilesClear = document.getElementById("product-images-input");
  const previewClear = document.getElementById("image-preview");
  const previewSection = document.getElementById("image-preview-section");

  if (nameInputClear) nameInputClear.value = "";
  if (priceInputClear) priceInputClear.value = "";

  // إعادة تعيين المقاسات (تحديد M فقط كافتراضي)
  sizeCheckboxes.forEach((checkbox) => {
    checkbox.checked = checkbox.value === "M";
  });

  if (imageFilesClear) {
    imageFilesClear.value = "";
  }
  if (previewClear) previewClear.innerHTML = "";
  if (previewSection) previewSection.style.display = "none";

  loadAdminProducts();
  showNotification(
    `تم إضافة المنتج بنجاح مع ${images.length} صورة - سيبقى محفوظاً!`,
    "success",
  );
  productIdCounter++;
}

// إعداد معرض الصور في النافذة المنبثقة
function setupModalImageGallery(images) {
  const prevBtn = document.getElementById("modal-prev-btn");
  const nextBtn = document.getElementById("modal-next-btn");
  const counter = document.getElementById("modal-image-counter");
  const indicator = document.getElementById("modal-images-indicator");
  const thumbnailsContainer = document.getElementById("modal-thumbnails");
  const imageGallery = document.getElementById("modal-image-gallery");
  const zoomIndicator = document.getElementById("zoom-indicator");
  const dotsContainer = document.getElementById("modal-dots");

  // إظهار مؤشر التكبير دائماً
  if (zoomIndicator) {
    zoomIndicator.style.display = "block";
    zoomIndicator.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>'; // أيقونة التكبير
    zoomIndicator.onclick = openImageInFullscreen; // ربط وظيفة فتح ملء الشاشة
  }

  if (images.length > 1) {
    // إظهار عناصر التنقل
    if (prevBtn) {
      prevBtn.style.display = "block";
      prevBtn.style.opacity = "0.8";
    }
    if (nextBtn) {
      nextBtn.style.display = "block";
      nextBtn.style.opacity = "0.8";
    }
    if (counter) {
      counter.style.display = "block";
      counter.textContent = `1/${images.length}`;
    }
    if (indicator) {
      indicator.style.display = "block";
      indicator.textContent = `📷 ${images.length} صور`;
    }

    // إنشاء الصور المصغرة مع تحسينات للعدد الكبير
    if (thumbnailsContainer) {
      thumbnailsContainer.innerHTML = "";

      // إنشاء عنوان للصور المصغرة
      const thumbTitle = document.createElement("div");
      thumbTitle.style.cssText = `
        width: 100%;
        text-align: center;
        color: #ccc;
        font-size: 12px;
        margin-bottom: 10px;
        font-weight: 500;
      `;
      thumbTitle.textContent = `جميع الصور (${images.length})`;
      thumbnailsContainer.appendChild(thumbTitle);

      // container للصور المصغرة مع scroll أفقي
      const thumbsWrapper = document.createElement("div");
      thumbsWrapper.style.cssText = `
        display: flex;
        gap: 8px;
        overflow-x: auto;
        padding: 5px 0;
        scrollbar-width: thin;
        scrollbar-color: #666 #333;
        max-width: 100%;
      `;

      images.forEach((img, index) => {
        const thumb = document.createElement("div");
        thumb.style.cssText = `
          min-width: 55px;
          width: 55px;
          height: 55px;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid ${index === 0 ? "#4CAF50" : "#555"};
          transition: all 0.3s ease;
          opacity: ${index === 0 ? "1" : "0.7"};
          position: relative;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        `;

        thumb.innerHTML = `
          <img src="${img}" style="width: 100%; height: 100%; object-fit: cover; transition: all 0.3s;">
          <div style="position: absolute; bottom: 2px; right: 2px; background: rgba(0,0,0,0.8); color: white; padding: 1px 4px; border-radius: 3px; font-size: 9px; font-weight: bold;">${index + 1}</div>
        `;

        thumb.onclick = () => changeModalImageToIndex(index);

        // تأثيرات التحويم المحسنة
        thumb.addEventListener("mouseenter", function () {
          if (
            index !==
            parseInt(
              document.getElementById("modal-product-image").dataset
                .currentImage,
            )
          ) {
            this.style.opacity = "0.9";
            this.style.transform = "scale(1.05)";
            this.style.borderColor = "#4CAF50";
          }
        });

        thumb.addEventListener("mouseleave", function () {
          if (
            index !==
            parseInt(
              document.getElementById("modal-product-image").dataset
                .currentImage,
            )
          ) {
            this.style.opacity = "0.7";
            this.style.transform = "scale(1)";
            this.style.borderColor = "#555";
          }
        });

        thumbsWrapper.appendChild(thumb);
      });

      thumbnailsContainer.appendChild(thumbsWrapper);

      // إضافة تمرير للهواتف المحمولة
      if (window.innerWidth <= 768) {
        createModalDots(images.length, dotsContainer);
      }
    }

    // إضافة تأثيرات التحويم المحسنة للأزرار
    if (imageGallery) {
      imageGallery.addEventListener("mouseenter", function () {
        if (prevBtn) {
          prevBtn.style.opacity = "1";
          prevBtn.style.transform = "translateY(-50%) scale(1.05)";
        }
        if (nextBtn) {
          nextBtn.style.opacity = "1";
          nextBtn.style.transform = "translateY(-50%) scale(1.05)";
        }
      });

      imageGallery.addEventListener("mouseleave", function () {
        if (prevBtn) {
          prevBtn.style.opacity = "0.7";
          prevBtn.style.transform = "translateY(-50%) scale(1)";
        }
        if (nextBtn) {
          nextBtn.style.opacity = "0.7";
          nextBtn.style.transform = "translateY(-50%) scale(1)";
        }
      });
    }

    // إضافة دعم لوحة المفاتيح
    document.addEventListener("keydown", handleImageNavigation);
  } else {
    // إخفاء عناصر التنقل للصورة الواحدة
    if (prevBtn) prevBtn.style.display = "none";
    if (nextBtn) nextBtn.style.display = "none";
    if (counter) counter.style.display = "none";
    if (indicator) indicator.style.display = "none";
    if (thumbnailsContainer) thumbnailsContainer.innerHTML = "";
    if (dotsContainer) dotsContainer.style.display = "none";
    // إظهار مؤشر التكبير للصورة الواحدة
    if (zoomIndicator) {
      zoomIndicator.style.display = "block";
      zoomIndicator.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>'; // أيقونة التكبير
      zoomIndicator.onclick = openImageInFullscreen; // ربط وظيفة فتح ملء الشاشة
    }

    // إزالة مستمع لوحة المفاتيح
    document.removeEventListener("keydown", handleImageNavigation);
  }
}

// إنشاء نقاط التنقل للهواتف المحمولة
function createModalDots(imageCount, container) {
  if (!container) return;

  container.innerHTML = "";
  container.style.display = "flex";

  for (let i = 0; i < imageCount; i++) {
    const dot = document.createElement("div");
    dot.style.cssText = `
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${i === 0 ? "#4CAF50" : "#666"};
      cursor: pointer;
      transition: all 0.3s;
    `;
    dot.onclick = () => changeModalImageToIndex(i);
    container.appendChild(dot);
  }
}

// التحكم بلوحة المفاتيح
function handleImageNavigation(event) {
  const modal = document.getElementById("order-form-modal");
  if (modal.style.display !== "flex") return;

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    changeModalImage(-1);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    changeModalImage(1);
  } else if (event.key === "Escape") {
    event.preventDefault();
    closeOrderForm();
  }
}

// فتح الصورة في وضع ملء الشاشة
function openImageInFullscreen() {
  const img = document.getElementById("modal-product-image");
  if (!img) return;

  const fullscreenDiv = document.createElement("div");
  fullscreenDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.95);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: zoom-out;
  `;

  const fullscreenImg = document.createElement("img");
  fullscreenImg.src = img.src;
  fullscreenImg.style.cssText = `
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.8);
  `;

  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "✕";
  closeBtn.style.cssText = `
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(0,0,0,0.8);
    color: white;
    border: none;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.3s;
  `;

  fullscreenDiv.appendChild(fullscreenImg);
  fullscreenDiv.appendChild(closeBtn);
  document.body.appendChild(fullscreenDiv);

  // إغلاق عند النقر
  fullscreenDiv.onclick = closeBtn.onclick = () => {
    if (fullscreenDiv && document.body.contains(fullscreenDiv)) {
      document.body.removeChild(fullscreenDiv);
    }
  };

  // منع انتشار النقر على الصورة
  fullscreenImg.onclick = (e) => e.stopPropagation();
}

// تغيير الصورة في النافذة المنبثقة
function changeModalImage(direction) {
  if (
    !currentOrderProduct ||
    !currentOrderProduct.images ||
    currentOrderProduct.images.length <= 1
  )
    return;

  const img = document.getElementById("modal-product-image");
  const counter = document.getElementById("modal-image-counter");
  const images = currentOrderProduct.images;

  let currentIndex = parseInt(img.dataset.currentImage);
  currentIndex += direction;

  if (currentIndex < 0) currentIndex = images.length - 1;
  if (currentIndex >= images.length) currentIndex = 0;

  // تأثير انتقالي
  img.style.opacity = "0.5";
  img.style.transform = "scale(0.95)";

  setTimeout(() => {
    img.src = images[currentIndex];
    img.dataset.currentImage = currentIndex;
    img.style.opacity = "1";
    img.style.transform = "scale(1)";
  }, 150);

  // تحديث العداد
  if (counter) {
    counter.textContent = `${currentIndex + 1}/${images.length}`;
  }

  // تحديث الصور المصغرة
  updateModalThumbnails(currentIndex);
}

// الانتقال لصورة معينة
function changeModalImageToIndex(index) {
  if (!currentOrderProduct || !currentOrderProduct.images) return;

  const img = document.getElementById("modal-product-image");
  const counter = document.getElementById("modal-image-counter");
  const images = currentOrderProduct.images;

  // تأثير انتقالي
  img.style.opacity = "0.5";
  img.style.transform = "scale(0.95)";

  setTimeout(() => {
    img.src = images[index];
    img.dataset.currentImage = index;
    img.style.opacity = "1";
    img.style.transform = "scale(1)";
  }, 150);

  // تحديث العداد
  if (counter) {
    counter.textContent = `${index + 1}/${images.length}`;
  }

  // تحديث الصور المصغرة
  updateModalThumbnails(index);
}

// تحديث الصور المصغرة
function updateModalThumbnails(currentIndex) {
  const thumbnailsWrapper = document.querySelector(
    "#modal-thumbnails > div:last-child",
  );
  if (!thumbnailsWrapper) return;

  const thumbnails = thumbnailsWrapper.querySelectorAll("div");
  const dots = document.querySelectorAll("#modal-dots > div");

  thumbnails.forEach((thumb, index) => {
    if (index === currentIndex) {
      thumb.style.border = "2px solid #4CAF50";
      thumb.style.opacity = "1";
      thumb.style.transform = "scale(1.05)";
      thumb.style.boxShadow = "0 4px 15px rgba(76, 175, 80, 0.4)";

      // تمرير للصورة المصغرة النشطة
      thumb.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    } else {
      thumb.style.border = "2px solid #555";
      thumb.style.opacity = "0.7";
      thumb.style.transform = "scale(1)";
      thumb.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
    }
  });

  // تحديث النقاط للهواتف المحمولة
  dots.forEach((dot, index) => {
    if (index === currentIndex) {
      dot.style.background = "#4CAF50";
      dot.style.transform = "scale(1.2)";
    } else {
      dot.style.background = "#666";
      dot.style.transform = "scale(1)";
    }
  });
}

// وظيفة تغيير صور المنتج مع تأثيرات محسنة
function changeProductImage(button, direction) {
  const productDiv = button.closest(".product");
  const img = productDiv.querySelector("img[data-current-image]");
  const images = JSON.parse(productDiv.dataset.images || "[]");

  if (images.length <= 1) return;

  let currentIndex = parseInt(img.dataset.currentImage);
  currentIndex += direction;

  if (currentIndex < 0) currentIndex = images.length - 1;
  if (currentIndex >= images.length) currentIndex = 0;

  // تأثير انتقالي للصورة
  img.style.opacity = "0.5";
  img.style.transform = "scale(0.95)";

  setTimeout(() => {
    img.src = images[currentIndex];
    img.dataset.currentImage = currentIndex;
    img.style.opacity = "1";
    img.style.transform = "scale(1)";
  }, 150);

  // تحديث عداد الصور
  const counter = productDiv.querySelector(
    '.product-image-gallery div[style*="bottom"]',
  );
  if (counter) {
    counter.textContent = `${currentIndex + 1}/${images.length}`;
  }

  // تأثير على الأزرار
  button.style.background = "rgba(76, 175, 80, 0.9)";
  button.style.transform = "translateY(-50%) scale(1.1)";

  setTimeout(() => {
    button.style.background = "rgba(0,0,0,0.8)";
    button.style.transform = "translateY(-50%) scale(1)";
  }, 200);
}

// عرض صور المنتج في الأدمين
function viewProductImages(index) {
  const products = document.querySelectorAll(".product");
  const product = products[index];
  if (!product) return;

  const imagesData = product.dataset.images;
  let productImages = [];

  if (imagesData) {
    try {
      productImages = JSON.parse(imagesData);
    } catch (e) {
      const img = product.querySelector("img");
      if (img) {
        productImages = [img.src];
      }
    }
  } else {
    const img = product.querySelector("img");
    if (img) {
      productImages = [img.src];
    }
  }

  if (productImages.length === 0) {
    showNotification("لا توجد صور لهذا المنتج", "error");
    return;
  }

  const productName = product.dataset.name || "منتج غير معروف";

  // إنشاء نافذة عرض الصور
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.95);
    z-index: 11000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    box-sizing: border-box;
  `;

  let currentImageIndex = 0;

  overlay.innerHTML = `
    <div style="background: linear-gradient(135deg, #1a1a1a, #2a2a2a); border-radius: 15px; padding: 30px; max-width: 800px; width: 100%; text-align: center; position: relative; box-shadow: 0 20px 60px rgba(0,0,0,0.8);">
      <button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 15px; right: 20px; background: rgba(255,68,68,0.9); color: white; border: none; width: 35px; height: 35px; border-radius: 50%; font-size: 18px; cursor: pointer; transition: all 0.3s;">✕</button>

      <h3 style="color: white; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">صور المنتج: ${productName}</h3>

      <div style="position: relative; margin-bottom: 20px;">
        <img id="current-image" src="${productImages[0]}" style="max-width: 100%; max-height: 400px; object-fit: contain; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">

        ${
          productImages.length > 1
            ? `
          <button onclick="changeViewImage(-1)" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.8); color: white; border: none; width: 45px; height: 45px; border-radius: 50%; font-size: 20px; cursor: pointer; transition: all 0.3s;">‹</button>
          <button onclick="changeViewImage(1)" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.8); color: white; border: none; width: 45px; height: 45px; border-radius: 50%; font-size: 20px; cursor: pointer; transition: all 0.3s;">›</button>

          <div style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); color: white; padding: 8px 15px; border-radius: 20px; font-size: 14px; font-weight: 500;">
            <span id="image-counter">${currentImageIndex + 1}</span>/${productImages.length}
          </div>
        `
            : ""
        }
      </div>

      ${
        productImages.length > 1
          ? `
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; max-width: 600px; margin: 0 auto;">
          ${productImages
            .map(
              (img, idx) => `
            <div onclick="goToImage(${idx})" style="width: 80px; height: 80px; border: 3px solid ${idx === 0 ? "#4CAF50" : "#555"}; border-radius: 8px; overflow: hidden; cursor: pointer; transition: all 0.3s;" data-thumb-index="${idx}">
              <img src="${img}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
          `,
            )
            .join("")}
        </div>
      `
          : ""
      }

      <div style="color: #4CAF50; font-size: 14px; margin-top: 15px; font-weight: 500;">
        إجمالي الصور: ${productImages.length}
      </div>
    </div>
  `;

  // إضافة الوظائف للنافذة
  window.changeViewImage = function (direction) {
    currentImageIndex += direction;
    if (currentImageIndex < 0) currentImageIndex = productImages.length - 1;
    if (currentImageIndex >= productImages.length) currentImageIndex = 0;

    const currentImg = overlay.querySelector("#current-image");
    const counter = overlay.querySelector("#image-counter");

    if (currentImg) {
      currentImg.style.opacity = "0.5";
      setTimeout(() => {
        currentImg.src = productImages[currentImageIndex];
        currentImg.style.opacity = "1";
      }, 150);
    }

    if (counter) {
      counter.textContent = currentImageIndex + 1;
    }

    // تحديث الصور المصغرة
    const thumbs = overlay.querySelectorAll("[data-thumb-index]");
    thumbs.forEach((thumb, idx) => {
      if (idx === currentImageIndex) {
        thumb.style.borderColor = "#4CAF50";
      } else {
        thumb.style.borderColor = "#555";
      }
    });
  };

  window.goToImage = function (index) {
    currentImageIndex = index;
    window.changeViewImage(0);
  };

  overlay.onclick = (e) => {
    if (e.target === overlay) {
      overlay.remove();
      // تنظيف الوظائف المؤقتة
      delete window.changeViewImage;
      delete window.goToImage;
    }
  };

  document.body.appendChild(overlay);
}

