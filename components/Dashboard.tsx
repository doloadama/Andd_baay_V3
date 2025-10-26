import React, { useState } from 'react';
import { User, Project, Site, Product, View, Role, Investment, Transaction, ProjectStatus } from '../types';
import { PlusCircle, ShoppingCart, ListTree, DollarSign, Edit, Save, X, Calendar, Droplets, Wheat } from 'lucide-react';
import NewProjectModal from './NewProjectModal';
import AddSiteForm from './AddSiteForm';
import ProductListingModal from './ProductListingModal';
import { formatDate } from '../utils/formatters';

interface DashboardProps {
    currentUser: User;
    projects: Project[];
    sites: Site[];
    products: Product[];
    investments: Investment[];
    transactions: Transaction[];
    onAddProject: (project: Omit<Project, 'id'>) => void;
    onUpdateProject: (project: Project) => void;
    onAddSite: (data: { name: string, location: string }) => void;
    onAddProduct: (product: Omit<Product, 'id' | 'imageUrl'>, imageFile: File | null) => void;
    onUpdateProduct: (product: Product, imageFile: File | null) => void;
    allProducts: Product[];
}

const Dashboard: React.FC<DashboardProps> = (props) => {
    const { currentUser, projects, sites, products, investments, transactions, onAddProject, onUpdateProject, onAddSite, onAddProduct, onUpdateProduct, allProducts } = props;
    
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isAddingSite, setIsAddingSite] = useState(false);
    const [selectedSiteForNewProject, setSelectedSiteForNewProject] = useState<number | null>(null);
    const [selectedProjectForListing, setSelectedProjectForListing] = useState<Project | null>(null);

    const openNewProjectModal = (siteId: number) => {
        setSelectedSiteForNewProject(siteId);
        setIsProjectModalOpen(true);
    };

    const openProductListingModal = (project: Project) => {
        setSelectedProjectForListing(project);
        setIsProductModalOpen(true);
    };

    const totalInvestment = investments.reduce((sum, i) => sum + i.amount, 0);
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpense;

    const stats = [
        { label: 'Active Projects', value: projects.length, icon: ListTree, color: 'text-blue-500' },
        { label: 'Total Investment', value: `$${totalInvestment.toLocaleString()}`, icon: DollarSign, color: 'text-indigo-500' },
        { label: 'Net Profit', value: `$${netProfit.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500' },
        { label: 'Products on Market', value: products.filter(p => p.farmerId === currentUser.id).length, icon: ShoppingCart, color: 'text-orange-500' }
    ];

    return (
        <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map(stat => (
                    <div key={stat.label} className="bg-white p-5 rounded-xl shadow-sm border border-stone-200 flex items-center space-x-4">
                        <div className={`p-3 rounded-lg bg-opacity-10 ${stat.color.replace('text-', 'bg-')}`}>
                           <stat.icon size={24} className={stat.color} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Farm Sites and Projects */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                    <h3 className="text-xl font-bold text-gray-800">My Farm Sites & Projects</h3>
                    <button onClick={() => setIsAddingSite(!isAddingSite)} className="flex items-center space-x-2 text-sm font-semibold text-emerald-600 hover:text-emerald-800 transition-colors">
                        <PlusCircle size={18} />
                        <span>{isAddingSite ? 'Cancel' : 'Add New Site'}</span>
                    </button>
                </div>
                {isAddingSite && <AddSiteForm onSave={(data) => { onAddSite(data); setIsAddingSite(false);}} onCancel={() => setIsAddingSite(false)} />}
                <div className="space-y-6">
                    {sites.map(site => (
                        <SiteSection 
                            key={site.id} 
                            site={site} 
                            projects={projects.filter(p => p.siteId === site.id)}
                            onNewProjectClick={() => openNewProjectModal(site.id)}
                            onUpdateProject={onUpdateProject}
                            onManageListingClick={openProductListingModal}
                            allProducts={allProducts}
                            currentUser={currentUser}
                        />
                    ))}
                     {sites.length === 0 && !isAddingSite && <p className="text-center py-8 text-gray-500">You haven't added any farm sites yet. Click 'Add New Site' to get started.</p>}
                </div>
            </div>

            <NewProjectModal 
                isOpen={isProjectModalOpen} 
                onClose={() => setIsProjectModalOpen(false)} 
                onAddProject={onAddProject}
                sites={sites}
                initialSiteId={selectedSiteForNewProject}
            />
            
            {(isProductModalOpen && selectedProjectForListing) && <ProductListingModal 
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onAddProduct={onAddProduct}
                onUpdateProduct={onUpdateProduct}
                project={selectedProjectForListing}
                product={allProducts.find(p => p.projectId === selectedProjectForListing.id)}
                projects={projects}
                allProducts={allProducts}
                currentUser={currentUser}
            />}
        </div>
    );
};

interface SiteSectionProps {
  site: Site;
  projects: Project[];
  onNewProjectClick: () => void;
  onUpdateProject: (project: Project) => void;
  onManageListingClick: (project: Project) => void;
  allProducts: Product[];
  currentUser: User;
}

const SiteSection: React.FC<SiteSectionProps> = ({ site, projects, onNewProjectClick, onUpdateProject, onManageListingClick, allProducts, currentUser }) => {
  return (
    <div className="border border-stone-200 rounded-lg p-4 bg-stone-50/50">
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <h4 className="font-bold text-lg text-gray-800">{site.name}</h4>
          <p className="text-sm text-gray-500">{site.location}</p>
        </div>
        <button onClick={onNewProjectClick} className="flex items-center space-x-2 text-xs font-semibold bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full hover:bg-emerald-200 transition-colors">
          <PlusCircle size={14} />
          <span>New Project</span>
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {projects.map(project => (
          <ProjectCard 
            key={project.id} 
            project={project}
            onUpdateProject={onUpdateProject}
            onManageListingClick={onManageListingClick}
            isListed={allProducts.some(p => p.projectId === project.id)}
            currentUser={currentUser}
          />
        ))}
        {projects.length === 0 && <p className="text-sm text-gray-400 pl-1">No projects yet for this site.</p>}
      </div>
    </div>
  );
};

interface ProjectCardProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  onManageListingClick: (project: Project) => void;
  isListed: boolean;
  currentUser: User;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onUpdateProject, onManageListingClick, isListed, currentUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(project);
  const [harvestMode, setHarvestMode] = useState(false);

  const handleSave = () => {
    onUpdateProject(formData);
    setIsEditing(false);
  };

  const handleStatusUpdate = (newStatus: ProjectStatus) => {
    onUpdateProject({ ...project, status: newStatus });
    setHarvestMode(false);
  }
  
  const canManageListing = project.status === ProjectStatus.HARVESTING || project.status === ProjectStatus.COMPLETED;

  if (isEditing) {
    return (
      <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-sm">
        <div className="grid grid-cols-2 gap-3 mb-3">
            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="text-sm p-1 border rounded" placeholder="Project Name"/>
            <input value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} type="date" className="text-sm p-1 border rounded"/>
        </div>
        <div className="flex justify-end space-x-2">
            <button onClick={() => setIsEditing(false)}><X size={16} className="text-gray-500 hover:text-red-500"/></button>
            <button onClick={handleSave}><Save size={16} className="text-gray-500 hover:text-green-500"/></button>
        </div>
      </div>
    )
  }
  
  if (harvestMode) {
      return (
        <div className="bg-white p-3 rounded-lg border border-yellow-300 shadow-sm flex justify-between items-center">
            <div>
              <p className="font-semibold text-sm text-yellow-800">Harvest Mode</p>
              <p className="text-xs text-gray-600">Yield: {project.expectedYield} kg | Status: {project.status}</p>
            </div>
            <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleStatusUpdate(ProjectStatus.HARVESTING)}
                  disabled={project.status === ProjectStatus.HARVESTING || project.status === ProjectStatus.COMPLETED}
                  className="text-xs font-semibold bg-yellow-500 text-white px-3 py-1 rounded-full hover:bg-yellow-600 disabled:bg-gray-300"
                >
                  Mark as Harvesting
                </button>
                <button onClick={() => setHarvestMode(false)}><X size={16} className="text-gray-500 hover:text-red-500"/></button>
            </div>
        </div>
      )
  }

  return (
    <div className="bg-white p-3 rounded-lg border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
      <div className="flex-1">
        <p className="font-semibold text-gray-800">{project.name}</p>
        <div className="flex items-center text-xs text-gray-500 mt-1 space-x-4">
            <div className="flex items-center"><Droplets size={12} className="mr-1.5"/><span>{project.cropType}</span></div>
            <div className="flex items-center"><Calendar size={12} className="mr-1.5"/><span>{formatDate(project.startDate)} &rarr; {formatDate(project.endDate)}</span></div>
        </div>
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${ project.status === ProjectStatus.COMPLETED ? 'bg-green-100 text-green-800' : project.status === ProjectStatus.HARVESTING ? 'bg-yellow-100 text-yellow-800' : project.status === ProjectStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800' }`}>
              {project.status}
          </span>
          <div className="flex items-center gap-1">
             <button onClick={() => setHarvestMode(true)} className="p-1.5 text-gray-500 hover:bg-yellow-100 hover:text-yellow-700 rounded-md"><Wheat size={14}/></button>
             <button onClick={() => setIsEditing(true)} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md"><Edit size={14}/></button>
          </div>
          <button
              onClick={() => onManageListingClick(project)}
              disabled={!canManageListing}
              className="text-xs font-semibold text-white bg-emerald-600 px-3 py-1.5 rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
              {isListed ? 'Edit Listing' : 'List Product'}
          </button>
      </div>
    </div>
  );
};


export default Dashboard;