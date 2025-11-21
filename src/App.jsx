import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Box, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Mail,
  Lock,
  CreditCard
} from 'lucide-react';

// --- KONFIGURASI SUPABASE (Placeholder) ---
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY;
// import { createClient } from '@supabase/supabase-js';
// const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- MOCK DATA SERVICE ---
const USE_MOCK_DATA = true;

// Data user diperbarui untuk simulasi login
const MOCK_USERS = [
  { id: 1, nama: 'Admin Lab', email: 'admin@lab.com', role: 'admin' },
  { id: 2, nama: 'Pak Dosen', email: 'dosen@kampus.ac.id', role: 'dosen' },
  { id: 3, nama: 'Budi Mahasiswa', email: '123456@mhs.uinsaid.ac.id', role: 'mahasiswa', nim: '123456' },
];

const MOCK_RUANGAN = [
  { id: 1, nama_ruang: 'Lab Komputer 1', kapasitas: 40, lokasi: 'Gedung A' },
  { id: 2, nama_ruang: 'Lab Jaringan', kapasitas: 30, lokasi: 'Gedung B' },
];

const MOCK_ALAT = [
  { id: 1, nama_alat: 'Proyektor', jumlah_tersedia: 5, kondisi: 'baik' },
  { id: 2, nama_alat: 'Mikroskop', jumlah_tersedia: 10, kondisi: 'baik' },
  { id: 3, nama_alat: 'Router Cisco', jumlah_tersedia: 2, kondisi: 'maintenance' },
];

const MOCK_PEMINJAMAN = [
  { 
    id: 101, 
    user_id: 2, 
    user_nama: 'Pak Dosen', 
    ruang_nama: 'Lab Komputer 1', 
    waktu_mulai: '2023-11-25T08:00', 
    waktu_selesai: '2023-11-25T10:00', 
    status: 'pending',
    tujuan: 'Kuliah Tamu' 
  },
  { 
    id: 102, 
    user_id: 3, 
    user_nama: 'Budi Mahasiswa', 
    ruang_nama: 'Lab Jaringan', 
    waktu_mulai: '2023-11-26T13:00', 
    waktu_selesai: '2023-11-26T15:00', 
    status: 'disetujui',
    tujuan: 'Pengerjaan Skripsi' 
  }
];

// --- UTILITY COMPONENTS ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 ${className}`}>
    {children}
  </div>
);

const Badge = ({ status }) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-700',
    disetujui: 'bg-green-100 text-green-700',
    ditolak: 'bg-red-100 text-red-700',
    selesai: 'bg-blue-100 text-blue-700',
    baik: 'bg-green-100 text-green-700',
    rusak: 'bg-red-100 text-red-700',
    maintenance: 'bg-orange-100 text-orange-700',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${colors[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  // Global State
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Auth State (Baru)
  const [authMode, setAuthMode] = useState('login'); // 'login' atau 'register'
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ nama: '', nim: '', email: '', password: '', confirmPassword: '' });
  const [authError, setAuthError] = useState('');

  // Data State
  const [peminjamanList, setPeminjamanList] = useState(MOCK_PEMINJAMAN);
  const [inventory] = useState(MOCK_ALAT);
  
  // Form State
  const [formPinjam, setFormPinjam] = useState({
    ruang: '',
    tanggal: '',
    jamMulai: '',
    jamSelesai: '',
    tujuan: '',
  });

  // --- LOGIC HANDLERS ---

  const validateStudentEmail = (email) => {
    return email.endsWith('@mhs.uinsaid.ac.id');
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError('');

    if (authMode === 'login') {
      // Simulasi Login
      const user = MOCK_USERS.find(u => u.email === loginForm.email);
      if (user) {
        // Untuk simulasi, password apapun dianggap benar jika email ada
        // Di sistem nyata, ini akan dicek dengan hash password di database
        if (loginForm.password === '123456') { // Password sementara untuk semua user mock
            setCurrentUser(user);
            setActiveTab('dashboard');
            setLoginForm({ email: '', password: '' });
        } else {
            setAuthError('Password salah. (Hint: gunakan 123456)');
        }
      } else {
        setAuthError('Email tidak terdaftar.');
      }
    } else {
      // Simulasi Register (Khusus Mahasiswa)
      if (!registerForm.nama || !registerForm.nim || !registerForm.email || !registerForm.password) {
        setAuthError('Semua field harus diisi.');
        return;
      }
      if (!validateStudentEmail(registerForm.email)) {
        setAuthError('Email mahasiswa harus diakhiri dengan @mhs.uinsaid.ac.id');
        return;
      }
      if (registerForm.password !== registerForm.confirmPassword) {
        setAuthError('Password dan konfirmasi password tidak cocok.');
        return;
      }
      if (registerForm.password.length < 6) {
        setAuthError('Password minimal 6 karakter.');
        return;
      }

      // Cek email duplikat
      if (MOCK_USERS.some(u => u.email === registerForm.email)) {
        setAuthError('Email sudah terdaftar.');
        return;
      }

      const newUser = {
        id: Date.now(),
        nama: registerForm.nama,
        email: registerForm.email,
        role: 'mahasiswa', // Default role untuk pendaftar baru
        nim: registerForm.nim
      };
      MOCK_USERS.push(newUser); // Tambah ke data mock
      setCurrentUser(newUser);
      setActiveTab('dashboard');
      setRegisterForm({ nama: '', nim: '', email: '', password: '', confirmPassword: '' });
      alert('Registrasi berhasil! Selamat datang.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthMode('login');
  };

  const handleAjukanPinjam = (e) => {
    e.preventDefault();
    const newPinjam = {
      id: Date.now(),
      user_id: currentUser.id,
      user_nama: currentUser.nama,
      ruang_nama: formPinjam.ruang || 'Ruang Umum',
      waktu_mulai: `${formPinjam.tanggal}T${formPinjam.jamMulai}`,
      waktu_selesai: `${formPinjam.tanggal}T${formPinjam.jamSelesai}`,
      status: 'pending',
      tujuan: formPinjam.tujuan
    };
    setPeminjamanList([newPinjam, ...peminjamanList]);
    alert('Permintaan peminjaman berhasil dikirim! Menunggu persetujuan Admin.');
    setFormPinjam({ ruang: '', tanggal: '', jamMulai: '', jamSelesai: '', tujuan: '' });
    setActiveTab('history');
  };

  const handleApproval = (id, status) => {
    const updatedList = peminjamanList.map(item => 
      item.id === id ? { ...item, status: status } : item
    );
    setPeminjamanList(updatedList);
  };

  // --- SUB-COMPONENTS (VIEWS) ---

  // 1. View Authentication (Login & Register) - DESAIN BARU
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-2xl shadow-xl flex overflow-hidden max-w-4xl w-full lg:flex-row flex-col">
          
          {/* Bagian Kiri - Gambar/Branding */}
          <div className="lg:w-1/2 bg-blue-600 p-12 text-white flex flex-col justify-center items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 opacity-90 z-0"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            
            <div className="relative z-10 text-center">
              <div className="h-20 w-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-white/30">
                <Box className="text-white w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold mb-2">SILAB v3</h2>
              <p className="text-blue-100 text-lg">Sistem Informasi Laboratorium Terpadu</p>
              <p className="mt-6 text-sm text-blue-200 max-w-xs mx-auto">Kelola peminjaman ruang dan alat laboratorium dengan mudah, cepat, dan transparan.</p>
            </div>
          </div>

          {/* Bagian Kanan - Form Login/Register */}
          <div className="lg:w-1/2 p-8 sm:p-12 bg-white flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                {authMode === 'login' ? 'Selamat Datang Kembali' : 'Buat Akun Baru'}
              </h3>
              <p className="text-slate-500 mb-8">
                {authMode === 'login' 
                  ? 'Silahkan masukkan email dan password Anda untuk login.' 
                  : 'Silahkan lengkapi data diri Anda untuk mendaftar sebagai Mahasiswa.'}
              </p>

              {authError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 mb-6 border border-red-200">
                  <AlertTriangle size={16} /> {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-5">
                {authMode === 'register' && (
                  <>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input 
                        type="text"
                        placeholder="Nama Lengkap"
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        value={registerForm.nama}
                        onChange={e => setRegisterForm({...registerForm, nama: e.target.value})}
                        required
                      />
                    </div>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input 
                        type="text"
                        placeholder="NIM"
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        value={registerForm.nim}
                        onChange={e => setRegisterForm({...registerForm, nim: e.target.value})}
                        required
                      />
                    </div>
                  </>
                )}

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="email"
                    placeholder={authMode === 'register' ? "Email (@mhs.uinsaid.ac.id)" : "Email Address"}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={authMode === 'login' ? loginForm.email : registerForm.email}
                    onChange={e => authMode === 'login' ? setLoginForm({...loginForm, email: e.target.value}) : setRegisterForm({...registerForm, email: e.target.value})}
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="password"
                    placeholder="Password"
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={authMode === 'login' ? loginForm.password : registerForm.password}
                    onChange={e => authMode === 'login' ? setLoginForm({...loginForm, password: e.target.value}) : setRegisterForm({...registerForm, password: e.target.value})}
                    required
                  />
                </div>

                {authMode === 'register' && (
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="password"
                      placeholder="Konfirmasi Password"
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      value={registerForm.confirmPassword}
                      onChange={e => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                )}

                {authMode === 'login' && (
                  <div className="flex justify-end">
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Lupa Password?</a>
                  </div>
                )}

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md hover:shadow-lg">
                  {authMode === 'login' ? 'Login' : 'Daftar'}
                </button>
              </form>

              <div className="my-8 flex items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">atau lanjutkan dengan</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <button className="w-full border border-slate-300 text-slate-700 font-medium py-3 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>

              <div className="mt-8 text-center text-slate-500 text-sm">
                {authMode === 'login' ? (
                  <>
                    Belum punya akun?{' '}
                    <button onClick={() => { setAuthMode('register'); setAuthError(''); }} className="text-blue-600 hover:text-blue-700 font-medium">
                      Daftar sekarang
                    </button>
                  </>
                ) : (
                  <>
                    Sudah punya akun?{' '}
                    <button onClick={() => { setAuthMode('login'); setAuthError(''); }} className="text-blue-600 hover:text-blue-700 font-medium">
                      Login disini
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. View Dashboard Components
  const renderSidebar = () => (
    <div className="w-64 bg-slate-900 text-white min-h-screen fixed left-0 top-0 p-4 hidden md:block z-10">
      <div className="flex items-center gap-3 mb-10 px-2">
        <Box className="text-blue-400" />
        <span className="font-bold text-xl">SILAB v3</span>
      </div>
      
      <div className="space-y-1">
        <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
          <LayoutDashboard size={18} /> Dashboard
        </button>
        
        <button onClick={() => setActiveTab('jadwal')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${activeTab === 'jadwal' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
          <Calendar size={18} /> Jadwal & Pinjam
        </button>

        <button onClick={() => setActiveTab('history')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
          <Clock size={18} /> Riwayat Saya
        </button>

        {/* Menu Khusus Admin */}
        {currentUser.role === 'admin' && (
          <>
            <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase">Admin Area</div>
            <button onClick={() => setActiveTab('approvals')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${activeTab === 'approvals' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <CheckCircle size={18} /> Persetujuan
              {peminjamanList.filter(p => p.status === 'pending').length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs py-0.5 px-2 rounded-full">
                  {peminjamanList.filter(p => p.status === 'pending').length}
                </span>
              )}
            </button>
            <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${activeTab === 'inventory' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <Box size={18} /> Kelola Inventaris
            </button>
          </>
        )}

        <button onClick={() => setActiveTab('lapor')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${activeTab === 'lapor' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
          <AlertTriangle size={18} /> Lapor Kerusakan
        </button>
      </div>

      <div className="absolute bottom-8 left-4 right-4">
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800 rounded-lg mb-2">
          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
            <User size={16} />
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-medium truncate">{currentUser.nama}</div>
            <div className="text-xs text-slate-400 capitalize">{currentUser.role}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white text-sm py-2">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );

  // View: Dashboard Home
  const DashboardView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-blue-500">
          <div className="text-slate-500 text-sm font-medium mb-1">Status Pinjaman Aktif</div>
          <div className="text-3xl font-bold text-slate-800">
            {currentUser.role === 'admin' 
              ? peminjamanList.filter(p => p.status === 'disetujui').length 
              : peminjamanList.filter(p => p.user_id === currentUser.id && p.status === 'disetujui').length
            }
          </div>
        </Card>
        <Card className="border-l-4 border-green-500">
          <div className="text-slate-500 text-sm font-medium mb-1">Ruangan Tersedia</div>
          <div className="text-3xl font-bold text-slate-800">{MOCK_RUANGAN.length}</div>
        </Card>
        <Card className="border-l-4 border-orange-500">
          <div className="text-slate-500 text-sm font-medium mb-1">Inventaris Maintenance</div>
          <div className="text-3xl font-bold text-slate-800">
            {inventory.filter(i => i.kondisi === 'maintenance').length}
          </div>
        </Card>
      </div>

      {/* Welcome Banner for Mahasiswa */}
      {currentUser.role === 'mahasiswa' && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Halo, {currentUser.nama}!</h3>
          <p className="opacity-90">Sekarang kamu dapat mengajukan peminjaman ruangan dan alat langsung melalui sistem ini. Pastikan menunggu persetujuan dari Laboran.</p>
          <button onClick={() => setActiveTab('jadwal')} className="mt-4 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-50">
            Ajukan Peminjaman Sekarang
          </button>
        </div>
      )}

      {/* Recent Activity */}
      <Card>
        <h3 className="font-bold text-slate-800 mb-4">Jadwal Laboratorium Hari Ini</h3>
        <div className="space-y-4">
          {peminjamanList.filter(p => p.status === 'disetujui').length > 0 ? (
             peminjamanList.filter(p => p.status === 'disetujui').map(pinjam => (
              <div key={pinjam.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">{pinjam.ruang_nama}</h4>
                  <p className="text-sm text-slate-600 mb-1">{pinjam.tujuan}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <User size={12} /> {pinjam.user_nama}
                    <span>•</span>
                    {pinjam.waktu_mulai.split('T')[1]} - {pinjam.waktu_selesai.split('T')[1]}
                  </div>
                </div>
              </div>
             ))
          ) : (
            <div className="text-center py-8 text-slate-400">Tidak ada jadwal aktif hari ini.</div>
          )}
        </div>
      </Card>
    </div>
  );

  // View: Form Peminjaman
  const LoanFormView = () => (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Pengajuan Peminjaman</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <Card>
            <form onSubmit={handleAjukanPinjam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Ruangan</label>
                <select 
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formPinjam.ruang}
                  onChange={e => setFormPinjam({...formPinjam, ruang: e.target.value})}
                  required
                >
                  <option value="">-- Pilih Ruangan --</option>
                  {MOCK_RUANGAN.map(r => (
                    <option key={r.id} value={r.nama_ruang}>{r.nama_ruang} (Kap: {r.kapasitas})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
                  <input 
                    type="date" 
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formPinjam.tanggal}
                    onChange={e => setFormPinjam({...formPinjam, tanggal: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mulai</label>
                    <input 
                      type="time" 
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formPinjam.jamMulai}
                      onChange={e => setFormPinjam({...formPinjam, jamMulai: e.target.value})}
                      required
                    />
                   </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Selesai</label>
                    <input 
                      type="time" 
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formPinjam.jamSelesai}
                      onChange={e => setFormPinjam({...formPinjam, jamSelesai: e.target.value})}
                      required
                    />
                   </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tujuan Peminjaman</label>
                <textarea 
                  rows="3"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Contoh: Praktikum Fisika Dasar, Penelitian Skripsi..."
                  value={formPinjam.tujuan}
                  onChange={e => setFormPinjam({...formPinjam, tujuan: e.target.value})}
                  required
                ></textarea>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors">
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* Info Section */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-blue-50 border-blue-100">
            <h4 className="font-semibold text-blue-800 mb-2">Aturan Peminjaman</h4>
            <ul className="text-sm text-blue-700 space-y-2 list-disc list-inside">
              <li>Pengajuan maksimal H-1 sebelum penggunaan.</li>
              <li>Mahasiswa wajib mengisi tujuan peminjaman dengan jelas.</li>
              <li>Admin akan melakukan verifikasi ketersediaan alat & ruangan.</li>
              <li>Notifikasi persetujuan akan muncul di dashboard.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );

  // View: Approval List (Admin Only)
  const ApprovalView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Persetujuan Peminjaman</h2>
      
      <Card className="overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold text-slate-700">Pemohon</th>
              <th className="p-4 font-semibold text-slate-700">Detail Pinjam</th>
              <th className="p-4 font-semibold text-slate-700">Tujuan</th>
              <th className="p-4 font-semibold text-slate-700">Status</th>
              <th className="p-4 font-semibold text-slate-700 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {peminjamanList.filter(p => p.status === 'pending').length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">Tidak ada permintaan tertunda.</td>
              </tr>
            )}
            {peminjamanList.filter(p => p.status === 'pending').map(item => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="p-4">
                  <div className="font-medium text-slate-800">{item.user_nama}</div>
                  <div className="text-xs text-slate-500">ID: {item.user_id}</div>
                </td>
                <td className="p-4">
                  <div className="font-medium">{item.ruang_nama}</div>
                  <div className="text-xs text-slate-500">
                    {item.waktu_mulai.split('T')[0]} <br/>
                    {item.waktu_mulai.split('T')[1]} - {item.waktu_selesai.split('T')[1]}
                  </div>
                </td>
                <td className="p-4 text-slate-600">{item.tujuan}</td>
                <td className="p-4"><Badge status={item.status} /></td>
                <td className="p-4 text-right space-x-2">
                  <button 
                    onClick={() => handleApproval(item.id, 'disetujui')}
                    className="bg-green-100 text-green-700 hover:bg-green-200 p-2 rounded-lg" title="Setujui">
                    <CheckCircle size={18} />
                  </button>
                  <button 
                    onClick={() => handleApproval(item.id, 'ditolak')}
                    className="bg-red-100 text-red-700 hover:bg-red-200 p-2 rounded-lg" title="Tolak">
                    <XCircle size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );

  // View: History / My Loans
  const HistoryView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Riwayat Peminjaman Saya</h2>
      <div className="grid gap-4">
        {peminjamanList
          .filter(p => currentUser.role === 'admin' ? true : p.user_id === currentUser.id)
          .map(item => (
          <Card key={item.id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${item.status === 'disetujui' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                <FileText size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">{item.ruang_nama}</h4>
                <div className="text-sm text-slate-500">
                  {item.waktu_mulai.replace('T', ' ')}
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge status={item.status} />
              <div className="text-xs text-slate-400 mt-1">ID: #{item.id}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  // Main Render Logic
  const renderContent = () => {
    switch(activeTab) {
      case 'jadwal': return <LoanFormView />;
      case 'approvals': return currentUser.role === 'admin' ? <ApprovalView /> : <DashboardView />;
      case 'history': return <HistoryView />;
      case 'inventory': return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">Daftar Inventaris</h2>
          <Card><p className="text-slate-500">Fitur CRUD Inventaris (Tersedia untuk Admin)</p></Card>
        </div>
      );
      case 'lapor': return (
         <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">Lapor Kerusakan</h2>
          <Card><p className="text-slate-500">Formulir pelaporan kerusakan alat...</p></Card>
        </div>
      );
      default: return <DashboardView />;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans flex">
      {renderSidebar()}
      
      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-8">
        {/* Mobile Header */}
        <div className="md:hidden mb-6 flex justify-between items-center relative z-20">
          <h1 className="font-bold text-xl">SILAB v3</h1>
          <button onClick={handleLogout}><LogOut size={20} /></button>
        </div>

        {renderContent()}
      </main>
    </div>
  );
}