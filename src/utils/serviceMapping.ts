export interface ServiceDefinition {
  id: string;
  title: string;
  slug: string;
  aliases: string[];
}

export const PROJECT_SERVICES: ServiceDefinition[] = [
  {
    id: 'ai-agents',
    title: 'AI Agents & AI Automation',
    slug: 'ai-agents',
    aliases: ['ai-agent', 'ai-agents', 'ai-automation', 'request-ai-agent', 'ai', 'automation']
  },
  {
    id: 'website-development',
    title: 'Website Development',
    slug: 'website-development',
    aliases: ['website-development', 'web-development', 'build-my-website', 'website', 'web-dev', 'web']
  },
  {
    id: 'ecommerce',
    title: 'E-Commerce Development',
    slug: 'ecommerce',
    aliases: ['ecommerce', 'e-commerce', 'build-my-store', 'online-store', 'e-commerce-development']
  },
  {
    id: 'mobile-apps',
    title: 'Mobile App Development',
    slug: 'mobile-apps',
    aliases: ['mobile-apps', 'mobile-app', 'build-my-app', 'app-development', 'mobile-development', 'ios-android']
  },
  {
    id: 'custom-software',
    title: 'Custom Software Development',
    slug: 'custom-software',
    aliases: ['custom-software', 'custom-software-development', 'discuss-my-project', 'saas', 'software']
  },
  {
    id: 'ui-ux',
    title: 'UI/UX Design',
    slug: 'ui-ux',
    aliases: ['ui-ux', 'ui-ux-design', 'design-my-product', 'design', 'ui', 'ux']
  },
  {
    id: 'api-integrations',
    title: 'API & Third-Party Integrations',
    slug: 'api-integrations',
    aliases: ['api-integrations', 'api-integration', 'connect-my-systems', 'apis', 'integration']
  },
  {
    id: 'seo',
    title: 'SEO & Digital Growth',
    slug: 'seo',
    aliases: ['seo', 'seo-digital-growth', 'grow-my-business', 'digital-growth', 'marketing']
  },
  {
    id: 'cloud-hosting',
    title: 'Cloud, Hosting & Deployment',
    slug: 'cloud-hosting',
    aliases: ['cloud-hosting', 'cloud-deployment', 'deploy-my-project', 'cloud', 'devops', 'hosting']
  },
  {
    id: 'maintenance',
    title: 'Maintenance & Technical Support',
    slug: 'maintenance',
    aliases: ['maintenance', 'technical-support', 'get-support', 'support']
  }
];

export const PROJECT_TYPES_LIST = PROJECT_SERVICES.map(s => s.title);

/**
 * Resolves any service string (slug, title, alias, or parameter) to the canonical service title.
 */
export function resolveServiceType(param?: string | null): string {
  if (!param) return PROJECT_SERVICES[1].title; // Default: Website Development

  const clean = param.trim().toLowerCase();
  
  // Exact title match (case-insensitive)
  const exactMatch = PROJECT_SERVICES.find(s => s.title.toLowerCase() === clean);
  if (exactMatch) return exactMatch.title;

  // Slug match
  const slugMatch = PROJECT_SERVICES.find(s => s.slug.toLowerCase() === clean);
  if (slugMatch) return slugMatch.title;

  // Alias match
  const aliasMatch = PROJECT_SERVICES.find(s => s.aliases.some(a => a.toLowerCase() === clean));
  if (aliasMatch) return aliasMatch.title;

  // Partial match
  const partialMatch = PROJECT_SERVICES.find(s => 
    s.title.toLowerCase().includes(clean) || 
    s.slug.toLowerCase().includes(clean) ||
    clean.includes(s.slug.toLowerCase())
  );
  if (partialMatch) return partialMatch.title;

  return PROJECT_SERVICES[1].title;
}

/**
 * Gets the standard slug for a service title
 */
export function getServiceSlug(serviceTitle: string): string {
  const found = PROJECT_SERVICES.find(s => s.title.toLowerCase() === serviceTitle.toLowerCase());
  return found ? found.slug : 'website-development';
}
