/**
 * Dashboard Overview - Professional stats and quick actions
 */

import React from 'react';
import { Card, CardBody, Button, StatsCard } from '../../src/components/ui';
import { useAppContext } from '../../context/AppContext';
import { Brand } from '../../types';
import {
  ImageIcon,
  FolderIcon,
  EyeIcon,
  CreditCardIcon,
  TrendingUpIcon,
  CalendarIcon,
} from 'lucide-react';

interface DashboardOverviewProps {
  brand: Brand;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ brand }) => {
  const { albums } = useAppContext();

  const totalPhotos = albums.reduce((sum, album) => sum + album.photos.length, 0);
  const totalAlbums = albums.length;

  const stats = [
    {
      label: 'Total Albums',
      value: totalAlbums,
      icon: <FolderIcon className="w-6 h-6" />,
      color: 'text-blue-500',
      bg: 'bg-blue-100',
    },
    {
      label: 'Total Photos',
      value: totalPhotos,
      icon: <ImageIcon className="w-6 h-6" />,
      color: 'text-purple-500',
      bg: 'bg-purple-100',
    },
    {
      label: 'Subscription',
      value: brand.subscription.status === 'active' ? 'Active' : 'Inactive',
      icon: <CreditCardIcon className="w-6 h-6" />,
      color: brand.subscription.status === 'active' ? 'text-green-500' : 'text-red-500',
      bg: brand.subscription.status === 'active' ? 'bg-green-100' : 'bg-red-100',
    },
    {
      label: 'Views This Month',
      value: '---',
      icon: <TrendingUpIcon className="w-6 h-6" />,
      color: 'text-orange-500',
      bg: 'bg-orange-100',
    },
  ];

  const quickActions = [
    {
      label: 'Create Album',
      description: 'Start organizing your photos',
      icon: <FolderIcon className="w-5 h-5" />,
      action: () => {
        const tabEvent = new CustomEvent('switchTab', { detail: 'albums' });
        window.dispatchEvent(tabEvent);
      },
    },
    {
      label: 'Customize Branding',
      description: 'Update colors and logo',
      icon: <ImageIcon className="w-5 h-5" />,
      action: () => {
        const tabEvent = new CustomEvent('switchTab', { detail: 'branding' });
        window.dispatchEvent(tabEvent);
      },
    },
    {
      label: 'View Gallery',
      description: 'See your public gallery',
      icon: <EyeIcon className="w-5 h-5" />,
      action: () => {
        window.open(`https://${brand.subdomain}`, '_blank');
      },
    },
  ];

  return (
    <div className="space-y-8 slide-up">
      {/* Welcome Section */}
      <div>
        <h1 className="heading-lg text-gray-900 mb-2">Welcome back, {brand.name}! 👋</h1>
        <p className="text-muted body-lg">Here's what's happening with your gallery today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            iconBgColor={stat.bg}
            iconColor={stat.color}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="heading-md text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Card key={index} hover onClick={action.action}>
              <CardBody className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg text-gray-600">{action.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900">{action.label}</h3>
                  <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Subscription Info */}
      {brand.subscription.status === 'active' && brand.subscription.currentPeriodEnd && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardBody className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Subscription Active</h3>
                <p className="text-sm text-gray-600">
                  Renews on{' '}
                  {new Date(brand.subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Manage Billing
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Recent Activity (Placeholder) */}
      <div>
        <h2 className="heading-md text-gray-900 mb-4">Recent Activity</h2>
        <Card>
          <CardBody>
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <TrendingUpIcon className="w-12 h-12 mx-auto opacity-50" />
              </div>
              <p className="text-gray-500">Activity tracking coming soon...</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
