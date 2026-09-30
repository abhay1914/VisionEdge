import { useState } from 'react';

type Filter = 'all' | 'running' | 'stopped';

interface StreamStatusFilterProps {
  onFilterChange: (filter: Filter) => void;
}

export default function StreamStatusFilter({
  onFilterChange,
}: StreamStatusFilterProps) {
  const [activeFilter, setActiveFilter] = useState<Filter>('all');

  const handleFilterChange = (filter: Filter) => {
    setActiveFilter(filter);
    onFilterChange(filter);
  };

  return (
    <div>
      <button onClick={() => handleFilterChange('all')}>
        All
      </button>

      <button onClick={() => handleFilterChange('running')}>
        Running
      </button>

      <button onClick={() => handleFilterChange('stopped')}>
        Stopped
      </button>

      <span> Selected: {activeFilter}</span>
    </div>
  );
}
