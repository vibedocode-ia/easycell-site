import React, { useState, useEffect } from 'react';
import { Store, ChevronDown, Check, Plus, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StoreSelector() {
  const [lojas, setLojas] = useState([
    { id: 'todas', nomeUnidade: 'Todas as Unidades (Visão Geral)', corIdentificacao: '#10b981', tipo: 'consolidado' },
    { id: 'loj_matriz_centro', nomeUnidade: 'Matriz — Centro Lab', corIdentificacao: '#06b6d4', tipo: 'matriz' },
    { id: 'loj_filial_shopping', nomeUnidade: 'Filial — Shopping Morumbi', corIdentificacao: '#3b82f6', tipo: 'filial' },
  ]);

  const [lojaAtivaId, setLojaAtivaId] = useState(() => {
    try {
      return localStorage.getItem('easycell_active_loja') || 'loj_matriz_centro';
    } catch (e) {
      return 'loj_matriz_centro';
    }
  });
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleLojaChange = () => {
      try {
        const saved = localStorage.getItem('easycell_active_loja') || 'loj_matriz_centro';
        setLojaAtivaId(saved);
      } catch (e) {
        setLojaAtivaId('loj_matriz_centro');
      }
    };

    window.addEventListener('loja-alterada', handleLojaChange);
    return () => window.removeEventListener('loja-alterada', handleLojaChange);
  }, []);

  const handleSelect = (id) => {
    setLojaAtivaId(id);
    localStorage.setItem('easycell_active_loja', id);
    setIsOpen(false);
    window.dispatchEvent(new Event('loja-alterada'));
  };

  const lojaSelecionada = lojas.find(l => l.id === lojaAtivaId) || lojas[1];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-white transition-all cursor-pointer"
      >
        <span 
          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" 
          style={{ backgroundColor: lojaSelecionada.corIdentificacao || '#06b6d4' }} 
        />
        <span className="font-bold truncate max-w-[140px] sm:max-w-[180px]">
          {lojaSelecionada.nomeUnidade}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800 p-2 shadow-2xl z-50 space-y-1 font-sans">
            <div className="px-3 py-2 text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider">
              Ponto de Atendimento Ativo
            </div>

            {lojas.map((loja) => {
              const isSelected = loja.id === lojaAtivaId;
              return (
                <button
                  key={loja.id}
                  onClick={() => handleSelect(loja.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition cursor-pointer text-left ${
                    isSelected 
                      ? 'bg-cyan-500/10 text-cyan-300 font-bold' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span 
                      className="w-2 h-2 rounded-full shrink-0" 
                      style={{ backgroundColor: loja.corIdentificacao || '#06b6d4' }} 
                    />
                    <span className="truncate">{loja.nomeUnidade}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                </button>
              );
            })}

            <div className="pt-2 mt-1 border-t border-slate-800/80">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/system/lojas');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 font-semibold transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Gerenciar Lojas & Filiais</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
