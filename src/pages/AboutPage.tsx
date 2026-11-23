import { Link } from 'react-router-dom';
import { MapPin, Clock, MessageCircle, Award, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { normalizeWhatsappNumber } from '../utils/format.ts';
import { SafeImage } from '../components/SafeImage.tsx';

export function AboutPage() {
  const { settings } = useStore();
  const waHref = `https://wa.me/${normalizeWhatsappNumber(settings.whatsapp_number)}?text=${encodeURIComponent(
    `Halo ${settings.brand_name}, saya ingin menanyakan pemesanan atau kerja sama acara.`
  )}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-white rounded-3xl border border-[#CFB799]/50 overflow-hidden">
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center">
          <p className="text-xs sm:text-sm font-semibold text-[#838655] mb-2">Kisah Dapur Kami</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#26351F] leading-tight mb-4">
            Tentang {settings.brand_name}
          </h1>
          <p className="text-base text-[#333333] leading-relaxed mb-4">{settings.description}</p>
          <p className="text-sm sm:text-base text-[#333333]/85 leading-relaxed mb-6">
            Setiap potong dimsum dibentuk manual setiap pagi dengan takaran daging yang dominan, kulit pangsit lentur racikan sendiri, dan dikukus dalam klakat bambu agar aromanya tetap terjaga hingga sampai di meja makan Anda.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/products"
              className="min-h-[44px] inline-flex items-center px-5 py-2.5 rounded-xl bg-[#DDAE35] text-[#26351F] font-bold text-sm"
            >
              Jelajahi Menu Kami
            </Link>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#26351F] text-white font-semibold text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Hubungi Dapur via WhatsApp</span>
            </a>
          </div>
        </div>

        <div className="lg:col-span-6 min-h-[300px] relative">
          <SafeImage
            src="/src/assets/images/article_steaming_guide_1795412487148.jpg"
            alt="Proses pengukusan dimsum segar di Dapur Ibu Raka"
            className="w-full h-full object-cover lg:absolute lg:inset-0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-[#CFB799]/45 p-6">
          <Award className="w-6 h-6 text-[#838655] mb-3" />
          <h2 className="font-display text-xl font-bold text-[#26351F] mb-2">100% Bahan Halal &amp; Segar</h2>
          <p className="text-sm text-[#333333]/85 leading-relaxed">
            Menggunakan daging ayam segar harian bersertifikat halal, udang kupas pilihan, serta sayuran segar tanpa pengenyal sintetis.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#CFB799]/45 p-6">
          <MapPin className="w-6 h-6 text-[#838655] mb-3" />
          <h2 className="font-display text-xl font-bold text-[#26351F] mb-2">Lokasi Dapur</h2>
          <p className="text-sm text-[#333333]/85 leading-relaxed">{settings.address}</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#CFB799]/45 p-6">
          <Clock className="w-6 h-6 text-[#838655] mb-3" />
          <h2 className="font-display text-xl font-bold text-[#26351F] mb-2">Jam Operasional &amp; Kirim</h2>
          <p className="text-sm text-[#333333]/85 leading-relaxed mb-1">{settings.operational_hours}</p>
          <p className="text-xs text-[#333333]/70">{settings.shipping_info}</p>
        </div>
      </div>
    </div>
  );
}
