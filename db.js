import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import pg from 'pg';

const { Pool } = pg;

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function createInitialSeedData() {
  const adminPasswordHash = bcrypt.hashSync('admin', 10);

  const categories = [
    { id: 1, name: 'Dimsum Ayam', slug: 'dimsum-ayam', image_url: '/src/assets/images/dimsum_ayam_original_1795412486133.jpg' },
    { id: 2, name: 'Dimsum Udang', slug: 'dimsum-udang', image_url: '/src/assets/images/dimsum_udang_premium_1795412486659.jpg' },
    { id: 3, name: 'Dimsum Premium', slug: 'dimsum-premium', image_url: '/src/assets/images/dimsum_beef_1795412485190.jpg' },
    { id: 4, name: 'Dimsum Mentai', slug: 'dimsum-mentai', image_url: '/src/assets/images/dimsum_mentai_1795412486057.jpg' },
    { id: 5, name: 'Dimsum Frozen', slug: 'dimsum-frozen', image_url: '/src/assets/images/dimsum_frozen_pack_1795412486930.jpg' },
    { id: 6, name: 'Paket Hemat', slug: 'paket-hemat', image_url: '/src/assets/images/dimsum_crabstick_1795412486711.jpg' },
    { id: 7, name: 'Paket Keluarga', slug: 'paket-keluarga', image_url: '/src/assets/images/dimsum_family_platter_1795412487394.jpg' },
    { id: 8, name: 'Saus dan Pelengkap', slug: 'saus-dan-pelengkap', image_url: '/src/assets/images/hero_dimsum_feast_1795412481233.jpg' },
  ];

  const products = [
    {
      id: 1,
      category_id: 1,
      name: 'Dimsum Ayam Original',
      slug: 'dimsum-ayam-original',
      description: 'Siomay daging paha ayam fillet pilihan yang dicincang halus dengan bumbu bawang putih panggang, minyak wijen murni, dan taburan wortel segar. Tekstur kenyal, gurih, dan juicy di setiap gigitan.',
      price: 18000,
      discount_price: null,
      is_promo: false,
      is_best_seller: true,
      is_new_arrival: false,
      is_active: true,
      stock: 32,
      unit_info: '5 pcs',
      variant: 'Siap Santap (Kukus)',
      serving_suggestion: 'Nikmati selagi hangat dengan cocolan chili oil khas Dapur Ibu Raka. Simpan di chiller maksimal 2 hari jika belum dikonsumsi.',
      image_url: '/src/assets/images/dimsum_ayam_original_1795412486133.jpg',
    },
    {
      id: 2,
      category_id: 1,
      name: 'Dimsum Ayam Jamur',
      slug: 'dimsum-ayam-jamur',
      description: 'Perpaduan daging ayam kampung segar dan potongan jamur shiitake aromatik yang dimasak perlahan bersama saus tiram autentik.',
      price: 20000,
      discount_price: null,
      is_promo: false,
      is_best_seller: true,
      is_new_arrival: false,
      is_active: true,
      stock: 24,
      unit_info: '5 pcs',
      variant: 'Siap Santap (Kukus)',
      serving_suggestion: 'Kukus ulang 5 menit sebelum disajikan bersama saus sambal Bangkok atau kecap asin jahe.',
      image_url: '/src/assets/images/dimsum_ayam_jamur_1795412487169.jpg',
    },
    {
      id: 3,
      category_id: 2,
      name: 'Dimsum Udang Premium',
      slug: 'dimsum-udang-premium',
      description: 'Hakau & siomay udang kupas utuh berkualitas ekspor dengan kulit lembut transparan. Rasa manis alami udang berpadu dengan rebung renyah.',
      price: 25000,
      discount_price: null,
      is_promo: false,
      is_best_seller: true,
      is_new_arrival: false,
      is_active: true,
      stock: 18,
      unit_info: '5 pcs',
      variant: 'Udang Utuh Segar',
      serving_suggestion: 'Paling nikmat disajikan panas langsung dari klakat bambu bersama minyak cabai wijen.',
      image_url: '/src/assets/images/dimsum_udang_premium_1795412486659.jpg',
    },
    {
      id: 4,
      category_id: 1,
      name: 'Dimsum Crabstick',
      slug: 'dimsum-crabstick',
      description: 'Adonan ayam udang lembut yang diberi topping suwiran crabstick premium manis gurih, favorit anak-anak hingga dewasa.',
      price: 22000,
      discount_price: null,
      is_promo: false,
      is_best_seller: false,
      is_new_arrival: true,
      is_active: true,
      stock: 20,
      unit_info: '5 pcs',
      variant: 'Siap Santap (Kukus)',
      serving_suggestion: 'Cocok dipadukan dengan saus asam manis atau chili oil ringan.',
      image_url: '/src/assets/images/dimsum_crabstick_1795412486711.jpg',
    },
    {
      id: 5,
      category_id: 3,
      name: 'Dimsum Mozzarella',
      slug: 'dimsum-mozzarella',
      description: 'Dimsum ayam spesial dengan lelehan keju mozzarella murni yang di-torch hingga keemasan di bagian atas. Creamy dan gurih.',
      price: 25000,
      discount_price: 22000,
      is_promo: true,
      is_best_seller: false,
      is_new_arrival: false,
      is_active: true,
      stock: 15,
      unit_info: '5 pcs',
      variant: 'Keju Leleh Torch',
      serving_suggestion: 'Santap segera saat keju masih hangat agar sensasi mulur mozzarella tetap maksimal.',
      image_url: '/src/assets/images/dimsum_mozzarella_1795412486930.jpg',
    },
    {
      id: 6,
      category_id: 4,
      name: 'Dimsum Mentai',
      slug: 'dimsum-mentai',
      description: 'Dimsum premium disiram saus mentai racikan sendiri yang creamy, smokey karena dipanggang api torch, dan ditaburi tobiko serta nori.',
      price: 28000,
      discount_price: null,
      is_promo: false,
      is_best_seller: true,
      is_new_arrival: false,
      is_active: true,
      stock: 14,
      unit_info: '5 pcs',
      variant: 'Saus Mentai Bakar',
      serving_suggestion: 'Langsung siap disantap. Tidak perlu dikukus ulang agar tekstur saus mentai tetap creamy.',
      image_url: '/src/assets/images/dimsum_mentai_1795412486057.jpg',
    },
    {
      id: 7,
      category_id: 3,
      name: 'Dimsum Beef',
      slug: 'dimsum-beef',
      description: 'Olahan daging sapi cincang berlemak seimbang dengan lada hitam, bawang bombay karamel, dan taburan biji wijen sangrai.',
      price: 27000,
      discount_price: null,
      is_promo: false,
      is_best_seller: false,
      is_new_arrival: true,
      is_active: true,
      stock: 4,
      unit_info: '5 pcs',
      variant: 'Daging Sapi Pilihan',
      serving_suggestion: 'Kukus 5–7 menit dan sajikan dengan kecap asin cabai rawit.',
      image_url: '/src/assets/images/dimsum_beef_1795412485190.jpg',
    },
    {
      id: 8,
      category_id: 3,
      name: 'Dimsum Nori',
      slug: 'dimsum-nori',
      description: 'Isian ayam dan udang cincang dibalut lembaran rumput laut panggang Jepang (nori) yang gurih dan kaya aroma laut.',
      price: 23000,
      discount_price: null,
      is_promo: false,
      is_best_seller: false,
      is_new_arrival: false,
      is_active: true,
      stock: 19,
      unit_info: '5 pcs',
      variant: 'Balut Rumput Laut',
      serving_suggestion: 'Sajikan hangat bersama teh oolong atau teh melati tawar.',
      image_url: '/src/assets/images/dimsum_nori_1795412526438.jpg',
    },
    {
      id: 9,
      category_id: 5,
      name: 'Dimsum Frozen Original',
      slug: 'dimsum-frozen-original',
      description: 'Kemasan beku higienis vacuum-sealed isi 10 pcs dimsum ayam original lengkap dengan 2 sachet saus sambal dan chili oil.',
      price: 32000,
      discount_price: 29000,
      is_promo: true,
      is_best_seller: false,
      is_new_arrival: false,
      is_active: true,
      stock: 26,
      unit_info: '10 pcs',
      variant: 'Frozen Vacuum Pack',
      serving_suggestion: 'Simpan di freezer (-18°C) tahan hingga 2 bulan. Kukus langsung 10–12 menit dari kondisi beku.',
      image_url: '/src/assets/images/dimsum_frozen_pack_1795412486930.jpg',
    },
    {
      id: 10,
      category_id: 5,
      name: 'Dimsum Frozen Premium',
      slug: 'dimsum-frozen-premium',
      description: 'Stok camilan keluarga isi 20 pcs campuran ayam original, jamur, udang, nori, dan crabstick dalam kemasan kedap udara.',
      price: 65000,
      discount_price: null,
      is_promo: false,
      is_best_seller: true,
      is_new_arrival: false,
      is_active: true,
      stock: 16,
      unit_info: '20 pcs',
      variant: 'Frozen Mix 5 Rasa',
      serving_suggestion: 'Olesi alas kukusan dengan sedikit minyak atau kertas baking agar kulit tidak lengket saat dikukus.',
      image_url: '/src/assets/images/dimsum_frozen_pack_1795412486930.jpg',
    },
    {
      id: 11,
      category_id: 6,
      name: 'Paket Dimsum Mix',
      slug: 'paket-dimsum-mix',
      description: 'Paket hemat siap santap berisi 15 pcs dimsum aneka rasa (Ayam Original, Jamur, Udang, Crabstick, dan Nori) plus chili oil botolan mini.',
      price: 55000,
      discount_price: 49000,
      is_promo: true,
      is_best_seller: false,
      is_new_arrival: false,
      is_active: true,
      stock: 12,
      unit_info: '15 pcs',
      variant: 'Mix 5 Varian + Saus',
      serving_suggestion: 'Ideal untuk 2–3 orang, teman kerja atau camilan sore bersama keluarga.',
      image_url: '/src/assets/images/dimsum_family_platter_1795412487394.jpg',
    },
    {
      id: 12,
      category_id: 7,
      name: 'Paket Keluarga',
      slug: 'paket-keluarga',
      description: 'Nampan besar isi 30 pcs lengkap dengan varian Mentai, Udang Premium, Ayam Jamur, Mozzarella, Nori, serta 2 cup besar saus spesial.',
      price: 105000,
      discount_price: null,
      is_promo: false,
      is_best_seller: true,
      is_new_arrival: false,
      is_active: true,
      stock: 10,
      unit_info: '30 pcs',
      variant: 'Platter Acara & Keluarga',
      serving_suggestion: 'Sangat pas untuk arisan, kumpul keluarga akhir pekan, atau hantaran syukuran.',
      image_url: '/src/assets/images/dimsum_family_platter_1795412487394.jpg',
    },
  ];

  const articles = [
    {
      id: 1,
      title: 'Cara Mengukus Dimsum Frozen Agar Tetap Lembut & Juicy',
      slug: 'cara-mengukus-dimsum-frozen-agar-tetap-lembut-juicy',
      excerpt: 'Panduan langkah demi langkah mengukus dimsum beku tanpa membuat kulitnya kering, pecah, atau lengket di dasar panci.',
      content:
        'Mengukus dimsum frozen sebenarnya sangat mudah jika Anda memperhatikan suhu air dan waktu pengukusan.\n\n1. Panaskan Air Hingga Mendidih Terlebih Dahulu\nPastikan air di dalam panci kukusan atau klakat bambu sudah benar-benar mendidih dan menghasilkan uap penuh sebelum dimsum dimasukkan. Memasukkan dimsum saat air masih dingin membuat kulit menyerap terlalu banyak air dan menjadi lembek.\n\n2. Gunakan Alas Kertas Baking atau Daun Pisang\nOlesi permukaan kukusan atau lapisi dengan kertas baking berlubang agar bagian bawah kulit dimsum tidak robek saat diangkat.\n\n3. Kukus 10–12 Menit dengan Api Sedang\nUntuk dimsum langsung dari freezer, cukup kukus selama 10 hingga 12 menit dengan tutup panci dilapisi kain bersih agar tetesan uap tidak membasahi topping.\n\n4. Sajikan Segera dengan Chili Oil\nAngkat dimsum selagi mengepul dan nikmati bersama saus sambal atau chili oil hangat untuk cita rasa terbaik.',
      category: 'Tips Memasak',
      cover_url: '/src/assets/images/article_steaming_guide_1795412487148.jpg',
      status: 'published',
      published_at: new Date('2026-10-12T08:00:00Z').toISOString(),
    },
    {
      id: 2,
      title: 'Tips Menyajikan Dimsum Hangat untuk Acara Keluarga & Arisan',
      slug: 'tips-menyajikan-dimsum-hangat-untuk-acara-keluarga',
      excerpt: 'Ingin menyajikan dimsum tetap hangat dan menggugah selera sepanjang acara? Simak trik penyajian ala katering profesional.',
      content:
        'Dimsum paling nikmat disantap dalam kondisi hangat. Saat menjamu tamu atau mengadakan arisan di rumah, penyajian dalam jumlah banyak membutuhkan sedikit strategi.\n\n1. Gunakan Klakat Bambu Bertingkat\nSelain menjaga suhu hangat lebih lama, klakat bambu menyerap kelembapan berlebih sehingga kulit dimsum tidak basah dan tampilannya tampak autentik.\n\n2. Pisahkan Varian Saus Bakar (Mentai & Mozzarella)\nVarian dengan saus mentai atau keju sebaiknya tidak ditumpuk dengan varian kukus biasa agar topping tetap rapi.\n\n3. Sediakan Variasi Pelengkap dalam Mangkuk Kecil\nSiapkan minimal dua jenis pelengkap: chili oil untuk penyuka pedas gurih dan saus asam manis untuk anak-anak.',
      category: 'Inspirasi Sajian',
      cover_url: '/src/assets/images/dimsum_family_platter_1795412487394.jpg',
      status: 'published',
      published_at: new Date('2026-10-25T08:00:00Z').toISOString(),
    },
    {
      id: 3,
      title: 'Perbedaan Dimsum Fresh & Frozen: Mana yang Paling Pas untuk Anda?',
      slug: 'perbedaan-dimsum-fresh-dan-frozen',
      excerpt: 'Kenali keunggulan masing-masing kemasan fresh siap santap dan frozen vacuum-sealed dari Dapur Ibu Raka.',
      content:
        'Banyak pelanggan bertanya apakah rasa dimsum frozen berbeda dengan dimsum fresh yang baru matang dari dapur kami.\n\nSecara komposisi resep dan bahan baku, keduanya 100% sama: menggunakan daging ayam segar harian, udang kupas pilihan, dan tanpa pengawet kimia.\n\nDimsum Fresh (Siap Santap):\n- Dikukus sesaat sebelum dikirim.\n- Praktis langsung dinikmati di kantor, rumah, atau acara mendadak.\n- Terbaik dikonsumsi dalam 6–12 jam.\n\nDimsum Frozen (Kemasan Vacuum):\n- Dibekukan cepat setelah dibentuk sehingga sari daging terkunci sempurna.\n- Tahan hingga 2 bulan di dalam freezer suhu -18°C.\n- Cocok untuk stok sarapan praktis, bekal sekolah anak, atau camilan malam kapan saja.',
      category: 'Edukasi Produk',
      cover_url: '/src/assets/images/dimsum_frozen_pack_1795412486930.jpg',
      status: 'published',
      published_at: new Date('2026-11-05T08:00:00Z').toISOString(),
    },
  ];

  const testimonials = [
    {
      id: 1,
      customer_name: 'Rani Kusumawardani',
      role: 'Ibu Rumah Tangga · Jakarta Selatan',
      rating: 5,
      content: 'Dimsum ayam dan udangnya terasa penuh daging, bukan tepung. Anak-anak suka sekali yang varian crabstick, dan kemasan frozen-nya selalu jadi penyelamat sarapan pagi.',
      is_visible: true,
      is_demo: true,
    },
    {
      id: 2,
      customer_name: 'Bima Pratama',
      role: 'Koordinator Kantor · Bandung',
      rating: 5,
      content: 'Sudah tiga kali pesan Paket Keluarga untuk rapat kantor. Pengiriman tepat waktu, masih hangat saat tiba, dan saus mentai bakarnya selalu habis duluan.',
      is_visible: true,
      is_demo: true,
    },
    {
      id: 3,
      customer_name: 'Siti Aminah',
      role: 'Pelanggan Tetap · Depok',
      rating: 5,
      content: 'Chili oil racikan Dapur Ibu Raka wangi banget dan tidak bikin tenggorokan gatal. Proses pesan lewat web langsung terhubung ke WhatsApp juga cepat dan jelas.',
      is_visible: true,
      is_demo: true,
    },
  ];

  const store_settings = {
    id: 1,
    brand_name: 'Dapur Ibu Raka Dimsum',
    description:
      'Dimsum artisanal buatan rumah yang diracik setiap pagi dari daging ayam pilihan, udang segar, dan bumbu alami tanpa bahan pengawet.',
    whatsapp_number: '6281234567890',
    address: 'Jl. Melati Kusuma No. 18, Kemang Timur, Jakarta Selatan 12730',
    operational_hours: 'Setiap Hari, 08.00 – 20.00 WIB',
    instagram: '@dapuriburaka.dimsum',
    tiktok: '@dapuriburaka',
    shipping_info: 'Pengiriman instan & sameday setiap hari. Gratis ongkir area kota untuk pembelian minimal Rp150.000.',
    shipping_fee: 10000,
  };

  return {
    users: [
      {
        id: 1,
        username: 'admin',
        password_hash: adminPasswordHash,
        role: 'admin',
        created_at: new Date().toISOString(),
      },
    ],
    categories: categories.map((c) => ({ ...c, created_at: new Date().toISOString() })),
    products: products.map((p) => ({
      ...p,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
    orders: [
      {
        id: 1,
        order_number: 'DIR-20261120-1001',
        customer_name: 'Nadia Larasati',
        customer_phone: '081298765432',
        customer_address: 'Jl. Kemang Utara IX No. 4, Jakarta Selatan',
        delivery_method: 'Pengiriman',
        notes: 'Tolong pisahkan chili oil ekstra ya Bu.',
        items_json: [
          { productId: 1, name: 'Dimsum Ayam Original', unitInfo: '5 pcs', price: 18000, quantity: 2, subtotal: 36000 },
          { productId: 6, name: 'Dimsum Mentai', unitInfo: '5 pcs', price: 28000, quantity: 1, subtotal: 28000 },
        ],
        total_amount: 74000,
        status: 'Diproses',
        created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      },
    ],
    articles,
    testimonials,
    store_settings,
  };
}

class LocalFileStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.dir = path.dirname(filePath);
    this.mutex = Promise.resolve();
    this.state = null;
  }

  async init() {
    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir, { recursive: true });
    }
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.state = JSON.parse(raw);
      } catch {
        this.state = createInitialSeedData();
        this.saveSync();
      }
    } else {
      this.state = createInitialSeedData();
      this.saveSync();
    }
  }

  saveSync() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.state, null, 2), 'utf-8');
  }

  runLocked(fn) {
    const next = this.mutex.then(() => fn());
    this.mutex = next.catch(() => {});
    return next;
  }

  nextId(collection) {
    const items = this.state[collection] || [];
    return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
  }

  enrichProduct(p) {
    const cat = this.state.categories.find((c) => c.id === p.category_id);
    return {
      ...p,
      category_name: cat ? cat.name : 'Umum',
      category_slug: cat ? cat.slug : 'umum',
    };
  }

  async getStoreSettings() {
    return { ...this.state.store_settings };
  }

  async updateStoreSettings(data) {
    return this.runLocked(() => {
      this.state.store_settings = {
        ...this.state.store_settings,
        ...data,
        id: 1,
      };
      this.saveSync();
      return { ...this.state.store_settings };
    });
  }

  async getCategories() {
    return this.state.categories.map((cat) => ({
      ...cat,
      product_count: this.state.products.filter((p) => p.category_id === cat.id && p.is_active).length,
    }));
  }

  async createCategory({ name, slug, image_url }) {
    return this.runLocked(() => {
      const cleanSlug = slugify(slug || name);
      if (this.state.categories.some((c) => c.name.toLowerCase() === name.toLowerCase() || c.slug === cleanSlug)) {
        const err = new Error('Nama atau slug kategori sudah digunakan.');
        err.code = 'DUPLICATE';
        throw err;
      }
      const created = {
        id: this.nextId('categories'),
        name: name.trim(),
        slug: cleanSlug,
        image_url: image_url || '/src/assets/images/dimsum_ayam_original_1795412486133.jpg',
        created_at: new Date().toISOString(),
      };
      this.state.categories.push(created);
      this.saveSync();
      return created;
    });
  }

  async updateCategory(id, { name, slug, image_url }) {
    return this.runLocked(() => {
      const idx = this.state.categories.findIndex((c) => c.id === id);
      if (idx === -1) return null;
      const cleanSlug = slugify(slug || name);
      if (
        this.state.categories.some(
          (c) => c.id !== id && (c.name.toLowerCase() === name.toLowerCase() || c.slug === cleanSlug)
        )
      ) {
        const err = new Error('Nama atau slug kategori sudah digunakan.');
        err.code = 'DUPLICATE';
        throw err;
      }
      this.state.categories[idx] = {
        ...this.state.categories[idx],
        name: name.trim(),
        slug: cleanSlug,
        image_url: image_url ?? this.state.categories[idx].image_url,
      };
      this.saveSync();
      return this.state.categories[idx];
    });
  }

  async deleteCategory(id) {
    return this.runLocked(() => {
      const inUse = this.state.products.some((p) => p.category_id === id);
      if (inUse) {
        const err = new Error('Kategori tidak dapat dihapus karena masih digunakan oleh produk.');
        err.code = 'IN_USE';
        throw err;
      }
      const prevLen = this.state.categories.length;
      this.state.categories = this.state.categories.filter((c) => c.id !== id);
      if (this.state.categories.length === prevLen) return false;
      this.saveSync();
      return true;
    });
  }

  async getProducts(filters = {}) {
    const {
      includeInactive = false,
      search = '',
      category = '',
      minPrice,
      maxPrice,
      bestSeller,
      promo,
      newArrival,
      inStock,
      sort = 'popular',
    } = filters;

    let list = this.state.products.map((p) => this.enrichProduct(p));
    if (!includeInactive) {
      list = list.filter((p) => p.is_active);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.category_name || '').toLowerCase().includes(q)
      );
    }
    if (category) {
      list = list.filter((p) => p.category_slug === category || String(p.category_id) === String(category));
    }
    if (minPrice !== undefined && minPrice !== null && minPrice !== '') {
      const min = Number(minPrice);
      if (!Number.isNaN(min)) {
        list = list.filter((p) => (p.is_promo && p.discount_price ? p.discount_price : p.price) >= min);
      }
    }
    if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') {
      const max = Number(maxPrice);
      if (!Number.isNaN(max)) {
        list = list.filter((p) => (p.is_promo && p.discount_price ? p.discount_price : p.price) <= max);
      }
    }
    if (bestSeller) list = list.filter((p) => p.is_best_seller);
    if (promo) list = list.filter((p) => p.is_promo);
    if (newArrival) list = list.filter((p) => p.is_new_arrival);
    if (inStock) list = list.filter((p) => p.stock > 0);

    const eff = (p) => (p.is_promo && p.discount_price ? p.discount_price : p.price);
    list.sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime() || b.id - a.id;
        case 'price_asc':
          return eff(a) - eff(b);
        case 'price_desc':
          return eff(b) - eff(a);
        case 'name_asc':
          return a.name.localeCompare(b.name, 'id');
        case 'popular':
        default:
          return (
            Number(b.is_best_seller) - Number(a.is_best_seller) ||
            Number(b.is_promo) - Number(a.is_promo) ||
            a.id - b.id
          );
      }
    });
    return list;
  }

  async getProductBySlug(slug) {
    const found = this.state.products.find((p) => p.slug === slug && p.is_active);
    if (!found) return null;
    const enriched = this.enrichProduct(found);
    const related = this.state.products
      .filter((p) => p.is_active && p.id !== found.id && (p.category_id === found.category_id || p.is_best_seller))
      .slice(0, 4)
      .map((p) => this.enrichProduct(p));
    return { product: enriched, related };
  }

  async getProductById(id) {
    const found = this.state.products.find((p) => p.id === id);
    return found ? this.enrichProduct(found) : null;
  }

  async createProduct(data) {
    return this.runLocked(() => {
      let baseSlug = slugify(data.slug || data.name);
      if (!baseSlug) baseSlug = `produk-${Date.now()}`;
      let uniqueSlug = baseSlug;
      let counter = 1;
      while (this.state.products.some((p) => p.slug === uniqueSlug)) {
        uniqueSlug = `${baseSlug}-${counter++}`;
      }
      const now = new Date().toISOString();
      const created = {
        id: this.nextId('products'),
        category_id: Number(data.category_id),
        name: data.name.trim(),
        slug: uniqueSlug,
        description: data.description || '',
        price: Number(data.price),
        discount_price: data.discount_price ? Number(data.discount_price) : null,
        is_promo: Boolean(data.is_promo),
        is_best_seller: Boolean(data.is_best_seller),
        is_new_arrival: Boolean(data.is_new_arrival),
        is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
        stock: Number(data.stock),
        unit_info: data.unit_info || '5 pcs',
        variant: data.variant || '',
        serving_suggestion: data.serving_suggestion || '',
        image_url: data.image_url || '/src/assets/images/dimsum_ayam_original_1795412486133.jpg',
        created_at: now,
        updated_at: now,
      };
      this.state.products.push(created);
      this.saveSync();
      return this.enrichProduct(created);
    });
  }

  async updateProduct(id, data) {
    return this.runLocked(() => {
      const idx = this.state.products.findIndex((p) => p.id === id);
      if (idx === -1) return null;
      const existing = this.state.products[idx];
      let nextSlug = existing.slug;
      if (data.slug && slugify(data.slug) !== existing.slug) {
        let base = slugify(data.slug);
        let candidate = base;
        let i = 1;
        while (this.state.products.some((p) => p.id !== id && p.slug === candidate)) {
          candidate = `${base}-${i++}`;
        }
        nextSlug = candidate;
      }
      const updated = {
        ...existing,
        ...data,
        id,
        slug: nextSlug,
        category_id: data.category_id !== undefined ? Number(data.category_id) : existing.category_id,
        price: data.price !== undefined ? Number(data.price) : existing.price,
        discount_price:
          data.discount_price !== undefined ? (data.discount_price ? Number(data.discount_price) : null) : existing.discount_price,
        stock: data.stock !== undefined ? Number(data.stock) : existing.stock,
        updated_at: new Date().toISOString(),
      };
      this.state.products[idx] = updated;
      this.saveSync();
      return this.enrichProduct(updated);
    });
  }

  async updateProductStock(id, stock) {
    return this.runLocked(() => {
      const idx = this.state.products.findIndex((p) => p.id === id);
      if (idx === -1) return null;
      this.state.products[idx].stock = Math.max(0, Number(stock));
      this.state.products[idx].updated_at = new Date().toISOString();
      this.saveSync();
      return this.enrichProduct(this.state.products[idx]);
    });
  }

  async deleteProduct(id) {
    return this.runLocked(() => {
      const prevLen = this.state.products.length;
      this.state.products = this.state.products.filter((p) => p.id !== id);
      if (this.state.products.length === prevLen) return false;
      this.saveSync();
      return true;
    });
  }

  async validateCartItems(requestedItems) {
    const warnings = [];
    let hasChanges = false;
    const validatedItems = [];

    for (const reqItem of requestedItems) {
      const product = this.state.products.find((p) => p.id === Number(reqItem.productId));
      if (!product || !product.is_active) {
        hasChanges = true;
        warnings.push(`Produk #${reqItem.productId} sudah tidak tersedia dan dihapus dari keranjang.`);
        continue;
      }
      if (product.stock <= 0) {
        hasChanges = true;
        warnings.push(`Stok "${product.name}" sedang habis dan dihapus dari keranjang.`);
        continue;
      }
      let qty = Number(reqItem.quantity);
      if (qty > product.stock) {
        hasChanges = true;
        warnings.push(`Stok "${product.name}" tersisa ${product.stock} porsi. Kuantitas disesuaikan otomatis.`);
        qty = product.stock;
      }
      const unitPrice = product.is_promo && product.discount_price ? product.discount_price : product.price;
      if (reqItem.clientPrice !== undefined && Number(reqItem.clientPrice) !== unitPrice) {
        hasChanges = true;
        warnings.push(`Harga resmi "${product.name}" telah diperbarui menjadi Rp${unitPrice.toLocaleString('id-ID')}.`);
      }
      validatedItems.push({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        unitInfo: product.unit_info,
        imageUrl: product.image_url,
        originalPrice: product.price,
        unitPrice,
        isPromo: Boolean(product.is_promo && product.discount_price),
        stock: product.stock,
        quantity: qty,
        subtotal: unitPrice * qty,
      });
    }

    const subtotal = validatedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const settings = this.state.store_settings;
    return {
      items: validatedItems,
      subtotal,
      shippingFee: settings.shipping_fee || 0,
      whatsappNumber: settings.whatsapp_number,
      brandName: settings.brand_name,
      hasChanges,
      warnings,
    };
  }

  async createOrderAtomic(orderInput) {
    return this.runLocked(() => {
      const { customer_name, customer_phone, customer_address, delivery_method, notes, items } = orderInput;
      const lineItems = [];
      let subtotal = 0;

      // Verify all stocks first
      for (const reqItem of items) {
        const product = this.state.products.find((p) => p.id === Number(reqItem.productId));
        if (!product || !product.is_active) {
          const err = new Error('Salah satu produk tidak ditemukan atau tidak aktif.');
          err.statusCode = 400;
          throw err;
        }
        if (product.stock < reqItem.quantity) {
          const err = new Error(`Stok "${product.name}" tidak mencukupi (tersisa ${product.stock}).`);
          err.statusCode = 409;
          throw err;
        }
        const unitPrice = product.is_promo && product.discount_price ? product.discount_price : product.price;
        const lineSubtotal = unitPrice * reqItem.quantity;
        subtotal += lineSubtotal;
        lineItems.push({
          productId: product.id,
          name: product.name,
          unitInfo: product.unit_info,
          price: unitPrice,
          quantity: reqItem.quantity,
          subtotal: lineSubtotal,
        });
      }

      // Decrement stocks atomically
      const now = new Date().toISOString();
      for (const line of lineItems) {
        const product = this.state.products.find((p) => p.id === line.productId);
        product.stock -= line.quantity;
        product.updated_at = now;
      }

      const settings = this.state.store_settings;
      const shippingFee = delivery_method === 'Ambil Sendiri' ? 0 : Number(settings.shipping_fee || 0);
      const totalAmount = subtotal + shippingFee;
      const dateStr = now.slice(0, 10).replace(/-/g, '');
      const rand = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `DIR-${dateStr}-${rand}`;

      const createdOrder = {
        id: this.nextId('orders'),
        order_number: orderNumber,
        customer_name: customer_name.trim(),
        customer_phone: customer_phone.trim(),
        customer_address: customer_address.trim(),
        delivery_method,
        notes: (notes || '').trim(),
        items_json: lineItems,
        subtotal_amount: subtotal,
        shipping_fee: shippingFee,
        total_amount: totalAmount,
        status: 'Menunggu Konfirmasi',
        created_at: now,
      };

      this.state.orders.unshift(createdOrder);
      this.saveSync();
      return { order: createdOrder, settings };
    });
  }

  async getOrders() {
    return [...this.state.orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async updateOrderStatus(id, status) {
    return this.runLocked(() => {
      const idx = this.state.orders.findIndex((o) => o.id === id);
      if (idx === -1) return null;
      this.state.orders[idx].status = status;
      this.saveSync();
      return this.state.orders[idx];
    });
  }

  async getArticles(includeDrafts = false) {
    let list = [...this.state.articles];
    if (!includeDrafts) list = list.filter((a) => a.status === 'published');
    return list.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  }

  async getArticleBySlug(slug) {
    return this.state.articles.find((a) => a.slug === slug && a.status === 'published') || null;
  }

  async createArticle(data) {
    return this.runLocked(() => {
      let base = slugify(data.slug || data.title);
      let unique = base || `artikel-${Date.now()}`;
      let i = 1;
      while (this.state.articles.some((a) => a.slug === unique)) {
        unique = `${base}-${i++}`;
      }
      const created = {
        id: this.nextId('articles'),
        title: data.title.trim(),
        slug: unique,
        excerpt: data.excerpt || '',
        content: data.content || '',
        category: data.category || 'Tips Memasak',
        cover_url: data.cover_url || '/src/assets/images/article_steaming_guide_1795412487148.jpg',
        status: data.status === 'draft' ? 'draft' : 'published',
        published_at: new Date().toISOString(),
      };
      this.state.articles.unshift(created);
      this.saveSync();
      return created;
    });
  }

  async updateArticle(id, data) {
    return this.runLocked(() => {
      const idx = this.state.articles.findIndex((a) => a.id === id);
      if (idx === -1) return null;
      this.state.articles[idx] = {
        ...this.state.articles[idx],
        ...data,
        id,
      };
      this.saveSync();
      return this.state.articles[idx];
    });
  }

  async deleteArticle(id) {
    return this.runLocked(() => {
      const prev = this.state.articles.length;
      this.state.articles = this.state.articles.filter((a) => a.id !== id);
      if (this.state.articles.length === prev) return false;
      this.saveSync();
      return true;
    });
  }

  async getTestimonials(includeHidden = false) {
    let list = [...this.state.testimonials];
    if (!includeHidden) list = list.filter((t) => t.is_visible);
    return list;
  }

  async createTestimonial(data) {
    return this.runLocked(() => {
      const created = {
        id: this.nextId('testimonials'),
        customer_name: data.customer_name.trim(),
        role: data.role || 'Pelanggan',
        rating: Math.min(5, Math.max(1, Number(data.rating) || 5)),
        content: data.content.trim(),
        is_visible: data.is_visible !== undefined ? Boolean(data.is_visible) : true,
        is_demo: Boolean(data.is_demo),
      };
      this.state.testimonials.push(created);
      this.saveSync();
      return created;
    });
  }

  async updateTestimonial(id, data) {
    return this.runLocked(() => {
      const idx = this.state.testimonials.findIndex((t) => t.id === id);
      if (idx === -1) return null;
      this.state.testimonials[idx] = {
        ...this.state.testimonials[idx],
        ...data,
        id,
      };
      this.saveSync();
      return this.state.testimonials[idx];
    });
  }

  async deleteTestimonial(id) {
    return this.runLocked(() => {
      const prev = this.state.testimonials.length;
      this.state.testimonials = this.state.testimonials.filter((t) => t.id !== id);
      if (this.state.testimonials.length === prev) return false;
      this.saveSync();
      return true;
    });
  }

  async getUserByUsername(username) {
    return this.state.users.find((u) => u.username === username) || null;
  }

  async getUserById(id) {
    return this.state.users.find((u) => u.id === id) || null;
  }

  async updateUserPassword(id, newPasswordHash) {
    return this.runLocked(() => {
      const user = this.state.users.find((u) => u.id === id);
      if (!user) return false;
      user.password_hash = newPasswordHash;
      this.saveSync();
      return true;
    });
  }

  async getAdminOverview() {
    const products = this.state.products.map((p) => this.enrichProduct(p));
    const orders = await this.getOrders();
    const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 5);
    const outOfStockProducts = products.filter((p) => p.stock === 0);
    return {
      totalProducts: products.length,
      totalCategories: this.state.categories.length,
      totalOrders: orders.length,
      availableProducts: products.filter((p) => p.is_active && p.stock > 0).length,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      lowStockProducts: [...outOfStockProducts, ...lowStockProducts].slice(0, 8),
      recentOrders: orders.slice(0, 6),
    };
  }

  async resetDemoData() {
    return this.runLocked(() => {
      const existingUsers = this.state.users;
      const fresh = createInitialSeedData();
      // Preserve existing admin password changes if already updated, or keep users intact
      fresh.users = existingUsers.length > 0 ? existingUsers : fresh.users;
      this.state = fresh;
      this.saveSync();
      return true;
    });
  }
}

class PostgresStore {
  constructor(databaseUrl) {
    const isUnixSocket = databaseUrl.includes('/cloudsql/') || databaseUrl.includes('host=/');
    const isLocalHost = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');
    const requiresSsl =
      databaseUrl.includes('sslmode=require') ||
      (process.env.NODE_ENV === 'production' && !isUnixSocket && !isLocalHost);

    this.pool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.PGSSLMODE === 'disable' || isUnixSocket ? false : requiresSsl ? { rejectUnauthorized: false } : false,
      max: 10,
      connectionTimeoutMillis: 15000,
    });
    this.pool.on('error', (err) => {
      console.error('Postgres pool idle client error:', err);
    });
  }

  async init() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(120) UNIQUE NOT NULL,
        slug VARCHAR(140) UNIQUE NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        category_id INTEGER REFERENCES categories(id),
        name VARCHAR(180) NOT NULL,
        slug VARCHAR(200) UNIQUE NOT NULL,
        description TEXT,
        price INTEGER NOT NULL,
        discount_price INTEGER,
        is_promo BOOLEAN DEFAULT FALSE,
        is_best_seller BOOLEAN DEFAULT FALSE,
        is_new_arrival BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        stock INTEGER NOT NULL DEFAULT 0,
        unit_info VARCHAR(80),
        variant VARCHAR(120),
        serving_suggestion TEXT,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(64) UNIQUE NOT NULL,
        customer_name VARCHAR(160) NOT NULL,
        customer_phone VARCHAR(40) NOT NULL,
        customer_address TEXT NOT NULL,
        delivery_method VARCHAR(60) NOT NULL,
        notes TEXT,
        items_json JSONB NOT NULL,
        total_amount INTEGER NOT NULL,
        status VARCHAR(60) NOT NULL DEFAULT 'Menunggu Konfirmasi',
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(220) NOT NULL,
        slug VARCHAR(240) UNIQUE NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        category VARCHAR(100),
        cover_url TEXT,
        status VARCHAR(30) NOT NULL DEFAULT 'published',
        published_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(140) NOT NULL,
        role VARCHAR(140),
        rating INTEGER NOT NULL DEFAULT 5,
        content TEXT NOT NULL,
        is_visible BOOLEAN DEFAULT TRUE,
        is_demo BOOLEAN DEFAULT TRUE
      );
      CREATE TABLE IF NOT EXISTS store_settings (
        id INTEGER PRIMARY KEY,
        brand_name VARCHAR(180),
        description TEXT,
        whatsapp_number VARCHAR(40),
        address TEXT,
        operational_hours VARCHAR(160),
        instagram VARCHAR(120),
        tiktok VARCHAR(120),
        shipping_info TEXT,
        shipping_fee INTEGER DEFAULT 0
      );
    `);

    await this.seedIfEmpty();
  }

  async seedIfEmpty(forceDemoReset = false) {
    const seed = createInitialSeedData();
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const { rows: userCountRows } = await client.query('SELECT COUNT(*)::int AS cnt FROM users');
      if (userCountRows[0].cnt === 0) {
        const u = seed.users[0];
        await client.query(
          'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) ON CONFLICT (username) DO NOTHING',
          [u.username, u.password_hash, u.role]
        );
      }

      if (forceDemoReset) {
        await client.query('TRUNCATE TABLE orders, products, categories, articles, testimonials, store_settings RESTART IDENTITY CASCADE');
      }

      const { rows: settingsRows } = await client.query('SELECT COUNT(*)::int AS cnt FROM store_settings');
      if (settingsRows[0].cnt === 0) {
        const s = seed.store_settings;
        await client.query(
          `INSERT INTO store_settings (id, brand_name, description, whatsapp_number, address, operational_hours, instagram, tiktok, shipping_info, shipping_fee)
           VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [s.brand_name, s.description, s.whatsapp_number, s.address, s.operational_hours, s.instagram, s.tiktok, s.shipping_info, s.shipping_fee]
        );
      }

      const { rows: catCountRows } = await client.query('SELECT COUNT(*)::int AS cnt FROM categories');
      if (catCountRows[0].cnt === 0) {
        const catIdMap = {};
        for (const c of seed.categories) {
          const res = await client.query(
            'INSERT INTO categories (name, slug, image_url) VALUES ($1, $2, $3) RETURNING id',
            [c.name, c.slug, c.image_url]
          );
          catIdMap[c.id] = res.rows[0].id;
        }
        for (const p of seed.products) {
          await client.query(
            `INSERT INTO products (category_id, name, slug, description, price, discount_price, is_promo, is_best_seller, is_new_arrival, is_active, stock, unit_info, variant, serving_suggestion, image_url)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
            [
              catIdMap[p.category_id],
              p.name,
              p.slug,
              p.description,
              p.price,
              p.discount_price,
              p.is_promo,
              p.is_best_seller,
              p.is_new_arrival,
              p.is_active,
              p.stock,
              p.unit_info,
              p.variant,
              p.serving_suggestion,
              p.image_url,
            ]
          );
        }
      }

      const { rows: artRows } = await client.query('SELECT COUNT(*)::int AS cnt FROM articles');
      if (artRows[0].cnt === 0) {
        for (const a of seed.articles) {
          await client.query(
            `INSERT INTO articles (title, slug, excerpt, content, category, cover_url, status, published_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [a.title, a.slug, a.excerpt, a.content, a.category, a.cover_url, a.status, a.published_at]
          );
        }
      }

      const { rows: testRows } = await client.query('SELECT COUNT(*)::int AS cnt FROM testimonials');
      if (testRows[0].cnt === 0) {
        for (const t of seed.testimonials) {
          await client.query(
            `INSERT INTO testimonials (customer_name, role, rating, content, is_visible, is_demo)
             VALUES ($1,$2,$3,$4,$5,$6)`,
            [t.customer_name, t.role, t.rating, t.content, t.is_visible, t.is_demo]
          );
        }
      }

      const { rows: ordRows } = await client.query('SELECT COUNT(*)::int AS cnt FROM orders');
      if (ordRows[0].cnt === 0) {
        const o = seed.orders[0];
        await client.query(
          `INSERT INTO orders (order_number, customer_name, customer_phone, customer_address, delivery_method, notes, items_json, total_amount, status, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10)`,
          [o.order_number, o.customer_name, o.customer_phone, o.customer_address, o.delivery_method, o.notes, JSON.stringify(o.items_json), o.total_amount, o.status, o.created_at]
        );
      }

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async getStoreSettings() {
    const { rows } = await this.pool.query('SELECT * FROM store_settings WHERE id = 1');
    return rows[0];
  }

  async updateStoreSettings(data) {
    const current = await this.getStoreSettings();
    const merged = { ...current, ...data };
    const { rows } = await this.pool.query(
      `UPDATE store_settings
       SET brand_name=$1, description=$2, whatsapp_number=$3, address=$4, operational_hours=$5, instagram=$6, tiktok=$7, shipping_info=$8, shipping_fee=$9
       WHERE id = 1 RETURNING *`,
      [
        merged.brand_name,
        merged.description,
        merged.whatsapp_number,
        merged.address,
        merged.operational_hours,
        merged.instagram,
        merged.tiktok,
        merged.shipping_info,
        Number(merged.shipping_fee) || 0,
      ]
    );
    return rows[0];
  }

  async getCategories() {
    const { rows } = await this.pool.query(`
      SELECT c.*, COUNT(p.id) FILTER (WHERE p.is_active = TRUE)::int AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.id ASC
    `);
    return rows;
  }

  async createCategory({ name, slug, image_url }) {
    const cleanSlug = slugify(slug || name);
    try {
      const { rows } = await this.pool.query(
        'INSERT INTO categories (name, slug, image_url) VALUES ($1, $2, $3) RETURNING *',
        [name.trim(), cleanSlug, image_url || '/src/assets/images/dimsum_ayam_original_1795412486133.jpg']
      );
      return rows[0];
    } catch (err) {
      if (err.code === '23505') {
        const dup = new Error('Nama atau slug kategori sudah digunakan.');
        dup.code = 'DUPLICATE';
        throw dup;
      }
      throw err;
    }
  }

  async updateCategory(id, { name, slug, image_url }) {
    const cleanSlug = slugify(slug || name);
    try {
      const { rows } = await this.pool.query(
        'UPDATE categories SET name=$1, slug=$2, image_url=COALESCE($3, image_url) WHERE id=$4 RETURNING *',
        [name.trim(), cleanSlug, image_url || null, id]
      );
      return rows[0] || null;
    } catch (err) {
      if (err.code === '23505') {
        const dup = new Error('Nama atau slug kategori sudah digunakan.');
        dup.code = 'DUPLICATE';
        throw dup;
      }
      throw err;
    }
  }

  async deleteCategory(id) {
    const { rows: used } = await this.pool.query('SELECT id FROM products WHERE category_id = $1 LIMIT 1', [id]);
    if (used.length > 0) {
      const err = new Error('Kategori tidak dapat dihapus karena masih digunakan oleh produk.');
      err.code = 'IN_USE';
      throw err;
    }
    const { rowCount } = await this.pool.query('DELETE FROM categories WHERE id = $1', [id]);
    return rowCount > 0;
  }

  async getProducts(filters = {}) {
    const {
      includeInactive = false,
      search = '',
      category = '',
      minPrice,
      maxPrice,
      bestSeller,
      promo,
      newArrival,
      inStock,
      sort = 'popular',
    } = filters;

    const conditions = [];
    const params = [];
    let idx = 1;

    if (!includeInactive) {
      conditions.push('p.is_active = TRUE');
    }
    if (search) {
      conditions.push(`(p.name ILIKE $${idx} OR p.description ILIKE $${idx} OR c.name ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (category) {
      conditions.push(`(c.slug = $${idx} OR p.category_id::text = $${idx})`);
      params.push(String(category));
      idx++;
    }
    if (minPrice !== undefined && minPrice !== null && minPrice !== '') {
      const min = Number(minPrice);
      if (!Number.isNaN(min)) {
        conditions.push(`COALESCE(NULLIF(CASE WHEN p.is_promo THEN p.discount_price ELSE NULL END, 0), p.price) >= $${idx}`);
        params.push(min);
        idx++;
      }
    }
    if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') {
      const max = Number(maxPrice);
      if (!Number.isNaN(max)) {
        conditions.push(`COALESCE(NULLIF(CASE WHEN p.is_promo THEN p.discount_price ELSE NULL END, 0), p.price) <= $${idx}`);
        params.push(max);
        idx++;
      }
    }
    if (bestSeller) conditions.push('p.is_best_seller = TRUE');
    if (promo) conditions.push('p.is_promo = TRUE');
    if (newArrival) conditions.push('p.is_new_arrival = TRUE');
    if (inStock) conditions.push('p.stock > 0');

    let orderBy = 'p.is_best_seller DESC, p.is_promo DESC, p.id ASC';
    if (sort === 'newest') orderBy = 'p.created_at DESC, p.id DESC';
    else if (sort === 'price_asc') orderBy = 'COALESCE(CASE WHEN p.is_promo THEN p.discount_price ELSE NULL END, p.price) ASC';
    else if (sort === 'price_desc') orderBy = 'COALESCE(CASE WHEN p.is_promo THEN p.discount_price ELSE NULL END, p.price) DESC';
    else if (sort === 'name_asc') orderBy = 'p.name ASC';

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await this.pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       ${whereClause}
       ORDER BY ${orderBy}`,
      params
    );
    return rows;
  }

  async getProductBySlug(slug) {
    const { rows } = await this.pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.slug = $1 AND p.is_active = TRUE`,
      [slug]
    );
    if (!rows[0]) return null;
    const product = rows[0];
    const { rows: related } = await this.pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.is_active = TRUE AND p.id <> $1 AND (p.category_id = $2 OR p.is_best_seller = TRUE)
       ORDER BY (p.category_id = $2) DESC, p.is_best_seller DESC
       LIMIT 4`,
      [product.id, product.category_id]
    );
    return { product, related };
  }

  async getProductById(id) {
    const { rows } = await this.pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async createProduct(data) {
    let baseSlug = slugify(data.slug || data.name) || `produk-${Date.now()}`;
    let uniqueSlug = baseSlug;
    let i = 1;
    while (true) {
      const { rows: exist } = await this.pool.query('SELECT id FROM products WHERE slug = $1', [uniqueSlug]);
      if (exist.length === 0) break;
      uniqueSlug = `${baseSlug}-${i++}`;
    }
    const { rows } = await this.pool.query(
      `INSERT INTO products (category_id, name, slug, description, price, discount_price, is_promo, is_best_seller, is_new_arrival, is_active, stock, unit_info, variant, serving_suggestion, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING id`,
      [
        Number(data.category_id),
        data.name.trim(),
        uniqueSlug,
        data.description || '',
        Number(data.price),
        data.discount_price ? Number(data.discount_price) : null,
        Boolean(data.is_promo),
        Boolean(data.is_best_seller),
        Boolean(data.is_new_arrival),
        data.is_active !== undefined ? Boolean(data.is_active) : true,
        Number(data.stock),
        data.unit_info || '5 pcs',
        data.variant || '',
        data.serving_suggestion || '',
        data.image_url || '/src/assets/images/dimsum_ayam_original_1795412486133.jpg',
      ]
    );
    return this.getProductById(rows[0].id);
  }

  async updateProduct(id, data) {
    const existing = await this.getProductById(id);
    if (!existing) return null;
    let nextSlug = existing.slug;
    if (data.slug && slugify(data.slug) !== existing.slug) {
      const base = slugify(data.slug);
      let candidate = base;
      let i = 1;
      while (true) {
        const { rows: exist } = await this.pool.query('SELECT id FROM products WHERE slug = $1 AND id <> $2', [candidate, id]);
        if (exist.length === 0) break;
        candidate = `${base}-${i++}`;
      }
      nextSlug = candidate;
    }

    await this.pool.query(
      `UPDATE products
       SET category_id=$1, name=$2, slug=$3, description=$4, price=$5, discount_price=$6, is_promo=$7, is_best_seller=$8, is_new_arrival=$9, is_active=$10, stock=$11, unit_info=$12, variant=$13, serving_suggestion=$14, image_url=$15, updated_at=NOW()
       WHERE id=$16`,
      [
        data.category_id !== undefined ? Number(data.category_id) : existing.category_id,
        data.name !== undefined ? data.name.trim() : existing.name,
        nextSlug,
        data.description !== undefined ? data.description : existing.description,
        data.price !== undefined ? Number(data.price) : existing.price,
        data.discount_price !== undefined ? (data.discount_price ? Number(data.discount_price) : null) : existing.discount_price,
        data.is_promo !== undefined ? Boolean(data.is_promo) : existing.is_promo,
        data.is_best_seller !== undefined ? Boolean(data.is_best_seller) : existing.is_best_seller,
        data.is_new_arrival !== undefined ? Boolean(data.is_new_arrival) : existing.is_new_arrival,
        data.is_active !== undefined ? Boolean(data.is_active) : existing.is_active,
        data.stock !== undefined ? Number(data.stock) : existing.stock,
        data.unit_info !== undefined ? data.unit_info : existing.unit_info,
        data.variant !== undefined ? data.variant : existing.variant,
        data.serving_suggestion !== undefined ? data.serving_suggestion : existing.serving_suggestion,
        data.image_url !== undefined ? data.image_url : existing.image_url,
        id,
      ]
    );
    return this.getProductById(id);
  }

  async updateProductStock(id, stock) {
    const { rowCount } = await this.pool.query(
      'UPDATE products SET stock = $1, updated_at = NOW() WHERE id = $2',
      [Math.max(0, Number(stock)), id]
    );
    if (rowCount === 0) return null;
    return this.getProductById(id);
  }

  async deleteProduct(id) {
    const { rowCount } = await this.pool.query('DELETE FROM products WHERE id = $1', [id]);
    return rowCount > 0;
  }

  async validateCartItems(requestedItems) {
    const warnings = [];
    let hasChanges = false;
    const validatedItems = [];

    for (const reqItem of requestedItems) {
      const product = await this.getProductById(Number(reqItem.productId));
      if (!product || !product.is_active) {
        hasChanges = true;
        warnings.push(`Produk #${reqItem.productId} sudah tidak tersedia dan dihapus dari keranjang.`);
        continue;
      }
      if (product.stock <= 0) {
        hasChanges = true;
        warnings.push(`Stok "${product.name}" sedang habis dan dihapus dari keranjang.`);
        continue;
      }
      let qty = Number(reqItem.quantity);
      if (qty > product.stock) {
        hasChanges = true;
        warnings.push(`Stok "${product.name}" tersisa ${product.stock} porsi. Kuantitas disesuaikan otomatis.`);
        qty = product.stock;
      }
      const unitPrice = product.is_promo && product.discount_price ? product.discount_price : product.price;
      if (reqItem.clientPrice !== undefined && Number(reqItem.clientPrice) !== unitPrice) {
        hasChanges = true;
        warnings.push(`Harga resmi "${product.name}" telah diperbarui menjadi Rp${unitPrice.toLocaleString('id-ID')}.`);
      }
      validatedItems.push({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        unitInfo: product.unit_info,
        imageUrl: product.image_url,
        originalPrice: product.price,
        unitPrice,
        isPromo: Boolean(product.is_promo && product.discount_price),
        stock: product.stock,
        quantity: qty,
        subtotal: unitPrice * qty,
      });
    }

    const subtotal = validatedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const settings = await this.getStoreSettings();
    return {
      items: validatedItems,
      subtotal,
      shippingFee: settings.shipping_fee || 0,
      whatsappNumber: settings.whatsapp_number,
      brandName: settings.brand_name,
      hasChanges,
      warnings,
    };
  }

  async createOrderAtomic(orderInput) {
    const { customer_name, customer_phone, customer_address, delivery_method, notes, items } = orderInput;
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const lineItems = [];
      let subtotal = 0;

      for (const reqItem of items) {
        const { rows } = await client.query(
          'SELECT * FROM products WHERE id = $1 FOR UPDATE',
          [Number(reqItem.productId)]
        );
        const product = rows[0];
        if (!product || !product.is_active) {
          const err = new Error('Salah satu produk tidak ditemukan atau tidak aktif.');
          err.statusCode = 400;
          throw err;
        }
        if (product.stock < reqItem.quantity) {
          const err = new Error(`Stok "${product.name}" tidak mencukupi (tersisa ${product.stock}).`);
          err.statusCode = 409;
          throw err;
        }
        const unitPrice = product.is_promo && product.discount_price ? product.discount_price : product.price;
        const lineSubtotal = unitPrice * reqItem.quantity;
        subtotal += lineSubtotal;

        await client.query(
          'UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2',
          [reqItem.quantity, product.id]
        );

        lineItems.push({
          productId: product.id,
          name: product.name,
          unitInfo: product.unit_info,
          price: unitPrice,
          quantity: reqItem.quantity,
          subtotal: lineSubtotal,
        });
      }

      const { rows: settingsRows } = await client.query('SELECT * FROM store_settings WHERE id = 1');
      const settings = settingsRows[0];
      const shippingFee = delivery_method === 'Ambil Sendiri' ? 0 : Number(settings.shipping_fee || 0);
      const totalAmount = subtotal + shippingFee;
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const rand = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `DIR-${dateStr}-${rand}`;

      const { rows: orderRows } = await client.query(
        `INSERT INTO orders (order_number, customer_name, customer_phone, customer_address, delivery_method, notes, items_json, total_amount, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,'Menunggu Konfirmasi')
         RETURNING *`,
        [
          orderNumber,
          customer_name.trim(),
          customer_phone.trim(),
          customer_address.trim(),
          delivery_method,
          (notes || '').trim(),
          JSON.stringify(lineItems),
          totalAmount,
        ]
      );

      await client.query('COMMIT');
      return {
        order: { ...orderRows[0], subtotal_amount: subtotal, shipping_fee: shippingFee },
        settings,
      };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async getOrders() {
    const { rows } = await this.pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    return rows;
  }

  async updateOrderStatus(id, status) {
    const { rows } = await this.pool.query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    return rows[0] || null;
  }

  async getArticles(includeDrafts = false) {
    const where = includeDrafts ? '' : "WHERE status = 'published'";
    const { rows } = await this.pool.query(`SELECT * FROM articles ${where} ORDER BY published_at DESC`);
    return rows;
  }

  async getArticleBySlug(slug) {
    const { rows } = await this.pool.query("SELECT * FROM articles WHERE slug = $1 AND status = 'published'", [slug]);
    return rows[0] || null;
  }

  async createArticle(data) {
    let base = slugify(data.slug || data.title) || `artikel-${Date.now()}`;
    let unique = base;
    let i = 1;
    while (true) {
      const { rows } = await this.pool.query('SELECT id FROM articles WHERE slug = $1', [unique]);
      if (rows.length === 0) break;
      unique = `${base}-${i++}`;
    }
    const { rows } = await this.pool.query(
      `INSERT INTO articles (title, slug, excerpt, content, category, cover_url, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [
        data.title.trim(),
        unique,
        data.excerpt || '',
        data.content || '',
        data.category || 'Tips Memasak',
        data.cover_url || '/src/assets/images/article_steaming_guide_1795412487148.jpg',
        data.status === 'draft' ? 'draft' : 'published',
      ]
    );
    return rows[0];
  }

  async updateArticle(id, data) {
    const { rows: curRows } = await this.pool.query('SELECT * FROM articles WHERE id = $1', [id]);
    if (!curRows[0]) return null;
    const cur = curRows[0];
    const { rows } = await this.pool.query(
      `UPDATE articles SET title=$1, excerpt=$2, content=$3, category=$4, cover_url=$5, status=$6 WHERE id=$7 RETURNING *`,
      [
        data.title !== undefined ? data.title.trim() : cur.title,
        data.excerpt !== undefined ? data.excerpt : cur.excerpt,
        data.content !== undefined ? data.content : cur.content,
        data.category !== undefined ? data.category : cur.category,
        data.cover_url !== undefined ? data.cover_url : cur.cover_url,
        data.status !== undefined ? data.status : cur.status,
        id,
      ]
    );
    return rows[0];
  }

  async deleteArticle(id) {
    const { rowCount } = await this.pool.query('DELETE FROM articles WHERE id = $1', [id]);
    return rowCount > 0;
  }

  async getTestimonials(includeHidden = false) {
    const where = includeHidden ? '' : 'WHERE is_visible = TRUE';
    const { rows } = await this.pool.query(`SELECT * FROM testimonials ${where} ORDER BY id ASC`);
    return rows;
  }

  async createTestimonial(data) {
    const { rows } = await this.pool.query(
      `INSERT INTO testimonials (customer_name, role, rating, content, is_visible, is_demo)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [
        data.customer_name.trim(),
        data.role || 'Pelanggan',
        Math.min(5, Math.max(1, Number(data.rating) || 5)),
        data.content.trim(),
        data.is_visible !== undefined ? Boolean(data.is_visible) : true,
        Boolean(data.is_demo),
      ]
    );
    return rows[0];
  }

  async updateTestimonial(id, data) {
    const { rows: curRows } = await this.pool.query('SELECT * FROM testimonials WHERE id = $1', [id]);
    if (!curRows[0]) return null;
    const cur = curRows[0];
    const { rows } = await this.pool.query(
      `UPDATE testimonials SET customer_name=$1, role=$2, rating=$3, content=$4, is_visible=$5, is_demo=$6 WHERE id=$7 RETURNING *`,
      [
        data.customer_name !== undefined ? data.customer_name.trim() : cur.customer_name,
        data.role !== undefined ? data.role : cur.role,
        data.rating !== undefined ? Math.min(5, Math.max(1, Number(data.rating))) : cur.rating,
        data.content !== undefined ? data.content.trim() : cur.content,
        data.is_visible !== undefined ? Boolean(data.is_visible) : cur.is_visible,
        data.is_demo !== undefined ? Boolean(data.is_demo) : cur.is_demo,
        id,
      ]
    );
    return rows[0];
  }

  async deleteTestimonial(id) {
    const { rowCount } = await this.pool.query('DELETE FROM testimonials WHERE id = $1', [id]);
    return rowCount > 0;
  }

  async getUserByUsername(username) {
    const { rows } = await this.pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return rows[0] || null;
  }

  async getUserById(id) {
    const { rows } = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0] || null;
  }

  async updateUserPassword(id, newPasswordHash) {
    const { rowCount } = await this.pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPasswordHash, id]);
    return rowCount > 0;
  }

  async getAdminOverview() {
    const [
      { rows: prodStats },
      { rows: catCount },
      { rows: ordCount },
      { rows: lowStock },
      { rows: recentOrders },
    ] = await Promise.all([
      this.pool.query(`
        SELECT
          COUNT(*)::int AS total_products,
          COUNT(*) FILTER (WHERE is_active = TRUE AND stock > 0)::int AS available_products,
          COUNT(*) FILTER (WHERE stock > 0 AND stock <= 5)::int AS low_stock_count,
          COUNT(*) FILTER (WHERE stock = 0)::int AS out_of_stock_count
        FROM products
      `),
      this.pool.query('SELECT COUNT(*)::int AS cnt FROM categories'),
      this.pool.query('SELECT COUNT(*)::int AS cnt FROM orders'),
      this.pool.query(`
        SELECT p.*, c.name AS category_name
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.stock <= 5
        ORDER BY p.stock ASC, p.id ASC
        LIMIT 8
      `),
      this.pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 6'),
    ]);

    return {
      totalProducts: prodStats[0].total_products,
      totalCategories: catCount[0].cnt,
      totalOrders: ordCount[0].cnt,
      availableProducts: prodStats[0].available_products,
      lowStockCount: prodStats[0].low_stock_count,
      outOfStockCount: prodStats[0].out_of_stock_count,
      lowStockProducts: lowStock,
      recentOrders,
    };
  }

  async resetDemoData() {
    await this.seedIfEmpty(true);
    return true;
  }
}

let dbInstance = null;

export async function initDatabase() {
  if (dbInstance) return dbInstance;
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (databaseUrl) {
    try {
      const pgStore = new PostgresStore(databaseUrl);
      await pgStore.init();
      console.log('Database connected: PostgreSQL (DATABASE_URL)');
      dbInstance = pgStore;
      return dbInstance;
    } catch (err) {
      console.error('PostgreSQL connection failed, falling back to local persistence:', err.message);
    }
  }

  const localStore = new LocalFileStore(path.resolve(process.cwd(), '.data', 'dapur-dimsum.json'));
  await localStore.init();
  console.log('Database ready: Local relational fallback (.data/dapur-dimsum.json)');
  dbInstance = localStore;
  return dbInstance;
}
