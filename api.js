// تحديد الرابط الأساسي للـ API
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3001/api"
    : `${window.location.origin}/api`;

// دالة مساعدة للطلبات
const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    showNotification('⚠️ خطأ في الاتصال بالسيرفر', 'error');
    throw error;
  }
};

// جلب المنتجات
const fetchProductsFromDB = async () => {
  try {
    const response = await apiRequest('/products');
    return response.success ? response.data : [];
  } catch (error) {
    return getLocalProducts();
  }
};

// حفظ منتج جديد
const saveProductToDB = async (productData) => {
  try {
    const response = await apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
    if (response.success) {
      showNotification(response.message, 'success');
      return response.data;
    }
  } catch (error) {
    return saveProductLocally(productData);
  }
};

// تحديث منتج
const updateProductInDB = async (productId, updates) => {
  try {
    const response = await apiRequest(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    if (response.success) {
      showNotification(response.message, 'success');
      return response.data;
    }
  } catch (error) {
    showNotification('فشل في تحديث المنتج', 'error');
    return null;
  }
};

// حذف منتج
const deleteProductFromDB = async (productId) => {
  try {
    const response = await apiRequest(`/products/${productId}`, {
      method: 'DELETE'
    });
    if (response.success) {
      showNotification(response.message, 'success');
      return true;
    }
  } catch (error) {
    showNotification('فشل في حذف المنتج', 'error');
    return false;
  }
};
