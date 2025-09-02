import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { componentLibrary, getComponentsByCategory } from '../../data/componentLibrary';
import { ComponentDefinition } from '../../types/strategy';
import * as LucideIcons from 'lucide-react';

interface DraggableComponentProps {
  component: ComponentDefinition;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({ component }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'component',
    item: () => {
      console.log('Drag started for component:', component.name);
      return { component };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  console.log('DraggableComponent render:', component.name, 'isDragging:', isDragging);

  // Get the icon component dynamically
  const IconComponent = (LucideIcons as any)[component.icon] || LucideIcons.Box;

  return (
    <div
      ref={drag}
      className={`
        p-3 bg-white border border-gray-200 rounded-lg cursor-move
        hover:border-gray-300 hover:shadow-sm transition-all duration-200
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
      style={{ borderLeftColor: component.color, borderLeftWidth: '4px' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <IconComponent 
          size={16} 
          style={{ color: component.color }}
        />
        <span className="font-medium text-sm text-gray-900">
          {component.name}
        </span>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed">
        {component.description}
      </p>
    </div>
  );
};

interface CategorySectionProps {
  title: string;
  category: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}

const CategorySection: React.FC<CategorySectionProps> = ({ 
  title, 
  category, 
  icon: Icon, 
  color 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const components = getComponentsByCategory(category);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
      >
        {isExpanded ? (
          <ChevronDown size={16} className="text-gray-500" />
        ) : (
          <ChevronRight size={16} className="text-gray-500" />
        )}
        <Icon size={16} style={{ color }} />
        <span className="font-medium text-sm text-gray-900">{title}</span>
        <span className="ml-auto text-xs text-gray-500">
          {components.length}
        </span>
      </button>
      
      {isExpanded && (
        <div className="mt-2 space-y-2 pl-6">
          {components.map((component) => (
            <DraggableComponent 
              key={component.id} 
              component={component} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ComponentLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredComponents = componentLibrary.filter(component =>
    component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    component.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [
    {
      title: 'Entry/Exit Conditions',
      category: 'entry-exit',
      icon: LucideIcons.Target,
      color: '#10b981'
    },
    {
      title: 'Risk Management',
      category: 'risk-management',
      icon: LucideIcons.Shield,
      color: '#ef4444'
    },
    {
      title: 'Time Filters',
      category: 'time-filters',
      icon: LucideIcons.Clock,
      color: '#84cc16'
    },
    {
      title: 'Technical Indicators',
      category: 'technical-indicators',
      icon: LucideIcons.TrendingUp,
      color: '#6366f1'
    }
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Component Library
        </h2>
        
        {/* Search */}
        <div className="relative">
          <LucideIcons.Search 
            size={16} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
          />
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Component Categories */}
      <div className="flex-1 overflow-y-auto p-4">
        {searchTerm ? (
          // Show filtered results
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Search Results ({filteredComponents.length})
            </h3>
            {filteredComponents.map((component) => (
              <DraggableComponent 
                key={component.id} 
                component={component} 
              />
            ))}
            {filteredComponents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <LucideIcons.Search size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No components found</p>
              </div>
            )}
          </div>
        ) : (
          // Show categories
          <div>
            {categories.map((category) => (
              <CategorySection
                key={category.category}
                title={category.title}
                category={category.category}
                icon={category.icon}
                color={category.color}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="text-xs text-gray-500 text-center">
          Drag components to the canvas to build your strategy
        </div>
      </div>
    </div>
  );
};

export default ComponentLibrary;