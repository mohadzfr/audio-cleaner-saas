"use client";

import { useState } from "react";
import { Upload, Wand2, Play, Download, CheckCircle2, Music, Lock } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
      setResult(null);
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

      const response = await fetch("/api/enhance", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        let finalUrl = data.cleanedUrl;
        if (typeof finalUrl === 'object') {
            finalUrl = JSON.stringify(finalUrl);
        }
        setResult(finalUrl);
      } else {
        setError(typeof data.error === 'object' ? JSON.stringify(data.error) : data.error || "Erreur inconnue");
      }
    } catch (err: any) {
      setError("Erreur de connexion : " + (err.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500 selection:text-white">
      
      {/* --- NAVBAR --- */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            AudioFix<span className="text-indigo-500">.ai</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <span className="hover:text-white cursor-pointer transition-colors">Tarifs</span>
            <span className="hover:text-white cursor-pointer transition-colors">Blog</span>
            <button className="px-4 py-2 bg-white text-slate-950 rounded-full hover:bg-slate-200 transition-colors font-semibold">
              Connexion
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-32 text-center">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-8">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          Nouvelle IA v2.0 Disponible
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Supprimez le bruit.<br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Gardez la voix.
          </span>
        </h1>
        
        <p className="text-slate-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
          Transformez vos mémos vocaux et podcasts amateurs en qualité studio grâce à l'intelligence artificielle.
        </p>

        {/* --- UPLOAD CARD --- */}
        <div className="bg-slate-900/50 border border-slate-800 p-2 rounded-2xl shadow-2xl shadow-indigo-500/10 backdrop-blur-sm max-w-xl mx-auto relative group">
          
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          
          <div className="relative bg-slate-950 rounded-xl p-8 border border-slate-800">
            
            {!file && !loading && !result && (
              <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-slate-900/50 transition-all group">
                <div className="p-4 bg-slate-900 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-indigo-400" />
                </div>
                <p className="text-lg font-medium text-slate-300">Cliquez pour uploader un audio</p>
                <p className="text-sm text-slate-500 mt-2">MP3, WAV, M4A (Max 10Mo)</p>
                <input type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />
              </label>
            )}

            {file && !loading && !result && (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Music className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1 truncate px-4">{file.name}</h3>
                <p className="text-slate-500 text-sm mb-8">Prêt à être nettoyé</p>
                
                <button
                  onClick={cleanAudio}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2"
                >
                  <Wand2 className="w-5 h-5" />
                  Nettoyer l'audio maintenant
                </button>
                
                <button 
                  onClick={() => setFile(null)}
                  className="mt-4 text-sm text-slate-500 hover:text-white underline"
                >
                  Changer de fichier
                </button>
              </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">L'IA travaille...</h3>
                <p className="text-slate-400">Suppression du souffle et du bruit de fond</p>
              </div>
            )}

            {result && (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20 animate-bounce-slow">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">C'est prêt !</h3>
                <p className="text-slate-400 mb-8">Votre audio est propre comme un sou neuf.</p>
                
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 mb-6">
                  <audio controls src={result} className="w-full h-10" />
                </div>

                <div className="flex gap-3">
                  <a 
                    href={result} 
                    download="audio-clean.wav"
                    className="flex-1 py-3 bg-white text-slate-950 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger
                  </a>
                  <button 
                    onClick={() => { setFile(null); setResult(null); }}
                    className="px-4 py-3 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors text-slate-300"
                  >
                    Nouveau
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                {error}
              </div>
            )}
          </div>
        </div>

        {/* --- FEATURES --- */}
        <div className="grid md:grid-cols-3 gap-8 mt-32 text-left">
          <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800 hover:border-indigo-500/30 transition-colors">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4">
              <Wand2 className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="font-bold text-white mb-2">IA de pointe</h3>
            <p className="text-slate-400 text-sm">Nous utilisons les derniers modèles DeepFilterNet pour une suppression de bruit chirurgicale.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800 hover:border-purple-500/30 transition-colors">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
              <Play className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="font-bold text-white mb-2">Rapide comme l'éclair</h3>
            <p className="text-slate-400 text-sm">Plus besoin d'attendre. Vos fichiers sont traités en quelques secondes sur nos serveurs GPU.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800 hover:border-pink-500/30 transition-colors">
            <div className="w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center mb-4">
              <Lock className="w-5 h-5 text-pink-400" />
            </div>
            <h3 className="font-bold text-white mb-2">100% Privé</h3>
            <p className="text-slate-400 text-sm">Vos fichiers ne sont pas conservés. Ils sont traités et supprimés automatiquement.</p>
          </div>
        </div>

        {/* --- PRICING SECTION --- */}
        <div id="pricing" className="py-32 text-center">
          <h2 className="text-4xl font-bold mb-4">Des tarifs simples.</h2>
          <p className="text-slate-400 mb-16">Commencez gratuitement, passez pro pour la vitesse.</p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            
            {/* Plan Gratuit */}
            <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/20 hover:border-slate-700 transition-colors">
              <h3 className="text-xl font-bold text-white mb-2">Découverte</h3>
              <div className="text-3xl font-bold text-white mb-6">0€ <span className="text-sm text-slate-500 font-normal">/mois</span></div>
              <ul className="space-y-4 mb-8 text-slate-400 text-sm">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> 3 fichiers par jour</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Qualité Standard (MP3)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Fichiers &lt; 5Mo</li>
              </ul>
              <button className="w-full py-3 border border-slate-700 rounded-xl text-white hover:bg-slate-800 transition-colors font-semibold">
                Utiliser Gratuitement
              </button>
            </div>

            {/* Plan PRO */}
            <div className="relative p-8 rounded-2xl border border-indigo-500 bg-slate-900/50 shadow-2xl shadow-indigo-500/10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full text-xs font-bold text-white uppercase tracking-wide">
                Le plus populaire
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Créateur Pro</h3>
              <div className="text-3xl font-bold text-white mb-6">9€ <span className="text-sm text-slate-500 font-normal">/mois</span></div>
              <ul className="space-y-4 mb-8 text-slate-300 text-sm">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> <strong>Illimité</strong></li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Qualité Studio (WAV)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Fichiers jusqu'à 500Mo</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Support Prioritaire</li>
              </ul>
              <button 
                onClick={() => alert("Wow ! Vous voulez payer ? 🤑\n\nC'est ici qu'on branchera Stripe plus tard.\nPour l'instant, c'est gratuit pour toi chef.")}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white hover:opacity-90 transition-opacity font-bold"
              >
                Passer Pro
              </button>
            </div>

          </div>
        </div>

      </div>
      
      {/* Footer simple */}
      <div className="border-t border-slate-900 py-8 text-center text-slate-600 text-sm">
        &copy; 2025 AudioFix AI. Tous droits réservés.
      </div>

    </main>
  );
}