// SABWEAR API Handler
// يدير جميع طلبات API للواجهة الأمامية

const API_BASE_URL = window.location.origin + '/api';

// دالة مساعدة لإرسال طلبات HTTP
async function apiRequest(endpoint, options = {}) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

// جلب جميع المنتجات
async function fetchProducts() {
  try {
    const response = await apiRequest('/products');
    return response.data || [];
  } catch (error) {
    console.error('خطأ في جلب المنتجات:', error);
    return [];
  }
}

// إضافة منتج جديد
async function addProduct(productData) {
  try {
    const response = await apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
    return response;
  } catch (error) {
    console.error('خطأ في إضافة المنتج:', error);
    throw error;
  }
}

// تحديث منتج
async function updateProduct(productId, productData) {
  try {
    const response = await apiRequest(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
    return response;
  } catch (error) {
    console.error('خطأ في تحديث المنتج:', error);
    throw error;
  }
}

// حذف منتج
async function deleteProduct(productId) {
  try {
    const response = await apiRequest(`/products/${productId}`, {
      method: 'DELETE'
    });
    return response;
  } catch (error) {
    console.error('خطأ في حذف المنتج:', error);
    throw error;
  }
}

// إرسال طلب شراء
async function submitOrder(orderData) {
  try {
    const response = await apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
    return response;
  } catch (error) {
    console.error('خطأ في إرسال الطلب:', error);
    throw error;
  }
}

// رفع صورة
async function uploadImage(imageFile) {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('خطأ في رفع الصورة:', error);
    throw error;
  }
}

// تحقق من حالة الخادم
async function checkServerStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('خطأ في التحقق من حالة الخادم:', error);
    return false;
  }
}

// تصدير الدوال للاستخدام في script.js
window.API = {
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  submitOrder,
  uploadImage,
  checkServerStatus
};

console.log('✅ تم تحميل API Handler بنجاح');