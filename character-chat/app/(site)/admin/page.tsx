'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, MessageSquare, TrendingUp, Clock,
  BarChart3, Activity, Eye, Heart,
  ArrowUp, ArrowDown, Calendar, Filter, Globe
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalConversations: number;
  totalMessages: number;
  activeUsersToday: number;
  activeUsersThisWeek: number;
  totalCharacterViews: number;
  totalCharacterSaves: number;
  averageSessionDuration: number;
  topCharacters: Array<{
    id: string;
    name: string;
    viewCount: number;
    chatCount: number;
    interactionCount: number;
    retentionScore: number;
  }>;
  userGrowth: Array<{
    date: string;
    count: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    count: number;
  }>;
}

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'1h' | '24h' | '7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    loadStats();
  }, [dateRange]);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Use the analytics endpoint with period param
      const response = await fetch(`/api/admin/analytics?period=${dateRange}`);
      if (response.ok) {
        const data = await response.json();
        // Map from analytics response to stats format
        setStats({
          totalUsers: data.overview?.totalUsers || 0, // This will now be total (anon + reg)
          totalConversations: data.overview?.totalConversations || 0,
          totalMessages: data.engagement?.totalInteractions || 0,
          activeUsersToday: data.overview?.registeredUsers || 0, // Repurposing this card for Registered count
          activeUsersThisWeek: 0,
          totalCharacterViews: data.engagement?.totalViews || 0,
          totalCharacterSaves: data.engagement?.totalLikes || 0,
          averageSessionDuration: 0,
          topCharacters: (data.topCharacters?.byViews || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            viewCount: c.viewCount || 0,
            chatCount: c.chatCount || 0,
            interactionCount: 0,
            retentionScore: 0
          })),
          userGrowth: [],
          categoryDistribution: (data.categoryBreakdown || []).map((c: any) => ({
            category: c.category || 'Unknown',
            count: c.count || 0
          }))
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center">
        <p className="text-white/60">No data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white">
      {/* Header */}
      <header className="bg-[#0c0c0c]/95 backdrop-blur-lg border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-sm text-white/40 mt-1">User analytics and platform insights</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="px-4 py-2 border border-white/10 rounded-lg text-sm font-medium text-white bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="1h">Last 1 hour</option>
                <option value="24h">Last 1 day</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 3 months</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Users (Inc. Anon)"
            value={stats.totalUsers.toLocaleString()}
            icon={Users}
          // Trend requires historical data snapshots, removing hardcoded value
          />
          <MetricCard
            title="Total Conversations"
            value={stats.totalConversations.toLocaleString()}
            icon={MessageSquare}
          />
          <MetricCard
            title="Total Messages"
            value={stats.totalMessages.toLocaleString()}
            icon={MessageSquare}
          />
          <MetricCard
            title="Registered Users"
            value={stats.activeUsersToday.toLocaleString()}
            icon={Activity}
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Character Conversations"
            value={stats.topCharacters.reduce((acc, curr) => acc + curr.chatCount, 0).toLocaleString()}
            icon={MessageSquare}
            variant="secondary"
          />
          <MetricCard
            title="Total Followers"
            value={stats.totalCharacterSaves.toLocaleString()}
            icon={Users}
            variant="secondary"
          />
          <MetricCard
            title="Avg Session Duration"
            value={`${Math.round(stats.averageSessionDuration / 60)}m`}
            icon={Clock}
            variant="secondary"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Characters */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Top Characters</h2>
            <div className="space-y-4">
              {stats.topCharacters.slice(0, 10).map((char, index) => (
                <div key={char.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{char.name}</p>
                      <p className="text-xs text-gray-500">
                        {char.viewCount.toLocaleString()} views • {char.chatCount.toLocaleString()} chats
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{char.chatCount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">chats</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Category Distribution</h2>
            <div className="space-y-4">
              {stats.categoryDistribution.map((cat, index) => {
                const maxCount = Math.max(...stats.categoryDistribution.map(c => c.count));
                const percentage = (cat.count / maxCount) * 100;
                return (
                  <div key={cat.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 capitalize">{cat.category}</span>
                      <span className="text-sm font-bold text-gray-900">{cat.count.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Geography (Replaces User Growth) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">User Geography</h2>
          <div className="h-64 flex flex-col justify-center items-center text-gray-400">
            <Globe className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm">Location data collecting...</p>
            <p className="text-xs mt-1">(Requires IP tracking implementation)</p>
          </div>
        </div>
      </main>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: any;
  trend?: string;
  variant?: 'primary' | 'secondary';
}

function MetricCard({ title, value, icon: Icon, trend, variant = 'primary' }: MetricCardProps) {
  const isPositive = trend?.startsWith('+');
  const trendValue = trend?.replace(/[+%\-]/g, '');

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${variant === 'secondary' ? 'bg-gray-50' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${variant === 'primary' ? 'bg-indigo-100' : 'bg-gray-100'}`}>
          <Icon className={`w-5 h-5 ${variant === 'primary' ? 'text-indigo-600' : 'text-gray-600'}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            {trendValue}%
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-500">{title}</p>
    </div>
  );
}




