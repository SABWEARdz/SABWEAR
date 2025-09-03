// وظائف API للتعامل مع قاعدة البيانات
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001/api' 
  : 'https://7b25c007-236f-4a32-8965-26f370565157-00-2msnthu0mzlad.kirk.replit.dev:3001/api';

// وظائف مساعدة للاتصال بـ API
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
    showNotification('خطأ في الاتصال بقاعدة البيانات', 'error');
    throw error;
  }
};

// جلب جميع المنتجات من قاعدة البيانات
const fetchProductsFromDB = async () => {
  try {
    const response = await apiRequest('/products');
    return response.success ? response.data : [];
  } catch (error) {
    console.error('فشل في جلب المنتجات:', error);
    // العودة للبيانات المحلية في حالة الفشل
    return getLocalProducts();
  }
};

// إضافة منتج جديد لقاعدة البيانات
const saveProductToDB = async (productData) => {
  try {
    const response = await apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
    
    if (response.success) {
      showNotification(response.message || 'تم إضافة المنتج بنجاح', 'success');
      return response.data;
    } else {
      throw new Error(response.message || 'فشل في إضافة المنتج');
    }
  } catch (error) {
    console.error('فشل في حفظ المنتج:', error);
    // حفظ محلي كاحتياطي
    return saveProductLocally(productData);
  }
};

// تحديث منتج في قاعدة البيانات
const updateProductInDB = async (productId, updates) => {
  try {
    const response = await apiRequest(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    
    if (response.success) {
      showNotification(response.message || 'تم تحديث المنتج بنجاح', 'success');
      return response.data;
    } else {
      throw new Error(response.message || 'فشل في تحديث المنتج');
    }
  } catch (error) {
    console.error('فشل في تحديث المنتج:', error);
    showNotification('فشل في تحديث المنتج', 'error');
    return null;
  }
};

// حذف منتج من قاعدة البيانات
const deleteProductFromDB = async (productId) => {
  try {
    const response = await apiRequest(`/products/${productId}`, {
      method: 'DELETE'
    });
    
    if (response.success) {
      showNotification(response.message || 'تم حذف المنتج بنجاح', 'success');
      return true;
    } else {
      throw new Error(response.message || 'فشل في حذف المنتج');
    }
  } catch (error) {
    console.error('فشل في حذف المنتج:', error);
    showNotification('فشل في حذف المنتج', 'error');
    return false;
  }
};

// تبديل حالة نفاد المخزون
const toggleSoldOutInDB = async (productId) => {
  try {
    const response = await apiRequest(`/products/${productId}/toggle-soldout`, {
      method: 'PATCH'
    });
    
    if (response.success) {
      showNotification(response.message, 'success');
      return response.data;
    } else {
      throw new Error(response.message || 'فشل في تحديث حالة المنتج');
    }
  } catch (error) {
    console.error('فشل في تحديث حالة المنتج:', error);
    showNotification('فشل في تحديث حالة المنتج', 'error');
    return null;
  }
};

// وظائف احتياطية للتخزين المحلي
const getLocalProducts = () => {
  try {
    const saved = localStorage.getItem('sabwear_products_backup');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('خطأ في قراءة البيانات المحلية:', error);
    return [];
  }
};

const saveProductLocally = (productData) => {
  try {
    const products = getLocalProducts();
    const newProduct = {
      id: Date.now().toString(),
      ...productData,
      createdAt: new Date().toISOString()
    };
    products.push(newProduct);
    localStorage.setItem('sabwear_products_backup', JSON.stringify(products));
    showNotification('تم حفظ المنتج محلياً', 'success');
    return newProduct;
  } catch (error) {
    console.error('فشل في الحفظ المحلي:', error);
    showNotification('فشل في حفظ المنتج', 'error');
    return null;
  }
};

// فحص حالة الاتصال بقاعدة البيانات
const checkDatabaseConnection = async () => {
  try {
    const response = await apiRequest('/status');
    const statusElement = document.getElementById('db-status');
    if (statusElement) {
      const isConnected = response.firebase;
      statusElement.innerHTML = isConnected 
        ? '🟢 متصل بـ Firebase' 
        : '🟡 يعمل محلياً';
      statusElement.className = isConnected ? 'status-connected' : 'status-local';
    }
    return response;
  } catch (error) {
    const statusElement = document.getElementById('db-status');
    if (statusElement) {
      statusElement.innerHTML = '🔴 غير متصل';
      statusElement.className = 'status-disconnected';
    }
    console.error('فشل في فحص حالة قاعدة البيانات:', error);
    return null;
  }
};

// تهيئة حالة قاعدة البيانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  // فحص الاتصال كل 30 ثانية
  checkDatabaseConnection();
  setInterval(checkDatabaseConnection, 30000);
});