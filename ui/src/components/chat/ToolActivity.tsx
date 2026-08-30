import React from 'react';
import type { ToolExecution } from '../../types';

interface Props {
  executions: ToolExecution[];
}

export const ToolActivity: React.FC<Props> = ({ executions }) => {
  if (executions.length === 0) return null;

  return (
    <div className="tool-activity">
      <div className="tool-activity-title">Using tools</div>
      {executions.map((tool) => (
        <div key={tool.id} className="tool-item">
          <span className={`tool-item-icon ${tool.status}`}>
            {tool.status === 'running' ? '◌' : tool.status === 'success' ? '✓' : '✗'}
          </span>
          <span className="tool-item-name">{tool.name}</span>
          {tool.durationMs !== undefined && (
            <span className="tool-item-duration">{tool.durationMs}ms</span>
          )}
        </div>
      ))}
    </div>
  );
};
