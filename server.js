const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// إعداد CORS للسماح للمتصفح بالوصول
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// مجموعة المنتجات المحفوظة محلياً كاحتياطي
let localProducts = [];

// تهيئة Firebase Admin
let db;
try {
  // التحقق من وجود المتغيرات المطلوبة
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
    throw new Error('Missing required Firebase environment variables');
  }

  // إنشاء Service Account من المتغيرات
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL
  };

  // محاولة تهيئة Firebase
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID
  });

  db = admin.firestore();
  console.log('✅ Firebase تم التهيئة بنجاح');
  console.log('🔥 متصل بـ Firestore Database');
} catch (error) {
  console.error('❌ خطأ في تهيئة Firebase:', error.message);
  console.log('⚠️ سيتم استخدام البيانات المحلية مؤقتاً');
  
  // إضافة بعض البيانات التجريبية إذا لم يكن Firebase متاح
  if (localProducts.length === 0) {
    localProducts.push(
      {
        id: '1',
        name: 'تيشيرت كلاسيكي',
        price: 120,
        category: 'تيشيرتات',
        sizes: ['S', 'M', 'L', 'XL'],
        soldOut: false,
        createdAt: new Date().toISOString()
      },
      {
        id: '2', 
        name: 'جينز فاتح',
        price: 280,
        category: 'بناطيل',
        sizes: ['28', '30', '32', '34'],
        soldOut: false,
        createdAt: new Date().toISOString()
      }
    );
    console.log('💾 تم تحميل بيانات تجريبية محلية');
  }
}

// دوال مساعدة للتعامل مع Firebase أو البيانات المحلية
const getProducts = async () => {
  if (db) {
    try {
      const snapshot = await db.collection('products').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('خطأ في جلب البيانات من Firebase:', error);
      return localProducts;
    }
  }
  return localProducts;
};

const saveProduct = async (product) => {
  if (db) {
    try {
      const docRef = await db.collection('products').add(product);
      return { id: docRef.id, ...product };
    } catch (error) {
      console.error('خطأ في حفظ البيانات إلى Firebase:', error);
      const newProduct = { id: Date.now().toString(), ...product };
      localProducts.push(newProduct);
      return newProduct;
    }
  }
  const newProduct = { id: Date.now().toString(), ...product };
  localProducts.push(newProduct);
  return newProduct;
};

const updateProduct = async (id, updates) => {
  if (db) {
    try {
      await db.collection('products').doc(id).update(updates);
      return { id, ...updates };
    } catch (error) {
      console.error('خطأ في تحديث البيانات في Firebase:', error);
      const index = localProducts.findIndex(p => p.id === id);
      if (index !== -1) {
        localProducts[index] = { ...localProducts[index], ...updates };
        return localProducts[index];
      }
      return null;
    }
  }
  const index = localProducts.findIndex(p => p.id === id);
  if (index !== -1) {
    localProducts[index] = { ...localProducts[index], ...updates };
    return localProducts[index];
  }
  return null;
};

const deleteProduct = async (id) => {
  if (db) {
    try {
      await db.collection('products').doc(id).delete();
      return true;
    } catch (error) {
      console.error('خطأ في حذف البيانات من Firebase:', error);
      const index = localProducts.findIndex(p => p.id === id);
      if (index !== -1) {
        localProducts.splice(index, 1);
        return true;
      }
      return false;
    }
  }
  const index = localProducts.findIndex(p => p.id === id);
  if (index !== -1) {
    localProducts.splice(index, 1);
    return true;
  }
  return false;
};

// API Routes

// جلب جميع المنتجات
app.get('/api/products', async (req, res) => {
  try {
    const products = await getProducts();
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في جلب المنتجات', error: error.message });
  }
});

// إضافة منتج جديد
app.post('/api/products', async (req, res) => {
  try {
    const productData = req.body;
    productData.createdAt = new Date().toISOString();
    productData.updatedAt = new Date().toISOString();
    
    const newProduct = await saveProduct(productData);
    res.json({ success: true, data: newProduct, message: 'تم إضافة المنتج بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في إضافة المنتج', error: error.message });
  }
});

// تحديث منتج
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    
    const updatedProduct = await updateProduct(id, updates);
    if (updatedProduct) {
      res.json({ success: true, data: updatedProduct, message: 'تم تحديث المنتج بنجاح' });
    } else {
      res.status(404).json({ success: false, message: 'المنتج غير موجود' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في تحديث المنتج', error: error.message });
  }
});

// حذف منتج
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteProduct(id);
    
    if (deleted) {
      res.json({ success: true, message: 'تم حذف المنتج بنجاح' });
    } else {
      res.status(404).json({ success: false, message: 'المنتج غير موجود' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في حذف المنتج', error: error.message });
  }
});

// تبديل حالة نفاد المخزون
app.patch('/api/products/:id/toggle-soldout', async (req, res) => {
  try {
    const { id } = req.params;
    const products = await getProducts();
    const product = products.find(p => p.id === id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
    }
    
    const updatedProduct = await updateProduct(id, { 
      soldOut: !product.soldOut,
      updatedAt: new Date().toISOString()
    });
    
    res.json({ 
      success: true, 
      data: updatedProduct, 
      message: updatedProduct.soldOut ? 'المنتج نفد من المخزون' : 'المنتج متوفر الآن' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في تحديث حالة المنتج', error: error.message });
  }
});

// صفحة الحالة
app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    firebase: !!db,
    message: db ? 'متصل بـ Firebase' : 'يعمل محلياً',
    timestamp: new Date().toISOString()
  });
});

// صفحة رئيسية بسيطة
app.get('/', (req, res) => {
  res.json({
    message: 'SABWEAR API Server',
    status: 'running',
    endpoints: {
      products: '/api/products',
      status: '/api/status'
    }
  });
});

// بدء الخادم
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`🔗 API available at http://0.0.0.0:${PORT}/api`);
  if (db) {
    console.log('💾 Using Firebase Database');
  } else {
    console.log('💾 Using Local Storage (Firebase not configured)');
  }
});

module.exports = app;