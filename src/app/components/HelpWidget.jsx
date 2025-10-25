"use client";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function HelpWidget() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const pathname = location?.pathname || (typeof window !== 'undefined' ? window.location.pathname : "/");

  const pageHelps = [
    {
      match: (p) => p === "/",
      title: "Aide - Accueil",
      items: [
        "Présentation de GameZone et fonctionnalités clés.",
        "Bouton Se connecter pour accéder à votre espace.",
        "Découvrez les sections: offres, horaires, localisation.",
      ],
    },
    {
      match: (p) => p.startsWith("/auth/login"),
      title: "Aide - Connexion",
      items: [
        "Entrez vos identifiants pour accéder à votre compte.",
        "Si vous n'avez pas de compte, utilisez S'inscrire.",
      ],
    },
    {
      match: (p) => p.startsWith("/auth/register"),
      title: "Aide - Inscription",
      items: [
        "Remplissez les informations requises pour créer un compte.",
        "Vous pourrez ensuite vous connecter et consulter vos données.",
      ],
    },
    {
      match: (p) => p.startsWith("/admin/invoice-scanner"),
      title: "Aide - Scanner de factures",
      items: [
        "Saisissez/collez le code de validation (16 caractères).",
        "Cliquez sur Scanner & Activer pour vérifier et activer la session.",
        "Le résultat indique le statut et les actions disponibles.",
      ],
    },
    {
      match: (p) => p.startsWith("/admin/dashboard"),
      title: "Aide - Tableau de bord",
      items: [
        "Cartes de statistiques: utilisateurs, événements, points.",
        "Top utilisateurs: classement avec points et niveaux.",
        "Événements récents: type, date, statut.",
        "Utilisez Actualiser pour recharger les données.",
      ],
    },
    {
      match: (p) => p.startsWith("/admin/players"),
      title: "Aide - Utilisateurs",
      items: [
        "Recherchez et filtrez les utilisateurs.",
        "Consultez points, niveau, statut, sanctions.",
        "Actions rapides: voir et modifier le statut.",
      ],
    },
    {
      match: (p) => p.startsWith("/admin/sessions"),
      title: "Aide - Sessions",
      items: [
        "Liste des sessions et de leurs statuts.",
        "Filtrez/rafraîchissez pour diagnostiquer en temps réel.",
      ],
    },
    {
      match: (p) => p.startsWith("/admin/shop"),
      title: "Aide - Boutique",
      items: [
        "Gérez les produits, prix et disponibilité.",
        "Assurez-vous que les prix/slug de paiement sont corrects.",
      ],
    },
    {
      match: (p) => p.startsWith("/admin/levels"),
      title: "Aide - Niveaux",
      items: [
        "Configurez les niveaux et seuils de points.",
        "Les changements impactent le classement et les récompenses.",
      ],
    },
    {
      match: (p) => p.startsWith("/admin/rewards"),
      title: "Aide - Récompenses",
      items: [
        "Gérez les récompenses et critères d'obtention.",
        "Vérifiez l'historique des récompenses réclamées.",
      ],
    },
    {
      match: (p) => p.startsWith("/admin/content"),
      title: "Aide - Contenu",
      items: [
        "Créez/éditez des actualités, événements, streams.",
        "Chaque item a un type, un statut et des métadonnées.",
      ],
    },
  ];

  const content = (() => {
    for (const h of pageHelps) if (h.match(pathname)) return h;
    return {
      title: "Aide",
      items: [
        "Ce bouton explique les éléments de la page et leur utilisation.",
        "Selon la page, vous verrez des conseils spécifiques.",
      ],
    };
  })();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        aria-label="Aide"
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          width: 48,
          height: 48,
          borderRadius: 9999,
          background: "#111827",
          color: "#fff",
          fontWeight: 800,
          fontSize: 20,
          boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
          zIndex: 10000,
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        !
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            style={{
              width: "100%",
              maxWidth: 560,
              background: "#ffffff",
              borderRadius: 12,
              padding: 20,
              maxHeight: "80vh",
              overflow: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>{content.title}</h2>
              <button
                aria-label="Fermer"
                onClick={() => setOpen(false)}
                style={{ background: "transparent", border: 0, fontSize: 20, cursor: "pointer" }}
              >
                ×
              </button>
            </div>
            <ul style={{ paddingLeft: 18, lineHeight: 1.6 }}>
              {content.items.map((it, idx) => (
                <li key={idx} style={{ marginBottom: 6 }}>{it}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
