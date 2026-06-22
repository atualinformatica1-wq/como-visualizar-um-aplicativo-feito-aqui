import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Wrench, 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  Plus, 
  Search, 
  Printer, 
  Trash2, 
  Save, 
  CheckCircle2, 
  AlertTriangle,
  History,
  ChevronRight,
  Menu,
  X,
  FileText,
  UserCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// --- Utility Hooks ---
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {}
  };

  return [storedValue, setValue];
}

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
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // --- Data State ---
  const [orders, setOrders] = useLocalStorage('mpro_orders', []);
  const [products, setProducts] = useLocalStorage('mpro_products', [
    { id: 1, name: 'Óleo Sintético 5W30', category: 'Lubrificantes', price: 65.0, stock: 45, minStock: 10 },
    { id: 2, name: 'Filtro de Óleo', category: 'Filtros', price: 35.0, stock: 12, minStock: 5 },
    { id: 3, name: 'Pastilha de Freio Dianteira', category: 'Freios', price: 180.0, stock: 8, minStock: 3 },
    { id: 4, name: 'Fluido de Arrefecimento', category: 'Químicos', price: 45.0, stock: 2, minStock: 5 },
  ]);
  const [customers, setCustomers] = useLocalStorage('mpro_customers', [
    { id: 1, name: 'João Silva', phone: '(11) 98888-7777', email: 'joao@email.com', vehicle: 'Toyota Corolla - ABC-1234' },
    { id: 2, name: 'Maria Oliveira', phone: '(11) 97777-6666', email: 'maria@email.com', vehicle: 'Honda Civic - XYZ-5678' },
  ]);
  const [mechanics, setMechanics] = useLocalStorage('mpro_mechanics', [
    { id: 1, name: 'Roberto Santos', specialty: 'Motor e Suspensão', status: 'Ativo' },
    { id: 2, name: 'Carlos Lima', specialty: 'Elétrica e Eletrônica', status: 'Ativo' },
  ]);
  const [transactions, setTransactions] = useLocalStorage('mpro_transactions', []);

  // --- Helpers ---
  const addTransaction = (type, amount, description) => {
    const newTx = {
      id: Date.now(),
      date: new Date().toISOString(),
      type, // 'income' or 'expense'
      amount,
      description
    };
    setTransactions([newTx, ...transactions]);
  };

  // --- Dashboard View ---
  const Dashboard = () => {
    const stats = useMemo(() => {
      const activeOS = orders.filter(o => o.status !== 'Finalizada').length;
      const lowStock = products.filter(p => p.stock <= p.minStock).length;
      const todayRevenue = transactions
        .filter(t => format(new Date(t.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);

      return { activeOS, lowStock, todayRevenue };
    }, []);

    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Bem-vindo ao MecânicaPro, sua oficina em números.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <Wrench size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">O.S. Ativas</p>
              <h3 className="text-2xl font-bold">{stats.activeOS}</h3>
            </div>
          </div>
          <div className="card p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center">
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Estoque Baixo</p>
              <h3 className="text-2xl font-bold">{stats.lowStock}</h3>
            </div>
          </div>
          <div className="card p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Receita de Hoje</p>
              <h3 className="text-2xl font-bold">R$ {stats.todayRevenue.toFixed(2)}</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold">Ordens de Serviço Recentes</h3>
              <button onClick={() => setActiveTab('orders')} className="text-sm text-blue-600 hover:underline">Ver todas</button>
            </div>
            <div className="divide-y divide-slate-50">
              {orders.slice(0, 5).map(order => (
                <div key={order.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{order.customerName}</p>
                    <p className="text-xs text-slate-500">{order.vehicle}</p>
                  </div>
                  <Badge variant={order.status === 'Finalizada' ? 'success' : 'blue'}>{order.status}</Badge>
                </div>
              ))}
              {orders.length === 0 && <p className="p-8 text-center text-slate-400 text-sm">Nenhuma ordem de serviço registrada.</p>}
            </div>
          </div>

          <div className="card">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold">Avisos de Estoque</h3>
              <button onClick={() => setActiveTab('inventory')} className="text-sm text-blue-600 hover:underline">Gerenciar</button>
            </div>
            <div className="divide-y divide-slate-50">
              {products.filter(p => p.stock <= p.minStock).map(p => (
                <div key={p.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-rose-500">Mínimo: {p.minStock} unidades</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{p.stock}</p>
                    <p className="text-[10px] text-slate-400">em estoque</p>
                  </div>
                </div>
              ))}
              {products.filter(p => p.stock <= p.minStock).length === 0 && (
                <p className="p-8 text-center text-slate-400 text-sm">Todo o estoque está em níveis normais.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Service Orders View ---
  const ServiceOrders = () => {
    const [isCreating, setCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newOS, setNewOS] = useState({
      customerName: '',
      vehicle: '',
      description: '',
      mechanicId: '',
      status: 'Aguardando Início',
      items: [],
      laborPrice: 0
    });

    const filteredOrders = orders.filter(o => 
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      o.vehicle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateOS = () => {
      const orderToAdd = {
        ...newOS,
        id: `OS-${Date.now()}`,
        createdAt: new Date().toISOString(),
        total: parseFloat(newOS.laborPrice) + newOS.items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
      };
      setOrders([orderToAdd, ...orders]);
      setCreating(false);
      setNewOS({ customerName: '', vehicle: '', description: '', mechanicId: '', status: 'Aguardando Início', items: [], laborPrice: 0 });
    };

    return (
      <div className="space-y-6">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ordens de Serviço</h1>
            <p className="text-slate-500">Gerencie os reparos e manutenções em andamento.</p>
          </div>
          <button onClick={() => setCreating(true)} className="btn-primary">
            <Plus size={18} /> Nova O.S.
          </button>
        </header>

        {isCreating ? (
          <div className="card p-6 bg-slate-50 border-blue-200">
            <h2 className="text-lg font-bold mb-4">Nova Ordem de Serviço</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Cliente</label>
                <input 
                  type="text" className="input" placeholder="Nome do cliente"
                  value={newOS.customerName} onChange={e => setNewOS({...newOS, customerName: e.target.value})}
                />
              </div>
              <div>
                <label className="label">Veículo (Modelo e Placa)</label>
                <input 
                  type="text" className="input" placeholder="Ex: Honda Civic - ABC-1234"
                  value={newOS.vehicle} onChange={e => setNewOS({...newOS, vehicle: e.target.value})}
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Descrição do Problema / Serviço</label>
                <textarea 
                  className="input h-24 py-2 resize-none" placeholder="Detalhes do serviço..."
                  value={newOS.description} onChange={e => setNewOS({...newOS, description: e.target.value})}
                ></textarea>
              </div>
              <div>
                <label className="label">Mecânico Responsável</label>
                <select 
                  className="input" value={newOS.mechanicId} 
                  onChange={e => setNewOS({...newOS, mechanicId: e.target.value})}
                >
                  <option value="">Selecione um mecânico</option>
                  {mechanics.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Mão de Obra (R$)</label>
                <input 
                  type="number" className="input"
                  value={newOS.laborPrice} onChange={e => setNewOS({...newOS, laborPrice: e.target.value})}
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={handleCreateOS} className="btn-primary">Criar O.S.</button>
              <button onClick={() => setCreating(false)} className="btn-secondary">Cancelar</button>
            </div>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" className="input pl-10" placeholder="Buscar por cliente ou veículo..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
                    <th className="px-6 py-3">CÓDIGO</th>
                    <th className="px-6 py-3">CLIENTE / VEÍCULO</th>
                    <th className="px-6 py-3">STATUS</th>
                    <th className="px-6 py-3">DATA</th>
                    <th className="px-6 py-3 text-right">AÇÕES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs">{order.id}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-sm">{order.customerName}</p>
                        <p className="text-xs text-slate-500">{order.vehicle}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={order.status === 'Finalizada' ? 'success' : 'blue'}>{order.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-blue-600">
                          <Printer size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-400">Nenhuma ordem de serviço encontrada.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    );
  };

  // --- Inventory View ---
  const Inventory = () => {
    const [isEditing, setEditing] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
      <div className="space-y-6">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Estoque e Produtos</h1>
            <p className="text-slate-500">Controle de peças, lubrificantes e acessórios.</p>
          </div>
          <button className="btn-primary"><Plus size={18} /> Novo Produto</button>
        </header>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" className="input pl-10" placeholder="Buscar produto..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="card">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
                <th className="px-6 py-3">PRODUTO</th>
                <th className="px-6 py-3">CATEGORIA</th>
                <th className="px-6 py-3">PREÇO</th>
                <th className="px-6 py-3">QTD ESTOQUE</th>
                <th className="px-6 py-3 text-right">ESTADO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-sm">{p.name}</td>
                  <td className="px-6 py-4 text-xs">{p.category}</td>
                  <td className="px-6 py-4 font-medium text-sm">R$ {p.price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={p.stock <= p.minStock ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                      {p.stock} un
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {p.stock <= p.minStock ? (
                      <Badge variant="danger">Crítico</Badge>
                    ) : (
                      <Badge variant="success">Normal</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // --- POS View ---
  const POS = () => {
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const addToCart = (product) => {
      const exists = cart.find(item => item.id === product.id);
      if (exists) {
        setCart(cart.map(item => item.id === product.id ? {...item, quantity: item.quantity + 1} : item));
      } else {
        setCart([...cart, {...product, quantity: 1}]);
      }
    };

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleCheckout = () => {
      if (cart.length === 0) return;
      
      // Update stock
      const updatedProducts = products.map(p => {
        const cartItem = cart.find(c => c.id === p.id);
        if (cartItem) return {...p, stock: p.stock - cartItem.quantity};
        return p;
      });
      setProducts(updatedProducts);

      // Record transaction
      addTransaction('income', total, `Venda PDV: ${cart.length} itens`);
      
      alert('Venda realizada com sucesso! Gerando recibo...');
      setCart([]);
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" className="input pl-10" placeholder="Código ou nome do produto..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map(p => (
              <button 
                key={p.id} onClick={() => addToCart(p)}
                className="card p-4 text-left hover:border-blue-500 hover:bg-blue-50 transition-all flex justify-between items-center group"
              >
                <div>
                  <p className="font-bold text-sm">{p.name}</p>
                  <p className="text-xs text-slate-500">R$ {p.price.toFixed(2)}</p>
                </div>
                <ShoppingCart size={18} className="text-slate-300 group-hover:text-blue-500" />
              </button>
            ))}
          </div>
        </div>

        <div className="card flex flex-col h-[calc(100vh-140px)]">
          <div className="p-4 border-b border-slate-100 flex items-center gap-2">
            <ShoppingCart size={18} className="text-slate-400" />
            <h3 className="font-bold">Carrinho de Vendas</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-slate-50 p-2 rounded">
                <div>
                  <p className="text-xs font-bold">{item.name}</p>
                  <p className="text-[10px] text-slate-500">{item.quantity} x R$ {item.price.toFixed(2)}</p>
                </div>
                <button onClick={() => setCart(cart.filter(i => i.id !== item.id))} className="text-rose-500">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <ShoppingCart size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">Carrinho vazio</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span className="text-blue-600">R$ {total.toFixed(2)}</span>
            </div>
            <button 
              onClick={handleCheckout} disabled={cart.length === 0}
              className="w-full btn-primary h-12 text-lg disabled:bg-slate-300"
            >
              Finalizar Venda
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --- Finance View ---
  const Finance = () => {
    const balance = transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);

    return (
      <div className="space-y-6">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Fluxo de Caixa</h1>
            <p className="text-slate-500">Controle financeiro da oficina.</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 font-medium">Saldo Atual</p>
            <h2 className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              R$ {balance.toFixed(2)}
            </h2>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 border-emerald-100 bg-emerald-50/20">
            <h3 className="font-bold text-emerald-700 flex items-center gap-2 mb-4">
              <Plus size={18} /> Lançar Receita
            </h3>
            <div className="space-y-4">
              <input type="text" className="input" placeholder="Descrição" id="inc_desc" />
              <input type="number" className="input" placeholder="Valor (R$)" id="inc_val" />
              <button 
                onClick={() => {
                  const d = document.getElementById('inc_desc').value;
                  const v = parseFloat(document.getElementById('inc_val').value);
                  if (d && v) { addTransaction('income', v, d); document.getElementById('inc_desc').value = ''; document.getElementById('inc_val').value = ''; }
                }}
                className="w-full btn-primary bg-emerald-600 hover:bg-emerald-700"
              >
                Registrar Entrada
              </button>
            </div>
          </div>

          <div className="card p-6 border-rose-100 bg-rose-50/20">
            <h3 className="font-bold text-rose-700 flex items-center gap-2 mb-4">
              <Trash2 size={18} /> Lançar Despesa
            </h3>
            <div className="space-y-4">
              <input type="text" className="input" placeholder="Descrição" id="exp_desc" />
              <input type="number" className="input" placeholder="Valor (R$)" id="exp_val" />
              <button 
                onClick={() => {
                  const d = document.getElementById('exp_desc').value;
                  const v = parseFloat(document.getElementById('exp_val').value);
                  if (d && v) { addTransaction('expense', v, d); document.getElementById('exp_desc').value = ''; document.getElementById('exp_val').value = ''; }
                }}
                className="w-full btn-primary bg-rose-600 hover:bg-rose-700"
              >
                Registrar Saída
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold">Histórico de Transações</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {transactions.map(t => (
              <div key={t.id} className="p-4 flex justify-between items-center">
                <div className="flex gap-4 items-center">
                  <div className={`p-2 rounded ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {t.type === 'income' ? <Plus size={16} /> : <Trash2 size={16} />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t.description}</p>
                    <p className="text-[10px] text-slate-500 uppercase">{format(new Date(t.date), 'dd MMM, yyyy HH:mm', { locale: ptBR })}</p>
                  </div>
                </div>
                <p className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                </p>
              </div>
            ))}
            {transactions.length === 0 && <p className="p-12 text-center text-slate-400">Nenhuma transação registrada.</p>}
          </div>
        </div>
      </div>
    );
  };

  // --- Users/Clients View ---
  const UsersManagement = () => {
    return (
      <div className="space-y-6">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gerenciamento</h1>
            <p className="text-slate-500">Cadastros de clientes e mecânicos.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2"><Users size={18} /> Clientes</h3>
              <button className="text-xs btn-primary h-7 px-2"><Plus size={14} /> Novo</button>
            </div>
            <div className="divide-y divide-slate-100">
              {customers.map(c => (
                <div key={c.id} className="p-4">
                  <p className="font-bold text-sm">{c.name}</p>
                  <p className="text-xs text-slate-500">{c.vehicle}</p>
                  <p className="text-[10px] text-slate-400">{c.phone}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2"><UserCheck size={18} /> Equipe de Mecânicos</h3>
              <button className="text-xs btn-primary h-7 px-2"><Plus size={14} /> Novo</button>
            </div>
            <div className="divide-y divide-slate-100">
              {mechanics.map(m => (
                <div key={m.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm">{m.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase">{m.specialty}</p>
                  </div>
                  <Badge variant="success">{m.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Layout Render ---
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'orders': return <ServiceOrders />;
      case 'inventory': return <Inventory />;
      case 'pos': return <POS />;
      case 'users': return <UsersManagement />;
      case 'finance': return <Finance />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className={`bg-slate-900 text-slate-300 w-64 shrink-0 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-0' : '-ml-64'}`}>
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-white font-black text-xl tracking-tight flex items-center gap-2">
            <Wrench className="text-blue-500" /> MECÂNICA<span className="text-blue-500">PRO</span>
          </h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<Wrench size={20} />} label="Ordens de Serviço" />
          <NavItem active={activeTab === 'pos'} onClick={() => setActiveTab('pos')} icon={<ShoppingCart size={20} />} label="Ponto de Venda" />
          <NavItem active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Package size={20} />} label="Estoque" />
          <NavItem active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={20} />} label="Clientes e Equipe" />
          <NavItem active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon={<DollarSign size={20} />} label="Fluxo de Caixa" />
        </nav>

        <div className="p-4 border-t border-slate-800 mt-auto">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold">A</div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">Admin</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Gerente</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 lg:hidden">
            <Menu size={20} />
          </button>
          
          <div className="flex-1 flex justify-end items-center gap-4">
             <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Hoje</p>
                <p className="text-sm font-bold text-slate-700">{format(new Date(), 'dd MMMM, yyyy', { locale: ptBR })}</p>
             </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-6xl mx-auto h-full">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

const NavItem = ({ active, icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-white'}`}
  >
    {icon}
    <span className="text-sm">{label}</span>
  </button>
);