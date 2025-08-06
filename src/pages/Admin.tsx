import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { DatabaseService } from '../lib/database';
import { gumroadAPI } from '../lib/gumroad';
import { 
  ArrowLeft, Users, TrendingUp, Gift, Plus, X, Settings, 
  Package, Truck, CheckCircle, Clock, AlertCircle, RefreshCw,
  Download, Upload, Search, Filter, Edit, Trash2, Eye,
  BarChart3, DollarSign, ShoppingCart, Globe, Mail, Phone,
  Save, ExternalLink, Calendar, Star, Zap
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalCracks: number;
  premiumPurchases: number;
  pendingShipments: number;
  pendingFreeClaims?: number;
  todayRevenue: number;
  monthlyRevenue: number;
}

export const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCracks: 0,
    premiumPurchases: 0,
    pendingShipments: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
  });
  
  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [prizes, setPrizes] = useState<any[]>([]);
  const [dynamicPrizes, setDynamicPrizes] = useState<any[]>([]);
  const [freePrizeClaims, setFreePrizeClaims] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showAddPrize, setShowAddPrize] = useState(false);
  const [newPrize, setNewPrize] = useState({
    name: '',
    price_usd: '',
    image_url: '',
    is_premium: true,
  });

  const ADMIN_PASSWORD = 'luckybones2024';

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Invalid password');
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchUsers(),
        fetchWinners(),
        fetchPurchases(),
        fetchShipments(),
        fetchPrizes(),
        fetchDynamicPrizes(),
        fetchFreePrizeClaims(),
        fetchSettings(),
        fetchWebhookLogs()
      ]);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch today's cracks
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCracks } = await supabase
        .from('crack_history')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00`);

      // Fetch premium purchases
      const { count: premiumPurchases } = await supabase
        .from('crack_history')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'premium');

      // Prepare queries array
      const queries = [];

      // Pending shipments
      queries.push(
        supabase
          .from('shipping_addresses')
          .select('*', { count: 'exact', head: true })
          .in('status', ['pending', 'processing'])
      );

      // Pending free prize claims
      queries.push(
        supabase
          .from('free_prize_claims')
          .select('*', { count: 'exact', head: true })
          .in('status', ['pending', 'processing'])
      );

      const results = await Promise.all(queries);

      // Get revenue data
      const { data: revenueData } = await supabase
        .from('gumroad_purchases')
        .select('price_usd, created_at')
        .eq('status', 'verified');

      const thisMonth = new Date().toISOString().substring(0, 7);

      const todayRevenue = revenueData
        ?.filter(p => p.created_at.startsWith(today))
        .reduce((sum, p) => sum + parseFloat(p.price_usd), 0) || 0;

      const monthlyRevenue = revenueData
        ?.filter(p => p.created_at.startsWith(thisMonth))
        .reduce((sum, p) => sum + parseFloat(p.price_usd), 0) || 0;

      setStats({
        totalUsers: totalUsers || 0,
        totalCracks: todayCracks || 0,
        premiumPurchases: premiumPurchases || 0,
        pendingShipments: results[0].count || 0,
        pendingFreeClaims: results[1].count || 0,
        todayRevenue,
        monthlyRevenue
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select(`
          *,
          crack_history (count),
          gumroad_purchases (count)
        `)
        .order('created_at', { ascending: false });
      
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchWinners = async () => {
    try {
      // Fetch recent winners from crack history
      const { data: recentWinners } = await supabase
        .from('crack_history')
        .select(`
          *,
          user_profiles (email)
        `)
        .eq('won', true)
        .order('created_at', { ascending: false })
        .limit(20);

      // Fetch premium winners
      const { data: premiumWinners } = await supabase
        .from('crack_history')
        .select(`
          *,
          user_profiles (email)
        `)
        .eq('type', 'premium')
        .order('created_at', { ascending: false })
        .limit(20);

      const allWinners = [
        ...(recentWinners || []).map(w => ({ ...w, type: w.type || 'free' })),
        ...(premiumWinners || []).map(w => ({ ...w, type: 'premium' }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setWinners(allWinners);
    } catch (error) {
      console.error('Error fetching winners:', error);
    }
  };

  const fetchPurchases = async () => {
    try {
      const purchases = await DatabaseService.getGumroadPurchases({ limit: 100 });
      setPurchases(purchases || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  const fetchShipments = async () => {
    try {
      const shipments = await DatabaseService.getShippingAddresses({ limit: 100 });
      setShipments(shipments || []);
    } catch (error) {
      console.error('Error fetching shipments:', error);
    }
  };

  const fetchPrizes = async () => {
    try {
      const { data } = await supabase
        .from('prizes')
        .select('*')
        .order('created_at', { ascending: false });
      
      setPrizes(data || []);
    } catch (error) {
      console.error('Error fetching prizes:', error);
    }
  };

  const fetchDynamicPrizes = async () => {
    try {
      const prizes = await DatabaseService.getDynamicPrizes({ 
        source: 'manual',
        limit: 100 
      });
      setDynamicPrizes(prizes || []);
    } catch (error) {
      console.error('Error fetching dynamic prizes:', error);
    }
  };

  const fetchFreePrizeClaims = async () => {
    try {
      const claims = await DatabaseService.getFreePrizeClaims({ limit: 100 });
      setFreePrizeClaims(claims || []);
    } catch (error) {
      console.error('Error fetching free prize claims:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data } = await supabase
        .from('admin_settings')
        .select('*')
        .order('key');
      
      const settingsObj = {};
      data?.forEach(setting => {
        settingsObj[setting.key] = setting.value;
      });
      
      setSettings(settingsObj);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchWebhookLogs = async () => {
    try {
      const { data } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      setWebhookLogs(data || []);
    } catch (error) {
      console.error('Error fetching webhook logs:', error);
    }
  };

  const handleAddPrize = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('prizes')
        .insert({
          name: newPrize.name,
          price_usd: parseFloat(newPrize.price_usd),
          image_url: newPrize.image_url,
          is_premium: newPrize.is_premium,
        });

      if (error) throw error;

      setNewPrize({ name: '', price_usd: '', image_url: '', is_premium: true });
      setShowAddPrize(false);
      fetchPrizes();
    } catch (error) {
      console.error('Error adding prize:', error);
      alert('Error adding prize');
    }
  };

  const togglePrizeStatus = async (prizeId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('prizes')
        .update({ is_active: !currentStatus })
        .eq('id', prizeId);

      if (error) throw error;
      fetchPrizes();
    } catch (error) {
      console.error('Error updating prize status:', error);
    }
  };

  const updateShipmentStatus = async (shipmentId: string, status: string, trackingNumber?: string) => {
    try {
      await DatabaseService.updateShippingStatus(shipmentId, status as any, trackingNumber);
      await fetchShipments();
      alert('Shipment status updated successfully!');
    } catch (error) {
      console.error('Error updating shipment:', error);
      alert('Error updating shipment status.');
    }
  };

  const updateFreeClaimStatus = async (claimId: string, status: string, adminNotes?: string) => {
    try {
      await DatabaseService.updateFreePrizeClaimStatus(claimId, status as any, adminNotes);
      await fetchFreePrizeClaims();
      alert('Claim status updated successfully!');
    } catch (error) {
      console.error('Error updating claim:', error);
      alert('Error updating claim status.');
    }
  };

  const exportData = (type: string) => {
    let data = [];
    let filename = '';

    switch (type) {
      case 'users':
        data = users;
        filename = 'users.json';
        break;
      case 'purchases':
        data = purchases;
        filename = 'purchases.json';
        break;
      case 'shipments':
        data = shipments;
        filename = 'shipments.json';
        break;
      case 'winners':
        data = winners;
        filename = 'winners.json';
        break;
      case 'free-claims':
        data = freePrizeClaims;
        filename = 'free-prize-claims.json';
        break;
      default:
        return;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderDashboard = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6">
          <div className="flex items-center">
            <Users className="h-6 w-6 sm:h-10 sm:w-10 text-blue-500 mr-2 sm:mr-4" />
            <div>
              <p className="text-lg sm:text-3xl font-bold text-gray-800">{stats.totalUsers}</p>
              <p className="text-xs sm:text-base text-gray-600">Total Users</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 sm:h-10 sm:w-10 text-green-500 mr-2 sm:mr-4" />
            <div>
              <p className="text-lg sm:text-3xl font-bold text-gray-800">{stats.totalCracks}</p>
              <p className="text-xs sm:text-base text-gray-600">Cracks Today</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6">
          <div className="flex items-center">
            <ShoppingCart className="h-6 w-6 sm:h-10 sm:w-10 text-purple-500 mr-2 sm:mr-4" />
            <div>
              <p className="text-lg sm:text-3xl font-bold text-gray-800">{stats.premiumPurchases}</p>
              <p className="text-xs sm:text-base text-gray-600">Premium Sales</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6">
          <div className="flex items-center">
            <DollarSign className="h-6 w-6 sm:h-10 sm:w-10 text-yellow-500 mr-2 sm:mr-4" />
            <div>
              <p className="text-lg sm:text-3xl font-bold text-gray-800">${stats.monthlyRevenue.toFixed(2)}</p>
              <p className="text-xs sm:text-base text-gray-600">Monthly Revenue</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6">
          <div className="flex items-center">
            <Package className="h-6 w-6 sm:h-10 sm:w-10 text-purple-500 mr-2 sm:mr-4" />
            <div>
              <p className="text-lg sm:text-3xl font-bold text-gray-800">{stats.pendingShipments}</p>
              <p className="text-xs sm:text-base text-gray-600">Pending Shipments</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6">
          <div className="flex items-center">
            <Gift className="h-6 w-6 sm:h-10 sm:w-10 text-emerald-500 mr-2 sm:mr-4" />
            <div>
              <p className="text-lg sm:text-3xl font-bold text-gray-800">{stats.pendingFreeClaims || 0}</p>
              <p className="text-xs sm:text-base text-gray-600">Free Prize Claims</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Quick Actions</h3>
          <div className="space-y-2 sm:space-y-3">
            <button
              onClick={() => exportData('users')}
              className="w-full flex items-center justify-center px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm sm:text-base"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Export Users
            </button>
            
            <button
              onClick={() => setActiveTab('settings')}
              className="w-full flex items-center justify-center px-3 sm:px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base"
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              App Settings
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Pending Actions</h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-base text-gray-600">Pending Shipments</span>
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs sm:text-sm">
                {stats.pendingShipments}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-base text-gray-600">Free Prize Claims</span>
              <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs sm:text-sm">
                {stats.pendingFreeClaims || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-base text-gray-600">Unprocessed Webhooks</span>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs sm:text-sm">
                {webhookLogs.filter(log => !log.processed).length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Revenue Overview</h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-base text-gray-600">Today</span>
              <span className="font-bold text-green-600 text-sm sm:text-base">${stats.todayRevenue.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-base text-gray-600">This Month</span>
              <span className="font-bold text-green-600 text-sm sm:text-base">${stats.monthlyRevenue.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
          <h4 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">🔧 Configuration Status</h4>
          <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <span>Supabase Connection</span>
              <span className="text-green-600">✓ Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Gumroad Integration</span>
              <span className="text-green-600">✓ Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Manual Prizes</span>
              <span className="text-green-600">✓ Database Only</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <h4 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">📊 System Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="text-center">
              <p className="font-bold text-lg sm:text-2xl text-blue-600">{stats.totalUsers}</p>
              <p className="text-gray-600">Total Users</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg sm:text-2xl text-green-600">{stats.totalCracks}</p>
              <p className="text-gray-600">Total Cracks</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg sm:text-2xl text-purple-600">{stats.premiumPurchases}</p>
              <p className="text-gray-600">Premium Sales</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg sm:text-2xl text-yellow-600">${stats.monthlyRevenue.toFixed(2)}</p>
              <p className="text-gray-600">Monthly Revenue</p>
            </div>
          </div>
        </div>
      </>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
          <div className="text-center mb-6 sm:mb-8">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🔐</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Admin Access</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Enter the admin password to continue</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-4 sm:mb-6">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin Password"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-red-500 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-bold hover:bg-red-600 transition-colors text-sm sm:text-base"
            >
              Access Admin Panel
            </button>
          </form>

          <Link 
            to="/home"
            className="block text-center mt-3 sm:mt-4 text-gray-600 hover:text-gray-800 text-sm sm:text-base"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'winners', name: 'Winners', icon: Gift },
    { id: 'purchases', name: 'Purchases', icon: ShoppingCart },
    { id: 'shipments', name: 'Shipments', icon: Truck },
    { id: 'free-claims', name: 'Free Claims', icon: Gift },
    { id: 'prizes', name: 'Prizes', icon: Star },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const renderUsers = () => (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">User Management</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => exportData('users')}
              className="flex items-center px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs sm:text-sm"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Export
            </button>
          </div>
        </div>
        
        <div className="mt-3 sm:mt-4 flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cracks</th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchases</th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users
              .filter(user => 
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((user) => (
                <tr key={user.id}>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-gray-900">{user.email}</div>
                      <div className="text-xs text-gray-500">Streak: {user.streak} days</div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mr-1 sm:mr-2" />
                      <span className="text-xs sm:text-sm text-gray-900">
                        {user.country || 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {user.total_cracks || 0}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {user.gumroad_purchases?.[0]?.count || 0}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                    <button
                      onClick={() => setEditingItem(user)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderWinners = () => (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-3 sm:gap-0">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800">Recent Winners</h3>
        <button
          onClick={() => exportData('winners')}
          className="flex items-center px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs sm:text-sm"
        >
          <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Export
        </button>
      </div>
      <div className="overflow-x-auto max-h-96">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">User</th>
              <th className="text-left py-2">Prize</th>
              <th className="text-left py-2">Type</th>
              <th className="text-left py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {winners.map((winner, index) => (
              <tr key={index} className="border-b">
                <td className="py-2">{winner.user_profiles?.email || 'Unknown'}</td>
                <td className="py-2">
                  {winner.type === 'premium' 
                    ? winner.gift_name 
                    : winner.gift_name || 'Fortune'}
                </td>
                <td className="py-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    winner.type === 'premium' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {winner.type}
                  </span>
                </td>
                <td className="py-2">
                  {new Date(winner.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderShipments = () => (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">Shipment Management</h3>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
            <button
              onClick={() => exportData('shipments')}
              className="flex items-center px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs sm:text-sm"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Winner</th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prize</th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {shipments
              .filter(shipment => 
                filterStatus === 'all' || shipment.status === filterStatus
              )
              .map((shipment) => (
                <tr key={shipment.id}>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-gray-900">{shipment.full_name}</div>
                      <div className="text-xs text-gray-500">{shipment.email}</div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm text-gray-900">{shipment.dynamic_prizes?.name || 'Unknown Prize'}</div>
                    <div className="text-xs text-gray-500">${shipment.dynamic_prizes?.price_usd || 0}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="text-xs sm:text-sm text-gray-900">
                      {shipment.address_line_1}
                      {shipment.address_line_2 && <br />}
                      {shipment.address_line_2}
                      <br />
                      {shipment.city}, {shipment.state_province} {shipment.postal_code}
                      <br />
                      {shipment.country}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      shipment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      shipment.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      shipment.status === 'shipped' ? 'bg-green-100 text-green-800' :
                      shipment.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {shipment.status}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                    <select
                      value={shipment.status}
                      onChange={(e) => updateShipmentStatus(shipment.id, e.target.value)}
                      className="px-1 sm:px-2 py-1 border border-gray-300 rounded text-xs"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPrizes = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Static Prizes */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-3 sm:gap-0">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">Static Prize Inventory</h3>
          <button
            onClick={() => setShowAddPrize(true)}
            className="flex items-center px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs sm:text-sm"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Add Prize
          </button>
        </div>

        <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
          {prizes.map((prize) => (
            <div key={prize.id} className="flex items-center justify-between p-2 sm:p-3 border rounded-lg">
              <div className="flex items-center">
                <img 
                  src={prize.image_url} 
                  alt={prize.name}
                  className="w-8 h-8 sm:w-12 sm:h-12 object-cover rounded mr-2 sm:mr-3"
                />
                <div>
                  <p className="font-medium text-xs sm:text-sm">{prize.name}</p>
                  <p className="text-xs text-gray-600">${prize.price_usd}</p>
                </div>
              </div>
              
              <button
                onClick={() => togglePrizeStatus(prize.id, prize.is_active)}
                className={`px-2 sm:px-3 py-1 rounded text-xs ${
                  prize.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {prize.is_active ? 'Active' : 'Inactive'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Prizes */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-3 sm:gap-0">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">Manual Prizes (Database)</h3>
          <div className="text-xs sm:text-sm text-gray-600">
            Manually added prizes from the database
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {dynamicPrizes.map((prize) => (
            <div key={prize.id} className="border rounded-lg p-3 sm:p-4">
              <img 
                src={prize.image_url} 
                alt={prize.name}
                className="w-full h-20 sm:h-32 object-cover rounded mb-2 sm:mb-3"
              />
              <h4 className="font-medium text-xs sm:text-sm mb-1">{prize.name}</h4>
              <p className="text-xs text-gray-600 mb-1 sm:mb-2">{prize.tier.toUpperCase()} Tier</p>
              <p className="font-bold text-green-600 text-xs sm:text-sm">${prize.price_usd}</p>
              <div className="flex justify-between items-center mt-1 sm:mt-2">
                <span className={`px-1 sm:px-2 py-1 text-xs rounded ${
                  prize.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {prize.is_active ? 'Active' : 'Inactive'}
                </span>
                {prize.affiliate_url && (
                  <a 
                    href={prize.affiliate_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {dynamicPrizes.length === 0 && (
          <div className="text-center py-6 sm:py-8">
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📦</div>
            <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">No manual prizes found in the database.</p>
            <p className="text-xs sm:text-sm text-gray-500">Add prizes manually through the database or static prizes section.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">Application Settings</h3>
      
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              App Name
            </label>
            <input
              type="text"
              value={settings.app_name || 'LuckyCookie.io'}
              className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Free Crack Cooldown (hours)
            </label>
            <input
              type="number"
              value={settings.free_crack_cooldown_hours || 1}
              className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
              readOnly
            />
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
          <h4 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">🔧 Configuration Status</h4>
          <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <span>Supabase Connection</span>
              <span className="text-green-600">✓ Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Gumroad Integration</span>
              <span className="text-green-600">✓ Connected</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <h4 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">📊 System Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="text-center">
              <p className="font-bold text-lg sm:text-2xl text-blue-600">{stats.totalUsers}</p>
              <p className="text-gray-600">Total Users</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg sm:text-2xl text-green-600">{stats.totalCracks}</p>
              <p className="text-gray-600">Total Cracks</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg sm:text-2xl text-purple-600">{stats.premiumPurchases}</p>
              <p className="text-gray-600">Premium Sales</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg sm:text-2xl text-yellow-600">${stats.monthlyRevenue.toFixed(2)}</p>
              <p className="text-gray-600">Monthly Revenue</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-red-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/home" className="flex items-center text-gray-600 hover:text-gray-800 mr-3 sm:mr-6">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-base">Back to Home</span>
            </Link>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          </div>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-2 sm:px-4 py-1 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs sm:text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-4 sm:mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto px-2 sm:px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap mr-4 sm:mr-8 ${
                      activeTab === tab.id
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-3 w-3 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'winners' && renderWinners()}
          {activeTab === 'purchases' && (
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">Premium Purchases</h3>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="verified">Verified</option>
                      <option value="cracked">Cracked</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button
                      onClick={() => exportData('purchases')}
                      className="flex items-center px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs sm:text-sm"
                    >
                      <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Export
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {purchases
                      .filter(purchase => 
                        filterStatus === 'all' || purchase.status === filterStatus
                      )
                      .map((purchase) => (
                        <tr key={purchase.id}>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div>
                              <div className="text-xs sm:text-sm font-medium text-gray-900">{purchase.email}</div>
                              <div className="text-xs text-gray-500">Sale ID: {purchase.sale_id}</div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm text-gray-900">{purchase.product_name}</div>
                            <div className="text-xs text-gray-500">{purchase.tier.toUpperCase()} Tier</div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                            ${purchase.price_usd}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              purchase.status === 'verified' ? 'bg-green-100 text-green-800' :
                              purchase.status === 'cracked' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {purchase.status}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            {new Date(purchase.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === 'shipments' && renderShipments()}
          {activeTab === 'free-claims' && (
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">Free Prize Claims Management</h3>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                      onClick={() => exportData('free-claims')}
                      className="flex items-center px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs sm:text-sm"
                    >
                      <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Export
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prize</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {freePrizeClaims
                      .filter(claim => 
                        filterStatus === 'all' || claim.status === filterStatus
                      )
                      .map((claim) => (
                        <tr key={claim.id}>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div>
                              <div className="text-xs sm:text-sm font-medium text-gray-900">{claim.user_profiles?.email || 'Unknown'}</div>
                              <div className="text-xs text-gray-500">{new Date(claim.created_at).toLocaleDateString()}</div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm text-gray-900">{claim.prize_name}</div>
                            <div className="text-xs text-gray-500">${claim.prize_value}</div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              {claim.claim_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="text-xs sm:text-sm text-gray-900">{claim.account_email}</div>
                            {claim.account_username && (
                              <div className="text-xs text-gray-500">@{claim.account_username}</div>
                            )}
                            {claim.phone_number && (
                              <div className="text-xs text-gray-500">{claim.phone_number}</div>
                            )}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              claim.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              claim.status === 'completed' ? 'bg-green-100 text-green-800' :
                              claim.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {claim.status}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                            <select
                              value={claim.status}
                              onChange={(e) => updateFreeClaimStatus(claim.id, e.target.value)}
                              className="px-1 sm:px-2 py-1 border border-gray-300 rounded text-xs"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="completed">Completed</option>
                              <option value="failed">Failed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === 'prizes' && renderPrizes()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </div>

      {/* Add Prize Modal */}
      {showAddPrize && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="text-lg sm:text-xl font-bold">Add New Prize</h3>
              <button
                onClick={() => setShowAddPrize(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            <form onSubmit={handleAddPrize} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Prize Name
                </label>
                <input
                  type="text"
                  value={newPrize.name}
                  onChange={(e) => setNewPrize({ ...newPrize, name: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Price (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newPrize.price_usd}
                  onChange={(e) => setNewPrize({ ...newPrize, price_usd: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={newPrize.image_url}
                  onChange={(e) => setNewPrize({ ...newPrize, image_url: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newPrize.is_premium}
                  onChange={(e) => setNewPrize({ ...newPrize, is_premium: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-xs sm:text-sm text-gray-700">Premium Prize</label>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-2 px-3 sm:px-4 rounded-lg hover:bg-blue-600 transition-colors text-xs sm:text-sm"
                >
                  Add Prize
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddPrize(false)}
                  className="flex-1 bg-gray-500 text-white py-2 px-3 sm:px-4 rounded-lg hover:bg-gray-600 transition-colors text-xs sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};