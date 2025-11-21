import React, { useState, useEffect } from 'react';
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
  Plus,
  Search,
  MapPin
} from 'lucide-react';

// --- KONFIGURASI SUPABASE (Placeholder) ---
// Di VS Code Anda, ganti ini dengan process.env.REACT_APP_SUPABASE_URL dsb.
const supabaseUrl = "https://bsxtbotieynsffqwkifo.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzeHRib3RpZXluc2ZmcXdraWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MDI4MDYsImV4cCI6MjA3OTI3ODgwNn0.64vjNejtjuwDZwyF8UJJ1EiKh-bNM3FgenYlxiaU8ks";
// import { createClient } from '@supabase/supabase-js';
// const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- MOCK DATA SERVICE ---
// Kita gunakan ini agar aplikasi bisa berjalan di Preview tanpa backend asli
const USE_MOCK_DATA = false;

const MOCK_USERS = [
  { id: 1, nama: 'Admin Lab', email: 'admin@lab.com', role: 'admin' },
  { id: 2, nama: 'Pak Dosen', email: 'dosen@kampus.id', role: 'dosen' },
  { id: 3, nama: 'Budi Mhs', email: 'budi@mhs.id', role: 'mahasiswa' },
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
    user_nama: 'Budi Mhs', 
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
  const [currentUser, setCurrentUser] = useState(null); // null = belum login
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data State
  const [peminjamanList, setPeminjamanList] = useState(MOCK_PEMINJAMAN);
  const [inventory, setInventory] = useState(MOCK_ALAT);
  
  // Form State
  const [formPinjam, setFormPinjam] = useState({
    ruang: '',
    tanggal: '',
    jamMulai: '',
    jamSelesai: '',
    tujuan: '',
  });

  // --- LOGIC HANDLERS ---

  const handleLogin = (role) => {
    // Simulasi Login
    const user = MOCK_USERS.find(u => u.role === role);
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleAjukanPinjam = (e) => {
    e.preventDefault();
    // Simulasi Kirim ke Supabase
    const newPinjam = {
      id: Date.now(),
      user_id: currentUser.id,
      user_nama: currentUser.nama,
      ruang_nama: formPinjam.ruang || 'Ruang Umum',
      waktu_mulai: `${formPinjam.tanggal}T${formPinjam.jamMulai}`,
      waktu_selesai: `${formPinjam.tanggal}T${formPinjam.jamSelesai}`,
      status: 'pending', // Default pending untuk approval admin
      tujuan: formPinjam.tujuan
    };
    setPeminjamanList([newPinjam, ...peminjamanList]);
    alert('Permintaan peminjaman berhasil dikirim! Menunggu persetujuan Admin.');
    setFormPinjam({ ruang: '', tanggal: '', jamMulai: '', jamSelesai: '', tujuan: '' });
    setActiveTab('history');
  };

  const handleApproval = (id, status) => {
    // Admin Logic
    const updatedList = peminjamanList.map(item => 
      item.id === id ? { ...item, status: status } : item
    );
    setPeminjamanList(updatedList);
  };

  // --- SUB-COMPONENTS (VIEWS) ---

  // 1. View Login
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Box className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Sistem Informasi Laboratorium</h1>
            <p className="text-slate-500">Silakan pilih peran untuk simulasi login</p>
          </div>
          
          <div className="space-y-3">
            <button onClick={() => handleLogin('admin')} className="w-full p-4 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-between group transition-all">
              <span className="font-medium text-slate-700">Login sebagai Admin (Laboran)</span>
              <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Full Access</div>
            </button>
            <button onClick={() => handleLogin('dosen')} className="w-full p-4 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-between group transition-all">
              <span className="font-medium text-slate-700">Login sebagai Dosen</span>
              <div className="bg-green-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Pinjam & Lapor</div>
            </button>
            <button onClick={() => handleLogin('mahasiswa')} className="w-full p-4 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-between group transition-all">
              <span className="font-medium text-slate-700">Login sebagai Mahasiswa</span>
              <div className="bg-purple-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Pinjam (Baru)</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. View Dashboard Components
  const renderSidebar = () => (
    <div className="w-64 bg-slate-900 text-white min-h-screen fixed left-0 top-0 p-4 hidden md:block">
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
        <div className="md:hidden mb-6 flex justify-between items-center">
          <h1 className="font-bold text-xl">SILAB v3</h1>
          <button onClick={handleLogout}><LogOut size={20} /></button>
        </div>

        {renderContent()}
      </main>
    </div>
  );
}