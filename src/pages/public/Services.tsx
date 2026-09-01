import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Layout, ShoppingCart, Smartphone, Code, 
  Palette, Network, TrendingUp, Cloud, Wrench, 
  ArrowRight, CheckCircle2, MessageSquare, X, Shield 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getServiceSlug } from '../../utils/serviceMapping';

const SERVICES_DATA = [
  {
    id: 'ai-agents',
    number: '01',
    title: 'AI Agents & AI Automation',
    icon: Bot,
    shortDesc: 'Build intelligent AI agents, assistants, chatbots, and automated workflows that handle repetitive tasks and improve business efficiency.',
    features: ['Custom AI Agents', 'AI Assistants', 'AI Chatbots', 'Business Automation', 'Intelligent Workflows'],
    cta: 'Explore AI Solutions'
  },
  {
    id: 'website-development',
    number: '02',
    title: 'Website Development',
    icon: Layout,
    shortDesc: 'Modern, fast, responsive websites designed to create a strong digital presence and convert visitors into customers.',
    features: ['Business Websites', 'Corporate Websites', 'Web Applications', 'Landing Pages', 'Custom Websites'],
    cta: 'Build My Website'
  },
  {
    id: 'ecommerce',
    number: '03',
    title: 'E-Commerce Development',
    icon: ShoppingCart,
    shortDesc: 'Powerful online stores with everything you need to showcase products, manage orders, and grow your online business.',
    features: ['Online Stores', 'Product Management', 'Order Management', 'Inventory', 'Admin Dashboard'],
    cta: 'Build My Store'
  },
  {
    id: 'mobile-apps',
    number: '04',
    title: 'Mobile App Development',
    icon: Smartphone,
    shortDesc: 'Custom mobile applications that provide seamless experiences across Android, iOS, and modern devices.',
    features: ['Android Apps', 'iOS Apps', 'Cross-Platform Apps', 'Business Apps', 'API Integration'],
    cta: 'Build My App'
  },
  {
    id: 'custom-software',
    number: '05',
    title: 'Custom Software Development',
    icon: Code,
    shortDesc: 'Purpose-built software solutions designed around your unique business processes, requirements, and goals.',
    features: ['CRM Systems', 'Business Dashboards', 'Management Systems', 'SaaS Platforms', 'Custom Applications'],
    cta: 'Discuss My Project'
  },
  {
    id: 'ui-ux',
    number: '06',
    title: 'UI/UX Design',
    icon: Palette,
    shortDesc: 'Clean, intuitive, and premium digital experiences that make websites, applications, and software easy and enjoyable to use.',
    features: ['Website UI/UX', 'Mobile App Design', 'Dashboard Design', 'User Experience', 'Design Systems'],
    cta: 'Design My Product'
  },
  {
    id: 'api-integrations',
    number: '07',
    title: 'API & Third-Party Integrations',
    icon: Network,
    shortDesc: 'Connect your digital products with the tools and platforms your business already uses.',
    features: ['REST APIs', 'AI APIs', 'Payment Gateways', 'WhatsApp Integration', 'Google Services', 'Third-Party APIs'],
    cta: 'Connect My Systems'
  },
  {
    id: 'seo',
    number: '08',
    title: 'SEO & Digital Growth',
    icon: TrendingUp,
    shortDesc: "Improve your website's visibility, performance, and search presence with a strong technical foundation and data-driven optimization.",
    features: ['Technical SEO', 'On-Page SEO', 'Performance Optimization', 'Analytics', 'Search Optimization'],
    cta: 'Grow My Business'
  },
  {
    id: 'cloud-hosting',
    number: '09',
    title: 'Cloud, Hosting & Deployment',
    icon: Cloud,
    shortDesc: 'Deploy and manage reliable digital infrastructure with secure hosting, cloud deployment, SSL, databases, and backups.',
    features: ['Domain & Hosting', 'Cloud Deployment', 'SSL/HTTPS', 'Database Setup', 'Migration & Backups'],
    cta: 'Deploy My Project'
  },
  {
    id: 'maintenance',
    number: '10',
    title: 'Maintenance & Technical Support',
    icon: Wrench,
    shortDesc: 'Keep your digital products secure, updated, fast, and reliable with ongoing technical support and maintenance.',
    features: ['Bug Fixes', 'Security Updates', 'Performance Optimization', 'Content Updates', 'Feature Improvements'],
    cta: 'Get Support'
  }
];

export const Services: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuth();
  const [selectedService, setSelectedService] = useState<typeof SERVICES_DATA[0] | null>(null);

  const handleServiceRequest = (serviceTitle: string) => {
    const slug = getServiceSlug(serviceTitle);
    const targetUrl = `/project-request?service=${encodeURIComponent(slug)}`;
    
    if (isAuthenticated) {
      navigate(targetUrl);
    } else {
      openAuthModal({
        redirectUrl: targetUrl,
        serviceTitle: serviceTitle,
        customTitle: 'Login or Create an Account to Start Your Project',
        customMessage: 'To submit a project request and track your project, please log in or create your free client account first.'
      });
    }
  };

  const handleGeneralProjectStart = () => {
    const targetUrl = '/project-request';
    if (isAuthenticated) {
      navigate(targetUrl);
    } else {
      openAuthModal({
        redirectUrl: targetUrl,
        customTitle: 'Login or Create an Account to Start Your Project',
        customMessage: 'To submit a project request and track your project, please log in or create your free client account first.'
      });
    }
  };

  return (
    <div className="bg-bg-light min-h-screen">
      {/* Header Section */}
      <section className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-accent-blue text-xs font-bold uppercase tracking-wider mb-4">
            <Shield size={13} />
            <span>Full-Cycle Agency Capabilities</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-5 tracking-tight">
            Our Core Services & Solutions
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Explore our 10 professional services. Select any service to view full specifications, or click to request a custom proposal directly through our authenticated client portal.
          </p>
        </motion.div>
      </section>

      {/* Services Grid */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES_DATA.map((service, index) => {
            const Icon = service.icon;
            const isFeatured = index === 0;

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`group relative bg-white rounded-3xl border border-slate-100 p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full ${
                  isFeatured ? 'lg:col-span-3 md:col-span-2 bg-gradient-to-br from-white to-blue-50/40 border-accent-blue/20' : ''
                }`}
              >
                <div className={`flex items-start justify-between mb-6 ${isFeatured ? 'lg:w-2/3' : ''}`}>
                  <div className="w-14 h-14 bg-blue-50 text-accent-blue rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-accent-blue group-hover:text-white transition-all duration-300 shadow-sm border border-blue-100/60">
                    <Icon size={28} />
                  </div>
                  <span className="text-3xl font-extrabold text-slate-200 group-hover:text-accent-blue/20 transition-colors">
                    {service.number}
                  </span>
                </div>

                <div className={`flex-1 ${isFeatured ? 'lg:flex lg:gap-12 lg:items-start' : ''}`}>
                  <div className={isFeatured ? 'lg:w-1/2' : ''}>
                    <h3 className="text-2xl font-bold text-primary mb-3 group-hover:text-accent-blue transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-slate-600 mb-6 leading-relaxed">
                      {service.shortDesc}
                    </p>

                    <button 
                      onClick={() => setSelectedService(service)}
                      className="text-xs font-bold text-accent-blue hover:underline mb-6 inline-flex items-center gap-1"
                    >
                      <span>View Detailed Specifications</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>

                  <div className={isFeatured ? 'lg:w-1/2 lg:bg-white lg:p-6 lg:rounded-2xl lg:shadow-sm lg:border lg:border-slate-100' : ''}>
                    <ul className="space-y-3 mb-8">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                          <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button 
                      onClick={() => handleServiceRequest(service.title)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-slate-50 text-primary font-semibold text-sm group-hover:bg-primary group-hover:text-white transition-all border border-slate-200 group-hover:border-primary shadow-sm"
                    >
                      <span>{service.cta}</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                <div className="absolute inset-0 border-2 border-transparent group-hover:border-accent-blue/20 rounded-3xl pointer-events-none transition-colors"></div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-white py-20 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-3">Why Businesses Choose AI Agents & Web Solutions</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">We partner with you to deliver high-quality digital products tailored to your business.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: '01', title: 'AI-First Approach', desc: 'Use modern AI technology to build smarter, automated digital systems.' },
              { num: '02', title: 'Custom-Built Solutions', desc: "Every solution is engineered around your actual business workflow." },
              { num: '03', title: 'Scalable Technology', desc: 'Modern TypeScript and cloud stacks designed to scale gracefully.' },
              { num: '04', title: 'Client Portal Tracking', desc: 'Track progress, approve quotations, and message your engineers in real time.' }
            ].map((item, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                <span className="text-xs font-bold text-accent-blue mb-3 block">{item.num}</span>
                <h3 className="text-base font-bold text-primary mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-bg-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">Have a Project in Mind?</h2>
          <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            Tell us what you're building. We'll help you choose the right technology and provide a clear quotation and timeline.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={handleGeneralProjectStart}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white rounded-xl font-medium text-base hover:bg-primary-light transition-all shadow-md hover:-translate-y-0.5"
            >
              <span>Start Your Project</span>
              <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => navigate('/contact')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-medium text-base hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <MessageSquare size={18} />
              <span>Contact Us</span>
            </button>
          </div>
        </div>
      </section>

      {/* Service Detail Modal */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="absolute inset-0 bg-primary/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] z-10"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-accent-blue rounded-xl flex items-center justify-center shadow-sm">
                    <selectedService.icon size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-primary">{selectedService.title}</h2>
                    <p className="text-xs text-slate-500 font-medium">Detailed Specifications & Inclusions</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedService(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-full hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-6 sm:p-8 overflow-y-auto flex-1">
                <div>
                  <h3 className="text-base font-bold text-primary mb-2">Service Overview</h3>
                  <p className="text-slate-600 mb-6 leading-relaxed text-sm">
                    {selectedService.shortDesc}
                  </p>
                  
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6">
                    <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Key Features & Deliverables</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0 m-0">
                      {selectedService.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-slate-700 text-sm">
                          <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span className="font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <h3 className="text-base font-bold text-primary mb-2">What you get:</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-3">
                    Our {selectedService.title.toLowerCase()} service provides enterprise-grade engineering, full responsiveness, automated backups, and complete source code ownership.
                  </p>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Submit a request to receive an official milestone breakdown and fixed-scope quotation inside your secure client portal.
                  </p>
                </div>
              </div>
              
              <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedService(null)}
                  className="px-5 py-2.5 font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-sm transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    const title = selectedService.title;
                    setSelectedService(null);
                    handleServiceRequest(title);
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-light transition-all shadow-sm"
                >
                  <span>Request This Service</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
