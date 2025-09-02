-- Create strategies table
CREATE TABLE strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'testing')),
    parameters JSONB DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{}',
    creator_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_public BOOLEAN DEFAULT false,
    rules_explanation TEXT
);

-- Create indexes for strategies
CREATE INDEX idx_strategies_creator_id ON strategies(creator_id);
CREATE INDEX idx_strategies_status ON strategies(status);
CREATE INDEX idx_strategies_created_at ON strategies(created_at DESC);
CREATE INDEX idx_strategies_performance ON strategies USING GIN(performance_metrics);
CREATE INDEX idx_strategies_is_public ON strategies(is_public);
CREATE INDEX idx_strategies_name ON strategies(name);

-- Enable RLS for strategies
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;

-- RLS policies for strategies
CREATE POLICY "Users can view public strategies or their own" ON strategies
    FOR SELECT USING (is_public = true OR auth.uid() = creator_id);

CREATE POLICY "Users can insert their own strategies" ON strategies
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own strategies" ON strategies
    FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete their own strategies" ON strategies
    FOR DELETE USING (auth.uid() = creator_id);

-- Create backtest_results table
CREATE TABLE backtest_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID REFERENCES strategies(id) ON DELETE CASCADE,
    results_data JSONB NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_return DECIMAL(10,4),
    max_drawdown DECIMAL(10,4),
    sharpe_ratio DECIMAL(10,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for backtest_results
CREATE INDEX idx_backtest_results_strategy_id ON backtest_results(strategy_id);
CREATE INDEX idx_backtest_results_created_at ON backtest_results(created_at DESC);
CREATE INDEX idx_backtest_results_performance ON backtest_results(total_return, max_drawdown, sharpe_ratio);

-- Enable RLS for backtest_results
ALTER TABLE backtest_results ENABLE ROW LEVEL SECURITY;

-- RLS policies for backtest_results
CREATE POLICY "Users can view backtest results for accessible strategies" ON backtest_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM strategies s 
            WHERE s.id = strategy_id 
            AND (s.is_public = true OR s.creator_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert backtest results for their own strategies" ON backtest_results
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM strategies s 
            WHERE s.id = strategy_id 
            AND s.creator_id = auth.uid()
        )
    );

CREATE POLICY "Users can update backtest results for their own strategies" ON backtest_results
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM strategies s 
            WHERE s.id = strategy_id 
            AND s.creator_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete backtest results for their own strategies" ON backtest_results
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM strategies s 
            WHERE s.id = strategy_id 
            AND s.creator_id = auth.uid()
        )
    );

-- Create favorites table
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    strategy_id UUID REFERENCES strategies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, strategy_id)
);

-- Create indexes for favorites
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_strategy_id ON favorites(strategy_id);

-- Enable RLS for favorites
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- RLS policies for favorites
CREATE POLICY "Users can manage their own favorites" ON favorites
    FOR ALL USING (auth.uid() = user_id);

-- Create tags table
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    color VARCHAR(7) DEFAULT '#3b82f6',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for tags
CREATE INDEX idx_tags_name ON tags(name);

-- Create strategy_tags junction table
CREATE TABLE strategy_tags (
    strategy_id UUID REFERENCES strategies(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (strategy_id, tag_id)
);

-- Create indexes for strategy_tags
CREATE INDEX idx_strategy_tags_strategy_id ON strategy_tags(strategy_id);
CREATE INDEX idx_strategy_tags_tag_id ON strategy_tags(tag_id);

-- Grant permissions for tags (public read access)
GRANT SELECT ON tags TO anon, authenticated;
GRANT SELECT ON strategy_tags TO anon, authenticated;

-- Insert initial tag data
INSERT INTO tags (name, color, description) VALUES
('trend-following', '#10b981', 'Strategies that follow market trends'),
('mean-reversion', '#f59e0b', 'Strategies that trade against trends'),
('scalping', '#ef4444', 'High-frequency short-term strategies'),
('swing-trading', '#8b5cf6', 'Medium-term position strategies'),
('day-trading', '#06b6d4', 'Intraday trading strategies'),
('position-trading', '#84cc16', 'Long-term position strategies'),
('beginner', '#06b6d4', 'Suitable for novice traders'),
('intermediate', '#f59e0b', 'For traders with some experience'),
('advanced', '#f97316', 'Complex strategies for experienced traders'),
('high-frequency', '#ef4444', 'Very short-term automated strategies'),
('momentum', '#10b981', 'Strategies based on price momentum'),
('breakout', '#8b5cf6', 'Strategies that trade breakouts'),
('grid-trading', '#64748b', 'Grid-based trading strategies'),
('arbitrage', '#0ea5e9', 'Price difference exploitation strategies');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for strategies table
CREATE TRIGGER update_strategies_updated_at BEFORE UPDATE ON strategies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for strategy statistics
CREATE VIEW strategy_stats AS
SELECT 
    s.id,
    s.name,
    s.status,
    s.creator_id,
    s.is_public,
    s.created_at,
    s.updated_at,
    COALESCE(f.favorite_count, 0) as favorite_count,
    COALESCE(br.backtest_count, 0) as backtest_count,
    COALESCE(st.tag_count, 0) as tag_count
FROM strategies s
LEFT JOIN (
    SELECT strategy_id, COUNT(*) as favorite_count
    FROM favorites
    GROUP BY strategy_id
) f ON s.id = f.strategy_id
LEFT JOIN (
    SELECT strategy_id, COUNT(*) as backtest_count
    FROM backtest_results
    GROUP BY strategy_id
) br ON s.id = br.strategy_id
LEFT JOIN (
    SELECT strategy_id, COUNT(*) as tag_count
    FROM strategy_tags
    GROUP BY strategy_id
) st ON s.id = st.strategy_id;

-- Grant permissions for the view
GRANT SELECT ON strategy_stats TO authenticated;