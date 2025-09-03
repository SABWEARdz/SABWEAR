const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// إعداد CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// تهيئة Firebase Admin
let db;
try {
  if (
    !process.env.FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_PRIVATE_KEY ||
    !process.env.FIREBASE_CLIENT_EMAIL
  ) {
    throw new Error('❌ متغيرات البيئة الخاصة بـ Firebase غير مكتملة');
  }

  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`
  });

  db = admin.firestore();
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  console.log('⚠️ سيتم استخدام التخزين المحلي كبديل');
}

// تخزين محلي احتياطي
let localProducts = [];

// دوال مساعدة
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
      console.error('خطأ في الحفظ بـ Firebase:', error);
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
      console.error('خطأ في التحديث بـ Firebase:', error);
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
      console.error('خطأ في الحذف بـ Firebase:', error);
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
app.get('/api/products', async (req, res) => {
  try {
    const products = await getProducts();
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في جلب المنتجات' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = await saveProduct(req.body);
    res.json({ success: true, message: 'تمت إضافة المنتج', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في إضافة المنتج' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const updated = await updateProduct(req.params.id, req.body);
    res.json({ success: true, message: 'تم تحديث المنتج', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في تحديث المنتج' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const deleted = await deleteProduct(req.params.id);
    res.json({ success: deleted, message: deleted ? 'تم حذف المنتج' : 'فشل في حذف المنتج' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في حذف المنتج' });
  }
});

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
