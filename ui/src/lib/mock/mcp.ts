import type { MCPTool } from '../../types';

export const mockMCPTools: MCPTool[] = [
  {
    id: 'tourism-search',
    name: 'Tourism Search',
    description: 'Search tourism information and destinations',
    enabled: true,
  },
  {
    id: 'postgres-query',
    name: 'PostgreSQL Query',
    description: 'Query structured data from database',
    enabled: true,
  },
  {
    id: 'document-search',
    name: 'Document Search',
    description: 'Search documents and knowledge base',
    enabled: false,
  },
  {
    id: 'weather-api',
    name: 'Weather API',
    description: 'Get weather information',
    enabled: false,
  },
];
