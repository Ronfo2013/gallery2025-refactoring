/**
 * Settings Tab - Brand settings and subscription info
 */

import React from 'react';
import { Card, CardHeader, CardBody, Badge, Button } from '../../../src/components/ui';
import { SettingsIcon, CreditCardIcon, MailIcon, CalendarIcon, GlobeIcon } from 'lucide-react';
import { Brand } from '../../../types';

interface SettingsTabProps {
  brand: Brand;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ brand }) => {
  return (
    <div className="space-y-6 slide-up max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="heading-lg text-gray-900 flex items-center gap-3">
          <SettingsIcon className="w-8 h-8" />
          Settings
        </h2>
        <p className="text-muted body-sm mt-1">Manage your brand settings and subscription</p>
      </div>

      {/* Brand Information */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-gray-900">Brand Information</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name</label>
            <input
              type="text"
              value={brand.name}
              disabled
              className="input cursor-not-allowed opacity-60"
            />
            <p className="text-xs text-gray-500 mt-2">Contact support to change your brand name</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <GlobeIcon className="w-4 h-4" />
              Subdomain
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={brand.subdomain}
                disabled
                className="input cursor-not-allowed opacity-60"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://${brand.subdomain}`, '_blank')}
              >
                Visit
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Your public gallery URL</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <MailIcon className="w-4 h-4" />
              Owner Email
            </label>
            <input
              type="email"
              value={brand.ownerEmail}
              disabled
              className="input cursor-not-allowed opacity-60"
            />
          </div>
        </CardBody>
      </Card>

      {/* Subscription Information */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCardIcon className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Subscription</h3>
          </div>
          <Badge variant={brand.subscription.status === 'active' ? 'success' : 'error'}>
            {brand.subscription.status.toUpperCase()}
          </Badge>
        </CardHeader>
        <CardBody className="space-y-4">
          {brand.subscription.status === 'active' ? (
            <>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CalendarIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-green-900">Your subscription is active</h4>
                    {brand.subscription.currentPeriodEnd && (
                      <p className="text-sm text-green-700 mt-1">
                        Next billing date:{' '}
                        <strong>
                          {new Date(brand.subscription.currentPeriodEnd).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            }
                          )}
                        </strong>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="flex-1">
                  Manage Billing
                </Button>
                <Button variant="ghost" className="flex-1 text-gray-600">
                  Download Invoice
                </Button>
              </div>
            </>
          ) : (
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <CreditCardIcon className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-red-900">Subscription inactive</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Your subscription is not active. Please update your payment method.
                  </p>
                  <Button variant="primary" className="mt-3">
                    Reactivate Subscription
                  </Button>
                </div>
              </div>
            </div>
          )}

          {brand.subscription.stripeCustomerId && (
            <div className="text-xs text-gray-500 font-mono">
              Customer ID: {brand.subscription.stripeCustomerId}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-gray-900">Account Actions</h3>
        </CardHeader>
        <CardBody className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            Request Data Export
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Contact Support
          </Button>
          <Button variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-50">
            Delete Account
          </Button>
        </CardBody>
      </Card>

      {/* Help Section */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">Need Help?</h4>
        <p className="text-sm text-blue-800 mb-3">
          Our support team is here to help you with any questions or issues.
        </p>
        <Button variant="outline" size="sm">
          Visit Help Center
        </Button>
      </div>
    </div>
  );
};

export default SettingsTab;
