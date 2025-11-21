"use client";

import { useState } from "react";
import { Upload, Wand2, CheckCircle2, Music, Sparkles, Zap, Shield, ArrowRight, Mic, FileAudio, Radio, X } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false); // Pour la fenêtre "Bientôt"

  // --- FONCTIONS ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
      setResult(null);
      // Auto scroll vers le lecteur après upload
      setTimeout(() => scrollToSection('player'), 500);
    }
  };

  const cleanAudio = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/enhance", { method: "POST", body: formData });
      const data = await response.json();

      if (response.ok) {
        let finalUrl = data.cleanedUrl;
        if (typeof finalUrl === 'object') finalUrl = JSON.stringify(finalUrl);
        setResult(finalUrl);
      } else {
        setError(typeof data.error === 'object' ? JSON.stringify(data.error) : data.error || "Erreur inconnue");
      }
    } catch (err: any) {
      setError("Erreur : " + (err.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  // Fonction de scroll fluide
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#2D3748] font-sans overflow-x-hidden relative">
      
      {/* --- MODAL "BIENTÔT" (Fake Door) --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4">
           <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center relative transform transition-all scale-100">
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
                <Sparkles className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Accès Pro Limité</h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Nous déployons les comptes Pro progressivement. Laissez-nous peaufiner les derniers détails.
              </p>
              
              <button 
                onClick={() => setShowModal(false)}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
              >
                J'ai compris
              </button>
           </div>
        </div>
      )}

      {/* --- BACKGROUND --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-white to-transparent opacity-60 blur-3xl"></div>
        <div className="absolute top-32 left-[10%] text-indigo-200 animate-bounce duration-[3000ms]"><Mic className="w-12 h-12" /></div>
        <div className="absolute top-40 right-[15%] text-purple-200 animate-pulse duration-[4000ms]"><Radio className="w-10 h-10" /></div>
      </div>

      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-50 backdrop-blur-sm bg-white/70 border-b border-gray-200/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tight text-slate-800 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Music className="w-5 h-5 text-white" />
            </div>
            AudioFix
          </div>
          
          <div className="hidden md:flex items-center gap-8 font-medium text-gray-600 text-sm">
            <button onClick={() => scrollToSection('upload')} className="hover:text-indigo-600 transition-colors">Produit</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-indigo-600 transition-colors">Tarifs</button>
          </div>

          <div className="flex items-center gap-4">
             <button onClick={() => setShowModal(true)} className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors">Connexion</button>
             <button onClick={() => setShowModal(true)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 font-semibold text-sm hover:-translate-y-0.5">
                S'inscrire
             </button>
          </div>
        </div>
      </nav>

      {/* --- HERO --- */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-32 text-center">
        
        <div className="mb-6 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
            La meilleure façon de <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">nettoyer votre audio</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Une expérience de nettoyage audio entièrement automatisée par l'IA pour les créateurs, podcasteurs et entreprises.
          </p>
        </div>

        <div className="mb-16">
           <button 
             onClick={() => scrollToSection('upload')}
             className="px-8 py-3 bg-white border border-gray-200 text-slate-800 font-bold rounded-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
           >
             Commencer maintenant
           </button>
        </div>

        {/* --- UPLOAD CARD --- */}
        <div id="upload" className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-gray-100 p-3 md:p-4 max-w-3xl mx-auto relative transform transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(99,102,241,0.2)]">
            
            <div className="bg-[#FAFAFA] rounded-[2rem] p-8 md:p-12 border border-gray-100 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
                
                {/* ÉTAT 1 : UPLOAD */}
                {!file && !loading && !result && (
                    <div className="w-full animate-fade-in">
                        <label className="cursor-pointer flex flex-col items-center group">
                            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-gray-200/50 group-hover:scale-110 transition-transform duration-300 border border-gray-50">
                                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                    <Upload className="w-8 h-8" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Déposez votre audio ici</h3>
                            <p className="text-gray-400 mb-8">ou cliquez pour parcourir (MP3, WAV, M4A)</p>
                            <div className="inline-flex items-center px-8 py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-600 transition-all duration-300 hover:-translate-y-1">
                                Sélectionner un fichier
                            </div>
                            <input type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />
                        </label>
                    </div>
                )}

                {/* ÉTAT 2 : FICHIER SÉLECTIONNÉ */}
                {file && !loading && !result && (
                    <div className="w-full max-w-md animate-fade-in">
                        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 mb-8 flex items-center gap-4 transform hover:scale-[1.02] transition-transform">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 flex-shrink-0">
                                <Music className="w-6 h-6" />
                            </div>
                            <div className="text-left overflow-hidden">
                                <p className="font-bold text-slate-800 truncate">{file.name}</p>
                                <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        
                        <button 
                            onClick={cleanAudio}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <Wand2 className="w-5 h-5" />
                            Nettoyer avec l'IA
                        </button>
                        <button onClick={() => setFile(null)} className="mt-4 text-sm text-gray-400 hover:text-indigo-600 transition-colors">Annuler</button>
                    </div>
                )}

                {/* ÉTAT 3 : LOADING */}
                {loading && (
                    <div className="text-center animate-fade-in">
                        <div className="relative w-24 h-24 mx-auto mb-6">
                            <div className="absolute inset-0 border-[6px] border-gray-200 rounded-full"></div>
                            <div className="absolute inset-0 border-[6px] border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 animate-pulse">Nettoyage en cours...</h3>
                        <p className="text-gray-400 mt-2">L'IA analyse votre fichier</p>
                    </div>
                )}

                {/* ÉTAT 4 : RÉSULTAT */}
                {result && (
                    <div id="player" className="w-full max-w-md animate-fade-in">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-inner animate-bounce-slow">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h3 className="text-3xl font-bold text-slate-800 mb-6">Terminé !</h3>
                        
                        <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm mb-8">
                            <audio controls src={result} className="w-full h-12" />
                        </div>

                        <div className="flex gap-3">
                            <a href={result} download="clean.wav" className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg text-center flex items-center justify-center gap-2 hover:-translate-y-1">
                                <span className="text-lg">Télécharger</span>
                            </a>
                            <button onClick={() => {setFile(null); setResult(null)}} className="px-6 py-4 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                                Nouveau
                            </button>
                        </div>
                    </div>
                )}
                
                {error && (
                    <div className="absolute bottom-6 left-0 right-0 px-8 animate-fade-in">
                        <div className="p-4 bg-red-50 text-red-500 rounded-xl border border-red-100 text-sm font-medium">
                            {error}
                        </div>
                    </div>
                )}
            </div>
        </div>

        <div className="mt-12 text-center">
             <p className="text-2xl font-bold text-slate-800 mb-2">Avec nous, l'audio devient facile.</p>
             <p className="text-gray-400">Suppression du bruit sans effort pour les particuliers et les entreprises.</p>
        </div>

      </div>

      {/* --- FEATURES --- */}
      <div className="py-20 px-6 bg-white">
         <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
             <div onClick={() => scrollToSection('upload')} className="bg-[#F8FAFC] p-10 rounded-[2.5rem] relative overflow-hidden group hover:shadow-xl transition-all duration-500 cursor-pointer">
                 <div className="relative z-10">
                     <h3 className="text-2xl font-bold text-slate-800 mb-4">Connexion intelligente</h3>
                     <p className="text-gray-500 mb-8 max-w-xs">L'IA détecte automatiquement les fréquences parasites et les élimine.</p>
                     <div className="inline-flex items-center font-bold text-indigo-600 group-hover:translate-x-2 transition-transform">Voir les détails <ArrowRight className="w-4 h-4 ml-2"/></div>
                 </div>
                 <div className="absolute right-0 bottom-0 w-48 h-48 bg-gradient-to-tl from-indigo-100 to-transparent rounded-tl-[4rem] opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
             </div>

             <div onClick={() => scrollToSection('upload')} className="bg-[#F8FAFC] p-10 rounded-[2.5rem] relative overflow-hidden group hover:shadow-xl transition-all duration-500 cursor-pointer">
                 <div className="relative z-10">
                     <h3 className="text-2xl font-bold text-slate-800 mb-4">Traitement automatique</h3>
                     <p className="text-gray-500 mb-8 max-w-xs">Plus besoin d'ingénieur son. Uploadez, attendez 5 secondes, c'est prêt.</p>
                     <div className="inline-flex items-center font-bold text-purple-600 group-hover:translate-x-2 transition-transform">Commencer <ArrowRight className="w-4 h-4 ml-2"/></div>
                 </div>
                 <div className="absolute right-0 bottom-0 w-48 h-48 bg-gradient-to-tl from-purple-100 to-transparent rounded-tl-[4rem] opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
             </div>
         </div>
      </div>

      {/* --- PRICING --- */}
      <div id="pricing" className="py-24 px-6 text-center">
         <h2 className="text-4xl font-bold text-slate-800 mb-16">Tarification simple basée sur vos besoins</h2>
         
         <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 items-end">
             {/* FREE */}
             <div className="p-8 rounded-[2rem] bg-white border border-gray-100 text-left hover:shadow-lg transition-all duration-300">
                 <div className="text-lg font-bold text-gray-400 mb-2">Individuel</div>
                 <div className="text-4xl font-bold text-slate-800 mb-6">0€ <span className="text-sm font-normal text-gray-400">/mois</span></div>
                 <button onClick={() => scrollToSection('upload')} className="w-full py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:border-indigo-600 hover:text-indigo-600 transition-all">Commencer</button>
                 <ul className="mt-8 space-y-3 text-sm text-gray-500">
                     <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Gratuit pour toujours</li>
                     <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> 3 fichiers / jour</li>
                 </ul>
             </div>

             {/* PRO */}
             <div className="p-8 rounded-[2rem] bg-gradient-to-b from-indigo-600 to-purple-700 text-white text-left relative shadow-2xl shadow-indigo-500/30 transform scale-105 z-10 hover:-translate-y-2 transition-all duration-300">
                 <div className="absolute top-0 right-0 bg-white/20 px-3 py-1 rounded-bl-2xl rounded-tr-[2rem] text-xs font-bold uppercase">Populaire</div>
                 <div className="text-lg font-bold text-indigo-100 mb-2">Créateur Pro</div>
                 <div className="text-4xl font-bold text-white mb-6">12€ <span className="text-sm font-normal text-indigo-200">/mois</span></div>
                 <button onClick={() => setShowModal(true)} className="w-full py-3 rounded-xl bg-white text-indigo-600 font-bold hover:bg-indigo-50 transition-all shadow-lg">Choisir Pro</button>
                 <ul className="mt-8 space-y-3 text-sm text-indigo-100">
                     <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-white"/> Illimité</li>
                     <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-white"/> Qualité Studio (WAV)</li>
                     <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-white"/> Support prioritaire</li>
                 </ul>
             </div>

              {/* ENTERPRISE */}
              <div className="p-8 rounded-[2rem] bg-white border border-gray-100 text-left hover:shadow-lg transition-all duration-300">
                 <div className="text-lg font-bold text-gray-400 mb-2">Entreprise</div>
                 <div className="text-4xl font-bold text-slate-800 mb-6">Sur devis</div>
                 <button onClick={() => setShowModal(true)} className="w-full py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-all">Contacter</button>
                 <ul className="mt-8 space-y-3 text-sm text-gray-500">
                     <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-gray-400"/> API Access</li>
                     <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-gray-400"/> Gestion d'équipe</li>
                 </ul>
             </div>
         </div>
      </div>

      <footer className="py-12 text-center border-t border-gray-100 bg-white">
          <div className="flex items-center justify-center gap-2 font-bold text-xl tracking-tight text-slate-800 mb-4">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            AudioFix
          </div>
          <p className="text-gray-400 text-sm">Pourquoi payer un ingénieur son quand vous avez l'IA ?</p>
      </footer>

    </div>
  );
}