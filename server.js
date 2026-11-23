import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { initDatabase } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dapur-ibu-raka-dimsum-dev-jwt-secret-2026';
const COOKIE_NAME = 'dir_admin_token';

const ALLOWED_ORDER_STATUSES = [
  'Menunggu Konfirmasi',
  'Diproses',
  'Siap Diambil',
  'Dalam Pengiriman',
  'Selesai',
  'Dibatalkan',
];

function formatRupiahServer(amount) {
  return `Rp${Number(amount || 0).toLocaleString('id-ID')}`;
}

function normalizeWhatsappNumber(phone) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('0')) {
    digits = '62' + digits.slice(1);
  } else if (!digits.startsWith('62') && digits.length > 0) {
    digits = '62' + digits;
  }
  return digits || '6281234567890';
}

function buildWhatsAppOrderUrl(settings, order) {
  const targetPhone = normalizeWhatsappNumber(settings.whatsapp_number);
  const lines = [
    `Halo *${settings.brand_name}*, saya ingin konfirmasi pesanan:`,
    '',
    `No. Pesanan: *${order.order_number}*`,
    `Nama: ${order.customer_name}`,
    `No. WhatsApp: ${order.customer_phone}`,
    `Metode: ${order.delivery_method}`,
    `Alamat: ${order.customer_address}`,
    '',
    '*Rincian Pesanan:*',
    ...order.items_json.map(
      (item, idx) =>
        `${idx + 1}. ${item.name} (${item.unitInfo || ''}) x${item.quantity} = ${formatRupiahServer(item.subtotal)}`
    ),
    '',
    `Ongkos Kirim: ${order.shipping_fee > 0 ? formatRupiahServer(order.shipping_fee) : 'Gratis / Ambil Sendiri'}`,
    `*Total Pembayaran: ${formatRupiahServer(order.total_amount)}*`,
  ];

  if (order.notes) {
    lines.push('', `Catatan: ${order.notes}`);
  }
  lines.push('', 'Mohon konfirmasi ketersediaan & instruksi pembayarannya. Terima kasih!');

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(lines.join('\n'))}`;
}

async function startServer() {
  const db = await initDatabase();
  const app = express();

  app.set('trust proxy', 1);

  app.use(
    helmet({
      frameguard: false,
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
          connectSrc: ["'self'", 'https:', 'ws:', 'wss:'],
          frameAncestors: ['*'],
        },
      },
    })
  );

  app.use(express.json({ limit: '6mb' }));
  app.use(cookieParser());

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Terlalu banyak percobaan login. Silakan tunggu 15 menit sebelum mencoba lagi.',
    },
  });

  const requireAdmin = async (req, res, next) => {
    try {
      const token = req.cookies?.[COOKIE_NAME];
      if (!token) {
        return res.status(401).json({ error: 'Sesi admin tidak ditemukan. Silakan login terlebih dahulu.' });
      }
      const payload = jwt.verify(token, JWT_SECRET);
      const user = await db.getUserById(payload.sub);
      if (!user || user.role !== 'admin') {
        return res.status(401).json({ error: 'Akses ditolak. Sesi tidak valid.' });
      }
      req.adminUser = user;
      next();
    } catch {
      return res.status(401).json({ error: 'Sesi telah berakhir atau tidak valid. Silakan login ulang.' });
    }
  };

  // ==================== AUTH ROUTES ====================
  app.post('/api/auth/login', loginLimiter, async (req, res) => {
    const schema = z.object({
      username: z.string().trim().min(1, 'Username wajib diisi').max(100),
      password: z.string().min(1, 'Password wajib diisi').max(200),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Input login tidak valid.' });
    }

    const user = await db.getUserByUsername(parsed.data.username);
    if (!user) {
      return res.status(401).json({ error: 'Username atau password salah.' });
    }
    const valid = await bcrypt.compare(parsed.data.password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Username atau password salah.' });
    }

    const token = jwt.sign(
      { sub: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production' && isHttps,
    });

    const usingDefaultPassword = await bcrypt.compare('admin', user.password_hash);
    return res.json({
      user: { id: user.id, username: user.username, role: user.role },
      usingDefaultPassword,
    });
  });

  app.post('/api/auth/logout', (_req, res) => {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    return res.json({ success: true });
  });

  app.get('/api/auth/me', requireAdmin, async (req, res) => {
    const user = req.adminUser;
    const usingDefaultPassword = await bcrypt.compare('admin', user.password_hash);
    return res.json({
      user: { id: user.id, username: user.username, role: user.role },
      usingDefaultPassword,
    });
  });

  // ==================== PUBLIC STOREFRONT ROUTES ====================
  app.get('/api/store', async (_req, res) => {
    try {
      const [settings, categories] = await Promise.all([db.getStoreSettings(), db.getCategories()]);
      return res.json({ settings, categories });
    } catch (err) {
      console.error('GET /api/store error:', err);
      return res.status(500).json({ error: 'Gagal memuat data toko.' });
    }
  });

  app.get('/api/products', async (req, res) => {
    try {
      const { search, category, minPrice, maxPrice, bestSeller, promo, newArrival, inStock, sort } = req.query;
      const products = await db.getProducts({
        includeInactive: false,
        search: typeof search === 'string' ? search.slice(0, 120) : '',
        category: typeof category === 'string' ? category.slice(0, 100) : '',
        minPrice: typeof minPrice === 'string' ? minPrice : undefined,
        maxPrice: typeof maxPrice === 'string' ? maxPrice : undefined,
        bestSeller: bestSeller === 'true',
        promo: promo === 'true',
        newArrival: newArrival === 'true',
        inStock: inStock === 'true',
        sort: typeof sort === 'string' ? sort : 'popular',
      });
      return res.json({ products });
    } catch (err) {
      console.error('GET /api/products error:', err);
      return res.status(500).json({ error: 'Gagal memuat katalog produk.' });
    }
  });

  app.get('/api/products/:slug', async (req, res) => {
    try {
      const data = await db.getProductBySlug(req.params.slug);
      if (!data) return res.status(404).json({ error: 'Produk tidak ditemukan.' });
      return res.json(data);
    } catch (err) {
      console.error('GET /api/products/:slug error:', err);
      return res.status(500).json({ error: 'Gagal memuat detail produk.' });
    }
  });

  app.get('/api/articles', async (_req, res) => {
    try {
      const articles = await db.getArticles(false);
      return res.json({ articles });
    } catch (err) {
      console.error('GET /api/articles error:', err);
      return res.status(500).json({ error: 'Gagal memuat daftar artikel.' });
    }
  });

  app.get('/api/articles/:slug', async (req, res) => {
    try {
      const article = await db.getArticleBySlug(req.params.slug);
      if (!article) return res.status(404).json({ error: 'Artikel tidak ditemukan.' });
      return res.json({ article });
    } catch (err) {
      console.error('GET /api/articles/:slug error:', err);
      return res.status(500).json({ error: 'Gagal memuat artikel.' });
    }
  });

  app.get('/api/testimonials', async (_req, res) => {
    try {
      const testimonials = await db.getTestimonials(false);
      return res.json({ testimonials });
    } catch (err) {
      console.error('GET /api/testimonials error:', err);
      return res.status(500).json({ error: 'Gagal memuat testimoni.' });
    }
  });

  app.post('/api/cart/validate', async (req, res) => {
    const schema = z.object({
      items: z
        .array(
          z.object({
            productId: z.number().int().positive(),
            quantity: z.number().int().positive().max(500),
            clientPrice: z.number().optional(),
          })
        )
        .max(100),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Format keranjang tidak valid.' });
    }
    try {
      const result = await db.validateCartItems(parsed.data.items);
      return res.json(result);
    } catch (err) {
      console.error('POST /api/cart/validate error:', err);
      return res.status(500).json({ error: 'Gagal memvalidasi keranjang.' });
    }
  });

  app.post('/api/orders', async (req, res) => {
    const schema = z.object({
      customer_name: z.string().trim().min(2, 'Nama lengkap minimal 2 karakter').max(150),
      customer_phone: z.string().trim().min(8, 'Nomor WhatsApp tidak valid').max(30),
      customer_address: z.string().trim().min(5, 'Alamat lengkap wajib diisi').max(500),
      delivery_method: z.enum(['Pengiriman', 'Ambil Sendiri']),
      notes: z.string().trim().max(500).optional(),
      items: z
        .array(
          z.object({
            productId: z.number().int().positive(),
            quantity: z.number().int().positive().max(200),
          })
        )
        .min(1, 'Keranjang belanja tidak boleh kosong'),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Data pesanan tidak valid.' });
    }

    try {
      const { order, settings } = await db.createOrderAtomic(parsed.data);
      const whatsappUrl = buildWhatsAppOrderUrl(settings, order);
      return res.status(201).json({ order, whatsappUrl });
    } catch (err) {
      const status = err.statusCode || 500;
      return res.status(status).json({ error: err.message || 'Gagal mencatat pesanan.' });
    }
  });

  // ==================== ADMIN ROUTES (JWT PROTECTED) ====================
  app.get('/api/admin/overview', requireAdmin, async (_req, res) => {
    try {
      const overview = await db.getAdminOverview();
      return res.json(overview);
    } catch (err) {
      console.error('GET /api/admin/overview error:', err);
      return res.status(500).json({ error: 'Gagal memuat ringkasan dashboard.' });
    }
  });

  app.get('/api/admin/products', requireAdmin, async (req, res) => {
    try {
      const { search, category } = req.query;
      const products = await db.getProducts({
        includeInactive: true,
        search: typeof search === 'string' ? search : '',
        category: typeof category === 'string' ? category : '',
        sort: 'newest',
      });
      return res.json({ products });
    } catch (err) {
      console.error('GET /api/admin/products error:', err);
      return res.status(500).json({ error: 'Gagal memuat produk.' });
    }
  });

  const productSchema = z
    .object({
      category_id: z.number().int().positive(),
      name: z.string().trim().min(2, 'Nama produk minimal 2 karakter').max(180),
      slug: z.string().trim().max(200).optional(),
      description: z.string().trim().max(2000).optional(),
      price: z.number().int().positive('Harga normal harus lebih besar dari 0'),
      discount_price: z.number().int().positive().nullable().optional(),
      is_promo: z.boolean().default(false),
      is_best_seller: z.boolean().default(false),
      is_new_arrival: z.boolean().default(false),
      is_active: z.boolean().default(true),
      stock: z.number().int().min(0, 'Stok tidak boleh negatif'),
      unit_info: z.string().trim().min(1, 'Info kemasan wajib diisi').max(80),
      variant: z.string().trim().max(120).optional(),
      serving_suggestion: z.string().trim().max(1000).optional(),
      image_url: z.string().trim().max(4500000).optional(),
    })
    .refine(
      (data) => {
        if (data.discount_price !== null && data.discount_price !== undefined) {
          return data.discount_price < data.price;
        }
        return true;
      },
      { message: 'Harga diskon harus lebih kecil daripada harga normal.' }
    );

  app.post('/api/admin/products', requireAdmin, async (req, res) => {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Data produk tidak valid.' });
    }
    try {
      const product = await db.createProduct(parsed.data);
      return res.status(201).json({ product });
    } catch (err) {
      console.error('POST /api/admin/products error:', err);
      return res.status(500).json({ error: 'Gagal menambah produk.' });
    }
  });

  app.put('/api/admin/products/:id', requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID produk tidak valid.' });
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Data produk tidak valid.' });
    }
    try {
      const product = await db.updateProduct(id, parsed.data);
      if (!product) return res.status(404).json({ error: 'Produk tidak ditemukan.' });
      return res.json({ product });
    } catch (err) {
      console.error('PUT /api/admin/products/:id error:', err);
      return res.status(500).json({ error: 'Gagal memperbarui produk.' });
    }
  });

  app.patch('/api/admin/products/:id/stock', requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const schema = z.object({ stock: z.number().int().min(0, 'Stok tidak boleh negatif') });
    const parsed = schema.safeParse(req.body);
    if (!Number.isInteger(id) || id <= 0 || !parsed.success) {
      return res.status(400).json({ error: 'Nilai stok tidak valid.' });
    }
    const product = await db.updateProductStock(id, parsed.data.stock);
    if (!product) return res.status(404).json({ error: 'Produk tidak ditemukan.' });
    return res.json({ product });
  });

  app.delete('/api/admin/products/:id', requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID produk tidak valid.' });
    const deleted = await db.deleteProduct(id);
    if (!deleted) return res.status(404).json({ error: 'Produk tidak ditemukan.' });
    return res.json({ success: true });
  });

  // Categories Admin
  const categorySchema = z.object({
    name: z.string().trim().min(2, 'Nama kategori minimal 2 karakter').max(120),
    slug: z.string().trim().max(140).optional(),
    image_url: z.string().trim().max(4500000).optional(),
  });

  app.get('/api/admin/categories', requireAdmin, async (_req, res) => {
    const categories = await db.getCategories();
    return res.json({ categories });
  });

  app.post('/api/admin/categories', requireAdmin, async (req, res) => {
    const parsed = categorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Data kategori tidak valid.' });
    }
    try {
      const category = await db.createCategory(parsed.data);
      return res.status(201).json({ category });
    } catch (err) {
      if (err.code === 'DUPLICATE') return res.status(409).json({ error: err.message });
      return res.status(500).json({ error: 'Gagal membuat kategori.' });
    }
  });

  app.put('/api/admin/categories/:id', requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const parsed = categorySchema.safeParse(req.body);
    if (!Number.isInteger(id) || id <= 0 || !parsed.success) {
      return res.status(400).json({ error: 'Data kategori tidak valid.' });
    }
    try {
      const category = await db.updateCategory(id, parsed.data);
      if (!category) return res.status(404).json({ error: 'Kategori tidak ditemukan.' });
      return res.json({ category });
    } catch (err) {
      if (err.code === 'DUPLICATE') return res.status(409).json({ error: err.message });
      return res.status(500).json({ error: 'Gagal mengubah kategori.' });
    }
  });

  app.delete('/api/admin/categories/:id', requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID kategori tidak valid.' });
    try {
      const deleted = await db.deleteCategory(id);
      if (!deleted) return res.status(404).json({ error: 'Kategori tidak ditemukan.' });
      return res.json({ success: true });
    } catch (err) {
      if (err.code === 'IN_USE') return res.status(409).json({ error: err.message });
      return res.status(500).json({ error: 'Gagal menghapus kategori.' });
    }
  });

  // Orders Admin
  app.get('/api/admin/orders', requireAdmin, async (_req, res) => {
    const orders = await db.getOrders();
    return res.json({ orders });
  });

  app.patch('/api/admin/orders/:id/status', requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const schema = z.object({ status: z.enum(ALLOWED_ORDER_STATUSES) });
    const parsed = schema.safeParse(req.body);
    if (!Number.isInteger(id) || id <= 0 || !parsed.success) {
      return res.status(400).json({ error: 'Status pesanan tidak valid.' });
    }
    const order = await db.updateOrderStatus(id, parsed.data.status);
    if (!order) return res.status(404).json({ error: 'Pesanan tidak ditemukan.' });
    return res.json({ order });
  });

  // Articles Admin
  const articleSchema = z.object({
    title: z.string().trim().min(3, 'Judul artikel minimal 3 karakter').max(220),
    excerpt: z.string().trim().max(600).optional(),
    content: z.string().trim().min(10, 'Konten artikel minimal 10 karakter').max(20000),
    category: z.string().trim().min(2).max(100),
    cover_url: z.string().trim().max(4500000).optional(),
    status: z.enum(['published', 'draft']),
  });

  app.get('/api/admin/articles', requireAdmin, async (_req, res) => {
    const articles = await db.getArticles(true);
    return res.json({ articles });
  });

  app.post('/api/admin/articles', requireAdmin, async (req, res) => {
    const parsed = articleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Data artikel tidak valid.' });
    }
    const article = await db.createArticle(parsed.data);
    return res.status(201).json({ article });
  });

  app.put('/api/admin/articles/:id', requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const parsed = articleSchema.safeParse(req.body);
    if (!Number.isInteger(id) || id <= 0 || !parsed.success) {
      return res.status(400).json({ error: parsed.error?.issues?.[0]?.message || 'Data artikel tidak valid.' });
    }
    const article = await db.updateArticle(id, parsed.data);
    if (!article) return res.status(404).json({ error: 'Artikel tidak ditemukan.' });
    return res.json({ article });
  });

  app.delete('/api/admin/articles/:id', requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const deleted = await db.deleteArticle(id);
    if (!deleted) return res.status(404).json({ error: 'Artikel tidak ditemukan.' });
    return res.json({ success: true });
  });

  // Testimonials Admin
  const testimonialSchema = z.object({
    customer_name: z.string().trim().min(2, 'Nama pelanggan wajib diisi').max(140),
    role: z.string().trim().max(140).optional(),
    rating: z.number().int().min(1).max(5),
    content: z.string().trim().min(5, 'Isi testimoni minimal 5 karakter').max(1000),
    is_visible: z.boolean().default(true),
    is_demo: z.boolean().default(false),
  });

  app.get('/api/admin/testimonials', requireAdmin, async (_req, res) => {
    const testimonials = await db.getTestimonials(true);
    return res.json({ testimonials });
  });

  app.post('/api/admin/testimonials', requireAdmin, async (req, res) => {
    const parsed = testimonialSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Data testimoni tidak valid.' });
    }
    const testimonial = await db.createTestimonial(parsed.data);
    return res.status(201).json({ testimonial });
  });

  app.put('/api/admin/testimonials/:id', requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const parsed = testimonialSchema.safeParse(req.body);
    if (!Number.isInteger(id) || id <= 0 || !parsed.success) {
      return res.status(400).json({ error: parsed.error?.issues?.[0]?.message || 'Data testimoni tidak valid.' });
    }
    const testimonial = await db.updateTestimonial(id, parsed.data);
    if (!testimonial) return res.status(404).json({ error: 'Testimoni tidak ditemukan.' });
    return res.json({ testimonial });
  });

  app.delete('/api/admin/testimonials/:id', requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const deleted = await db.deleteTestimonial(id);
    if (!deleted) return res.status(404).json({ error: 'Testimoni tidak ditemukan.' });
    return res.json({ success: true });
  });

  // Settings & Security Admin
  app.get('/api/admin/settings', requireAdmin, async (_req, res) => {
    const settings = await db.getStoreSettings();
    return res.json({ settings });
  });

  app.put('/api/admin/settings', requireAdmin, async (req, res) => {
    const schema = z.object({
      brand_name: z.string().trim().min(2, 'Nama brand minimal 2 karakter').max(180),
      description: z.string().trim().max(1000),
      whatsapp_number: z.string().trim().min(8, 'Nomor WhatsApp minimal 8 digit').max(40),
      address: z.string().trim().min(5, 'Alamat wajib diisi').max(400),
      operational_hours: z.string().trim().min(3).max(160),
      instagram: z.string().trim().max(120),
      tiktok: z.string().trim().max(120),
      shipping_info: z.string().trim().max(600),
      shipping_fee: z.number().int().min(0, 'Ongkir tidak boleh negatif'),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Data pengaturan tidak valid.' });
    }
    const settings = await db.updateStoreSettings(parsed.data);
    return res.json({ settings });
  });

  app.post('/api/admin/change-password', requireAdmin, async (req, res) => {
    const schema = z.object({
      currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
      newPassword: z.string().min(6, 'Password baru minimal 6 karakter').max(120),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Input password tidak valid.' });
    }
    const user = req.adminUser;
    const match = await bcrypt.compare(parsed.data.currentPassword, user.password_hash);
    if (!match) {
      return res.status(400).json({ error: 'Password saat ini tidak sesuai.' });
    }
    const hash = await bcrypt.hash(parsed.data.newPassword, 10);
    await db.updateUserPassword(user.id, hash);
    return res.json({ success: true });
  });

  app.post('/api/admin/reset-demo', requireAdmin, async (req, res) => {
    const schema = z.object({ confirmText: z.literal('RESET DATA DEMO') });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Ketik "RESET DATA DEMO" dengan tepat untuk konfirmasi.' });
    }
    await db.resetDemoData();
    return res.json({ success: true });
  });

  // ==================== STATIC / VITE SERVING ====================
  const distPath = path.resolve(__dirname, 'dist');
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      return res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Dapur Ibu Raka Dimsum berjalan pada http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
