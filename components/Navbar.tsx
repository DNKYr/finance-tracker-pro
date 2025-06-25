
import React from 'react';
import PlusIcon from './icons/PlusIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import ChartPieIcon from './icons/ChartPieIcon';
import CalendarDaysIcon from './icons/CalendarDaysIcon';
import LayoutDashboardIcon from './icons/LayoutDashboardIcon';
import ListBulletIcon from './icons/ListBulletIcon'; // Import new icon
// DownloadIcon import removed as it's no longer used in Navbar
import { APP_TITLE } from '../constants';
import { ViewMode } from '../App';

interface NavbarProps {
  openModal: (mode: 'add' | 'import') => void;
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  // onExportToExcel prop removed
}

const Navbar: React.FC<NavbarProps> = ({ openModal, currentView, setCurrentView }) => {
  const commonViewButtonClass = "flex items-center text-white font-semibold py-2 px-3 rounded-lg shadow-sm transition duration-150 ease-in-out text-sm";
  const activeViewButtonClass = "bg-accent hover:bg-yellow-400"; 
  const inactiveViewButtonClass = "bg-primary/60 hover:bg-primary/80"; 

  const commonActionButtonClass = "flex items-center text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out text-sm";


  return (
    <nav className="bg-primary shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <ChartPieIcon className="h-8 w-8 text-white mr-2" />
            <span className="font-bold text-xl text-white mr-6">{APP_TITLE}</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`${commonViewButtonClass} ${currentView === 'dashboard' ? activeViewButtonClass : inactiveViewButtonClass}`}
                aria-pressed={currentView === 'dashboard'}
                aria-label="Switch to Dashboard View"
              >
                <LayoutDashboardIcon className="h-5 w-5 mr-1.5" />
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('all')}
                className={`${commonViewButtonClass} ${currentView === 'all' ? activeViewButtonClass : inactiveViewButtonClass}`}
                aria-pressed={currentView === 'all'}
                aria-label="Switch to All Transactions View"
              >
                <ListBulletIcon className="h-5 w-5 mr-1.5" />
                All Transactions
              </button>
              <button
                onClick={() => setCurrentView('monthly')}
                className={`${commonViewButtonClass} ${currentView === 'monthly' ? activeViewButtonClass : inactiveViewButtonClass}`}
                aria-pressed={currentView === 'monthly'}
                aria-label="Switch to Monthly View"
              >
                <CalendarDaysIcon className="h-5 w-5 mr-1.5" />
                Monthly
              </button>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => openModal('add')}
              className={`${commonActionButtonClass} bg-green-500 hover:bg-green-600`}
              aria-label="Add new transaction"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Transaction
            </button>
            <button
              onClick={() => openModal('import')}
              className={`${commonActionButtonClass} bg-sky-500 hover:bg-sky-600`}
              aria-label="Import transactions"
            >
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Import Transactions
            </button>
            {/* Export Excel button removed from here */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
