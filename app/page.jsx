'use client';

import React, { useState, useEffect } from 'react';
import { 
  Menu, X, MapPin, Phone, Mail, Award, BookOpen, 
  Users, Heart, ChevronRight, CheckCircle, Trash2, 
  Download, Eye, Lock, FileText, Image as ImageIcon
} from 'lucide-react';

// --- Firebase Setup ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';

// Konfigurasi ini nantinya bisa Anda isi di Environment Variables Vercel (.env.local)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "dummy_api_key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dummy_auth_domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dummy_project_id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dummy_storage_bucket",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "dummy_sender_id",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "dummy_app_id"
};

let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn("Firebase belum diatur sepenuhnya. Silakan masukkan konfigurasi Firebase Anda di Vercel.");
}

const appId = 'sdn-050577-app';

export default function Page() {
  const [activeTab, setActiveTab] = useState('beranda');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Authentication Effect
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Auth error:", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const navigateTo = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 flex flex-col">
      {/* Top Bar */}
      <div className="bg-green-800 text-yellow-50 text-sm py-2 px-4 md:px-8 flex justify-between items-center hidden md:flex">
        <div className="flex items-center space-x-4">
          <span className="flex items-center"><MapPin size={14} className="mr-1" /> Binjai, Sumatera Utara</span>
          <span className="flex items-center"><Phone size={14} className="mr-1" /> 0856 6826 9882</span>
        </div>
        <div>
          <span>Buka: Senin - Sabtu, 07:15 - 14:00 WIB</span>
        </div>
      </div>

      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center cursor-pointer" onClick={() => navigateTo('beranda')}>
              <div className="bg-green-700 text-white p-2 rounded-lg mr-3 shadow-sm">
                <BookOpen size={28} />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-green-700 leading-tight">SDN 050577</h1>
                <p className="text-xs text-gray-500 font-semibold tracking-wider">KABUPATEN LANGKAT</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <NavLink label="Beranda" isActive={activeTab === 'beranda'} onClick={() => navigateTo('beranda')} />
              <NavLink label="Profil" isActive={activeTab === 'profil'} onClick={() => navigateTo('profil')} />
              <NavLink label="Galeri" isActive={activeTab === 'galeri'} onClick={() => navigateTo('galeri')} />
              <NavLink label="Kontak" isActive={activeTab === 'kontak'} onClick={() => navigateTo('kontak')} />
              <NavLink label="Admin" isActive={activeTab === 'admin'} onClick={() => navigateTo('admin')} />
              <button 
                onClick={() => navigateTo('ppdb')}
                className="bg-yellow-400 hover:bg-yellow-500 text-green-900 font-bold py-2.5 px-6 rounded-full shadow-lg transition duration-300 transform hover:scale-105"
              >
                PPDB Online
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-green-700 hover:text-green-900 focus:outline-none p-2"
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-green-50 border-t border-green-100 px-4 pt-2 pb-6 space-y-1 shadow-inner absolute w-full left-0 z-50">
            <MobileNavLink label="Beranda" onClick={() => navigateTo('beranda')} isActive={activeTab === 'beranda'} />
            <MobileNavLink label="Profil Sekolah" onClick={() => navigateTo('profil')} isActive={activeTab === 'profil'} />
            <MobileNavLink label="Galeri" onClick={() => navigateTo('galeri')} isActive={activeTab === 'galeri'} />
            <MobileNavLink label="Kontak" onClick={() => navigateTo('kontak')} isActive={activeTab === 'kontak'} />
            <MobileNavLink label="Admin Dashboard" onClick={() => navigateTo('admin')} isActive={activeTab === 'admin'} />
            <button 
              onClick={() => navigateTo('ppdb')}
              className="w-full mt-4 bg-yellow-400 text-green-900 font-bold py-3 px-4 rounded-xl shadow-md"
            >
              Daftar PPDB Online
            </button>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow">
        {activeTab === 'beranda' && <Beranda navigateTo={navigateTo} />}
        {activeTab === 'profil' && <Profil />}
        {activeTab === 'ppdb' && <PPDB user={user} db={db} />}
        {activeTab === 'admin' && <Admin user={user} db={db} />}
        {activeTab === 'galeri' && <Galeri />}
        {activeTab === 'kontak' && <Kontak />}
      </main>

      {/* Footer */}
      <footer className="bg-green-900 text-green-50 pt-12 pb-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-white text-green-800 p-1.5 rounded-lg mr-3">
                  <BookOpen size={24} />
                </div>
                <h2 className="text-2xl font-bold">SDN 050577</h2>
              </div>
              <p className="text-green-200 mb-4 text-sm leading-relaxed">
                Mewujudkan Generasi Cerdas, Berkarakter, dan Berprestasi melalui lingkungan belajar yang nyaman dan guru yang profesional.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-yellow-400 mb-4 border-b border-green-700 pb-2 inline-block">Alamat Sekolah</h3>
              <p className="flex items-start text-sm text-green-200 mb-2">
                <MapPin size={18} className="mr-2 mt-0.5 flex-shrink-0 text-yellow-400" />
                <span>JLN. P. KEMERDEKAAN, Kecamatan Binjai,<br/>Kabupaten Langkat, Provinsi Sumatera Utara,<br/>Indonesia.</span>
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-yellow-400 mb-4 border-b border-green-700 pb-2 inline-block">Hubungi Kami</h3>
              <p className="flex items-center text-sm text-green-200 mb-3">
                <Phone size={18} className="mr-2 text-yellow-400" />
                0856 6826 9882 (WhatsApp)
              </p>
              <a 
                href="https://wa.me/6285668269882" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center bg-green-700 hover:bg-green-600 border border-green-500 text-white text-sm py-2 px-4 rounded-full transition"
              >
                Chat WhatsApp Sekolah
              </a>
            </div>
          </div>
          <div className="border-t border-green-800 pt-8 text-center text-sm text-green-400">
            <p>&copy; {new Date().getFullYear()} SD NEGERI 050577. Hak Cipta Dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function NavLink({ label, isActive, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`font-semibold text-sm uppercase tracking-wide transition-colors duration-200 ${
        isActive ? 'text-green-700 border-b-2 border-green-600 pb-1' : 'text-gray-600 hover:text-green-600'
      }`}
    >
      {label}
    </button>
  );
}

function MobileNavLink({ label, isActive, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`block w-full text-left py-3 px-4 rounded-lg font-medium transition-colors ${
        isActive ? 'bg-green-100 text-green-800' : 'text-gray-700 hover:bg-green-100 hover:text-green-700'
      }`}
    >
      {label}
    </button>
  );
}

/* ================= PAGES (100% LENGKAP) ================= */

function Beranda({ navigateTo }) {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative bg-green-50 py-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="2" fill="#15803d" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pattern)" />
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0 lg:pr-12">
              <span className="inline-block py-1 px-3 rounded-full bg-yellow-200 text-yellow-800 font-bold text-xs tracking-wider mb-4 border border-yellow-300 shadow-sm">
                TAHUN AJARAN 2026/2027
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-green-800 leading-tight mb-6">
                Selamat Datang di <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-400">
                  SD NEGERI 050577
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto lg:mx-0 border-l-4 border-yellow-400 pl-4">
                "Mewujudkan Generasi Cerdas, Berkarakter, dan Berprestasi."
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                <button 
                  onClick={() => navigateTo('ppdb')}
                  className="bg-yellow-400 hover:bg-yellow-500 text-green-900 font-bold py-4 px-8 rounded-full shadow-lg transition transform hover:-translate-y-1 flex items-center justify-center"
                >
                  Daftar Siswa Baru <ChevronRight size={20} className="ml-2" />
                </button>
                <button 
                  onClick={() => navigateTo('kontak')}
                  className="bg-white hover:bg-gray-50 text-green-700 border-2 border-green-600 font-bold py-4 px-8 rounded-full shadow-sm transition flex items-center justify-center"
                >
                  Hubungi Sekolah
                </button>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="absolute -inset-4 bg-yellow-300 rounded-3xl transform rotate-3 opacity-30"></div>
              <img 
                src="https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Kegiatan Belajar Siswa" 
                className="relative rounded-3xl shadow-2xl object-cover h-[400px] w-full border-4 border-white"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Keunggulan Sekolah Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-green-800 mb-4">Keunggulan Sekolah Kami</h2>
            <div className="w-24 h-1 bg-yellow-400 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Users size={40} className="text-green-600" />}
              title="Guru Profesional"
              desc="Tenaga pendidik yang kompeten, berpengalaman, dan berdedikasi tinggi dalam mendidik siswa."
            />
            <FeatureCard 
              icon={<CheckCircle size={40} className="text-green-600" />}
              title="Lingkungan Belajar Nyaman"
              desc="Fasilitas yang memadai dengan lingkungan hijau yang mendukung konsentrasi belajar."
            />
            <FeatureCard 
              icon={<Heart size={40} className="text-green-600" />}
              title="Pendidikan Karakter"
              desc="Fokus pada pembentukan akhlak, kedisiplinan, dan etika siswa sedini mungkin."
            />
            <FeatureCard 
              icon={<Award size={40} className="text-green-600" />}
              title="Prestasi Siswa"
              desc="Mendukung dan memfasilitasi siswa untuk meraih prestasi di bidang akademik maupun non-akademik."
            />
          </div>
        </div>
      </section>

      {/* Call to Action Mini */}
      <section className="bg-green-700 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Penerimaan Peserta Didik Baru Telah Dibuka!</h2>
          <p className="text-green-100 mb-8">Segera daftarkan putra/putri Anda dan bergabung bersama keluarga besar SD Negeri 050577.</p>
          <button 
            onClick={() => navigateTo('ppdb')}
            className="bg-yellow-400 hover:bg-yellow-500 text-green-900 font-bold py-3 px-10 rounded-full shadow-lg transition text-lg"
          >
            Daftar Sekarang
          </button>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-yellow-50 rounded-2xl p-8 border border-yellow-100 shadow-sm hover:shadow-xl transition-shadow duration-300 text-center group">
      <div className="bg-white w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-inner mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-green-800 mb-3">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function Profil() {
  return (
    <div className="animate-fade-in bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-green-800 mb-4">Profil Sekolah</h1>
          <div className="w-24 h-1 bg-yellow-400 mx-auto rounded-full"></div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-12 border border-gray-100">
          <div className="p-8 md:p-12">
            <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center">
              <BookOpen className="mr-3 text-yellow-500" /> Sejarah Singkat
            </h2>
            <p className="text-gray-700 leading-relaxed mb-8">
              SD NEGERI 050577 berdiri dengan tujuan mulia untuk mencerdaskan anak bangsa di wilayah Kecamatan Binjai, Kabupaten Langkat. Sejak didirikan, sekolah ini terus berkomitmen memberikan layanan pendidikan dasar terbaik yang tidak hanya berfokus pada kecerdasan akademik, tetapi juga pembangunan karakter yang kuat berlandaskan nilai-nilai luhur budaya bangsa.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-green-50 p-6 rounded-2xl border-l-4 border-green-500">
                <h3 className="text-xl font-bold text-green-800 mb-3">Visi</h3>
                <p className="text-gray-700 italic">"Terwujudnya peserta didik yang religius, cerdas, terampil, berkarakter, dan peduli lingkungan."</p>
              </div>
              <div className="bg-yellow-50 p-6 rounded-2xl border-l-4 border-yellow-400">
                <h3 className="text-xl font-bold text-green-800 mb-3">Misi</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 text-sm">
                  <li>Menanamkan keimanan dan ketakwaan melalui pengamalan ajaran agama.</li>
                  <li>Mengoptimalkan proses pembelajaran yang aktif, inovatif, kreatif, dan menyenangkan.</li>
                  <li>Mengembangkan potensi bakat dan minat siswa melalui kegiatan ekstrakurikuler.</li>
                  <li>Membiasakan perilaku disiplin, jujur, sopan santun, dan berbudi pekerti luhur.</li>
                </ul>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-green-700 mb-6 flex items-center">
                <Award className="mr-3 text-yellow-500" /> Program Unggulan
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {['Tahfidz Qur\'an (Ekstrakurikuler)', 'Literasi Sekolah', 'Pramuka', 'Seni Tari Daerah', 'Olahraga Prestasi'].map((item, i) => (
                  <div key={i} className="flex items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <CheckCircle className="text-green-500 mr-3 flex-shrink-0" size={20} />
                    <span className="font-medium text-gray-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-green-700 mb-6 flex items-center">
                <MapPin className="mr-3 text-yellow-500" /> Fasilitas Sekolah
              </h2>
              <div className="flex flex-wrap gap-3">
                {['Ruang Kelas Nyaman', 'Perpustakaan Lengkap', 'UKS', 'Lapangan Olahraga', 'Mushola', 'Kantin Sehat', 'Taman Hijau'].map((item, i) => (
                  <span key={i} className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold border border-green-200">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PPDB({ user, db }) {
  const [formData, setFormData] = useState({
    namaSiswa: '', nisn: '', tempatLahir: '', tanggalLahir: '', jenisKelamin: 'Laki-laki',
    namaAyah: '', namaIbu: '', nomorHp: '', alamat: '', asalTk: '',
    kkFileName: '', aktaFileName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData(prev => ({ ...prev, [`${name}FileName`]: files[0].name }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!db) {
      alert("Sistem database belum terhubung secara sempurna. (Pastikan Firebase Config sudah terisi di production).");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const dbRef = collection(db, 'artifacts', appId, 'public', 'data', 'ppdb_applications');
      await addDoc(dbRef, {
        ...formData,
        createdAt: serverTimestamp(),
        userId: user ? user.uid : 'anonymous'
      });
      
      setSuccessMsg("Pendaftaran berhasil dikirim. Data akan diverifikasi oleh pihak sekolah.");
      setFormData({
        namaSiswa: '', nisn: '', tempatLahir: '', tanggalLahir: '', jenisKelamin: 'Laki-laki',
        namaAyah: '', namaIbu: '', nomorHp: '', alamat: '', asalTk: '',
        kkFileName: '', aktaFileName: ''
      });
      
      const kkInput = document.getElementById('kk');
      if (kkInput) kkInput.value = '';
      const aktaInput = document.getElementById('akta');
      if (aktaInput) aktaInput.value = '';
      
    } catch (error) {
      console.error("Error submitting form: ", error);
      alert("Terjadi kesalahan. Silakan coba lagi. Pastikan konfigurasi Firebase valid.");
    } finally {
      setIsSubmitting(false);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="animate-fade-in bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-green-800 mb-4">Pendaftaran Siswa Baru</h1>
          <p className="text-gray-600">Isi formulir di bawah ini dengan data yang sebenar-benarnya.</p>
        </div>

        {successMsg && (
          <div className="mb-8 bg-green-100 border-l-4 border-green-500 text-green-800 p-6 rounded-r-lg shadow-sm flex items-start">
            <CheckCircle className="mr-4 text-green-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-lg mb-1">Berhasil!</h3>
              <p>{successMsg}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-green-700 px-6 py-4">
            <h2 className="text-white font-bold text-lg flex items-center">
              <FileText className="mr-2" size={20} /> Formulir PPDB Online
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            
            {/* Data Siswa */}
            <div>
              <h3 className="text-lg font-bold text-yellow-600 mb-4 border-b pb-2">Data Siswa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap Siswa *</label>
                  <input required type="text" name="namaSiswa" value={formData.namaSiswa} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" placeholder="Sesuai Akta Kelahiran" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">NISN (Jika ada)</label>
                  <input type="text" name="nisn" value={formData.nisn} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" placeholder="Nomor Induk Siswa Nasional" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Jenis Kelamin *</label>
                  <select required name="jenisKelamin" value={formData.jenisKelamin} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-white">
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tempat Lahir *</label>
                  <input required type="text" name="tempatLahir" value={formData.tempatLahir} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal Lahir *</label>
                  <input required type="date" name="tanggalLahir" value={formData.tanggalLahir} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Asal TK / PAUD</label>
                  <input type="text" name="asalTk" value={formData.asalTk} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" placeholder="Nama sekolah sebelumnya (jika ada)" />
                </div>
              </div>
            </div>

            {/* Data Orang Tua */}
            <div>
              <h3 className="text-lg font-bold text-yellow-600 mb-4 border-b pb-2">Data Orang Tua & Kontak</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Ayah *</label>
                  <input required type="text" name="namaAyah" value={formData.namaAyah} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Ibu *</label>
                  <input required type="text" name="namaIbu" value={formData.namaIbu} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nomor HP / WhatsApp *</label>
                  <input required type="tel" name="nomorHp" value={formData.nomorHp} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" placeholder="08xx..." />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Alamat Rumah Lengkap *</label>
                  <textarea required name="alamat" value={formData.alamat} onChange={handleInputChange} rows="3" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"></textarea>
                </div>
              </div>
            </div>

            {/* Upload Berkas */}
            <div>
              <h3 className="text-lg font-bold text-yellow-600 mb-4 border-b pb-2">Upload Berkas</h3>
              <p className="text-xs text-gray-500 mb-4">* Format PDF atau JPG. (Sebagai simulasi, file tidak akan diunggah ke server sesungguhnya, hanya dicatat nama file-nya untuk keperluan demo).</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border-2 border-dashed border-green-300 rounded-xl p-6 text-center hover:bg-green-50 transition">
                  <FileText className="mx-auto text-green-500 mb-2" size={32} />
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Kartu Keluarga (KK) *</label>
                  <input required type="file" id="kk" name="kk" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200 cursor-pointer" />
                </div>
                <div className="border-2 border-dashed border-green-300 rounded-xl p-6 text-center hover:bg-green-50 transition">
                  <FileText className="mx-auto text-green-500 mb-2" size={32} />
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Akta Kelahiran *</label>
                  <input required type="file" id="akta" name="akta" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200 cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full text-lg font-bold py-4 rounded-xl shadow-lg transition flex justify-center items-center ${isSubmitting ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white transform hover:-translate-y-1'}`}
              >
                {isSubmitting ? 'Mengirim Data...' : 'Kirim Pendaftaran'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Admin({ user, db }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simple PIN check for admin area demo
  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert("PIN Salah! Hint: admin123");
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !user || !db) return;

    const dbRef = collection(db, 'artifacts', appId, 'public', 'data', 'ppdb_applications');
    const q = query(dbRef, orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApplications(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching data:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated, user, db]);

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'ppdb_applications', id));
      } catch (error) {
        console.error("Error deleting document: ", error);
        alert("Gagal menghapus data.");
      }
    }
  };

  const escapeCSV = (str) => `"${String(str || '').replace(/"/g, '""')}"`;

  const downloadCSV = () => {
    if (applications.length === 0) {
      alert("Tidak ada data untuk diunduh.");
      return;
    }

    const headers = ["Nama Siswa", "NISN", "Tempat Lahir", "Tanggal Lahir", "Jenis Kelamin", "Nama Ayah", "Nama Ibu", "Nomor HP", "Alamat", "Asal TK", "Tanggal Daftar"];
    const rows = applications.map(app => {
      const dateStr = app.createdAt?.toDate ? app.createdAt.toDate().toLocaleDateString('id-ID') : 'N/A';
      return [
        escapeCSV(app.namaSiswa), escapeCSV(app.nisn), escapeCSV(app.tempatLahir), escapeCSV(app.tanggalLahir),
        escapeCSV(app.jenisKelamin), escapeCSV(app.namaAyah), escapeCSV(app.namaIbu), escapeCSV(app.nomorHp),
        escapeCSV(app.alamat), escapeCSV(app.asalTk), escapeCSV(dateStr)
      ].join(",");
    });
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(",") + "\n" + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Data_Pendaftar_SDN050577.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-green-700" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Akses Admin</h2>
          <p className="text-gray-500 mb-6 text-sm">Masukkan PIN untuk mengakses dashboard (Hint: admin123)</p>
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 mb-4 focus:border-green-500 focus:outline-none text-center text-xl tracking-widest"
              placeholder="••••••••"
            />
            <button type="submit" className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-xl transition">
              Masuk
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in bg-gray-50 py-8 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-green-800">Dashboard Admin PPDB</h1>
            <p className="text-gray-600">Kelola data pendaftar siswa baru SD Negeri 050577</p>
          </div>
          <button 
            onClick={downloadCSV}
            className="flex items-center bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-2 px-6 rounded-lg shadow transition"
          >
            <Download size={18} className="mr-2" /> Download Data (CSV)
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-green-700 text-white text-sm uppercase tracking-wide">
                  <th className="py-4 px-6 font-semibold">Nama Siswa</th>
                  <th className="py-4 px-6 font-semibold">Orang Tua</th>
                  <th className="py-4 px-6 font-semibold">Nomor HP</th>
                  <th className="py-4 px-6 font-semibold">Asal TK</th>
                  <th className="py-4 px-6 font-semibold">Tanggal Daftar</th>
                  <th className="py-4 px-6 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700 text-sm">
                {loading ? (
                  <tr><td colSpan="6" className="py-8 text-center text-gray-500">Memuat data...</td></tr>
                ) : applications.length === 0 ? (
                  <tr><td colSpan="6" className="py-8 text-center text-gray-500">Belum ada data pendaftar.</td></tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id} className="hover:bg-green-50 transition">
                      <td className="py-3 px-6 font-medium">{app.namaSiswa}</td>
                      <td className="py-3 px-6">{app.namaAyah} / {app.namaIbu}</td>
                      <td className="py-3 px-6">{app.nomorHp}</td>
                      <td className="py-3 px-6">{app.asalTk || '-'}</td>
                      <td className="py-3 px-6">
                        {app.createdAt?.toDate ? app.createdAt.toDate().toLocaleDateString('id-ID') : 'Baru saja'}
                      </td>
                      <td className="py-3 px-6 flex justify-center space-x-2">
                        <button 
                          onClick={() => setSelectedApp(app)}
                          className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition tooltip"
                          title="Lihat Detail"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(app.id)}
                          className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition tooltip"
                          title="Hapus Data"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Detail Siswa */}
        {selectedApp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="bg-green-700 text-white px-6 py-4 flex justify-between items-center sticky top-0">
                <h3 className="font-bold text-lg">Detail Pendaftar</h3>
                <button onClick={() => setSelectedApp(null)} className="hover:bg-green-600 p-1 rounded-full"><X size={24} /></button>
              </div>
              <div className="p-6 space-y-6">
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-gray-500 font-semibold mb-1">Nama Lengkap</p>
                    <p className="bg-gray-50 p-2 rounded border border-gray-100 font-medium">{selectedApp.namaSiswa}</p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-gray-500 font-semibold mb-1">NISN</p>
                    <p className="bg-gray-50 p-2 rounded border border-gray-100">{selectedApp.nisn || '-'}</p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-gray-500 font-semibold mb-1">TTL</p>
                    <p className="bg-gray-50 p-2 rounded border border-gray-100">{selectedApp.tempatLahir}, {selectedApp.tanggalLahir}</p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-gray-500 font-semibold mb-1">Jenis Kelamin</p>
                    <p className="bg-gray-50 p-2 rounded border border-gray-100">{selectedApp.jenisKelamin}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 font-semibold mb-1">Asal TK / PAUD</p>
                    <p className="bg-gray-50 p-2 rounded border border-gray-100">{selectedApp.asalTk || '-'}</p>
                  </div>
                </div>

                <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-gray-500 font-semibold mb-1">Nama Ayah</p>
                    <p className="bg-gray-50 p-2 rounded border border-gray-100">{selectedApp.namaAyah}</p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-gray-500 font-semibold mb-1">Nama Ibu</p>
                    <p className="bg-gray-50 p-2 rounded border border-gray-100">{selectedApp.namaIbu}</p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-gray-500 font-semibold mb-1">Nomor HP</p>
                    <p className="bg-gray-50 p-2 rounded border border-gray-100 font-medium text-green-700">{selectedApp.nomorHp}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 font-semibold mb-1">Alamat</p>
                    <p className="bg-gray-50 p-2 rounded border border-gray-100">{selectedApp.alamat}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-gray-500 font-semibold mb-3 text-sm">File Berkas (Simulasi)</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex items-center justify-between">
                      <div className="flex items-center overflow-hidden mr-2">
                        <FileText className="text-yellow-600 mr-2 flex-shrink-0" size={20} />
                        <span className="text-sm truncate text-gray-700">{selectedApp.kkFileName || 'KK Tidak ada'}</span>
                      </div>
                      <button className="text-xs bg-yellow-200 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-300 font-semibold flex-shrink-0 flex items-center" onClick={()=>alert("Mendownload Berkas KK: " + selectedApp.kkFileName)}><Download size={14} className="mr-1"/> Unduh</button>
                    </div>
                    <div className="flex-1 bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex items-center justify-between">
                      <div className="flex items-center overflow-hidden mr-2">
                        <FileText className="text-yellow-600 mr-2 flex-shrink-0" size={20} />
                        <span className="text-sm truncate text-gray-700">{selectedApp.aktaFileName || 'Akta Tidak ada'}</span>
                      </div>
                      <button className="text-xs bg-yellow-200 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-300 font-semibold flex-shrink-0 flex items-center" onClick={()=>alert("Mendownload Berkas Akta: " + selectedApp.aktaFileName)}><Download size={14} className="mr-1"/> Unduh</button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Galeri() {
  const photos = [
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800"
  ];

  return (
    <div className="animate-fade-in py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-green-800 mb-4">Galeri Kegiatan</h1>
          <div className="w-24 h-1 bg-yellow-400 mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-600">Dokumentasi momen-momen berharga dan kegiatan siswa/i SD Negeri 050577.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {photos.map((src, index) => (
            <div key={index} className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 aspect-[4/3] bg-gray-100">
              <img 
                src={src} 
                alt={`Kegiatan Sekolah ${index + 1}`} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-6 text-white w-full">
                  <ImageIcon className="mb-2 text-yellow-400" size={24} />
                  <p className="font-semibold text-lg drop-shadow-md">Momen Pembelajaran</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Kontak() {
  return (
    <div className="animate-fade-in bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-green-800 mb-4">Lokasi & Kontak</h1>
          <div className="w-24 h-1 bg-yellow-400 mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-5 gap-8 bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
          
          <div className="md:col-span-2 bg-green-800 p-8 md:p-12 text-white flex flex-col justify-center">
            <h2 className="text-2xl font-bold mb-8 text-yellow-400">Informasi Kontak</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <MapPin className="text-yellow-400 mr-4 mt-1 flex-shrink-0" size={24} />
                <div>
                  <h4 className="font-semibold text-lg mb-1">Alamat</h4>
                  <p className="text-green-100 text-sm leading-relaxed">
                    SD NEGERI 050577<br/>
                    JLN. P. KEMERDEKAAN<br/>
                    Kecamatan Binjai, Kabupaten Langkat<br/>
                    Provinsi Sumatera Utara, Indonesia
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="text-yellow-400 mr-4 mt-1 flex-shrink-0" size={24} />
                <div>
                  <h4 className="font-semibold text-lg mb-1">Telepon / WhatsApp</h4>
                  <p className="text-green-100 text-sm">0856 6826 9882</p>
                </div>
              </div>

              <div className="flex items-start">
                <Mail className="text-yellow-400 mr-4 mt-1 flex-shrink-0" size={24} />
                <div>
                  <h4 className="font-semibold text-lg mb-1">Email</h4>
                  <p className="text-green-100 text-sm">info@sdn050577.sch.id</p>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <a 
                href="https://wa.me/6285668269882" 
                target="_blank" 
                rel="noreferrer"
                className="w-full block text-center bg-yellow-400 hover:bg-yellow-500 text-green-900 font-bold py-4 rounded-xl shadow transition transform hover:-translate-y-1"
              >
                Chat WhatsApp Sekolah
              </a>
            </div>
          </div>

          <div className="md:col-span-3 min-h-[400px]">
            <iframe 
              title="Peta Lokasi SD Negeri 050577"
              src="https://maps.google.com/maps?q=JLN.+P.+KEMERDEKAAN,+Kecamatan+Binjai,+Kabupaten+Langkat,+Sumatera+Utara&t=&z=15&ie=UTF8&iwloc=&output=embed" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

        </div>
      </div>
    </div>
  );
}