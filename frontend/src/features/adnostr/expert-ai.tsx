import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { Card, Stack, Text } from '@/components/ui/index.ts';

const ExpertAI: React.FC = () => {
  const intl = useIntl();
  const [experts, setExperts] = useState([
    { id: 1, name: 'Expert #1', followers: 15420, conversionRate: 3.2, avatar: '/static/images/default-avatar.png' },
    { id: 2, name: 'Expert #2', followers: 28900, conversionRate: 4.1, avatar: '/static/images/default-avatar.png' },
    { id: 3, name: 'Expert #3', followers: 45600, conversionRate: 2.8, avatar: '/static/images/default-avatar.png' },
    { id: 4, name: 'Expert #4', followers: 12300, conversionRate: 5.2, avatar: '/static/images/default-avatar.png' },
    { id: 5, name: 'Expert #5', followers: 67800, conversionRate: 3.9, avatar: '/static/images/default-avatar.png' },
  ]);

  const [selectedExpert, setSelectedExpert] = useState<number | null>(null);
  const [adStyle, setAdStyle] = useState('beauty');
  const [generatedContent, setGeneratedContent] = useState<{
    copy: string;
    image: string;
  } | null>(null);

  const generateAIContent = async () => {
    if (!selectedExpert) return;

    // Mock AI content generation
    let copy = '';
    let imageDesc = '';

    switch (adStyle) {
      case 'beauty':
        copy = `✨ Transform your look with our premium beauty collection! 🌟\n\n` +
              `Discover luxurious skincare and makeup that enhances your natural beauty.\n` +
              `Expert-recommended formulas for radiant, glowing skin.\n\n` +
              `#BeautyGoals #SkincareRoutine #GlowUp`;
        imageDesc = 'Gorgeous model with flawless skin, professional makeup, elegant lighting';
        break;
      case 'tech':
        copy = `🚀 Next-gen technology meets everyday innovation! ⚡\n\n` +
              `Experience cutting-edge gadgets that simplify your life.\n` +
              `Smart features, premium build quality, unbeatable performance.\n\n` +
              `#TechInnovation #SmartDevices #FutureTech`;
        imageDesc = 'Sleek tech gadget with blue LED lights, modern design, clean background';
        break;
      case 'lifestyle':
        copy = `🌿 Elevate your lifestyle with premium experiences! ✨\n\n` +
              `Curated products for the modern, sophisticated individual.\n` +
              `Quality craftsmanship meets contemporary design.\n\n` +
              `#Lifestyle #Premium #Sophisticated`;
        imageDesc = 'Luxury lifestyle product, elegant composition, warm lighting';
        break;
      case 'business':
        copy = `💼 Power your business with professional solutions! 🎯\n\n` +
              `Enterprise-grade tools for modern businesses.\n` +
              `Boost productivity, streamline operations, achieve more.\n\n` +
              `#BusinessGrowth #ProfessionalTools #Success`;
        imageDesc = 'Professional business tools, clean workspace, corporate setting';
        break;
    }

    setGeneratedContent({
      copy,
      image: `https://via.placeholder.com/400x300/4a5568/ffffff?text=${encodeURIComponent(imageDesc)}`
    });

    // Save to backend (mock)
    alert(`AI content generated for ${experts.find(e => e.id === selectedExpert)?.name}!\n\nContent saved to database.`);
  };

  const loadExperts = () => {
    // Mock loading more experts
    const newExperts = [
      { id: 6, name: 'Expert #6', followers: 34500, conversionRate: 4.7, avatar: '/static/images/default-avatar.png' },
      { id: 7, name: 'Expert #7', followers: 56700, conversionRate: 3.5, avatar: '/static/images/default-avatar.png' },
      { id: 8, name: 'Expert #8', followers: 23400, conversionRate: 4.9, avatar: '/static/images/default-avatar.png' },
      { id: 9, name: 'Expert #9', followers: 78900, conversionRate: 2.1, avatar: '/static/images/default-avatar.png' },
      { id: 10, name: 'Expert #10', followers: 12300, conversionRate: 5.8, avatar: '/static/images/default-avatar.png' },
    ];
    setExperts([...experts, ...newExperts]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Expert AI Engine</h1>
        <p className="text-gray-600">AI-powered content generation and expert management platform</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expert List */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 border-b border-gray-200 pb-2">
            👥 Expert Directory
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {experts.map((expert) => (
                <div
                  key={expert.id}
                  className={`p-3 bg-gray-50 rounded border cursor-pointer hover:bg-gray-100 transition-colors ${
                    selectedExpert === expert.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedExpert(expert.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img src={expert.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
                      <div>
                        <div className="text-gray-900 font-medium">{expert.name}</div>
                        <div className="text-gray-600 text-sm">
                          {expert.followers.toLocaleString()} followers • {expert.conversionRate}% conversion
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-600 text-sm">+1,249 sats</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={loadExperts}
            className="w-full mt-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            Load More Experts
          </button>
        </Card>

        {/* Expert Details */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 border-b border-gray-200 pb-2">
            👤 Expert Profile
          </h3>
          <div className="space-y-4">
            {selectedExpert ? (
              (() => {
                const expert = experts.find(e => e.id === selectedExpert);
                return (
                  <div>
                    <div className="text-center">
                      <img src={expert?.avatar} alt="Expert Avatar" className="w-20 h-20 rounded-full mx-auto mb-4" />
                      <h4 className="text-xl font-semibold text-gray-900">{expert?.name}</h4>
                      <p className="text-gray-600">Professional Content Creator</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <div className="text-gray-600 text-sm">Followers</div>
                        <div className="text-gray-900 font-semibold">{expert?.followers.toLocaleString()}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <div className="text-gray-600 text-sm">Conversion Rate</div>
                        <div className="text-green-600 font-semibold">{expert?.conversionRate}%</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded border border-gray-200 mt-4">
                      <h5 className="text-gray-900 font-medium mb-2">Revenue Parameters</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Base Revenue (C):</span>
                          <span className="text-gray-900">1.5</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Decay Factor (k):</span>
                          <span className="text-gray-900">0.8</span>
                        </div>
                        <div className="flex justify-between">
                          <span class="text-gray-600">Current Rate:</span>
                          <span className="text-green-600">1.25 sats/click</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>Select an expert from the directory to view details</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Parameter Adjustment */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 border-b border-gray-200 pb-2">
          ⚙️ Dynamic Parameter Adjustment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {selectedExpert ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Revenue Constant (C)</label>
                <input
                  type="number"
                  step="0.1"
                  defaultValue="1.5"
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Decay Exponent (k)</label>
                <input
                  type="number"
                  step="0.1"
                  defaultValue="0.8"
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900"
                />
              </div>
              <button
                onClick={() => alert('Parameters updated! This would save to the database.')}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Update Parameters
              </button>
              <p className="text-gray-600 text-xs">
                Changes affect revenue calculation: R = (C × ln(I + 1)) / D^k
              </p>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4 col-span-2">
              <p>Select an expert to adjust revenue parameters</p>
            </div>
          )}
        </div>
      </Card>

      {/* AI Content Generator */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 border-b border-gray-200 pb-2">
          🎨 AI Content Generator
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Ad Style</label>
              <select
                value={adStyle}
                onChange={(e) => setAdStyle(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900"
              >
                <option value="beauty">Beauty & Fashion</option>
                <option value="tech">Tech Gadgets</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="business">Business</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={generateAIContent}
                disabled={!selectedExpert}
                className={`w-full px-4 py-2 rounded transition-colors ${
                  selectedExpert
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                🎨 Generate Ad Content
              </button>
            </div>
          </div>

          {generatedContent && (
            <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
              <div className="text-xs text-gray-600 mb-2">Generated Ad Copy:</div>
              <div className="text-gray-900 text-sm bg-white p-2 rounded border mb-2 whitespace-pre-wrap">
                {generatedContent.copy}
              </div>
              <div className="text-xs text-gray-600 mb-2">Suggested Image:</div>
              <div className="bg-white p-2 rounded border border-gray-200 text-center">
                <img src={generatedContent.image} alt="AI Generated" className="max-w-full h-auto rounded mx-auto" />
                <div className="text-xs text-gray-500 mt-2">Ready to save to expert profile</div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ExpertAI;