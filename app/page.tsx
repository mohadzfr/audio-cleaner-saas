"use client";

import { useState, useEffect } from "react";
import { Upload, Wand2, CheckCircle2, AudioWaveform, Zap, Shield, X, Sparkles, ArrowRight, Bot, Video, FileAudio } from "lucide-react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { upload } from '@vercel/blob/client';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  
  // Gestion de la progression
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  // --- GESTION DU SCROLL ---
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const shouldBeScrolled = latest > 20;
    if (shouldBeScrolled !== isScrolled) setIsScrolled(shouldBeScrolled);
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Limite théorique Blob (on met 300Mo pour être large)
      if (selectedFile.size > 300 * 1024 * 1024) {
        alert("Fichier trop lourd (>300Mo).");
        return;
      }
      setFile(selectedFile);
      setError("");
      setResult(null);
      setUploadProgress(0);
      setStatusMessage("");
      setTimeout(() => scrollToSection('player'), 500);
    }
  };

  // --- LOGIQUE DE TRAITEMENT ASYNCHRONE (POLLING) ---
  const cleanAudio = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    setUploadProgress(0);
    setStatusMessage("Préparation de l'envoi sécurisé...");

    try {
      // 1. Upload vers le Cloud (Vercel Blob)
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        onUploadProgress: (progressEvent) => {
           setUploadProgress(progressEvent.percentage);
           setStatusMessage(`Envoi du fichier : ${progressEvent.percentage}%`);
        }
      });

      // 2. Lancement de l'IA
      setStatusMessage("Démarrage du moteur IA Haute Qualité...");
      const startResponse = await fetch("/api/enhance", { 
        method: "POST", 
        body: JSON.stringify({ fileUrl: newBlob.url }) 
      });
      
      if (!startResponse.ok) throw new Error("Impossible de contacter l'IA.");
      
      const startData = await startResponse.json();
      const predictionId = startData.id; // On récupère le ticket

      // 3. Boucle d'attente (Le Polling)
      setStatusMessage("Traitement audio en cours (Qualité Studio)...");
      
      let finalOutput = null;
      let attempts = 0;

      // On vérifie toutes les 2 secondes tant que ce n'est pas fini
      while (!finalOutput) {
        // Pause de 2 secondes
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;

        // Petit message pour faire patienter si c'est long
        if (attempts > 10) setStatusMessage("L'IA peaufine les détails...");
        if (attempts > 30) setStatusMessage("Fichier complexe, encore un instant...");

        // Vérification du statut
        const checkResponse = await fetch(`/api/enhance?id=${predictionId}`);
        const checkData = await checkResponse.json();

        if (checkData.status === "succeeded") {
          finalOutput = checkData.output;
        } else if (checkData.status === "failed" || checkData.status === "canceled") {
          throw new Error("L'IA n'a pas réussi à traiter ce fichier.");
        }
        // Si status === "starting" ou "processing", la boucle continue
      }

      // 4. Affichage du résultat
      if (finalOutput) {
        let finalUrl = finalOutput;
        if (typeof finalOutput === 'object') {
            // Parfois l'IA renvoie un objet ou une liste, on prend le bon lien
            finalUrl = Array.isArray(finalOutput) ? finalOutput[0] : (finalOutput.audio || finalOutput.file || finalOutput);
        }
        setResult(finalUrl);
      }

    } catch (err: any) {
      console.error(err);
      setError("Erreur : " + (err.message || String(err)));
    } finally {
      setLoading(false);
      setStatusMessage("");
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isVideo = file?.type.startsWith('video');

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden w-full">
      
      {/* --- MODAL (SANS ÉTOILE) --- */}
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
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-blue-600 transition-colors"><X className="w-5 h-5" /></button>
              
              <h3 className="text-xl font-bold mb-2 text-slate-900 mt-6">Accès Pro Bientôt</h3>
              <p className="text-slate-500 mb-8 text-sm leading-relaxed">L'offre illimitée est en cours de finalisation. Revenez très vite.</p>
              <button onClick={() => setShowModal(false)} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all">Compris</button>
           </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* --- DYNAMIC ISLAND NAVBAR (FLUIDE) --- */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center items-start pt-0 pointer-events-none">
        <motion.nav 
          layout
          initial={false}
          animate={isScrolled ? "scrolled" : "top"}
          variants={{
            top: { 
              width: "100%", 
              maxWidth: "100%",
              marginTop: 0,
              borderRadius: 0,
              padding: "1rem 1.5rem",
              backgroundColor: "rgba(255, 255, 255, 0)",
              borderBottom: "1px solid rgba(0,0,0,0.0)",
              boxShadow: "none"
            },
            scrolled: { 
              width: "calc(100% - 2rem)", 
              maxWidth: "500px",
              marginTop: 16,
              borderRadius: 100,
              padding: "0.75rem 1.25rem",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(12px)",
              borderBottom: "1px solid rgba(0,0,0,0.1)",
              border: "1px solid rgba(0,0,0,0.1)",
              boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)"
            }
          }}
          transition={{ type: "spring", stiffness: 200, damping: 30, mass: 0.8 }}
          className="flex items-center justify-between pointer-events-auto overflow-hidden"
        >
            <div className="flex items-center gap-3 font-bold text-lg tracking-tight cursor-pointer shrink-0" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-violet-600 rounded-full flex items-center justify-center shadow-md shadow-blue-500/20">
                <AudioWaveform className="w-5 h-5 text-white" />
              </div>
              <motion.span 
                layout
                className={`whitespace-nowrap overflow-hidden text-slate-900 ${isScrolled ? 'hidden sm:block' : 'block'}`}
              >
                AudioFix
              </motion.span>
            </div>
            
            <motion.div 
              layout
              animate={{ opacity: isScrolled ? 0 : 1, display: isScrolled ? "none" : "flex" }} 
              className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500 overflow-hidden"
            >
              <button onClick={() => scrollToSection('upload')} className="hover:text-blue-600 transition-colors whitespace-nowrap">Produit</button>
              <button onClick={() => scrollToSection('pricing')} className="hover:text-blue-600 transition-colors whitespace-nowrap">Tarifs</button>
            </motion.div>

            <div className="flex items-center gap-2 shrink-0">
              <button 
                 onClick={() => setShowModal(true)} 
                 className="text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors hidden sm:block px-3"
              >
                Connexion
              </button>
              <motion.button 
                layout
                onClick={() => setShowModal(true)}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-full font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20 whitespace-nowrap"
              >
                S'inscrire
              </motion.button>
            </div>
        </motion.nav>
      </div>

      {/* --- HERO SECTION --- */}
      <div className="relative pt-40 pb-32 px-6">
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
            Supprimez le bruit de fond instantanément grâce à l'IA.<br/> Compatible Audio & Vidéo.
          </motion.p>

          {/* --- UPLOAD CARD --- */}
          <motion.div 
            id="upload"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
            className="relative max-w-2xl mx-auto group"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-violet-100 rounded-[3rem] blur-3xl opacity-50 -z-10 group-hover:opacity-70 transition-opacity duration-500"></div>
            
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl shadow-blue-200/20 p-2 relative">
              <div className="rounded-[1.5rem] bg-slate-50/50 border border-slate-100 p-8 md:p-12 min-h-[350px] flex flex-col items-center justify-center relative overflow-hidden transition-colors hover:border-blue-300">
                
                <AnimatePresence mode="wait">
                  {/* ÉTAT 1 : UPLOAD */}
                  {!file && !loading && !result && (
                    <motion.label 
                      key="upload"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex flex-col items-center cursor-pointer group/label w-full z-10"
                    >
                      <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 group-hover/label:scale-110 group-hover/label:border-blue-300 group-hover/label:shadow-md transition-all duration-300">
                        <Upload className="w-8 h-8 text-slate-400 group-hover/label:text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Glissez votre fichier</h3>
                      <p className="text-slate-500 mb-8 text-sm font-medium">
                        <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md mr-2">Audio</span>
                        <span className="bg-purple-50 text-purple-600 px-2 py-1 rounded-md">Vidéo</span>
                      </p>
                      <div className="px-8 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5">
                        Sélectionner
                      </div>
                      <input type="file" accept="audio/*,video/*" onChange={handleFileChange} className="hidden" />
                    </motion.label>
                  )}

                  {/* ÉTAT 2 : FICHIER SÉLECTIONNÉ */}
                  {file && !loading && !result && (
                    <motion.div 
                      key="file"
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                      className="w-full text-center z-10"
                    >
                      <div className="inline-flex items-center gap-3 px-4 py-2 bg-white border border-blue-100 rounded-full mb-8 shadow-sm">
                         {isVideo ? <Video className="w-4 h-4 text-purple-600"/> : <FileAudio className="w-4 h-4 text-blue-600"/>}
                         <span className="text-slate-700 font-medium">{file.name}</span>
                      </div>
                      
                      <button 
                        onClick={cleanAudio} 
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                      >
                        <Bot className="w-5 h-5" />
                        Nettoyer {isVideo ? 'la vidéo' : 'l\'audio'}
                      </button>
                      <button onClick={() => setFile(null)} className="mt-6 text-sm text-slate-500 hover:text-blue-600 transition-colors underline-offset-4 hover:underline">Annuler</button>
                    </motion.div>
                  )}

                  {/* ÉTAT 3 : LOADING (BARRE DE PROGRESSION) */}
                  {loading && (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-center z-10"
                    >
                      <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                      
                      {/* Status Dynamique */}
                      <h3 className="text-lg font-bold text-slate-900 animate-pulse">
                        {statusMessage || "Traitement en cours..."}
                      </h3>
                      
                      {/* Barre de progression visuelle (Fake ou Réelle) */}
                      <div className="mt-6 w-64 h-2 bg-slate-100 rounded-full mx-auto overflow-hidden">
                         <motion.div 
                           className="h-full bg-blue-600"
                           initial={{ width: "0%" }}
                           animate={{ width: uploadProgress < 100 ? `${uploadProgress}%` : "100%" }}
                           transition={{ duration: 0.5 }}
                         />
                         {/* Barre infinie si l'IA traite */}
                         {uploadProgress === 100 && (
                            <motion.div 
                              className="h-full bg-blue-400 w-full absolute top-0 left-0"
                              initial={{ x: "-100%" }}
                              animate={{ x: "100%" }}
                              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            />
                         )}
                      </div>
                    </motion.div>
                  )}

                  {/* ÉTAT 4 : RÉSULTAT */}
                  {result && (
                    <motion.div 
                      id="player"
                      key="result"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="w-full text-center z-10"
                    >
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 text-green-600 shadow-sm border border-green-200">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      
                      <div className="bg-white border border-slate-200 p-4 rounded-xl mb-8 shadow-sm">
                        <audio controls src={result} className="w-full h-10" />
                      </div>

                      <div className="flex gap-4">
                        <a href={result} download={`clean-${file?.name.split('.')[0]}.wav`} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all text-center shadow-lg hover:-translate-y-0.5">
                          Télécharger (WAV)
                        </a>
                        <button onClick={() => {setFile(null); setResult(null)}} className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600 transition-colors">
                          Nouveau
                        </button>
                      </div>
                      {isVideo && <p className="text-xs text-slate-400 mt-4">Audio extrait et nettoyé.</p>}
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

      {/* --- FEATURES --- */}
      <div className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: "Qualité Studio", desc: "Le moteur MP-SENet préserve la voix naturelle.", color: "text-amber-500", bg: "bg-amber-50" },
            { icon: Bot, title: "Audio & Vidéo", desc: "Compatible MP3, WAV, MP4, MOV jusqu'à 500Mo.", color: "text-blue-500", bg: "bg-blue-50" },
            { icon: Shield, title: "100% Privé", desc: "Suppression automatique des fichiers.", color: "text-green-500", bg: "bg-green-50" }
          ].map((feature, i) => (
            <div key={i} className="bg-white border border-slate-100 p-8 rounded-[2rem] hover:shadow-xl hover:border-blue-200 transition-all duration-300 group hover:-translate-y-1">
              <div className={`w-12 h-12 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 ${feature.color} group-hover:scale-110 transition-transform shadow-sm`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* --- PRICING --- */}
      <div id="pricing" className="py-24 px-6 border-t border-slate-100 bg-slate-50/50">
         <div className="max-w-4xl mx-auto text-center">
             <h2 className="text-3xl font-bold text-slate-900 mb-16">Tarifs Simples</h2>
             
             <div className="grid md:grid-cols-2 gap-8 items-start">
                 <div className="p-8 rounded-[2rem] bg-white border border-slate-200 text-left hover:shadow-lg transition-all hover:border-blue-200">
                     <div className="text-slate-500 font-medium mb-2">Découverte</div>
                     <div className="text-4xl font-bold text-slate-900 mb-6">0€</div>
                     <ul className="space-y-4 mb-8 text-sm text-slate-500">
                         <li className="flex gap-3"><CheckCircle2 className="w-4 h-4 text-green-500"/> 3 fichiers / jour</li>
                         <li className="flex gap-3"><CheckCircle2 className="w-4 h-4 text-green-500"/> Qualité MP3</li>
                     </ul>
                     <button onClick={() => scrollToSection('upload')} className="w-full py-3 rounded-xl border-2 border-slate-200 font-bold text-slate-700 hover:border-blue-600 hover:text-blue-600 transition-all">Commencer</button>
                 </div>

                 <div className="p-8 rounded-[2rem] bg-gradient-to-b from-blue-600 to-violet-900 text-white text-left relative shadow-2xl shadow-blue-900/30 transform hover:scale-[1.02] transition-all">
                     <div className="absolute top-0 right-0 bg-white/20 px-4 py-1 rounded-bl-2xl rounded-tr-[2rem] text-xs font-bold uppercase">Populaire</div>
                     <div className="text-blue-200 font-medium mb-2">Créateur Pro</div>
                     <div className="text-4xl font-bold text-white mb-6">9€ <span className="text-lg text-blue-200 font-normal">/mois</span></div>
                     <ul className="space-y-4 mb-8 text-sm text-blue-100">
                         <li className="flex gap-3"><CheckCircle2 className="w-4 h-4 text-white"/> Illimité</li>
                         <li className="flex gap-3"><CheckCircle2 className="w-4 h-4 text-white"/> Qualité Studio (WAV)</li>
                         <li className="flex gap-3"><CheckCircle2 className="w-4 h-4 text-white"/> Vidéos longues</li>
                     </ul>
                     <button onClick={() => setShowModal(true)} className="w-full py-3 rounded-xl bg-white text-blue-900 font-bold hover:bg-blue-50 transition-all shadow-lg">Passer Pro</button>
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