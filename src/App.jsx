import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Páginas Públicas
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import TrackingPage from './pages/tracking/TrackingPage';
import PricingPage from './pages/public/PricingPage';
import CheckoutPage from './pages/public/CheckoutPage';
import ReferralLandingPage from './pages/public/ReferralLandingPage';

// Layouts
import SystemLayout from './layouts/SystemLayout';
import SaasAdminLayout from './layouts/SaasAdminLayout';

// Páginas da Assistência Técnica (Tenant)
import DashboardPage from './pages/system/DashboardPage';
import NovaOsPage from './pages/system/NovaOsPage';
import KanbanPage from './pages/system/KanbanPage';
import DetalhesOsPage from './pages/system/DetalhesOsPage';
import EstoquePage from './pages/system/EstoquePage';
import CaixaPage from './pages/system/CaixaPage';
import AutomacoesPage from './pages/system/AutomacoesPage';
import TecnicosPage from './pages/system/TecnicosPage';
import ConfiguracoesPage from './pages/system/ConfiguracoesPage';
import LojasPage from './pages/system/LojasPage';
import PerfilPage from './pages/system/PerfilPage';
import AssinaturaPage from './pages/system/AssinaturaPage';
import IndicarPage from './pages/system/IndicarPage';
import SuportePage from './pages/system/SuportePage';

// Páginas do Super Admin SaaS (Plataforma B2B)
import AdminSaasPage from './pages/admin/AdminSaasPage';
import SaasPlansPage from './pages/admin/SaasPlansPage';
import SaasFinancePage from './pages/admin/SaasFinancePage';
import SaasCrmPage from './pages/admin/SaasCrmPage';
import SaasReferralsPage from './pages/admin/SaasReferralsPage';
import SaasSupportPage from './pages/admin/SaasSupportPage';
import SaasSdrPage from './pages/admin/SaasSdrPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/precos" element={<PricingPage />} />
          <Route path="/checkout/:planId" element={<CheckoutPage />} />
          <Route path="/r/:slug" element={<ReferralLandingPage />} />
          <Route path="/admin" element={<LoginPage />} />
          <Route path="/track/:hash" element={<TrackingPage />} />

          {/* Rotas Operacionais da Assistência (/system/*) */}
          <Route path="/system" element={<ProtectedRoute />}>
            <Route element={<SystemLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="os" element={<KanbanPage />} />
              <Route path="os/nova" element={<NovaOsPage />} />
              <Route path="os/:id" element={<DetalhesOsPage />} />
              <Route path="estoque" element={<EstoquePage />} />
              <Route path="caixa" element={<CaixaPage />} />
              <Route path="automacoes" element={<AutomacoesPage />} />
              <Route path="tecnicos" element={<TecnicosPage />} />
              <Route path="configuracoes" element={<ConfiguracoesPage />} />
              <Route path="lojas" element={<LojasPage />} />
              <Route path="perfil" element={<PerfilPage />} />
              <Route path="assinatura" element={<AssinaturaPage />} />
              <Route path="indicar" element={<IndicarPage />} />
              <Route path="suporte" element={<SuportePage />} />
            </Route>
          </Route>

          {/* Rotas do Super Admin SaaS (/admin/saas/*) */}
          <Route path="/admin/saas" element={<ProtectedRoute />}>
            <Route element={<SaasAdminLayout />}>
              <Route index element={<AdminSaasPage />} />
              <Route path="planos" element={<SaasPlansPage />} />
              <Route path="financeiro" element={<SaasFinancePage />} />
              <Route path="crm" element={<SaasCrmPage />} />
              <Route path="indicacoes" element={<SaasReferralsPage />} />
              <Route path="suporte" element={<SaasSupportPage />} />
              <Route path="sofia-sdr" element={<SaasSdrPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
