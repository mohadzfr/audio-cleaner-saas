"use client";

import { useState, useEffect } from "react";
import { Upload, Wand2, CheckCircle2, AudioWaveform, Zap, Shield, X, Sparkles, ArrowRight } from "lucide-react";
import { motion, AnimatePresence, useScroll } from "framer-motion";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  // --- GESTION DU SCROLL ---
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 50);
    });
  }, [scrollY]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
      setResult(null);
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

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --- CONFIGURATION DYNAMIC ISLAND (RESPONSIVE FIX) ---
  const navVariants = {
    top: { 
      width: "100%", 
      maxWidth: "1280px",
      top: 0, 
      y: 0,
      borderRadius: 0, 
      padding: "1.2rem 1.5rem", // Padding standard
      backgroundColor: "rgba(255, 255, 255, 0)", 
      borderBottom: "1px solid rgba(0,0,0,0.05)"
    },
    scrolled: { 
      width: "92%", // FIX MOBILE : Prend 92% de l'écran au lieu d'une taille fixe
      maxWidth: "420px", // FIX PC : Ne dépasse pas 420px sur grand écran
      top: 15,
      y: 0,
      borderRadius: "100px", 
      padding: "0.75rem 1.25rem", // Padding un peu plus serré pour mobile
      backgroundColor: "rgba(255, 255, 255, 0.9)", 
      borderBottom: "1px solid rgba(0,0,0,0.1)",
      border: "1px solid rgba(0,0,0,0.1)",
      boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)"
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      
      {/* --- MODAL LIGHT --- */}
      <AnimatePresence>
      {showModal && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4"
        >
           <motion.div 
             initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
             className="bg-white border border-slate-200 p-8 rounded-3xl max-w-sm w-full text-center relative shadow-2xl"
           >
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 transition-colors"><X className="w-5 h-5" /></button>
              <h3 className="text-xl font-bold mb-2 text-slate-900 mt-4">Accès Pro Bientôt</h3>
              <p className="text-slate-500 mb-8 text-sm leading-relaxed">L'offre illimitée est en cours de finalisation.</p>
              <button onClick={() => setShowModal(false)} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all">Compris</button>
           </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* --- DYNAMIC ISLAND NAVBAR --- */}
      <motion.nav 
        initial="top"
        animate={isScrolled ? "scrolled" : "top"}
        variants={navVariants}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }}
        style={{ position: "fixed", left: "50%", x: "-50%", zIndex: 50 }}
        className="backdrop-blur-xl flex items-center justify-between overflow-hidden"
      >
          <div className="flex items-center gap-3 font-bold text-lg tracking-tight cursor-pointer shrink-0" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-violet-600 rounded-full flex items-center justify-center shadow-md shadow-blue-500/20">
              <AudioWaveform className="w-4 h-4 text-white" />
            </div>
            <motion.span animate={{ opacity: isScrolled ? 0 : 1, width: isScrolled ? 0 : "auto" }} className="whitespace-nowrap overflow-hidden text-slate-900">AudioFix</motion.span>
          </div>
          
          <motion.div animate={{ opacity: isScrolled ? 0 : 1, display: isScrolled ? "none" : "flex" }} className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <button onClick={() => scrollToSection('upload')} className="hover:text-slate-900 transition-colors">Produit</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-slate-900 transition-colors">Tarifs</button>
          </motion.div>

          <div className="flex items-center gap-3 shrink-0">
            <motion.button 
               animate={{ opacity: isScrolled ? 0 : 1, display: isScrolled ? "none" : "block" }}
               onClick={() => setShowModal(true)} 
               className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors hidden sm:block" // Caché sur très petits mobiles au scroll
            >
              Connexion
            </motion.button>
            <motion.button 
              onClick={() => setShowModal(true)}
              layout
              className="px-5 py-2 bg-slate-900 text-white rounded-full font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm"
            >
              {isScrolled ? "S'inscrire" : "Essayer Pro"}
            </motion.button>
          </div>
      </motion.nav>

      {/* --- HERO SECTION --- */}
      <div className="relative pt-40 pb-32 px-6">
        
        {/* --- FOND BLANC NET --- */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FAFAFA] to-[#FAFAFA] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold mb-8 uppercase tracking-wider">
               <Sparkles className="w-3 h-3" /> Version 2.0
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]"
          >
            Votre audio. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600">Parfaitement clair.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-xl text-slate-500 mb-16 max-w-2xl mx-auto leading-relaxed"
          >
            Supprimez le bruit de fond instantanément grâce à l'IA.<br/> Sans studio. Sans ingénieur.
          </motion.p>

          {/* --- UPLOAD CARD --- */}
          <motion.div 
            id="upload"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
            className="relative max-w-2xl mx-auto group"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-violet-100 rounded-[3rem] blur-3xl opacity-50 -z-10 group-hover:opacity-70 transition-opacity duration-500"></div>
            
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/50 p-2 relative">
              <div className="rounded-[1.5rem] bg-slate-50/50 border border-slate-100 p-8 md:p-12 min-h-[350px] flex flex-col items-center justify-center relative overflow-hidden transition-colors hover:border-blue-200/50">
                
                <AnimatePresence mode="wait">
                  {/* UPLOAD STATE */}
                  {!file && !loading && !result && (
                    <motion.label 
                      key="upload"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex flex-col items-center cursor-pointer group/label w-full z-10"
                    >
                      <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 group-hover/label:scale-110 group-hover/label:border-blue-300 group-hover/label:shadow-md transition-all duration-300">
                        <Upload className="w-8 h-8 text-slate-400 group-hover/label:text-blue-500" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Glissez votre fichier audio</h3>
                      <p className="text-slate-500 mb-8 text-sm">MP3, WAV, M4A (Max 50Mo)</p>
                      <div className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5">
                        Sélectionner un fichier
                      </div>
                      <input type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />
                    </motion.label>
                  )}

                  {/* FILE STATE */}
                  {file && !loading && !result && (
                    <motion.div 
                      key="file"
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                      className="w-full text-center z-10"
                    >
                      <div className="inline-flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-full mb-8 shadow-sm">
                         <AudioWaveform className="w-4 h-4 text-blue-500"/>
                         <span className="text-slate-700 font-medium">{file.name}</span>
                      </div>
                      
                      <button 
                        onClick={cleanAudio} 
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                      >
                        <Wand2 className="w-5 h-5" />
                        Nettoyer avec l'IA
                      </button>
                      <button onClick={() => setFile(null)} className="mt-6 text-sm text-slate-500 hover:text-slate-900 transition-colors underline-offset-4 hover:underline">Annuler</button>
                    </motion.div>
                  )}

                  {/* LOADING STATE */}
                  {loading && (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-center z-10"
                    >
                      <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                      <h3 className="text-lg font-bold text-slate-900">Traitement en cours...</h3>
                    </motion.div>
                  )}

                  {/* RESULT STATE */}
                  {result && (
                    <motion.div 
                      id="player"
                      key="result"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="w-full text-center z-10"
                    >
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 text-green-600 shadow-sm">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      
                      <div className="bg-white border border-slate-200 p-4 rounded-xl mb-8 shadow-sm">
                        <audio controls src={result} className="w-full h-10" />
                      </div>

                      <div className="flex gap-4">
                        <a href={result} download="clean.wav" className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all text-center shadow-lg hover:-translate-y-0.5">
                          Télécharger
                        </a>
                        <button onClick={() => {setFile(null); setResult(null)}} className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors">
                          Nouveau
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && (
                  <div className="absolute bottom-6 left-0 right-0 px-8">
                    <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">
                      {error}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- FEATURES (Light) --- */}
      <div className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: "Ultra Rapide", desc: "Avec un traitement en quelques secondes. Tout en améliorant la qualité sonore. ", color: "text-amber-500", bg: "bg-amber-50" },
            { icon: Wand2, title: "IA DeepFilter", desc: "Technologie de pointe, avec suppresion de bruit de fond et nuissance sonore.", color: "text-blue-500", bg: "bg-blue-50" },
            { icon: Shield, title: "100% Privé", desc: "Suppression automatique des fichiers. Aucun fichier n'est enregistré sur nos serveur.", color: "text-green-500", bg: "bg-green-50" }
          ].map((feature, i) => (
            <div key={i} className="bg-white border border-slate-100 p-8 rounded-[2rem] hover:shadow-xl hover:border-blue-100 transition-all duration-300 group hover:-translate-y-1">
              <div className={`w-12 h-12 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 ${feature.color} group-hover:scale-110 transition-transform shadow-sm`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* --- PRICING (Light) --- */}
      <div id="pricing" className="py-24 px-6 border-t border-slate-100 bg-slate-50/50">
         <div className="max-w-4xl mx-auto text-center">
             <h2 className="text-3xl font-bold text-slate-900 mb-16">Tarifs Simples</h2>
             
             <div className="grid md:grid-cols-2 gap-8 items-start">
                 {/* FREE */}
                 <div className="p-8 rounded-[2rem] bg-white border border-slate-200 text-left hover:shadow-lg transition-all">
                     <div className="text-slate-500 font-medium mb-2">Découverte</div>
                     <div className="text-4xl font-bold text-slate-900 mb-6">0€</div>
                     <ul className="space-y-4 mb-8 text-sm text-slate-500">
                         <li className="flex gap-3"><CheckCircle2 className="w-4 h-4 text-slate-900"/> 3 fichiers / jour</li>
                         <li className="flex gap-3"><CheckCircle2 className="w-4 h-4 text-slate-900"/> Qualité MP3</li>
                     </ul>
                     <button onClick={() => scrollToSection('upload')} className="w-full py-3 rounded-xl border-2 border-slate-200 font-bold text-slate-700 hover:border-slate-900 hover:text-slate-900 transition-all">Commencer</button>
                 </div>

                 {/* PRO (Dark Contrast Card) */}
                 <div className="p-8 rounded-[2rem] bg-[#0F172A] text-white text-left relative shadow-2xl shadow-blue-900/20 transform hover:scale-[1.02] transition-all">
                     <div className="absolute top-0 right-0 bg-blue-600 px-4 py-1 rounded-bl-2xl rounded-tr-[2rem] text-xs font-bold uppercase">Populaire</div>
                     <div className="text-blue-200 font-medium mb-2">Créateur Pro</div>
                     <div className="text-4xl font-bold text-white mb-6">9€ <span className="text-lg text-slate-400 font-normal">/mois</span></div>
                     <ul className="space-y-4 mb-8 text-sm text-slate-300">
                         <li className="flex gap-3"><CheckCircle2 className="w-4 h-4 text-blue-400"/> Illimité</li>
                         <li className="flex gap-3"><CheckCircle2 className="w-4 h-4 text-blue-400"/> Qualité Studio (WAV)</li>
                         <li className="flex gap-3"><CheckCircle2 className="w-4 h-4 text-blue-400"/> Support prioritaire</li>
                     </ul>
                     <button onClick={() => setShowModal(true)} className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all shadow-lg">Passer Pro</button>
                 </div>
             </div>
         </div>
      </div>

      <footer className="py-12 text-center border-t border-slate-200 bg-white text-slate-500 text-sm">
        <p>&copy; 2025 AudioFix AI. Fait avec soin.</p>
      </footer>
    </div>
  );
}