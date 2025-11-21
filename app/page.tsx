"use client";

import { useState } from "react";

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
        // Si c'est un objet, on le stringify, sinon on prend tel quel
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

  // Fonction pour vérifier si c'est un format qu'on peut jouer
  const isPlayable = result && (result.startsWith("http") || result.startsWith("data:audio"));

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Audio Cleaner AI
          </h1>
          <p className="mt-2 text-gray-400">Nettoyeur de voix professionnel</p>
        </div>

        {/* Zone Upload */}
        <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 text-center shadow-2xl">
          <div className="mb-6">
            <label className={`cursor-pointer block w-full p-10 border-2 border-dashed rounded-lg transition-all ${file ? 'border-green-500 bg-green-900/10' : 'border-gray-700 hover:border-blue-500 hover:bg-gray-800'}`}>
              <div className="text-4xl mb-2">{file ? "✅" : "🎤"}</div>
              <span className="text-gray-300 font-medium">
                {file ? file.name : "Cliquez pour uploader un audio"}
              </span>
              <input type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
          
          <button
            onClick={cleanAudio}
            disabled={loading || !file}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-[1.02] ${
              loading || !file 
                ? "bg-gray-700 cursor-not-allowed text-gray-500" 
                : "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-900/50"
            }`}
          >
            {loading ? "Nettoyage IA en cours..." : "Nettoyer l'audio 🚀"}
          </button>
        </div>

        {/* Erreur */}
        {error && (
          <div className="p-4 bg-red-900/50 border border-red-500 rounded text-red-200 text-center">
            🚨 {error}
          </div>
        )}

        {/* Résultat Final */}
        {result && (
          <div className="p-8 bg-gray-900 border border-green-500/50 rounded-xl mt-8 animate-fade-in shadow-2xl shadow-green-900/20">
            <h3 className="text-green-400 font-bold mb-6 text-center text-xl">✨ Audio Nettoyé avec Succès !</h3>
            
            {isPlayable ? (
                <div className="space-y-6">
                    {/* Le Lecteur Audio */}
                    <audio controls src={result} className="w-full h-12 rounded-lg" />
                    
                    {/* Bouton Télécharger */}
                    <div className="text-center">
                        <a 
                            href={result} 
                            download="mon-audio-propre.wav"
                            className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg text-white font-bold transition-colors shadow-lg"
                        >
                            📥 Télécharger le fichier
                        </a>
                    </div>
                </div>
            ) : (
                <div className="text-yellow-500 text-center break-words text-xs">
                    Format reçu non reconnu : {result.substring(0, 50)}...
                </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}