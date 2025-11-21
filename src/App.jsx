import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
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
  CreditCard,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  MapPin,
  Monitor
} from 'lucide-react';

// --- INITIAL DATA (DEFAULT) ---
const DEFAULT_USERS = [
  { id: 1, nama: 'Admin Lab', email: 'admin@lab.com', role: 'admin' },
  { id: 2, nama: 'Pak Dosen', email: 'dosen@kampus.ac.id', role: 'dosen' },
];

const DEFAULT_RUANGAN = [
  { id: 1, nama_ruang: 'Lab Fisika', kapasitas: 30, lokasi: 'Gedung B Lantai 1' },
  { id: 2, nama_ruang: 'Lab Kimia', kapasitas: 35, lokasi: 'Gedung B Lantai 2' },
  { id: 3, nama_ruang: 'Lab Komputer 1', kapasitas: 40, lokasi: 'Gedung A Lantai 2' },
  { id: 4, nama_ruang: 'Ruang Kelas 4.01', kapasitas: 40, lokasi: 'Gedung Lab Lantai 4' },
];

const DEFAULT_ALAT = [
  { id: 1, nama_alat: 'Proyektor', jumlah_tersedia: 5, kondisi: 'baik' },
  { id: 2, nama_alat: 'Mikroskop', jumlah_tersedia: 10, kondisi: 'baik' },
  { id: 3, nama_alat: 'Router Cisco', jumlah_tersedia: 2, kondisi: 'maintenance' },
];

const DEFAULT_PEMINJAMAN = [
  { 
    id: 101, 
    user_id: 2, 
    user_nama: 'Pak Dosen', 
    ruang_nama: 'Lab Komputer 1', 
    waktu_mulai: '2025-11-21T08:00', 
    waktu_selesai: '2025-11-21T10:00', 
    status: 'pending',
    tujuan: 'Kuliah Tamu' 
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
  // --- STATE MANAGEMENT ---
  
  const getInitialData = (key, defaultData) => {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
    return defaultData;
  };

  const [users, setUsers] = useState(() => getInitialData('silab_users', DEFAULT_USERS));
  const [peminjamanList, setPeminjamanList] = useState(() => getInitialData('silab_loans', DEFAULT_PEMINJAMAN));
  // Ruangan sekarang jadi State agar bisa diedit Admin
  const [rooms, setRooms] = useState(() => getInitialData('silab_rooms', DEFAULT_RUANGAN));
  const [inventory, setInventory] = useState(() => getInitialData('silab_inventory', DEFAULT_ALAT));

  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Auth State
  const [authMode, setAuthMode] = useState('login'); 
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ nama: '', nim: '', email: '', password: '', confirmPassword: '' });
  const [authError, setAuthError] = useState('');

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  // Inventory Admin State
  const [activeInvTab, setActiveInvTab] = useState('ruangan'); // 'peralatan' or 'ruangan'

  // Form Peminjaman State
  const [formPinjam, setFormPinjam] = useState({
    ruang: '',
    tanggal: '',
    jamMulai: '',
    jamSelesai: '',
    tujuan: '',
  });

  // --- EFFECTS ---
  useEffect(() => { localStorage.setItem('silab_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('silab_loans', JSON.stringify(peminjamanList)); }, [peminjamanList]);
  useEffect(() => { localStorage.setItem('silab_rooms', JSON.stringify(rooms)); }, [rooms]);
  useEffect(() => { localStorage.setItem('silab_inventory', JSON.stringify(inventory)); }, [inventory]);

  // --- HELPERS ---
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
    return new Date(d.setDate(diff));
  };

  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const formatDateID = (date) => {
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // --- LOGIC HANDLERS ---

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError('');

    if (authMode === 'login') {
      const user = users.find(u => u.email === loginForm.email);
      if (user) {
        const isValidPass = user.password ? (user.password === loginForm.password) : (loginForm.password === '123456');
        if (isValidPass) {
            setCurrentUser(user);
            setActiveTab('dashboard');
            setLoginForm({ email: '', password: '' });
        } else {
            setAuthError('Password salah.');
        }
      } else {
        setAuthError('Email tidak terdaftar.');
      }
    } else {
      if (!registerForm.email.endsWith('@mhs.uinsaid.ac.id')) {
        setAuthError('Email harus @mhs.uinsaid.ac.id');
        return;
      }
      const newUser = {
        id: Date.now(),
        nama: registerForm.nama,
        email: registerForm.email,
        role: 'mahasiswa',
        nim: registerForm.nim,
        password: registerForm.password
      };
      setUsers([...users, newUser]);
      setCurrentUser(newUser);
      setActiveTab('dashboard');
      alert('Registrasi berhasil!');
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
      ruang_nama: formPinjam.ruang,
      waktu_mulai: `${formPinjam.tanggal}T${formPinjam.jamMulai}`,
      waktu_selesai: `${formPinjam.tanggal}T${formPinjam.jamSelesai}`,
      status: 'pending',
      tujuan: formPinjam.tujuan
    };
    setPeminjamanList([newPinjam, ...peminjamanList]);
    alert('Permintaan berhasil dikirim!');
    setFormPinjam({ ruang: '', tanggal: '', jamMulai: '', jamSelesai: '', tujuan: '' });
    setActiveTab('jadwal'); // Redirect ke kalender
  };

  // --- ADMIN ROOM MANAGEMENT HANDLERS ---
  const handleDeleteRoom = (id) => {
    if (window.confirm('Yakin ingin menghapus ruangan ini?')) {
      setRooms(rooms.filter(r => r.id !== id));
    }
  };

  const handleAddRoom = () => {
    const nama = prompt("Nama Ruangan Baru:");
    if (!nama) return;
    const lokasi = prompt("Lokasi Ruangan:");
    const kapasitas = prompt("Kapasitas (angka):");
    
    const newRoom = {
      id: Date.now(),
      nama_ruang: nama,
      lokasi: lokasi || '-',
      kapasitas: parseInt(kapasitas) || 0
    };
    setRooms([...rooms, newRoom]);
  };

  const handleEditRoom = (id) => {
    const room = rooms.find(r => r.id === id);
    const nama = prompt("Edit Nama Ruangan:", room.nama_ruang);
    if (!nama) return;
    const lokasi = prompt("Edit Lokasi:", room.lokasi);
    const kapasitas = prompt("Edit Kapasitas:", room.kapasitas);

    const updatedRooms = rooms.map(r => 
      r.id === id ? { ...r, nama_ruang: nama, lokasi, kapasitas } : r
    );
    setRooms(updatedRooms);
  };

  // --- VIEWS ---

  const CalendarView = () => {
    const startOfWeek = getStartOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startOfWeek, i));

    const getEventsForCell = (roomName, date) => {
      const dateStr = date.toISOString().split('T')[0];
      return peminjamanList.filter(p => 
        p.ruang_nama === roomName && 
        p.waktu_mulai.startsWith(dateStr) &&
        (p.status === 'disetujui' || p.status === 'pending')
      );
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Kalender Laboratorium</h2>
            <p className="text-slate-500">Jadwal penggunaan ruangan</p>
          </div>
          <button onClick={() => setActiveTab('form_pinjam')} className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors">
            <Plus size={18} /> Ajukan Peminjaman
          </button>
        </div>

        <Card className="overflow-x-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">
              {startOfWeek.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-2">
              <button onClick={() => setCurrentDate(addDays(currentDate, -7))} className="px-3 py-1 border rounded hover:bg-slate-50 text-sm">Minggu Sebelumnya</button>
              <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 border rounded hover:bg-slate-50 text-sm font-medium">Hari Ini</button>
              <button onClick={() => setCurrentDate(addDays(currentDate, 7))} className="px-3 py-1 border rounded hover:bg-slate-50 text-sm">Minggu Berikutnya</button>
            </div>
          </div>

          <div className="min-w-[800px]">
            <div className="grid grid-cols-8 border-b border-slate-200">
              <div className="p-3 font-semibold text-slate-700 bg-slate-50">Ruangan</div>
              {weekDays.map((day, i) => (
                <div key={i} className="p-3 text-center border-l border-slate-100 bg-slate-50">
                  <div className="text-sm font-semibold text-slate-700">
                    {day.toLocaleDateString('id-ID', { weekday: 'short' })}
                  </div>
                  <div className="text-xl font-bold text-slate-800">
                    {day.getDate()}
                  </div>
                </div>
              ))}
            </div>

            {rooms.map((room) => (
              <div key={room.id} className="grid grid-cols-8 border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <div className="p-4 border-r border-slate-100">
                  <div className="font-semibold text-slate-800 text-sm">{room.nama_ruang}</div>
                  <div className="text-xs text-slate-500">{room.lokasi}</div>
                </div>
                {weekDays.map((day, i) => {
                  const events = getEventsForCell(room.nama_ruang, day);
                  return (
                    <div key={i} className="p-2 border-l border-slate-100 min-h-[80px] relative">
                      {events.map(ev => (
                        <div key={ev.id} className={`mb-1 p-1.5 rounded text-[10px] border ${ev.status === 'disetujui' ? 'bg-green-100 border-green-200 text-green-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800'}`}>
                          <div className="font-bold">
                            {ev.waktu_mulai.split('T')[1]} - {ev.waktu_selesai.split('T')[1]}
                          </div>
                          <div className="truncate">{ev.user_nama}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
              <span>Menunggu Persetujuan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span>Disetujui</span>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const InventoryView = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manajemen Inventaris</h2>
          <p className="text-slate-500">Kelola peralatan dan ruangan laboratorium</p>
        </div>
        {activeInvTab === 'ruangan' && currentUser.role === 'admin' && (
           <button onClick={handleAddRoom} className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800">
             <Plus size={18} /> Tambah Ruangan
           </button>
        )}
      </div>

      <div className="border-b border-slate-200">
        <div className="flex gap-6">
          <button 
            onClick={() => setActiveInvTab('peralatan')}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${activeInvTab === 'peralatan' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Box className="inline-block mr-2 w-4 h-4"/> Peralatan
          </button>
          <button 
            onClick={() => setActiveInvTab('ruangan')}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${activeInvTab === 'ruangan' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <MapPin className="inline-block mr-2 w-4 h-4"/> Ruangan
          </button>
        </div>
      </div>

      {activeInvTab === 'ruangan' ? (
        <div className="space-y-4">
           <h3 className="text-lg font-bold text-slate-800">Daftar Ruangan</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {rooms.map(room => (
               <div key={room.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                 <div className="flex justify-between items-start mb-4">
                   <div>
                     <h4 className="font-bold text-slate-800 text-lg">{room.nama_ruang}</h4>
                     <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
                       <MapPin size={14}/> {room.lokasi}
                     </p>
                   </div>
                   <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600 border border-slate-200">
                     Kapasitas: {room.kapasitas}
                   </div>
                 </div>
                 
                 {currentUser.role === 'admin' && (
                   <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                     <button onClick={() => handleEditRoom(room.id)} className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 flex items-center justify-center gap-2">
                       <Edit size={16}/> Edit
                     </button>
                     <button onClick={() => handleDeleteRoom(room.id)} className="w-10 flex items-center justify-center rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-100">
                       <Trash2 size={18}/>
                     </button>
                   </div>
                 )}
               </div>
             ))}
           </div>
        </div>
      ) : (
        <div className="space-y-4">
           <h3 className="text-lg font-bold text-slate-800">Daftar Peralatan</h3>
           <Card>
              <p className="text-slate-500 italic">Fitur manajemen peralatan (Simulasi - Tampilan sama dengan Ruangan)</p>
           </Card>
        </div>
      )}
    </div>
  );

  // Login/Register Render
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-2xl shadow-xl flex overflow-hidden max-w-4xl w-full lg:flex-row flex-col">
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
            </div>
          </div>
          <div className="lg:w-1/2 p-8 sm:p-12 bg-white flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                {authMode === 'login' ? 'Selamat Datang Kembali' : 'Buat Akun Baru'}
              </h3>
              {authError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 mb-6 border border-red-200">
                  <AlertTriangle size={16} /> {authError}
                </div>
              )}
              <form onSubmit={handleAuthSubmit} className="space-y-5">
                {authMode === 'register' && (
                  <>
                    <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} /><input type="text" placeholder="Nama Lengkap" className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg outline-none" value={registerForm.nama} onChange={e => setRegisterForm({...registerForm, nama: e.target.value})} required /></div>
                    <div className="relative"><CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} /><input type="text" placeholder="NIM" className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg outline-none" value={registerForm.nim} onChange={e => setRegisterForm({...registerForm, nim: e.target.value})} required /></div>
                  </>
                )}
                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} /><input type="email" placeholder="Email" className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg outline-none" value={authMode === 'login' ? loginForm.email : registerForm.email} onChange={e => authMode === 'login' ? setLoginForm({...loginForm, email: e.target.value}) : setRegisterForm({...registerForm, email: e.target.value})} required /></div>
                <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} /><input type="password" placeholder="Password" className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg outline-none" value={authMode === 'login' ? loginForm.password : registerForm.password} onChange={e => authMode === 'login' ? setLoginForm({...loginForm, password: e.target.value}) : setRegisterForm({...registerForm, password: e.target.value})} required /></div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md hover:shadow-lg">{authMode === 'login' ? 'Login' : 'Daftar'}</button>
              </form>
              <div className="mt-8 text-center text-slate-500 text-sm">
                {authMode === 'login' ? <button onClick={() => setAuthMode('register')} className="text-blue-600 font-medium">Daftar sekarang</button> : <button onClick={() => setAuthMode('login')} className="text-blue-600 font-medium">Login disini</button>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'jadwal': return <CalendarView />;
      case 'form_pinjam': return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">Pengajuan Peminjaman</h2>
            <button onClick={() => setActiveTab('jadwal')} className="text-slate-500 hover:text-slate-700">Batal</button>
          </div>
          <Card>
            <form onSubmit={handleAjukanPinjam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Ruangan</label>
                <select className="w-full p-2.5 border border-slate-300 rounded-lg" value={formPinjam.ruang} onChange={e => setFormPinjam({...formPinjam, ruang: e.target.value})} required>
                  <option value="">-- Pilih Ruangan --</option>
                  {rooms.map(r => <option key={r.id} value={r.nama_ruang}>{r.nama_ruang}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label><input type="date" className="w-full p-2.5 border border-slate-300 rounded-lg" value={formPinjam.tanggal} onChange={e => setFormPinjam({...formPinjam, tanggal: e.target.value})} required /></div>
                <div className="grid grid-cols-2 gap-2">
                   <div><label className="block text-sm font-medium text-slate-700 mb-1">Mulai</label><input type="time" className="w-full p-2.5 border border-slate-300 rounded-lg" value={formPinjam.jamMulai} onChange={e => setFormPinjam({...formPinjam, jamMulai: e.target.value})} required /></div>
                   <div><label className="block text-sm font-medium text-slate-700 mb-1">Selesai</label><input type="time" className="w-full p-2.5 border border-slate-300 rounded-lg" value={formPinjam.jamSelesai} onChange={e => setFormPinjam({...formPinjam, jamSelesai: e.target.value})} required /></div>
                </div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Tujuan</label><textarea className="w-full p-2.5 border border-slate-300 rounded-lg" value={formPinjam.tujuan} onChange={e => setFormPinjam({...formPinjam, tujuan: e.target.value})} required></textarea></div>
              <button type="submit" className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg">Kirim Pengajuan</button>
            </form>
          </Card>
        </div>
      );
      case 'approvals': return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">Persetujuan</h2>
          <Card className="p-0">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr><th className="p-4">Pemohon</th><th className="p-4">Ruang & Waktu</th><th className="p-4">Status</th><th className="p-4 text-right">Aksi</th></tr>
              </thead>
              <tbody>
                {peminjamanList.filter(p => p.status === 'pending').map(item => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4"><div>{item.user_nama}</div></td>
                    <td className="p-4"><div>{item.ruang_nama}</div><div className="text-xs text-slate-500">{item.waktu_mulai.replace('T', ' ')}</div></td>
                    <td className="p-4"><Badge status={item.status} /></td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button onClick={() => { setPeminjamanList(peminjamanList.map(p => p.id === item.id ? {...p, status: 'disetujui'} : p)) }} className="text-green-600 bg-green-100 p-2 rounded"><CheckCircle size={16}/></button>
                      <button onClick={() => { setPeminjamanList(peminjamanList.map(p => p.id === item.id ? {...p, status: 'ditolak'} : p)) }} className="text-red-600 bg-red-100 p-2 rounded"><XCircle size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      );
      case 'inventory': return <InventoryView />;
      case 'history': return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">Riwayat Saya</h2>
          <div className="space-y-4">
            {peminjamanList.filter(p => currentUser.role === 'admin' ? true : p.user_id === currentUser.id).map(item => (
              <Card key={item.id} className="flex justify-between items-center p-4">
                <div><h4 className="font-bold">{item.ruang_nama}</h4><p className="text-sm text-slate-500">{item.waktu_mulai.replace('T', ' ')}</p></div>
                <Badge status={item.status} />
              </Card>
            ))}
          </div>
        </div>
      );
      default: return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-l-4 border-blue-500">
              <div className="text-slate-500 text-sm font-medium mb-1">Pinjaman Aktif</div>
              <div className="text-3xl font-bold text-slate-800">{peminjamanList.filter(p => p.status === 'disetujui').length}</div>
            </Card>
            <Card className="border-l-4 border-green-500">
              <div className="text-slate-500 text-sm font-medium mb-1">Total Ruangan</div>
              <div className="text-3xl font-bold text-slate-800">{rooms.length}</div>
            </Card>
          </div>
          <Card>
            <h3 className="font-bold mb-4">Jadwal Hari Ini</h3>
            {peminjamanList.filter(p => p.status === 'disetujui').length === 0 ? <p className="text-slate-400">Tidak ada jadwal.</p> : 
              peminjamanList.filter(p => p.status === 'disetujui').map(p => <div key={p.id} className="p-3 bg-slate-50 mb-2 rounded border border-slate-100">{p.ruang_nama} - {p.user_nama}</div>)
            }
          </Card>
        </div>
      );
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans flex">
      <div className="w-64 bg-slate-900 text-white min-h-screen fixed left-0 top-0 p-4 hidden md:block z-10">
        <div className="flex items-center gap-3 mb-10 px-2"><Box className="text-blue-400" /><span className="font-bold text-xl">SILAB v3</span></div>
        <div className="space-y-1">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${activeTab === 'dashboard' ? 'bg-blue-600' : 'text-slate-400 hover:bg-slate-800'}`}><LayoutDashboard size={18} /> Dashboard</button>
          <button onClick={() => setActiveTab('jadwal')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${activeTab === 'jadwal' || activeTab === 'form_pinjam' ? 'bg-blue-600' : 'text-slate-400 hover:bg-slate-800'}`}><CalendarIcon size={18} /> Jadwal & Pinjam</button>
          <button onClick={() => setActiveTab('history')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${activeTab === 'history' ? 'bg-blue-600' : 'text-slate-400 hover:bg-slate-800'}`}><Clock size={18} /> Riwayat Saya</button>
          {currentUser.role === 'admin' && (
            <>
              <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase">Admin Area</div>
              <button onClick={() => setActiveTab('approvals')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${activeTab === 'approvals' ? 'bg-blue-600' : 'text-slate-400 hover:bg-slate-800'}`}><CheckCircle size={18} /> Persetujuan</button>
              <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${activeTab === 'inventory' ? 'bg-blue-600' : 'text-slate-400 hover:bg-slate-800'}`}><Box size={18} /> Kelola Inventaris</button>
            </>
          )}
        </div>
        <div className="absolute bottom-8 left-4 right-4">
           <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white text-sm py-2"><LogOut size={16} /> Logout</button>
        </div>
      </div>
      <main className="flex-1 md:ml-64 p-8">
        <div className="md:hidden mb-6 flex justify-between items-center"><h1 className="font-bold text-xl">SILAB v3</h1><button onClick={handleLogout}><LogOut size={20} /></button></div>
        {renderContent()}
      </main>
    </div>
  );
}