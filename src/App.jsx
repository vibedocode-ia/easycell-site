import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Páginas
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SystemLayout from './layouts/SystemLayout';
import DashboardPage from './pages/system/DashboardPage';
import NovaOsPage from './pages/system/NovaOsPage';
import KanbanPage from './pages/system/KanbanPage';
import DetalhesOsPage from './pages/system/DetalhesOsPage';
import EstoquePage from './pages/system/EstoquePage';
import CaixaPage from './pages/system/CaixaPage';
import TrackingPage from './pages/tracking/TrackingPage';
import AutomacoesPage from './pages/system/AutomacoesPage';
import TecnicosPage from './pages/system/TecnicosPage';
import ConfiguracoesPage from './pages/system/ConfiguracoesPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota Pública 1: Landing Page do Hermes */}
          <Route path="/" element={<LandingPage />} />

          {/* Rota Pública 2: Portal de Acesso Operacional */}
          <Route path="/admin" element={<LoginPage />} />

          {/* Rota Pública 3: Portal do Cliente (Tracking de O.S. via WhatsApp) */}
          <Route path="/track/:hash" element={<TrackingPage />} />

          {/* Rotas Protegidas do Sistema sob /system */}
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
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
