import React, { useState, useEffect } from 'react';
import { useAIStrategyStore } from '../store/useAIStrategyStore';
import { mockEducationalContent } from '../data/aiStrategyMockData';
import { BookOpen, Play, Clock, Star, Users, Award, Search, Filter, ChevronRight, Download, ExternalLink } from 'lucide-react';

interface ContentFilter {
  category: string;
  difficulty: string;
  type: string;
  searchTerm: string;
}

const EducationalHub: React.FC = () => {
  const { educationalContent, setEducationalContent } = useAIStrategyStore();
  const [activeTab, setActiveTab] = useState<'all' | 'courses' | 'tutorials' | 'guides' | 'webinars'>('all');
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [filters, setFilters] = useState<ContentFilter>({
    category: 'all',
    difficulty: 'all',
    type: 'all',
    searchTerm: ''
  });
  const [completedContent, setCompletedContent] = useState<string[]>([]);

  useEffect(() => {
    if (!educationalContent) {
      setEducationalContent(mockEducationalContent);
    }
  }, [educationalContent, setEducationalContent]);

  // Combine strategies and risk management content into a single array
  const allContent = educationalContent ? [
    ...educationalContent.strategies.map(item => ({ ...item, type: 'course', rating: 4.5 })),
    ...educationalContent.riskManagement.map(item => ({ ...item, type: 'guide', rating: 4.3, category: 'risk_management' }))
  ] : [];

  const filteredContent = allContent.filter(content => {
    const categoryMatch = filters.category === 'all' || content.category === filters.category;
    const difficultyMatch = filters.difficulty === 'all' || content.difficulty === filters.difficulty;
    const typeMatch = filters.type === 'all' || content.type === filters.type;
    const searchMatch = filters.searchTerm === '' || 
      content.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      content.description.toLowerCase().includes(filters.searchTerm.toLowerCase());
    const tabMatch = activeTab === 'all' || content.type === activeTab.slice(0, -1); // Remove 's' from plural
    
    return categoryMatch && difficultyMatch && typeMatch && searchMatch && tabMatch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-50 text-green-700';
      case 'intermediate': return 'bg-yellow-50 text-yellow-700';
      case 'advanced': return 'bg-red-50 text-red-700';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical_analysis': return 'bg-blue-50 text-blue-700';
      case 'fundamental_analysis': return 'bg-purple-50 text-purple-700';
      case 'risk_management': return 'bg-red-50 text-red-700';
      case 'psychology': return 'bg-green-50 text-green-700';
      case 'strategy_development': return 'bg-orange-50 text-orange-700';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course': return <BookOpen className="h-4 w-4" />;
      case 'tutorial': return <Play className="h-4 w-4" />;
      case 'guide': return <Award className="h-4 w-4" />;
      case 'webinar': return <Users className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const handleContentComplete = (contentId: string) => {
    setCompletedContent(prev => 
      prev.includes(contentId) 
        ? prev.filter(id => id !== contentId)
        : [...prev, contentId]
    );
  };

  const getProgressPercentage = () => {
    if (allContent.length === 0) return 0;
    return Math.round((completedContent.length / allContent.length) * 100);
  };

  const getFeaturedContent = () => {
    return allContent
      .filter(content => content.rating >= 4.5)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900">Educational Hub</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                <Award className="h-4 w-4" />
                <span>{getProgressPercentage()}% Complete</span>
              </div>
              <div className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                {allContent.length} Resources
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Your Learning Progress</h2>
            <span className="text-sm text-slate-600">{completedContent.length} of {allContent.length} completed</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>

        {/* Featured Content */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Featured Content</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {getFeaturedContent().map(content => (
              <div key={content.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <div className="text-white text-center">
                    {getTypeIcon(content.type)}
                    <p className="text-sm mt-2 opacity-90">Featured {content.type}</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(content.difficulty)}`}>
                      {content.difficulty}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{content.rating}</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{content.title}</h3>
                  <p className="text-sm text-slate-600 mb-3">{content.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      <span>{content.duration}</span>
                    </div>
                    <button 
                      onClick={() => setSelectedContent(content.id)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Start Learning
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
            {[
              { key: 'all', label: 'All Content', count: allContent.length },
              { key: 'courses', label: 'Courses', count: allContent.filter(c => c.type === 'course').length },
              { key: 'tutorials', label: 'Tutorials', count: allContent.filter(c => c.type === 'tutorial').length },
              { key: 'guides', label: 'Guides', count: allContent.filter(c => c.type === 'guide').length },
              { key: 'webinars', label: 'Webinars', count: allContent.filter(c => c.type === 'webinar').length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{label}</span>
                <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs">{count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search content..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="technical_analysis">Technical Analysis</option>
              <option value="fundamental_analysis">Fundamental Analysis</option>
              <option value="risk_management">Risk Management</option>
              <option value="psychology">Psychology</option>
              <option value="strategy_development">Strategy Development</option>
            </select>

            {/* Difficulty Filter */}
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
              className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            {/* Type Filter */}
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="course">Courses</option>
              <option value="tutorial">Tutorials</option>
              <option value="guide">Guides</option>
              <option value="webinar">Webinars</option>
            </select>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map(content => {
            const isCompleted = completedContent.includes(content.id);
            return (
              <div key={content.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
                  <div className="text-slate-600 text-center">
                    {getTypeIcon(content.type)}
                    <p className="text-sm mt-2">{content.type}</p>
                  </div>
                  {isCompleted && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(content.difficulty)}`}>
                      {content.difficulty}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{content.rating}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-slate-900 mb-2">{content.title}</h3>
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">{content.description}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(content.category)}`}>
                      {content.category.replace('_', ' ')}
                    </span>
                    <div className="flex items-center space-x-1 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      <span>{content.duration}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setSelectedContent(content.id)}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      {isCompleted ? 'Review' : 'Start'}
                    </button>
                    <button 
                      onClick={() => handleContentComplete(content.id)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isCompleted 
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {isCompleted ? '✓' : '○'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredContent.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No content found</h3>
            <p className="text-slate-600">Try adjusting your filters or search terms.</p>
          </div>
        )}

        {/* Learning Path Suggestion */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6 mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Recommended Learning Path</h3>
              <p className="text-slate-600 mb-4">Based on your progress, we recommend starting with Technical Analysis fundamentals.</p>
              <div className="flex items-center space-x-4">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Start Path
                </button>
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  View Details
                </button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                <ChevronRight className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Modal */}
      {selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">
                  {allContent.find(c => c.id === selectedContent)?.title}
                </h2>
                <button 
                  onClick={() => setSelectedContent(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <Play className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600">Content player would be integrated here</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-slate-700">
                  {allContent.find(c => c.id === selectedContent)?.description}
                </p>
                
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => handleContentComplete(selectedContent)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Mark as Complete
                  </button>
                  <button className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                    Download Resources
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EducationalHub;