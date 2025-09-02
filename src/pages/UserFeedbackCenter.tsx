import React, { useState, useEffect } from 'react';
import { useAIStrategyStore } from '../store/useAIStrategyStore';
import { mockUserFeedback, mockStrategies } from '../data/aiStrategyMockData';
import { MessageSquare, Star, ThumbsUp, ThumbsDown, Send, Filter, TrendingUp, Users, Award, Clock } from 'lucide-react';

interface FeedbackFormData {
  strategyId: string;
  rating: number;
  comment: string;
  category: 'performance' | 'usability' | 'documentation' | 'support';
}

const UserFeedbackCenter: React.FC = () => {
  const { strategies, userFeedback, setStrategies, setUserFeedback } = useAIStrategyStore();
  const [activeTab, setActiveTab] = useState<'view' | 'submit'>('view');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<number>(0);
  const [feedbackForm, setFeedbackForm] = useState<FeedbackFormData>({
    strategyId: '',
    rating: 5,
    comment: '',
    category: 'performance'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (strategies.length === 0) {
      setStrategies(mockStrategies);
    }
    if (userFeedback.length === 0) {
      setUserFeedback(mockUserFeedback);
    }
    if (!feedbackForm.strategyId && strategies.length > 0) {
      setFeedbackForm(prev => ({ ...prev, strategyId: strategies[0].id }));
    }
  }, [strategies, userFeedback, setStrategies, setUserFeedback, feedbackForm.strategyId]);

  const filteredFeedback = userFeedback.filter(feedback => {
    const categoryMatch = filterCategory === 'all' || feedback.category === filterCategory;
    const ratingMatch = filterRating === 0 || feedback.rating >= filterRating;
    return categoryMatch && ratingMatch;
  });

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newFeedback = {
      id: `feedback-${Date.now()}`,
      userId: 'current-user',
      userName: 'You',
      userAvatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20trader%20avatar%20icon%20blue%20theme&image_size=square',
      strategyId: feedbackForm.strategyId,
      strategyName: strategies.find(s => s.id === feedbackForm.strategyId)?.name || '',
      rating: feedbackForm.rating,
      comment: feedbackForm.comment,
      category: feedbackForm.category,
      createdAt: new Date().toISOString(),
      helpfulCount: 0,
      isVerified: false
    };
    
    setUserFeedback([newFeedback, ...userFeedback]);
    setFeedbackForm({
      strategyId: strategies[0]?.id || '',
      rating: 5,
      comment: '',
      category: 'performance'
    });
    
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  const renderStars = (rating: number, interactive: boolean = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-slate-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
          />
        ))}
      </div>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return <TrendingUp className="h-4 w-4" />;
      case 'usability': return <Users className="h-4 w-4" />;
      case 'documentation': return <MessageSquare className="h-4 w-4" />;
      case 'support': return <Award className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'performance': return 'bg-green-50 text-green-700';
      case 'usability': return 'bg-blue-50 text-blue-700';
      case 'documentation': return 'bg-purple-50 text-purple-700';
      case 'support': return 'bg-orange-50 text-orange-700';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  const getAverageRating = () => {
    if (userFeedback.length === 0) return 0;
    const total = userFeedback.reduce((sum, feedback) => sum + feedback.rating, 0);
    return (total / userFeedback.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    userFeedback.forEach(feedback => {
      distribution[feedback.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900">User Feedback Center</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                <Star className="h-4 w-4 fill-current" />
                <span>{getAverageRating()}</span>
                <span className="text-blue-500">({userFeedback.length} reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {submitSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <p className="text-green-800 font-medium">Thank you for your feedback! Your review has been submitted successfully.</p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('view')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'view'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>View Feedback</span>
            </button>
            <button
              onClick={() => setActiveTab('submit')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'submit'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Send className="h-4 w-4" />
              <span>Submit Feedback</span>
            </button>
          </div>
        </div>

        {/* View Feedback Tab */}
        {activeTab === 'view' && (
          <div className="space-y-8">
            {/* Feedback Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Average Rating */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
                <div className="text-3xl font-bold text-slate-900 mb-2">{getAverageRating()}</div>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.round(parseFloat(getAverageRating())))}
                </div>
                <p className="text-sm text-slate-600">{userFeedback.length} total reviews</p>
              </div>

              {/* Rating Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Rating Distribution</h3>
                <div className="space-y-2">
                  {Object.entries(getRatingDistribution()).reverse().map(([rating, count]) => (
                    <div key={rating} className="flex items-center space-x-2">
                      <span className="text-sm text-slate-600 w-6">{rating}★</span>
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full" 
                          style={{ width: `${userFeedback.length > 0 ? (count / userFeedback.length) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-slate-600 w-8">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Most Reviewed</span>
                    <span className="text-sm font-medium text-slate-900">Momentum Strategy</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Highest Rated</span>
                    <span className="text-sm font-medium text-slate-900">Mean Reversion</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">This Month</span>
                    <span className="text-sm font-medium text-slate-900">{userFeedback.filter(f => new Date(f.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} reviews</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center space-x-4">
                <Filter className="h-5 w-5 text-slate-600" />
                <span className="font-medium text-slate-900">Filters:</span>
                
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="performance">Performance</option>
                  <option value="usability">Usability</option>
                  <option value="documentation">Documentation</option>
                  <option value="support">Support</option>
                </select>
                
                <select
                  value={filterRating}
                  onChange={(e) => setFilterRating(parseInt(e.target.value))}
                  className="border border-slate-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={0}>All Ratings</option>
                  <option value={5}>5 Stars</option>
                  <option value={4}>4+ Stars</option>
                  <option value={3}>3+ Stars</option>
                  <option value={2}>2+ Stars</option>
                  <option value={1}>1+ Stars</option>
                </select>
                
                <span className="text-sm text-slate-600">
                  Showing {filteredFeedback.length} of {userFeedback.length} reviews
                </span>
              </div>
            </div>

            {/* Feedback List */}
            <div className="space-y-4">
              {filteredFeedback.map(feedback => (
                <div key={feedback.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={feedback.userAvatar}
                        alt={feedback.userName}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-slate-900">{feedback.userName}</h4>
                          {feedback.isVerified && (
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">{feedback.strategyName}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        {renderStars(feedback.rating)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(feedback.category)}`}>
                          <div className="flex items-center space-x-1">
                            {getCategoryIcon(feedback.category)}
                            <span className="capitalize">{feedback.category}</span>
                          </div>
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-slate-700 mb-4">{feedback.comment}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-1 text-sm text-slate-600 hover:text-green-600 transition-colors">
                        <ThumbsUp className="h-4 w-4" />
                        <span>Helpful ({feedback.helpfulCount})</span>
                      </button>
                      <button className="flex items-center space-x-1 text-sm text-slate-600 hover:text-red-600 transition-colors">
                        <ThumbsDown className="h-4 w-4" />
                        <span>Not Helpful</span>
                      </button>
                    </div>
                    
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Feedback Tab */}
        {activeTab === 'submit' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Submit Your Feedback</h2>
              
              <form onSubmit={handleSubmitFeedback} className="space-y-6">
                {/* Strategy Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Strategy</label>
                  <select
                    value={feedbackForm.strategyId}
                    onChange={(e) => setFeedbackForm(prev => ({ ...prev, strategyId: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {strategies.map(strategy => (
                      <option key={strategy.id} value={strategy.id}>
                        {strategy.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                  <select
                    value={feedbackForm.category}
                    onChange={(e) => setFeedbackForm(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="performance">Performance</option>
                    <option value="usability">Usability</option>
                    <option value="documentation">Documentation</option>
                    <option value="support">Support</option>
                  </select>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                  <div className="flex items-center space-x-2">
                    {renderStars(feedbackForm.rating, true, (rating) => 
                      setFeedbackForm(prev => ({ ...prev, rating }))
                    )}
                    <span className="text-sm text-slate-600 ml-2">({feedbackForm.rating} star{feedbackForm.rating !== 1 ? 's' : ''})</span>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Comment</label>
                  <textarea
                    value={feedbackForm.comment}
                    onChange={(e) => setFeedbackForm(prev => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Share your experience with this strategy..."
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Feedback</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserFeedbackCenter;