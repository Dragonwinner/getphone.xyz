import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PhonesPage from './pages/PhonesPage';
import PhoneDetailPage from './pages/PhoneDetailPage';
import ComparePage from './pages/ComparePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';

type Page = 'home' | 'phones' | 'phone' | 'compare' | 'about' | 'contact' | 'privacy-policy' | 'terms-of-service';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentSlug, setCurrentSlug] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSlug, setFilterSlug] = useState<string>('');
  const [comparePhoneIds, setComparePhoneIds] = useState<string[]>([]);

  const handleNavigate = (page: string, slug?: string, phoneIds?: string[]) => {
    setCurrentPage(page as Page);
    setCurrentSlug(slug || '');
    setSearchQuery('');

    if (page === 'phones' && slug) {
      setFilterSlug(slug);
    } else {
      setFilterSlug('');
    }

    if (page === 'compare' && phoneIds) {
      setComparePhoneIds(phoneIds);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage('phones');
    setFilterSlug('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onSearch={handleSearch} onNavigate={handleNavigate} />

      <main className="flex-1">
        {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentPage === 'phones' && (
          <PhonesPage
            onNavigate={handleNavigate}
            initialFilter={filterSlug}
            searchQuery={searchQuery}
          />
        )}
        {currentPage === 'phone' && (
          <PhoneDetailPage slug={currentSlug} onNavigate={handleNavigate} />
        )}
        {currentPage === 'compare' && (
          <ComparePage onNavigate={handleNavigate} initialPhoneIds={comparePhoneIds} />
        )}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'contact' && <ContactPage />}
        {currentPage === 'privacy-policy' && <PrivacyPolicyPage onNavigate={handleNavigate} />}
        {currentPage === 'terms-of-service' && <TermsOfServicePage onNavigate={handleNavigate} />}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
