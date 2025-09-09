const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// إعداد CORS للسماح للمتصفح بالوصول
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// إعداد خدمة الملفات الثابتة 
app.use(express.static('.'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// إعداد multer لرفع الصور
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, 'uploads');
    // إنشاء المجلد إذا لم يكن موجود
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // إنشاء اسم ملف فريد مع الامتداد الأصلي
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    const extension = path.extname(originalName);
    const basename = path.basename(originalName, extension);
    cb(null, basename + '_' + uniqueSuffix + extension);
  }
});

// فلتر للسماح بالصور فقط
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('يُسمح برفع الصور فقط!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // حد أقصى 5MB للملف الواحد
    files: 10 // حد أقصى 10 ملفات في المرة الواحدة
  }
});

// مجموعة المنتجات المحفوظة محلياً كاحتياطي
let localProducts = [];

// إعداد بوت التليجرام
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

let bot;
if (TELEGRAM_TOKEN && TELEGRAM_CHAT_ID) {
  try {
    bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });
    console.log('✅ تم تهيئة بوت التليجرام بنجاح');
    console.log(`📞 Chat ID: ${TELEGRAM_CHAT_ID.substring(0, 5)}...`);
  } catch (error) {
    console.error('❌ خطأ في تهيئة بوت التليجرام:', error.message);
  }
} else {
  console.warn('⚠️ متغيرات التليجرام غير محددة (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID)');
}

// دالة لإرسال إشعار طلب جديد عبر التليجرام
const sendTelegramNotification = async (orderDetails) => {
  if (!bot || !TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('❌ بوت التليجرام غير متاح أو المتغيرات مفقودة');
    return false;
  }

  try {
    const message = formatOrderMessage(orderDetails);
    console.log('📤 محاولة إرسال رسالة إلى التليجرام...');
    
    const result = await bot.sendMessage(TELEGRAM_CHAT_ID, message, { parse_mode: 'HTML' });
    console.log('✅ تم إرسال إشعار التليجرام بنجاح');
    console.log('📨 معرف الرسالة:', result.message_id);
    return true;
  } catch (error) {
    console.error('❌ فشل في إرسال إشعار التليجرام:', error.message);
    console.error('🔍 تفاصيل الخطأ:', {
      code: error.code,
      response: error.response?.body
    });
    
    // تحقق من أخطاء شائعة
    if (error.message.includes('404')) {
      console.error('💡 نصيحة: تأكد من أن Chat ID صحيح أو أن البوت مضاف للمحادثة/القناة');
    } else if (error.message.includes('401')) {
      console.error('💡 نصيحة: تأكد من أن Bot Token صحيح');
    }
    
    return false;
  }
};

// تنسيق رسالة الطلب
const formatOrderMessage = (orderDetails) => {
  const { product, size, color, quantity, customer } = orderDetails;
  
  const colorNames = {
    white: 'أبيض',
    black: 'أسود',
    'light-blue': 'أزرق فاتح',
    'dark-blue': 'أزرق داكن',
    gray: 'رمادي',
    brown: 'بني'
  };

  return `
🛍️ <b>طلب جديد من SABWEAR</b>

📦 <b>تفاصيل المنتج:</b>
• المنتج: ${product.name}
• السعر: ${product.price}
• المقاس: ${size}
• اللون: ${colorNames[color] || color}
• الكمية: ${quantity}

👤 <b>معلومات العميل:</b>
• الاسم: ${customer.name} ${customer.lastname}
• الهاتف: ${customer.phone}
• الولاية: ${customer.state}
• البلدية: ${customer.city}
• نوع التوصيل: ${customer.deliveryType === 'home' ? 'المنزل' : 'المكتب'}
${customer.inquiry ? `• ملاحظات: ${customer.inquiry}` : ''}

⏰ وقت الطلب: ${new Date().toLocaleString('ar-DZ')}
  `.trim();
};

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

// استقبال طلب جديد - POST /api/orders
app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    orderData.createdAt = new Date().toISOString();
    orderData.orderId = `ORDER_${Date.now()}`;

    console.log('📦 طلب جديد وارد:', orderData);

    // إرسال إشعار التليجرام
    const telegramSent = await sendTelegramNotification(orderData);

    // حفظ الطلب في قاعدة البيانات (اختياري)
    if (db) {
      try {
        await db.collection('orders').add(orderData);
        console.log('💾 تم حفظ الطلب في Firebase');
      } catch (error) {
        console.error('❌ فشل في حفظ الطلب في Firebase:', error);
      }
    }

    res.json({
      success: true,
      orderId: orderData.orderId,
      message: 'تم استلام طلبك بنجاح',
      telegramSent: telegramSent
    });

  } catch (error) {
    console.error('❌ خطأ في معالجة الطلب:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في معالجة الطلب',
      error: error.message
    });
  }
});

// رفع الصور - POST /api/upload
app.post('/api/upload', upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'لم يتم رفع أي صور'
      });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      url: `/uploads/${file.filename}`
    }));

    console.log(`✅ تم رفع ${uploadedFiles.length} صورة بنجاح`);
    
    res.json({
      success: true,
      message: `تم رفع ${uploadedFiles.length} صورة بنجاح`,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('❌ خطأ في رفع الصور:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في رفع الصور',
      error: error.message
    });
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

// صفحة رئيسية - عرض ملف HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index .html'));
});

// إضافة نقطة نهاية للحالة الصحية
app.get('/api/health', (req, res) => {
  res.json({
    message: 'SABWEAR API Server',
    status: 'running',
    endpoints: {
      products: '/api/products',
      upload: '/api/upload',
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