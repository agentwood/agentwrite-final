'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, MessageSquare, TrendingUp, Clock,
  BarChart3, Activity, Eye, Heart,
  ArrowUp, ArrowDown, Calendar, Filter
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
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    loadStats();
  }, [dateRange]);

  const loadStats = async () => {
    try {
      const response = await fetch(`/api/admin/stats?range=${dateRange}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
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
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={Users}
            trend={stats.userGrowth.length > 1 ?
              ((stats.userGrowth[stats.userGrowth.length - 1].count - stats.userGrowth[0].count) / stats.userGrowth[0].count * 100).toFixed(1) : '0'
            }
          />
          <MetricCard
            title="Total Conversations"
            value={stats.totalConversations.toLocaleString()}
            icon={MessageSquare}
            trend="+12.5%"
          />
          <MetricCard
            title="Total Messages"
            value={stats.totalMessages.toLocaleString()}
            icon={MessageSquare}
            trend="+8.3%"
          />
          <MetricCard
            title="Active Users (Today)"
            value={stats.activeUsersToday.toLocaleString()}
            icon={Activity}
            trend="+5.2%"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Character Views"
            value={stats.totalCharacterViews.toLocaleString()}
            icon={Eye}
            trend="+15.7%"
            variant="secondary"
          />
          <MetricCard
            title="Character Saves"
            value={stats.totalCharacterSaves.toLocaleString()}
            icon={Heart}
            trend="+9.1%"
            variant="secondary"
          />
          <MetricCard
            title="Avg Session Duration"
            value={`${Math.round(stats.averageSessionDuration / 60)}m`}
            icon={Clock}
            trend="+2.4%"
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
                    <p className="text-sm font-bold text-gray-900">{char.retentionScore.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">score</p>
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

        {/* User Growth Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">User Growth</h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {stats.userGrowth.map((point, index) => {
              const maxCount = Math.max(...stats.userGrowth.map(p => p.count));
              const height = (point.count / maxCount) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-indigo-100 rounded-t-lg hover:bg-indigo-200 transition-colors relative group">
                    <div
                      className="bg-indigo-600 rounded-t-lg transition-all duration-500"
                      style={{ height: `${height}%` }}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {point.count.toLocaleString()}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 text-center">
                    {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            })}
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




