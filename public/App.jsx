// MECANICAPRO - V1.0.6 - REFRESH SESSION
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  LayoutDashboard, Wrench, Package, ShoppingCart, Users, DollarSign, 
  Plus, Search, Printer, Trash2, History, ChevronRight, Menu, X, 
  FileText, UserCheck, AlertTriangle, CheckCircle2, BarChart3, Edit
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// --- Utility Hooks ---
function useSyncedData(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;
      return JSON.parse(item);
    } catch (error) {
      return initialValue;
    }
  });

  const [isSyncing, setIsSyncing] = useState(false);

  // Sync from Cloud on mount
  useEffect(() => {
    const fetchFromCloud = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch(`/api/data?key=${key}`);
            const cloudData = await res.json();
            if (cloudData !== null) {
                console.log(`Dados sincronizados da nuvem para: ${key}`);
                setStoredValue(cloudData);
                window.localStorage.setItem(key, JSON.stringify(cloudData));
            }
        } catch (e) {
            console.error("Erro ao sincronizar do servidor:", e);
        } finally {
            setIsSyncing(false);
        }
    };
    fetchFromCloud();
  }, [key]);

  const setValue = async (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save local for instant UI update
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));

      // Save to Cloud in background
      setIsSyncing(true);
      await fetch(`/api/data?key=${key}`, {
        method: 'POST',
        body: JSON.stringify(valueToStore),
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
        console.error("Erro ao salvar no servidor:", error);
    } finally {
        setIsSyncing(false);
    }
  };

  return [storedValue, setValue, isSyncing];
}

// --- Global Helpers ---
const safeFormat = (dateStr, formatStr) => {
  try {
    if (!dateStr) return '---';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '---';
    return format(d, formatStr, { locale: ptBR });
  } catch (e) {
    return '---';
  }
};

const getFullAddress = (settings) => {
    const { address, neighborhood, city, state } = settings;
    if (!address) return 'Endereço não configurado';
    return `${address}${neighborhood ? `, ${neighborhood}` : ''}${city ? ` - ${city}` : ''}${state ? ` (${state})` : ''}`;
};

// --- Components ---
const Badge = ({ children, variant = 'neutral' }) => {
  const variants = {
    neutral: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-rose-100 text-rose-700',
    blue: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${variants[variant] || variants.neutral}`}>
      {children}
    </span>
  );
};

const NavItem = ({ active, icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-white'}`}
  >
    {icon}
    <span className="text-sm">{label}</span>
  </button>
);

// --- Main App ---
function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [globalPrintData, setGlobalPrintData] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = window.localStorage.getItem('mpro_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });

  // --- Login Component ---
  const Login = () => {
    const [pass, setPass] = useState('');
    const handleLogin = () => {
        if (pass === '1234') { // Senha padrão simples
            const user = { name: 'Administrador', role: 'admin' };
            setCurrentUser(user);
            window.localStorage.setItem('mpro_user', JSON.stringify(user));
        } else {
            alert('Senha incorreta!');
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-[1000] p-4">
            <div className="bg-white rounded-[2rem] p-10 w-full max-w-md shadow-2xl text-center space-y-8">
                <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-200 mx-auto">
                    <Wrench size={40} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">MECÂNICA<span className="text-blue-600">PRO</span></h2>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">Acesso Restrito</p>
                </div>
                <div className="space-y-4">
                    <div className="text-left">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-1 block">Senha de Acesso</label>
                        <input 
                            type="password" 
                            className="w-full h-14 px-6 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none text-center text-2xl tracking-[0.5em] transition-all"
                            value={pass}
                            onChange={e => setPass(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleLogin()}
                            autoFocus
                        />
                    </div>
                    <button 
                        onClick={handleLogin}
                        className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all"
                    >
                        Entrar no Sistema
                    </button>
                </div>
                <p className="text-[10px] text-slate-300 font-medium">Esqueceu a senha? Contrate o suporte técnico.</p>
            </div>
        </div>
    );
  };
  const [orders, setOrders, isSyncingOrders] = useSyncedData('mpro_orders', []);
  const [products, setProducts, isSyncingProducts] = useSyncedData('mpro_products', [
    { id: 1, name: 'Óleo Sintético 5W30', category: 'Lubrificantes', price: 65.0, stock: 45, minStock: 10, images: [] },
    { id: 2, name: 'Filtro de Óleo', category: 'Filtros', price: 35.0, stock: 12, minStock: 5, images: [] },
    { id: 3, name: 'Pastilha de Freio Dianteira', category: 'Freios', price: 180.0, stock: 8, minStock: 3, images: [] },
    { id: 4, name: 'Fluido de Arrefecimento', category: 'Químicos', price: 45.0, stock: 2, minStock: 5, images: [] },
  ]);
  const [customers, setCustomers, isSyncingCustomers] = useSyncedData('mpro_customers', [
    { id: 1, name: 'João Silva', phone: '(11) 98888-7777', email: 'joao@email.com', vehicle: 'Toyota Corolla - ABC-1234', address: 'Rua das Flores, 123' },
    { id: 2, name: 'Maria Oliveira', phone: '(11) 97777-6666', email: 'maria@email.com', vehicle: 'Honda Civic - XYZ-5678', address: 'Av. Paulista, 1000' },
  ]);
  const [mechanics, setMechanics, isSyncingMechanics] = useSyncedData('mpro_mechanics', [
    { id: 1, name: 'Roberto Santos', specialty: 'Motor e Suspensão', status: 'Ativo', phone: '(11) 91111-2222' },
    { id: 2, name: 'Carlos Lima', specialty: 'Elétrica e Eletrônica', status: 'Ativo', phone: '(11) 92222-3333' },
  ]);
  const [transactions, setTransactions, isSyncingTransactions] = useSyncedData('mpro_transactions', []);
  const [laborServices, setLaborServices, isSyncingLabor] = useSyncedData('mpro_labor', [
    { id: 1, name: 'Troca de Óleo e Filtro', price: 50.0, category: 'Motor' },
    { id: 2, name: 'Alinhamento e Balanceamento', price: 120.0, category: 'Suspensão' },
    { id: 3, name: 'Revisão de Freios', price: 80.0, category: 'Freios' },
  ]);
  const [shopSettings, setShopSettings, isSyncingSettings] = useSyncedData('mpro_settings', {
    name: 'MECÂNICA PRO',
    phone: '(11) 99999-8888',
    address: 'Rua das Oficinas, 500',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    cnpj: '00.000.000/0001-00',
    logoText: 'MP',
    printType: 'a4'
  });

  const isGlobalSyncing = isSyncingOrders || isSyncingProducts || isSyncingCustomers || isSyncingMechanics || isSyncingTransactions || isSyncingLabor || isSyncingSettings;

  // --- Helpers ---
  const addTransaction = (type, amount, description, category = 'Outros') => {
    const newTx = {
      id: Date.now(),
      date: new Date().toISOString(),
      type, 
      amount: parseFloat(amount) || 0,
      description,
      category
    };
    setTransactions([newTx, ...transactions]);
  };

  const deleteTransaction = (id) => {
    if(confirm('Deseja excluir este lançamento financeiro?')) {
        setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  // --- Print Component ---
  const GlobalPrinter = () => {
    if (!globalPrintData) return null;
    const { type, data } = globalPrintData;

    return (
      <div className={`fixed inset-0 bg-white z-[9999] text-black ${shopSettings.printType === 'thermal' ? 'w-[80mm] p-4 text-[10px]' : 'p-10 text-sm'}`}>
        <div className="text-center border-b-2 border-black pb-4 mb-4">
          <h1 className="text-2xl font-black uppercase tracking-tighter">{shopSettings.name}</h1>
          <p className="text-[10px] uppercase font-bold">{getFullAddress(shopSettings)}</p>
          <p className="text-[10px] font-black">{shopSettings.cnpj ? `CNPJ: ${shopSettings.cnpj}` : ''} | {shopSettings.phone}</p>
          <div className="bg-black text-white text-[10px] py-1 px-4 inline-block mt-3 font-black tracking-widest uppercase">
            {type === 'sale' ? `Comprovante de Venda #${data.id}` : `Ordem de Serviço #${data.id}`}
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 border-b border-black/10 pb-4">
          <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Cliente</p>
            <p className="font-black text-xs uppercase">{data.customerName}</p>
            <p className="text-[10px] font-medium">{data.customerPhone || '---'}</p>
            {data.customerVehicle && data.customerVehicle !== '---' && <p className="text-[10px] font-bold text-blue-700 uppercase">{data.customerVehicle}</p>}
          </div>
          <div className="text-right">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Emissão</p>
            <p className="text-[10px] font-bold">{safeFormat(data.date || data.createdAt, 'dd/MM/yyyy HH:mm')}</p>
          </div>
        </div>

        <div className="mb-4">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-black text-[8px] font-black uppercase tracking-widest">
                <th className="pb-1">Descrição</th>
                <th className="pb-1 text-center">Qtd</th>
                <th className="pb-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-[10px]">
              {type === 'sale' ? (
                data.items.map((item, i) => (
                  <tr key={i} className="h-8">
                    <td>{item.name}</td>
                    <td className="text-center font-bold">x{item.quantity}</td>
                    <td className="text-right font-black">R$ {(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <>
                  {(data.labors || []).map((l, i) => (
                    <tr key={i} className="h-8">
                      <td>{l} (Mão de Obra)</td>
                      <td className="text-center font-bold">1</td>
                      <td className="text-right font-black">---</td>
                    </tr>
                  ))}
                  {(data.parts || []).map((p, i) => (
                    <tr key={i} className="h-8">
                      <td>{p}</td>
                      <td className="text-center font-bold">---</td>
                      <td className="text-right font-black">---</td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center py-4 border-t-2 border-black">
          <span className="text-[10px] font-black uppercase tracking-widest">Total Geral</span>
          <span className="text-2xl font-black">R$ {(parseFloat(data.total) || 0).toFixed(2)}</span>
        </div>

        <div className="mt-16 text-center border-t border-black pt-6">
          <div className="w-48 border-t border-black mx-auto mb-1"></div>
          <p className="text-[8px] font-black uppercase tracking-widest">Assinatura do Cliente</p>
          <p className="text-[10px] font-bold mt-8 italic text-slate-500">Obrigado pela preferência!</p>
        </div>
      </div>
    );
  };

  // --- Sub-components (Welcome, Dashboard, etc.) ---
  // [Components logic here as in previous Turn but cleaned up]

  const Welcome = () => (
    <div className="h-full flex flex-col items-center justify-center text-center space-y-12 py-10 px-4">
        <div className="space-y-4">
          <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-200 animate-bounce mx-auto"><Wrench size={48} /></div>
          <div><h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-2">MECÂNICA<span className="text-blue-600">PRO</span></h1><p className="text-xl text-slate-500 font-medium max-w-md mx-auto text-balance">Gerenciamento inteligente e simplificado para sua oficina.</p></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full max-w-5xl">
            <QuickBtn onClick={() => setActiveTab('orders')} color="blue" icon={<Wrench size={32}/>} label="Ordem de Serviço" sub="Gerenciar Reparos" />
            <QuickBtn onClick={() => setActiveTab('pos')} color="emerald" icon={<ShoppingCart size={32}/>} label="PDV / Vendas" sub="Venda Rápida" />
            <QuickBtn onClick={() => setActiveTab('customers')} color="indigo" icon={<Users size={32}/>} label="Clientes" sub="Base de Dados" />
            <QuickBtn onClick={() => setActiveTab('inventory')} color="amber" icon={<Package size={32}/>} label="Estoque" sub="Peças" />
            <QuickBtn onClick={() => setActiveTab('labor')} color="rose" icon={<FileText size={32}/>} label="Mão de Obra" sub="Serviços" />
        </div>
        <button onClick={() => setActiveTab('management')} className="bg-slate-900 text-white px-10 h-14 rounded-full font-black text-sm uppercase tracking-widest hover:bg-blue-600 hover:scale-105 transition-all shadow-2xl flex items-center gap-4">Acessar Painel de Controle <ChevronRight size={18} /></button>
        <div className="pt-6 text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-4"><span className="w-8 h-[1px] bg-slate-200"></span>EFICIÊNCIA • CONTROLE • RESULTADO<span className="w-8 h-[1px] bg-slate-200"></span></div>
    </div>
  );

  const QuickBtn = ({ onClick, color, icon, label, sub }) => (
    <button onClick={onClick} className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-blue-500 hover:-translate-y-2 transition-all group flex flex-col items-center gap-4">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors shadow-inner ${color === 'blue' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600' : color === 'emerald' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600' : color === 'indigo' ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600' : color === 'rose' ? 'bg-rose-50 text-rose-600 group-hover:bg-rose-600' : 'bg-amber-50 text-amber-600 group-hover:bg-amber-600'} group-hover:text-white`}>{icon}</div>
        <div><h3 className="font-bold text-slate-900 text-sm">{label}</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{sub}</p></div>
    </button>
  );

  const Dashboard = () => {
    const stats = useMemo(() => {
        const activeOS = (Array.isArray(orders) ? orders : []).filter(o => o && o.status !== 'Finalizada').length;
        const lowStock = (Array.isArray(products) ? products : []).filter(p => p && p.stock <= p.minStock).length;
        const todayStr = safeFormat(new Date().toISOString(), 'yyyy-MM-dd');
        const todayRevenue = (Array.isArray(transactions) ? transactions : []).filter(t => safeFormat(t.date, 'yyyy-MM-dd') === todayStr && t.type === 'income').reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
        return { activeOS, lowStock, todayRevenue };
    }, [orders, products, transactions]);

    return (
      <div className="space-y-6">
        <header className="flex justify-between items-center"><div><h1 className="text-2xl font-bold text-slate-900">Dashboard</h1><p className="text-slate-500 text-sm">Resumo operacional.</p></div></header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={<Wrench />} label="O.S. Ativas" value={stats.activeOS} color="blue" />
          <StatCard icon={<Package />} label="Estoque Baixo" value={stats.lowStock} color="rose" />
          <StatCard icon={<DollarSign />} label="Receita Hoje" value={`R$ ${stats.todayRevenue.toFixed(2)}`} color="emerald" />
        </div>
      </div>
    );
  };

  const ManagementConsole = () => {
    const stats = useMemo(() => {
        const totalOS = (orders || []).length;
        const pendingOS = (orders || []).filter(o => o.status !== 'Finalizada').length;
        const finalizedOS = totalOS - pendingOS;
        const monthStr = safeFormat(new Date().toISOString(), 'MM/yyyy');
        const income = (transactions || []).filter(t => t.type === 'income' && safeFormat(t.date, 'MM/yyyy') === monthStr).reduce((acc, t) => acc + t.amount, 0);
        const expense = (transactions || []).filter(t => t.type === 'expense' && safeFormat(t.date, 'MM/yyyy') === monthStr).reduce((acc, t) => acc + t.amount, 0);
        
        const mechCounts = (orders || []).reduce((acc, o) => { acc[o.mechanicName] = (acc[o.mechanicName] || 0) + 1; return acc; }, {});
        const topMechanics = Object.entries(mechCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
        
        return { totalOS, pendingOS, finalizedOS, income, expense, topMechanics };
    }, [orders, transactions]);

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center"><div><h1 className="text-3xl font-black text-slate-900">Gestão Simplificada</h1><p className="text-slate-500">Controle rápido e eficiente.</p></div><button onClick={() => { if(confirm('Limpar banco de dados?')) { window.localStorage.clear(); window.location.reload(); } }} className="text-[10px] text-slate-400 hover:text-rose-500 uppercase font-bold no-print">Limpar Banco</button></header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={<Wrench />} label="Ações" value={stats.pendingOS} color="blue" />
                <StatCard icon={<CheckCircle2 />} label="Eficiência" value={`${stats.totalOS > 0 ? Math.round((stats.finalizedOS / stats.totalOS) * 100) : 0}%`} color="emerald" />
                <StatCard icon={<DollarSign />} label="Ganhos Mês" value={`R$ ${stats.income.toFixed(2)}`} color="blue" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card title="Ranking de Produtividade"><div className="p-4 space-y-3">{stats.topMechanics.map(([name, count], i) => (<div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100"><div><span className="font-bold">{name}</span></div><Badge variant="blue">{count} O.S.</Badge></div>))}{(stats.topMechanics.length === 0) && <EmptyState text="Nenhum dado."/>}</div></Card>
                <Card title="Saúde Financeira"><div className="p-10 bg-slate-900 rounded-2xl text-white"><p className="text-xs uppercase text-slate-400 mb-2">Lucro Projetado</p><p className="text-4xl font-black text-emerald-400">R$ {(stats.income - stats.expense).toFixed(2)}</p></div></Card>
            </div>
        </div>
    );
  };

  const Orders = () => {
    const [isCreating, setCreating] = useState(false);
    const [isEditing, setEditing] = useState(false);
    const [viewingOS, setViewingOS] = useState(null);
    const [productSearch, setProductSearch] = useState('');
    const [newOS, setNewOS] = useState({ customerId: '', customerName: '', vehicle: '', description: '', laborPrice: '', mechanicId: '', selectedLaborIds: [], selectedProducts: [] });

    const handleAddOS = () => {
        const mechanic = mechanics.find(m => m.id.toString() === newOS.mechanicId.toString());
        const selectedLabors = laborServices.filter(s => newOS.selectedLaborIds.includes(s.id.toString()));
        const laborTotal = selectedLabors.reduce((acc, s) => acc + s.price, 0) + (parseFloat(newOS.laborPrice) || 0);
        
        const productDetails = newOS.selectedProducts.map(sp => {
            const product = products.find(p => p.id === sp.id);
            return { name: product?.name, price: product?.price, quantity: sp.quantity, total: (product?.price || 0) * sp.quantity };
        });
        const productsTotal = productDetails.reduce((acc, p) => acc + p.total, 0);

        const osToAdd = {
            id: `OS-${Date.now()}`,
            createdAt: new Date().toISOString(),
            status: 'Pendente',
            customerId: newOS.customerId,
            customerName: newOS.customerName,
            vehicle: newOS.vehicle,
            description: newOS.description,
            mechanicName: mechanic ? mechanic.name : 'Não atribuído',
            labors: selectedLabors.map(s => s.name),
            parts: productDetails.map(p => `${p.name} (x${p.quantity})`),
            total: laborTotal + productsTotal,
            customerPhone: (customers.find(c => c.id.toString() === newOS.customerId.toString()))?.phone || '---'
        };

        setOrders([osToAdd, ...orders]);
        setCreating(false);
        setNewOS({ customerId: '', customerName: '', vehicle: '', description: '', laborPrice: '', mechanicId: '', selectedLaborIds: [], selectedProducts: [] });
    };

    const handleFinalize = (os) => {
        const updated = (orders || []).map(item => item.id === os.id ? {...item, status: 'Finalizada'} : item);
        setOrders(updated);
        addTransaction('income', os.total, `O.S. Finalizada: ${os.id}`, 'Serviço');
        setGlobalPrintData({ type: 'os', data: os });
        setTimeout(() => { window.print(); setGlobalPrintData(null); }, 500);
    };

    return (
        <div className="space-y-6">
            {viewingOS && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[50] p-4 no-print">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b flex justify-between items-center bg-slate-50"><div><h2 className="text-xl font-black text-slate-900">Detalhes O.S. #{viewingOS.id}</h2><p className="text-xs text-slate-500">{safeFormat(viewingOS.createdAt, 'dd/MM/yyyy')}</p></div><button onClick={() => setViewingOS(null)} className="p-2 hover:bg-slate-200 rounded-full"><X size={24}/></button></div>
                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4"><div><p className="text-[10px] font-bold text-slate-400 uppercase">Cliente</p><p className="font-bold">{viewingOS.customerName}</p></div><div><p className="text-[10px] font-bold text-slate-400 uppercase">Veículo</p><p className="font-bold">{viewingOS.vehicle}</p></div></div>
                            <div className="bg-slate-50 p-4 rounded-xl">{(viewingOS.labors || []).map((l, i) => <p key={i} className="text-sm font-medium">• {l}</p>)}</div>
                            <div className="bg-emerald-50 p-4 rounded-xl">{(viewingOS.parts || []).map((p, i) => <p key={i} className="text-sm font-medium">• {p}</p>)}</div>
                        </div>
                        <div className="p-6 bg-slate-50 border-t flex justify-between items-center"><div><p className="text-[10px] font-bold uppercase">Mecânico</p><p className="font-bold">{viewingOS.mechanicName}</p></div><div className="text-right"><p className="text-[10px] font-bold uppercase">Total</p><p className="text-3xl font-black text-blue-600">R$ {(parseFloat(viewingOS.total) || 0).toFixed(2)}</p></div></div>
                        <div className="p-4 bg-white border-t flex gap-3"><button onClick={() => { setGlobalPrintData({type: 'os', data: viewingOS}); setTimeout(() => { window.print(); setGlobalPrintData(null); }, 200); }} className="flex-1 bg-slate-100 text-slate-700 h-12 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"><Printer size={20} /> Imprimir</button><button onClick={() => setViewingOS(null)} className="flex-1 bg-blue-600 text-white h-12 rounded-xl font-bold">Fechar</button></div>
                    </div>
                </div>
            )}
            <header className="flex justify-between items-center no-print"><h1 className="text-2xl font-bold">Ordens de Serviço</h1>{!isCreating && <button onClick={() => setCreating(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Plus size={18}/> Nova O.S.</button>}</header>
            {isCreating && (
                <div className="bg-white p-6 rounded-xl border border-blue-200 bg-slate-50 mb-6 no-print">
                    <div className="grid grid-cols-2 gap-4">
                        <select className="h-10 px-3 rounded-lg border bg-white" value={newOS.customerId} onChange={e => { const c = customers.find(x => x.id.toString() === e.target.value.toString()); setNewOS({...newOS, customerId: e.target.value, customerName: c?.name || '', vehicle: c?.vehicle || ''}) }}>
                            <option value="">Cliente</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <input className="h-10 px-3 rounded-lg border bg-slate-100" value={newOS.vehicle} readOnly placeholder="Veículo" />
                        <select className="h-10 px-3 rounded-lg border bg-white" value={newOS.mechanicId} onChange={e => setNewOS({...newOS, mechanicId: e.target.value})}>
                            <option value="">Mecânico</option>
                            {mechanics.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                        <input className="h-10 px-3 rounded-lg border" placeholder="Mão de Obra Adicional R$" type="number" value={newOS.laborPrice} onChange={e => setNewOS({...newOS, laborPrice: e.target.value})} />
                        
                        <div className="col-span-2">
                           <div className="flex justify-between items-center mb-2">
                              <p className="text-xs font-bold uppercase text-slate-400">Serviços de Mão de Obra</p>
                              <button onClick={() => setActiveTab('labor')} className="text-[10px] text-blue-600 font-bold hover:underline">+ Cadastrar Novo Serviço</button>
                           </div>
                           <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4 max-h-32 overflow-y-auto p-2 bg-white rounded-lg border">
                              {laborServices.map(s => (
                                 <label key={s.id} className="flex items-center gap-2 text-[10px] p-2 hover:bg-slate-50 rounded cursor-pointer border border-transparent hover:border-slate-100 transition-all">
                                    <input 
                                        type="checkbox" 
                                        className="w-3 h-3 text-blue-600"
                                        checked={newOS.selectedLaborIds.includes(s.id.toString())} 
                                        onChange={() => {
                                            const ids = newOS.selectedLaborIds.includes(s.id.toString()) 
                                                ? newOS.selectedLaborIds.filter(i => i !== s.id.toString()) 
                                                : [...newOS.selectedLaborIds, s.id.toString()];
                                            setNewOS({...newOS, selectedLaborIds: ids});
                                        }} 
                                    />
                                    <span className="flex-1 font-bold truncate">{s.name}</span>
                                    <span className="text-blue-600">R$ {s.price.toFixed(2)}</span>
                                 </label>
                              ))}
                           </div>
                        </div>

                        <div className="col-span-2">
                           <p className="text-xs font-bold mb-2">Peças</p>
                           <input className="h-10 px-3 rounded-lg border w-full mb-2" placeholder="Pesquisar..." value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                           {productSearch && <div className="flex flex-wrap gap-2 mb-2">{products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).map(p => <button key={p.id} onClick={() => { const exists = newOS.selectedProducts.find(x => x.id === p.id); if(exists) setNewOS({...newOS, selectedProducts: newOS.selectedProducts.map(x => x.id === p.id ? {...x, quantity: x.quantity + 1} : x)}); else setNewOS({...newOS, selectedProducts: [...newOS.selectedProducts, {id: p.id, quantity: 1}]}); setProductSearch(''); }} className="text-[10px] bg-white border p-1 rounded">+ {p.name}</button>)}</div>}
                           <div className="flex flex-wrap gap-2">{newOS.selectedProducts.map(sp => { const p = products.find(x => x.id === sp.id); return <div key={sp.id} className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded flex items-center gap-2">{p?.name} x{sp.quantity} <X size={10} className="cursor-pointer" onClick={() => setNewOS({...newOS, selectedProducts: newOS.selectedProducts.filter(x => x.id !== sp.id)})} /></div> })}</div>
                        </div>
                    </div>
                    <div className="mt-4 flex gap-2"><button onClick={handleAddOS} className="bg-blue-600 text-white h-10 px-4 rounded-lg font-bold">Criar O.S.</button><button onClick={() => setCreating(false)} className="h-10 px-4 border rounded-lg">Cancelar</button></div>
                </div>
            )}
            <div className="bg-white rounded-lg border overflow-hidden no-print">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-bold uppercase border-b"><tr><th className="px-6 py-3">Cód / Data</th><th className="px-6 py-3">Cliente</th><th className="px-6 py-3">Total / Status</th><th className="px-6 py-3 text-right">Ações</th></tr></thead>
                    <tbody className="divide-y text-sm">
                        {(orders || []).map(o => (
                            <tr key={o.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4"><p className="font-mono text-xs">{o.id}</p><p className="text-[10px] text-slate-400">{safeFormat(o.createdAt, 'dd/MM/yy')}</p></td>
                                <td className="px-6 py-4"><p className="font-bold">{o.customerName}</p><p className="text-xs text-slate-500">{o.vehicle}</p></td>
                                <td className="px-6 py-4 font-bold text-blue-600">R$ {(parseFloat(o.total) || 0).toFixed(2)}<br/><Badge variant={o.status === 'Finalizada' ? 'success' : 'warning'}>{o.status}</Badge></td>
                                <td className="px-6 py-4 text-right"><div className="flex justify-end gap-2"><button onClick={() => setViewingOS(o)} className="p-2 border rounded"><Search size={16}/></button>{o.status !== 'Finalizada' ? <button onClick={() => handleFinalize(o)} className="bg-emerald-600 text-white text-[10px] px-2 py-1 rounded font-bold">Finalizar</button> : <button onClick={() => {setGlobalPrintData({type: 'os', data: o}); setTimeout(() => {window.print(); setGlobalPrintData(null);}, 200)}} className="p-2 border rounded"><Printer size={16}/></button>}<button onClick={() => setOrders(orders.filter(x => x.id !== o.id))} className="p-2 border rounded text-rose-500"><Trash2 size={16}/></button></div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
  };

  const POS = () => {
    const [cart, setCart] = useState([]);
    const [pSearch, setPSearch] = useState('');
    const [cSearch, setCSearch] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleCheckout = () => {
        if (cart.length === 0) return;
        const saleData = {
            id: `VDA-${Date.now()}`,
            date: new Date().toISOString(),
            customerName: selectedCustomer ? selectedCustomer.name : 'Consumidor Final',
            customerVehicle: selectedCustomer ? selectedCustomer.vehicle : '---',
            customerPhone: selectedCustomer ? selectedCustomer.phone : '---',
            items: [...cart],
            total: total
        };
        addTransaction('income', total, `Venda PDV: ${saleData.customerName}`, 'Venda');
        setGlobalPrintData({ type: 'sale', data: saleData });
        setTimeout(() => { window.print(); setGlobalPrintData(null); setCart([]); setSelectedCustomer(null); setCSearch(''); setPSearch(''); }, 500);
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full no-print">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-4 rounded-xl border">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Cliente</p>
            {!selectedCustomer ? <div className="relative"><input className="w-full h-10 pl-10 pr-4 rounded-lg border focus:border-blue-500 outline-none" placeholder="Buscar cliente..." value={cSearch} onChange={e => setCSearch(e.target.value)}/>{cSearch.length > 1 && <div className="absolute top-full left-0 right-0 bg-white border rounded shadow-xl z-50">{customers.filter(c => c.name.toLowerCase().includes(cSearch.toLowerCase())).map(c => <button key={c.id} onClick={() => {setSelectedCustomer(c); setCSearch('')}} className="w-full p-2 text-left hover:bg-slate-50 border-b">{c.name}</button>)}</div>}</div> : <div className="flex justify-between items-center bg-blue-50 p-2 rounded"><div><p className="font-bold text-sm">{selectedCustomer.name}</p></div><button onClick={() => setSelectedCustomer(null)}><X size={18}/></button></div>}
          </div>
          <div className="space-y-4">
            <input className="w-full h-10 px-4 rounded-lg border" placeholder="Buscar produto..." value={pSearch} onChange={e => setPSearch(e.target.value)}/>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{products.filter(p => p.name.toLowerCase().includes(pSearch.toLowerCase())).map(p => (<button key={p.id} onClick={() => { const ex = cart.find(x => x.id === p.id); if(ex) setCart(cart.map(x => x.id === p.id ? {...x, quantity: x.quantity + 1} : x)); else setCart([...cart, {...p, quantity: 1}]); }} className="bg-white p-4 rounded-xl border flex flex-col items-start hover:border-emerald-500 transition-all"><p className="font-bold text-sm">{p.name}</p><p className="text-emerald-600 font-black">R$ {p.price.toFixed(2)}</p></button>))}</div>
          </div>
        </div>
        <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col h-[calc(100vh-160px)]">
            <h3 className="font-black mb-4">CARRINHO</h3>
            <div className="flex-1 overflow-auto space-y-2">{cart.map((item, i) => <div key={i} className="flex justify-between items-center text-xs bg-white/5 p-2 rounded"><span>{item.name} x{item.quantity}</span><span>R$ {(item.price * item.quantity).toFixed(2)}</span></div>)}</div>
            <div className="pt-4 border-t border-white/10 mt-4"><p className="text-2xl font-black mb-4">Total R$ {total.toFixed(2)}</p><button onClick={handleCheckout} disabled={cart.length === 0} className="w-full h-12 bg-emerald-500 rounded-xl font-black text-sm">FINALIZAR</button></div>
        </div>
      </div>
    );
  };

  const Inventory = () => {
    const [search, setSearch] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(null);
    const [newP, setNewP] = useState({ name: '', price: '', stock: '', minStock: '', category: '', images: ['', '', ''] });

    const handleAdd = () => {
        if (!newP.name || !newP.price) return alert('Preencha nome e preço');
        const productToAdd = { 
            ...newP, 
            id: Date.now(), 
            price: parseFloat(newP.price), 
            stock: parseInt(newP.stock) || 0, 
            minStock: parseInt(newP.minStock) || 0,
            images: newP.images.filter(img => img.trim() !== '')
        };
        setProducts([productToAdd, ...products]);
        setIsCreating(false);
        setNewP({ name: '', price: '', stock: '', minStock: '', category: '', images: ['', '', ''] });
    };

    const handleUpdate = () => {
        const updatedProducts = products.map(p => {
            if (p.id === isEditing.id) {
                return {
                    ...isEditing,
                    price: parseFloat(isEditing.price),
                    stock: parseInt(isEditing.stock) || 0,
                    minStock: parseInt(isEditing.minStock) || 0,
                    images: isEditing.images.filter(img => img.trim() !== '')
                };
            }
            return p;
        });
        setProducts(updatedProducts);
        setIsEditing(null);
    };

    const handleFileUpload = (e, idx, state, setState) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const imgs = [...state.images];
                imgs[idx] = reader.result;
                setState({...state, images: imgs});
            };
            reader.readAsDataURL(file);
        }
    };

    const ImageWithZoom = ({ src, className }) => {
        const [isZoomed, setIsZoomed] = useState(false);
        const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

        const handleMouseMove = (e) => {
            const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
            const x = ((e.pageX - left) / width) * 100;
            const y = ((e.pageY - top) / height) * 100;
            setMousePos({ x, y });
        };

        return (
            <div 
                className={`relative overflow-hidden cursor-zoom-in rounded-lg bg-slate-100 ${className}`}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
            >
                <img 
                    src={src || 'https://via.placeholder.com/150?text=Sem+Foto'} 
                    alt="Produto" 
                    className={`w-full h-full object-cover transition-transform duration-200 ${isZoomed ? 'scale-[2.5]' : 'scale-100'}`}
                    style={isZoomed ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` } : {}}
                />
            </div>
        );
    };

    return (
      <div className="space-y-6">
        <header className="flex justify-between items-center no-print">
            <h1 className="text-2xl font-bold">Estoque</h1>
            {!isCreating && !isEditing && <button onClick={() => setIsCreating(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex gap-2 shadow-lg"><Plus size={18} /> Novo Produto</button>}
        </header>

        {(isCreating || isEditing) && (
            <div className="bg-white p-6 rounded-xl border border-blue-200 bg-slate-50 mb-6 shadow-sm">
                <h2 className="text-lg font-bold mb-4">{isEditing ? 'Editar Produto' : 'Cadastrar Novo Produto'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Nome do Produto</label>
                        <input className="w-full h-11 px-4 border rounded-xl" value={isEditing ? isEditing.name : newP.name} onChange={e => isEditing ? setIsEditing({...isEditing, name: e.target.value}) : setNewP({...newP, name: e.target.value})}/>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400">Categoria</label>
                        <input className="w-full h-11 px-4 border rounded-xl" value={isEditing ? isEditing.category : newP.category} onChange={e => isEditing ? setIsEditing({...isEditing, category: e.target.value}) : setNewP({...newP, category: e.target.value})}/>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400">Preço de Venda</label>
                        <input type="number" className="w-full h-11 px-4 border rounded-xl font-bold text-blue-600" value={isEditing ? isEditing.price : newP.price} onChange={e => isEditing ? setIsEditing({...isEditing, price: e.target.value}) : setNewP({...newP, price: e.target.value})}/>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400">Qtd Estoque</label>
                        <input type="number" className="w-full h-11 px-4 border rounded-xl" value={isEditing ? isEditing.stock : newP.stock} onChange={e => isEditing ? setIsEditing({...isEditing, stock: e.target.value}) : setNewP({...newP, stock: e.target.value})}/>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400">Estoque Mínimo</label>
                        <input type="number" className="w-full h-11 px-4 border rounded-xl" value={isEditing ? isEditing.minStock : newP.minStock} onChange={e => isEditing ? setIsEditing({...isEditing, minStock: e.target.value}) : setNewP({...newP, minStock: e.target.value})}/>
                    </div>
                </div>

                <div className="mt-6">
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-2 tracking-widest">Fotos do Produto</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[0, 1, 2].map(idx => (
                            <div key={idx} className="space-y-2">
                                <div className="relative group h-40 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-white hover:border-blue-500 transition-all cursor-pointer overflow-hidden">
                                    {(isEditing ? isEditing.images[idx] : newP.images[idx]) ? (
                                        <>
                                            <img src={isEditing ? isEditing.images[idx] : newP.images[idx]} className="w-full h-full object-cover" />
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const imgs = isEditing ? [...isEditing.images] : [...newP.images];
                                                    imgs[idx] = '';
                                                    isEditing ? setIsEditing({...isEditing, images: imgs}) : setNewP({...newP, images: imgs});
                                                }}
                                                className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={14}/>
                                            </button>
                                        </>
                                    ) : (
                                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                                            <Plus className="text-slate-300 group-hover:text-blue-500 mb-2" size={32} />
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600">Inserir Foto {idx + 1}</span>
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                className="hidden" 
                                                onChange={(e) => handleFileUpload(e, idx, isEditing ? isEditing : newP, isEditing ? setIsEditing : setNewP)} 
                                            />
                                        </label>
                                    )}
                                </div>
                                <input 
                                    className="w-full h-8 px-3 border rounded-lg text-[10px] bg-white/50" 
                                    placeholder="Ou cole a URL aqui..." 
                                    value={isEditing ? (isEditing.images[idx] || '') : newP.images[idx]} 
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (isEditing) {
                                            const imgs = [...isEditing.images];
                                            imgs[idx] = val;
                                            setIsEditing({...isEditing, images: imgs});
                                        } else {
                                            const imgs = [...newP.images];
                                            imgs[idx] = val;
                                            setNewP({...newP, images: imgs});
                                        }
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 flex gap-3">
                    <button onClick={isEditing ? handleUpdate : handleAdd} className="flex-1 bg-slate-900 text-white h-12 rounded-xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl">
                        {isEditing ? 'Salvar Alterações' : 'Cadastrar Produto'}
                    </button>
                    <button onClick={() => { setIsCreating(false); setIsEditing(null); }} className="px-8 h-12 border rounded-xl font-bold text-slate-500 bg-white">Cancelar</button>
                </div>
            </div>
        )}

        {!isCreating && !isEditing && (
            <>
                <div className="relative no-print">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input className="w-full h-12 pl-10 pr-4 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none transition-all shadow-sm" placeholder="Buscar produto por nome ou categoria..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                    {(products || []).filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase())).map(p => (
                        <div key={p.id} className="bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 group">
                            <div className="flex gap-2">
                                {[0, 1, 2].map(idx => (
                                    <ImageWithZoom 
                                        key={idx} 
                                        src={p.images?.[idx]} 
                                        className="w-20 h-20 md:w-24 md:h-24 shadow-inner" 
                                    />
                                ))}
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Badge variant="blue">{p.category || 'Geral'}</Badge>
                                        <h3 className="text-lg font-black text-slate-800 mt-1 uppercase tracking-tight">{p.name}</h3>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => {
                                                const imgs = [...(p.images || [])];
                                                while(imgs.length < 3) imgs.push('');
                                                setIsEditing({...p, images: imgs});
                                            }} 
                                            className="p-2 bg-amber-50 rounded-lg text-amber-600 hover:bg-amber-100 transition-colors"
                                            title="Editar Produto"
                                        >
                                            <Edit size={18}/>
                                        </button>
                                        <button 
                                            onClick={() => { if(confirm('Excluir produto?')) setProducts(products.filter(x => x.id !== p.id)) }} 
                                            className="p-2 bg-rose-50 rounded-lg text-rose-500 hover:bg-rose-100 transition-colors"
                                            title="Excluir Produto"
                                        >
                                            <Trash2 size={18}/>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-end mt-4 md:mt-0">
                                    <div className="flex gap-6">
                                        <div><p className="text-[10px] font-bold text-slate-400 uppercase">Estoque</p><p className={`text-xl font-black ${p.stock <= p.minStock ? 'text-rose-600' : 'text-slate-900'}`}>{p.stock} <span className="text-[10px] font-medium text-slate-400">un</span></p></div>
                                        <div><p className="text-[10px] font-bold text-slate-400 uppercase">Mínimo</p><p className="text-xl font-black text-slate-900">{p.minStock}</p></div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Preço Venda</p>
                                        <p className="text-2xl font-black text-emerald-600">R$ {p.price.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        )}
      </div>
    );
  };

  const Finance = () => {
    const [finSearch, setFinSearch] = useState('');
    const [printingReport, setPrintingReport] = useState(false);
    const balance = transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
    
    const todayStr = safeFormat(new Date().toISOString(), 'yyyy-MM-dd');
    const todayTransactions = (transactions || []).filter(t => safeFormat(t.date, 'yyyy-MM-dd') === todayStr);
    const todayIncome = todayTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const todayExpense = todayTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

    const monthStr = safeFormat(new Date().toISOString(), 'MM/yyyy');
    const monthTransactions = (transactions || []).filter(t => safeFormat(t.date, 'MM/yyyy') === monthStr);
    
    const salesTotal = monthTransactions.filter(t => t.category === 'Venda').reduce((acc, t) => acc + t.amount, 0);
    const servicesTotal = monthTransactions.filter(t => t.category === 'Serviço').reduce((acc, t) => acc + t.amount, 0);

    const filteredTransactions = (transactions || []).filter(t => 
        t.description.toLowerCase().includes(finSearch.toLowerCase())
    );

    const handlePrintDaily = () => {
        setPrintingReport(true);
        setTimeout(() => { window.print(); setPrintingReport(null); }, 500);
    };

    const ManualEntry = ({ type }) => {
        const [d, setD] = useState('');
        const [v, setV] = useState('');
        return (
            <div className={`p-4 rounded-2xl border ${type === 'income' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                <p className={`font-black text-[10px] uppercase mb-3 ${type === 'income' ? 'text-emerald-700' : 'text-rose-700'}`}>Lançar {type === 'income' ? 'Receita' : 'Despesa'}</p>
                <div className="space-y-2">
                    <input className="w-full h-9 px-3 border rounded-lg text-sm outline-none" placeholder="Descrição..." value={d} onChange={e => setD(e.target.value)} />
                    <input type="number" className="w-full h-9 px-3 border rounded-lg text-sm outline-none font-bold" placeholder="Valor R$" value={v} onChange={e => setV(e.target.value)} />
                    <button 
                        onClick={() => { if(d && v) { addTransaction(type, v, d, type === 'income' ? 'Outros' : 'Gasto'); setD(''); setV(''); } }}
                        className={`w-full h-9 rounded-lg text-white font-bold text-xs uppercase tracking-widest ${type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        );
    };

    return (
      <div className="space-y-6">
        {printingReport && (
            <div className={`fixed inset-0 bg-white z-[9999] text-black ${shopSettings.printType === 'thermal' ? 'w-[80mm] p-4 text-[10px]' : 'p-10 text-sm'}`}>
                <div className="text-center border-b-2 border-black pb-4 mb-6">
                    <h1 className="text-2xl font-black">{shopSettings.name}</h1>
                    <h2 className="font-bold uppercase tracking-widest">Fechamento de Caixa Diário</h2>
                    <p>Data: {safeFormat(new Date().toISOString(), 'dd/MM/yyyy')}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-6 border-b pb-4">
                    <div className="text-center">
                        <p className="text-[8px] font-bold uppercase">Entradas</p>
                        <p className="font-black text-emerald-600">R$ {todayIncome.toFixed(2)}</p>
                    </div>
                    <div className="text-center border-x">
                        <p className="text-[8px] font-bold uppercase">Saídas</p>
                        <p className="font-black text-rose-600">R$ {todayExpense.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[8px] font-bold uppercase">Saldo Dia</p>
                        <p className="font-black text-blue-600">R$ {(todayIncome - todayExpense).toFixed(2)}</p>
                    </div>
                </div>
                <table className="w-full text-left text-[9px]">
                    <thead><tr className="border-b"><th>DESCRIÇÃO</th><th className="text-right">VALOR</th></tr></thead>
                    <tbody>
                        {todayTransactions.map(t => (
                            <tr key={t.id} className="border-b/10 h-6">
                                <td>{t.description}</td>
                                <td className={`text-right font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="mt-20 border-t border-black w-48 mx-auto pt-2 text-center text-[8px] font-bold uppercase">Assinatura Responsável</div>
            </div>
        )}

        <header className="flex justify-between items-end no-print">
            <div><h1 className="text-2xl font-bold">Financeiro</h1><p className="text-slate-500">Controle de entradas e saídas.</p></div>
            <div className="flex gap-4 items-end">
                <div className="flex gap-2 mr-4">
                    <div className="bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                        <p className="text-[8px] font-black text-emerald-600 uppercase">Vendas Mês</p>
                        <p className="font-bold text-sm text-emerald-700">R$ {salesTotal.toFixed(2)}</p>
                    </div>
                    <div className="bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                        <p className="text-[8px] font-black text-blue-600 uppercase">Serviços Mês</p>
                        <p className="font-bold text-sm text-blue-700">R$ {servicesTotal.toFixed(2)}</p>
                    </div>
                </div>
                <button onClick={handlePrintDaily} className="h-11 px-5 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-slate-200"><Printer size={16}/> Fechamento</button>
                <div className="text-right"><p className="text-[10px] font-bold text-slate-400">SALDO TOTAL</p><p className={`text-3xl font-black ${balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>R$ {balance.toFixed(2)}</p></div>
            </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 no-print">
            <ManualEntry type="income" />
            <ManualEntry type="expense" />
        </div>

        <div className="bg-white rounded-2xl border overflow-hidden no-print shadow-sm">
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                <h3 className="font-bold text-slate-700 text-sm">Histórico de Movimentações</h3>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input className="w-full h-8 pl-9 pr-4 rounded-lg border text-xs outline-none bg-white" placeholder="Filtrar lançamentos..." value={finSearch} onChange={e => setFinSearch(e.target.value)} />
                </div>
            </div>
            <div className="divide-y overflow-auto max-h-[400px]">
                {filteredTransactions.map(t => (
                    <div key={t.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                        <div className="flex gap-3 items-center">
                            <div className={`p-2 rounded-lg ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{t.type === 'income' ? <Plus size={14}/> : <Trash2 size={14}/>}</div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-sm text-slate-800">{t.description}</p>
                                    {t.category && <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase ${t.category === 'Venda' ? 'bg-emerald-100 text-emerald-700' : t.category === 'Serviço' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>{t.category}</span>}
                                </div>
                                <p className="text-[10px] text-slate-400 uppercase font-medium">{safeFormat(t.date, 'dd MMM HH:mm')}</p>
                            </div>
                        </div>
                        <span className={`font-black text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                        </span>
                        <button onClick={() => deleteTransaction(t.id)} className="ml-4 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-all"><Trash2 size={14}/></button>
                    </div>
                ))}
                {filteredTransactions.length === 0 && <EmptyState text="Nenhum lançamento encontrado." />}
            </div>
        </div>
      </div>
    );
  };

  const Customers = () => {
    const [sel, setSel] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(null);
    const [newC, setNewC] = useState({ name: '', phone: '', email: '', vehicle: '', address: '' });

    const handleAdd = () => {
        if (!newC.name || !newC.vehicle) return alert('Nome e Veículo são obrigatórios');
        const customerToAdd = { ...newC, id: Date.now() };
        setCustomers([customerToAdd, ...customers]);
        setIsCreating(false);
        setNewC({ name: '', phone: '', email: '', vehicle: '', address: '' });
    };

    const handleUpdate = () => {
        if (!isEditing.name || !isEditing.vehicle) return alert('Nome e Veículo são obrigatórios');
        const updated = customers.map(c => c.id === isEditing.id ? isEditing : c);
        setCustomers(updated);
        setIsEditing(null);
        if (sel && sel.id === isEditing.id) setSel(isEditing);
    };

    const CustomerForm = ({ data, setData, onSubmit, onCancel, title }) => (
        <div className="bg-white p-6 rounded-xl border border-blue-200 bg-slate-50 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="text-lg font-bold mb-4">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Nome Completo</label>
                    <input className="w-full h-11 px-4 rounded-xl border-2 border-white focus:border-blue-500 outline-none transition-all" value={data.name} onChange={e => setData({...data, name: e.target.value})} placeholder="Ex: João Silva" />
                </div>
                <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Veículo (Modelo e Placa)</label>
                    <input className="w-full h-11 px-4 rounded-xl border-2 border-white focus:border-blue-500 outline-none transition-all" value={data.vehicle} onChange={e => setData({...data, vehicle: e.target.value})} placeholder="Ex: Corolla - ABC-1234" />
                </div>
                <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Telefone</label>
                    <input className="w-full h-11 px-4 rounded-xl border-2 border-white focus:border-blue-500 outline-none transition-all" value={data.phone} onChange={e => setData({...data, phone: e.target.value})} placeholder="(11) 99999-9999" />
                </div>
                <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Email</label>
                    <input className="w-full h-11 px-4 rounded-xl border-2 border-white focus:border-blue-500 outline-none transition-all" value={data.email} onChange={e => setData({...data, email: e.target.value})} placeholder="cliente@email.com" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Endereço</label>
                    <input className="w-full h-11 px-4 rounded-xl border-2 border-white focus:border-blue-500 outline-none transition-all" value={data.address} onChange={e => setData({...data, address: e.target.value})} placeholder="Rua, Número, Bairro" />
                </div>
            </div>
            <div className="mt-8 flex gap-3">
                <button onClick={onSubmit} className="flex-1 bg-blue-600 text-white h-12 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">Salvar Cliente</button>
                <button onClick={onCancel} className="px-6 h-12 rounded-xl font-bold text-slate-500 bg-white border border-slate-200">Cancelar</button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center no-print">
                <h1 className="text-2xl font-bold">Clientes</h1>
                {!sel && !isCreating && !isEditing && <button onClick={() => setIsCreating(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:bg-blue-700 transition-all"><Plus size={18} /> Novo Cliente</button>}
                {(sel || isCreating || isEditing) && <button onClick={() => { setSel(null); setIsCreating(false); setIsEditing(null); }} className="text-blue-600 font-bold flex items-center gap-1 hover:underline"><ChevronRight size={16} className="rotate-180" /> Voltar para Lista</button>}
            </header>

            {isCreating && <CustomerForm data={newC} setData={setNewC} onSubmit={handleAdd} onCancel={() => setIsCreating(false)} title="Cadastrar Novo Cliente" />}
            {isEditing && <CustomerForm data={isEditing} setData={setIsEditing} onSubmit={handleUpdate} onCancel={() => setIsEditing(null)} title="Editar Cadastro de Cliente" />}

            {!sel && !isCreating && !isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {customers.map(c => (
                        <div key={c.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-500 transition-all group flex flex-col justify-between h-40">
                            <div className="flex justify-between items-start">
                                <div className="cursor-pointer flex-1" onClick={() => setSel(c)}>
                                    <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">{c.name}</h3>
                                    <p className="text-xs text-blue-600 font-medium">{c.vehicle}</p>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setIsEditing(c)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg"><Edit size={14} /></button>
                                    <button onClick={() => { if(confirm('Excluir cliente?')) setCustomers(customers.filter(x => x.id !== c.id)) }} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={14} /></button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-black tracking-widest mt-auto border-t pt-3">
                                <span>{c.phone}</span>
                                <div className="flex items-center gap-1 cursor-pointer" onClick={() => setSel(c)}>
                                    <span>Ver Histórico</span>
                                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform text-blue-500" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : sel && !isEditing && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="bg-blue-600 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-6 right-6 z-20">
                            <button onClick={() => setIsEditing(sel)} className="bg-white/20 hover:bg-white/30 p-3 rounded-2xl backdrop-blur-xl border border-white/20 transition-all"><Edit size={20}/></button>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/30 text-2xl font-black">{sel.name[0]}</div>
                                <div>
                                    <h2 className="text-4xl font-black tracking-tighter">{sel.name}</h2>
                                    <p className="bg-white/20 px-3 py-0.5 rounded-full inline-block text-[10px] font-black uppercase tracking-widest backdrop-blur-md mt-1">{sel.vehicle}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-6 border-t border-white/10">
                                <div><p className="text-[10px] uppercase font-black opacity-50 tracking-[0.2em] mb-1">Telefone</p><p className="font-bold text-lg">{sel.phone}</p></div>
                                <div><p className="text-[10px] uppercase font-black opacity-50 tracking-[0.2em] mb-1">Email</p><p className="font-bold text-lg truncate">{sel.email || 'Não informado'}</p></div>
                                <div className="col-span-2 md:col-span-1"><p className="text-[10px] uppercase font-black opacity-50 tracking-[0.2em] mb-1">Endereço</p><p className="font-bold text-lg leading-tight">{sel.address || 'Não informado'}</p></div>
                            </div>
                        </div>
                        <Users className="absolute -right-16 -bottom-16 w-80 h-80 opacity-5 rotate-12" />
                    </div>

                    <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
                        <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2"><History size={16} className="text-blue-500" /> Histórico de Serviços</h3>
                            <Badge variant="blue">{orders.filter(o => o.customerId?.toString() === sel.id?.toString()).length} VISITAS</Badge>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {orders.filter(o => o.customerId?.toString() === sel.id?.toString()).map(o => (
                                <div key={o.id} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-6">
                                        <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><Wrench size={24} /></div>
                                        <div>
                                            <p className="font-black text-slate-900">O.S. #{o.id}</p>
                                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{safeFormat(o.createdAt, 'dd MMMM yyyy')}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-2xl text-slate-900">R$ {(parseFloat(o.total) || 0).toFixed(2)}</p>
                                        <Badge variant={o.status === 'Finalizada' ? 'success' : 'warning'}>{o.status}</Badge>
                                    </div>
                                </div>
                            ))}
                            {orders.filter(o => o.customerId?.toString() === sel.id?.toString()).length === 0 && <EmptyState text="Nenhuma ordem de serviço registrada para este cliente." />}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
  };

  const Team = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [newM, setNewM] = useState({ name: '', specialty: '', status: 'Ativo' });

    const handleAdd = () => {
        if (!newM.name) return alert('Nome é obrigatório');
        setMechanics([{ ...newM, id: Date.now() }, ...mechanics]);
        setIsCreating(false);
        setNewM({ name: '', specialty: '', status: 'Ativo' });
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center no-print">
                <h1 className="text-2xl font-bold text-slate-900">Equipe de Mecânicos</h1>
                {!isCreating && <button onClick={() => setIsCreating(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Plus size={18} /> Novo Mecânico</button>}
            </header>

            {isCreating && (
                <div className="bg-white p-6 rounded-xl border border-blue-200 bg-slate-50 mb-6">
                    <h2 className="text-lg font-bold mb-4">Cadastrar Mecânico</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className="text-[10px] font-bold uppercase text-slate-400">Nome</label><input className="w-full h-10 px-3 border rounded" value={newM.name} onChange={e => setNewM({...newM, name: e.target.value})}/></div>
                        <div><label className="text-[10px] font-bold uppercase text-slate-400">Especialidade</label><input className="w-full h-10 px-3 border rounded" value={newM.specialty} onChange={e => setNewM({...newM, specialty: e.target.value})}/></div>
                        <div><label className="text-[10px] font-bold uppercase text-slate-400">Status</label><select className="w-full h-10 px-3 border rounded bg-white" value={newM.status} onChange={e => setNewM({...newM, status: e.target.value})}><option value="Ativo">Ativo</option><option value="Inativo">Inativo</option></select></div>
                    </div>
                    <div className="mt-4 flex gap-2"><button onClick={handleAdd} className="bg-blue-600 text-white h-10 px-4 rounded-lg font-bold">Salvar</button><button onClick={() => setIsCreating(false)} className="h-10 px-4 border rounded-lg">Cancelar</button></div>
                </div>
            )}

            <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-bold border-b"><tr><th className="px-6 py-3">Nome</th><th className="px-6 py-3">Especialidade</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Ações</th></tr></thead>
                    <tbody className="divide-y text-sm">
                        {mechanics.map(m => (
                            <tr key={m.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-bold">{m.name}</td>
                                <td className="px-6 py-4">{m.specialty}</td>
                                <td className="px-6 py-4"><Badge variant={m.status === 'Ativo' ? 'success' : 'warning'}>{m.status}</Badge></td>
                                <td className="px-6 py-4 text-right"><button onClick={() => setMechanics(mechanics.filter(x => x.id !== m.id))} className="text-rose-500"><Trash2 size={16}/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
  };
  const LaborManagement = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [newL, setNewL] = useState({ name: '', price: '' });

    const handleAdd = () => {
        if (!newL.name || !newL.price) return alert('Preencha nome e preço');
        setLaborServices([{ ...newL, id: Date.now(), price: parseFloat(newL.price) }, ...laborServices]);
        setIsCreating(false);
        setNewL({ name: '', price: '' });
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center no-print">
                <h1 className="text-2xl font-bold text-slate-900">Mão de Obra</h1>
                {!isCreating && <button onClick={() => setIsCreating(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Plus size={18} /> Inserir Mão de Obra</button>}
            </header>

            {isCreating && (
                <div className="bg-white p-6 rounded-xl border border-blue-200 bg-slate-50 mb-6">
                    <h2 className="text-lg font-bold mb-4">Cadastrar Serviço</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="text-[10px] font-bold uppercase text-slate-400">Nome do Serviço</label><input className="w-full h-10 px-3 border rounded" value={newL.name} onChange={e => setNewL({...newL, name: e.target.value})} placeholder="Ex: Troca de Pastilhas" /></div>
                        <div><label className="text-[10px] font-bold uppercase text-slate-400">Preço Base (R$)</label><input type="number" className="w-full h-10 px-3 border rounded" value={newL.price} onChange={e => setNewL({...newL, price: e.target.value})} placeholder="0.00" /></div>
                    </div>
                    <div className="mt-4 flex gap-2"><button onClick={handleAdd} className="bg-blue-600 text-white h-10 px-4 rounded-lg font-bold">Salvar</button><button onClick={() => setIsCreating(false)} className="h-10 px-4 border rounded-lg">Cancelar</button></div>
                </div>
            )}

            <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-bold border-b"><tr><th className="px-6 py-3">Serviço</th><th className="px-6 py-3">Preço Base</th><th className="px-6 py-3 text-right">Ações</th></tr></thead>
                    <tbody className="divide-y text-sm">
                        {laborServices.map(s => (
                            <tr key={s.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-bold">{s.name}</td>
                                <td className="px-6 py-4 text-blue-600 font-bold">R$ {s.price.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right"><button onClick={() => setLaborServices(laborServices.filter(x => x.id !== s.id))} className="text-rose-500"><Trash2 size={16}/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
  };
  const Settings = () => (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Ajustes da Oficina</h1>
      <div className="bg-white p-8 rounded-2xl border max-w-2xl shadow-sm">
        <div className="space-y-5">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Nome da Oficina</label>
            <input className="w-full h-11 px-4 border rounded-xl focus:border-blue-500 outline-none transition-all" value={shopSettings.name} onChange={e => setShopSettings({...shopSettings, name: e.target.value})}/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">CNPJ</label>
              <input className="w-full h-11 px-4 border rounded-xl focus:border-blue-500 outline-none transition-all" value={shopSettings.cnpj} onChange={e => setShopSettings({...shopSettings, cnpj: e.target.value})} placeholder="00.000.000/0000-00"/>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Telefone</label>
              <input className="w-full h-11 px-4 border rounded-xl focus:border-blue-500 outline-none transition-all" value={shopSettings.phone} onChange={e => setShopSettings({...shopSettings, phone: e.target.value})}/>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Logradouro (Rua e Número)</label>
            <input className="w-full h-11 px-4 border rounded-xl focus:border-blue-500 outline-none transition-all" value={shopSettings.address} onChange={e => setShopSettings({...shopSettings, address: e.target.value})} placeholder="Ex: Rua das Flores, 123"/>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Bairro</label>
                <input className="w-full h-11 px-4 border rounded-xl focus:border-blue-500 outline-none transition-all" value={shopSettings.neighborhood} onChange={e => setShopSettings({...shopSettings, neighborhood: e.target.value})} placeholder="Ex: Centro"/>
            </div>
            <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Cidade</label>
                <input className="w-full h-11 px-4 border rounded-xl focus:border-blue-500 outline-none transition-all" value={shopSettings.city} onChange={e => setShopSettings({...shopSettings, city: e.target.value})} placeholder="Ex: São Paulo"/>
            </div>
            <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Estado (UF)</label>
                <input className="w-full h-11 px-4 border rounded-xl focus:border-blue-500 outline-none transition-all" maxLength="2" value={shopSettings.state} onChange={e => setShopSettings({...shopSettings, state: e.target.value})} placeholder="Ex: SP"/>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Tipo de Impressão Padrão</label>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setShopSettings({...shopSettings, printType: 'a4'})} className={`h-12 border rounded-xl font-bold transition-all ${shopSettings.printType === 'a4' ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>Folha A4</button>
              <button onClick={() => setShopSettings({...shopSettings, printType: 'thermal'})} className={`h-12 border rounded-xl font-bold transition-all ${shopSettings.printType === 'thermal' ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>Recibo Térmico</button>
            </div>
          </div>
          <div className="pt-4 border-t">
            <button onClick={() => alert('Configurações salvas com sucesso!')} className="w-full bg-slate-900 text-white h-12 rounded-xl font-black uppercase tracking-widest hover:bg-black transition-all">Salvar Alterações</button>
          </div>
        </div>
      </div>
    </div>
  );

  const StatCard = ({ icon, label, value, color }) => {
    const colors = { blue: 'bg-blue-50 text-blue-600', rose: 'bg-rose-50 text-rose-600', emerald: 'bg-emerald-50 text-emerald-600' };
    return <div className="bg-white p-6 rounded-xl border flex items-center gap-4"><div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[color]}`}>{icon}</div><div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p><h3 className="text-2xl font-black">{value}</h3></div></div>;
  };

  const Card = ({ title, children }) => <div className="bg-white rounded-xl border overflow-hidden"><div className="p-4 border-b font-bold">{title}</div>{children}</div>;
  const EmptyState = ({ text }) => <div className="p-10 text-center text-slate-400 text-sm">{text}</div>;

  const FloatingActions = () => {
    const [isOpen, setIsOpen] = useState(false);
    const actions = [
      { tab: 'orders', icon: <Wrench size={20} />, color: 'bg-blue-600' },
      { tab: 'pos', icon: <ShoppingCart size={20} />, color: 'bg-emerald-600' },
      { tab: 'customers', icon: <Users size={20} />, color: 'bg-indigo-600' },
      { tab: 'inventory', icon: <Package size={20} />, color: 'bg-amber-600' },
      { tab: 'labor', icon: <FileText size={20} />, color: 'bg-rose-600' },
    ];
    return (
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-3 no-print">
        {isOpen && actions.map((a, i) => (<button key={i} onClick={() => { setActiveTab(a.tab); setIsOpen(false); }} className={`${a.color} w-12 h-12 rounded-full flex items-center justify-center text-white shadow-2xl`}>{a.icon}</button>))}
        <button onClick={() => setIsOpen(!isOpen)} className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl ${isOpen ? 'bg-rose-500' : 'bg-slate-900'}`}>{isOpen ? <X size={28} /> : <Plus size={28} />}</button>
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {!currentUser && <Login />}
      <GlobalPrinter />
      <FloatingActions />
      <aside className="bg-slate-900 text-slate-300 w-64 shrink-0 flex flex-col no-print">
        <div className="p-6 border-b border-slate-800"><h2 className="text-white font-black text-xl tracking-tighter">MECÂNICA<span className="text-blue-500">PRO</span></h2></div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Menu size={20} />} label="Início" />
          <NavItem active={activeTab === 'management'} onClick={() => setActiveTab('management')} icon={<LayoutDashboard size={20} />} label="Gestão Simplificada" />
          <NavItem active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<Wrench size={20} />} label="Ordens de Serviço" />
          <NavItem active={activeTab === 'pos'} onClick={() => setActiveTab('pos')} icon={<ShoppingCart size={20} />} label="PDV" />
          <NavItem active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Package size={20} />} label="Estoque" />
          <NavItem active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} icon={<Users size={20} />} label="Clientes" />
          <NavItem active={activeTab === 'team'} onClick={() => setActiveTab('team')} icon={<UserCheck size={20} />} label="Mecânicos" />
          <NavItem active={activeTab === 'labor'} onClick={() => setActiveTab('labor')} icon={<FileText size={20} />} label="Mão de Obra" />
          <NavItem active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon={<DollarSign size={20} />} label="Financeiro" />
          <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Menu size={20} />} label="Ajustes" />
        </nav>
        <div className="p-4 border-t border-slate-800 mt-auto no-print">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold">{shopSettings.logoText}</div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-white truncate">{shopSettings.name}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider text-xs">MODO GESTOR</p>
            </div>
            <button 
                onClick={() => { setCurrentUser(null); window.localStorage.removeItem('mpro_user'); }}
                className="p-1.5 text-slate-500 hover:text-rose-500 transition-colors"
                title="Sair"
            >
                <X size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden no-print">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0 text-xs font-bold text-slate-400 uppercase">
          <div className="flex items-center gap-2">
            {isGlobalSyncing ? (
              <span className="flex items-center gap-1.5 text-blue-500 animate-pulse">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Sincronizando...
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-500">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                Nuvem Conectada
              </span>
            )}
          </div>
          <div>{safeFormat(new Date().toISOString(), 'EEEE, dd MMMM')}</div>
        </header>
        <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-5xl mx-auto h-full">
                {activeTab === 'home' && <Welcome />}
                {activeTab === 'management' && <ManagementConsole />}
                {activeTab === 'orders' && <Orders />}
                {activeTab === 'pos' && <POS />}
                {activeTab === 'finance' && <Finance />}
                {activeTab === 'inventory' && <Inventory />}
                {activeTab === 'customers' && <Customers />}
                {activeTab === 'team' && <Team />}
                {activeTab === 'labor' && <LaborManagement />}
                {activeTab === 'settings' && <Settings />}
            </div>
        </div>
      </main>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);