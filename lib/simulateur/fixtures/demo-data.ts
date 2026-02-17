import type {
  SimActivite,
  SimHebergement,
  SimEspace,
  SimService,
  SimSejourTemplate,
  SimulateurSettings,
  SimulateurData,
} from "../types"

// ─── Activités ───────────────────────────────────────────────

export const demoActivites: SimActivite[] = [
  {
    slug: "course-orientation",
    title: "Course d'orientation",
    acf: {
      nom: "Course d'orientation",
      descriptif: "Parcourez le domaine en équipe et relevez les défis disséminés dans la nature.",
      duree_minutes: 120,
      capacite_min: 10,
      capacite_max: 60,
      prix_par_personne: 25,
      mode_tarification: "par_personne",
      creneau_suggere: "matin",
      description_immersive:
        "Dès le signal de départ, les équipes s'élancent à travers les sentiers boisés du domaine. Carte en main, boussole au poing, chaque groupe doit trouver les balises cachées entre les chênes centenaires.",
      niveau_physique: "modere",
      interieur_exterieur: "exterieur",
    },
    types: [{ slug: "sport-aventure", name: "Sport & Aventure" }],
  },
  {
    slug: "atelier-cuisine",
    title: "Atelier cuisine",
    acf: {
      nom: "Atelier cuisine",
      descriptif:
        "Préparez un repas gastronomique avec un chef local à partir de produits du terroir.",
      duree_minutes: 180,
      capacite_min: 8,
      capacite_max: 30,
      prix_par_personne: 55,
      mode_tarification: "par_personne",
      creneau_suggere: "matin",
      description_immersive:
        "Sous la houlette du Chef, vous apprendrez à sublimer les produits du terroir picard. Chaque équipe prépare une partie du menu, avant de partager ensemble le fruit de votre travail.",
      niveau_physique: "faible",
      interieur_exterieur: "interieur",
    },
    types: [{ slug: "gastronomie-oenologie", name: "Gastronomie & Œnologie" }],
  },
  {
    slug: "yoga-plein-air",
    title: "Yoga en plein air",
    acf: {
      nom: "Yoga en plein air",
      descriptif: "Séance de yoga guidée dans le parc du domaine pour recharger les batteries.",
      duree_minutes: 60,
      capacite_min: 5,
      capacite_max: 40,
      prix_par_personne: 18,
      mode_tarification: "par_personne",
      creneau_suggere: "matin",
      description_immersive:
        "Le soleil matinal filtre à travers les feuillages tandis que vous déroulez votre tapis sur l'herbe fraîche. Guidés par une voix apaisante, vous enchaînez les postures au rythme du chant des oiseaux.",
      niveau_physique: "faible",
      interieur_exterieur: "exterieur",
    },
    types: [{ slug: "bien-etre-relaxation", name: "Bien-être & Relaxation" }],
  },
  {
    slug: "escape-game",
    title: "Escape Game grandeur nature",
    acf: {
      nom: "Escape Game grandeur nature",
      descriptif: "Résolvez les énigmes disséminées dans le domaine en équipe.",
      duree_minutes: 90,
      capacite_min: 10,
      capacite_max: 50,
      prix_forfaitaire: 800,
      mode_tarification: "forfaitaire",
      creneau_suggere: "apres_midi",
      description_immersive:
        "Les portes se referment. Votre équipe dispose de 90 minutes pour percer les mystères de L'Hermitage. Chaque pièce du domaine recèle un indice, chaque recoin une surprise.",
      niveau_physique: "faible",
      interieur_exterieur: "les_deux",
    },
    types: [{ slug: "jeux-challenges", name: "Jeux & Challenges" }],
  },
  {
    slug: "olympiades",
    title: "Olympiades d'équipe",
    acf: {
      nom: "Olympiades d'équipe",
      descriptif: "Tournoi multi-épreuves sportives et ludiques par équipes.",
      duree_minutes: 180,
      capacite_min: 15,
      capacite_max: 100,
      prix_par_personne: 30,
      mode_tarification: "par_personne",
      creneau_suggere: "apres_midi",
      description_immersive:
        "Tir à l'arc, relais en sac, quiz culture générale, construction de radeau... Les épreuves s'enchaînent dans une ambiance de franche camaraderie. La compétition est là, mais c'est l'esprit d'équipe qui l'emporte.",
      niveau_physique: "modere",
      interieur_exterieur: "exterieur",
    },
    types: [{ slug: "sport-aventure", name: "Sport & Aventure" }],
  },
  {
    slug: "atelier-fresque-climat",
    title: "Fresque du climat",
    acf: {
      nom: "Fresque du climat",
      descriptif: "Atelier collaboratif de sensibilisation aux enjeux climatiques.",
      duree_minutes: 180,
      capacite_min: 8,
      capacite_max: 40,
      prix_forfaitaire: 600,
      mode_tarification: "forfaitaire",
      creneau_suggere: "apres_midi",
      description_immersive:
        "Autour des tables, les cartes s'assemblent progressivement pour révéler les liens de cause à effet du changement climatique. Un moment de prise de conscience collective, suivi d'un brainstorm sur les actions concrètes.",
      niveau_physique: "faible",
      interieur_exterieur: "interieur",
    },
    types: [{ slug: "creatif-culture", name: "Créatif & Culture" }],
  },
  {
    slug: "degustation-oenologique",
    title: "Dégustation œnologique",
    acf: {
      nom: "Dégustation œnologique",
      descriptif: "Découverte des vins de la région guidée par un sommelier.",
      duree_minutes: 90,
      capacite_min: 8,
      capacite_max: 25,
      prix_par_personne: 35,
      mode_tarification: "par_personne",
      creneau_suggere: "soiree",
      description_immersive:
        "Dans la cave voûtée aux pierres centenaires, le sommelier débouche les premières bouteilles. Les arômes se libèrent tandis qu'il vous guide à travers les terroirs picards et leurs secrets.",
      niveau_physique: "faible",
      interieur_exterieur: "interieur",
    },
    types: [{ slug: "gastronomie-oenologie", name: "Gastronomie & Œnologie" }],
  },
  {
    slug: "atelier-creatif",
    title: "Atelier créatif collectif",
    acf: {
      nom: "Atelier créatif collectif",
      descriptif: "Création d'une œuvre collective (fresque murale, sculpture, land art).",
      duree_minutes: 120,
      capacite_min: 10,
      capacite_max: 50,
      prix_par_personne: 28,
      mode_tarification: "par_personne",
      creneau_suggere: "apres_midi",
      description_immersive:
        "Pinceaux, argile, éléments naturels... Chaque participant apporte sa touche à l'œuvre collective. Pas besoin d'être artiste : l'important, c'est de créer ensemble.",
      niveau_physique: "faible",
      interieur_exterieur: "les_deux",
    },
    types: [{ slug: "creatif-culture", name: "Créatif & Culture" }],
  },
]

// ─── Hébergements ────────────────────────────────────────────

export const demoHebergements: SimHebergement[] = [
  {
    slug: "chambre-standard",
    title: "Chambre standard",
    acf: {
      nom: "Chambre standard",
      descriptif: "Chambre confortable avec vue sur le parc.",
      capacite_personnes: 2,
      nombre_unites: 15,
      prix_nuit_unite: 85,
      niveau_confort: "standard",
      equipements_chambre: ["wifi", "sdb_privative"],
      description_immersive:
        "Une chambre simple et chaleureuse, parfaite pour se reposer après une journée d'activités. La fenêtre donne sur le parc arboré.",
    },
  },
  {
    slug: "chambre-confort",
    title: "Chambre confort",
    acf: {
      nom: "Chambre confort",
      descriptif: "Chambre spacieuse avec literie premium et vue dégagée.",
      capacite_personnes: 2,
      nombre_unites: 10,
      prix_nuit_unite: 130,
      niveau_confort: "confort",
      equipements_chambre: ["wifi", "sdb_privative", "climatisation", "tv"],
      description_immersive:
        "Literie king-size, salle de bain privative avec douche à l'italienne. Le confort d'un hôtel dans l'écrin de verdure du domaine.",
    },
  },
  {
    slug: "suite-premium",
    title: "Suite premium",
    acf: {
      nom: "Suite premium",
      descriptif: "Suite de caractère avec salon privatif et terrasse.",
      capacite_personnes: 2,
      nombre_unites: 4,
      prix_nuit_unite: 220,
      niveau_confort: "premium",
      equipements_chambre: [
        "wifi",
        "sdb_privative",
        "climatisation",
        "tv",
        "minibar",
        "terrasse",
        "vue_parc",
      ],
      description_immersive:
        "Un véritable cocon avec son salon privé, sa terrasse donnant sur le parc et ses finitions haut de gamme. L'endroit idéal pour vos VIP.",
    },
  },
  {
    slug: "chalet-groupe",
    title: "Chalet / Gîte",
    acf: {
      nom: "Chalet / Gîte",
      descriptif: "Gîte indépendant pouvant accueillir un petit groupe.",
      capacite_personnes: 6,
      nombre_unites: 3,
      prix_nuit_unite: 350,
      niveau_confort: "confort",
      equipements_chambre: ["wifi", "sdb_privative", "climatisation", "tv", "terrasse"],
      description_immersive:
        "Un cocon boisé niché à l'orée du parc. Le chalet dispose de 3 chambres, un salon commun avec cheminée et une terrasse privée. Idéal pour créer une ambiance intimiste.",
    },
  },
  {
    slug: "dortoir-collectif",
    title: "Dortoir collectif",
    acf: {
      nom: "Dortoir collectif",
      descriptif: "Espace partagé convivial avec lits superposés.",
      capacite_personnes: 8,
      nombre_unites: 3,
      prix_nuit_unite: 180,
      niveau_confort: "standard",
      equipements_chambre: ["wifi"],
      description_immersive:
        "L'esprit colonie de vacances pour adultes ! Des lits confortables dans un espace partagé qui favorise les échanges informels et la convivialité.",
    },
  },
]

// ─── Espaces ─────────────────────────────────────────────────

export const demoEspaces: SimEspace[] = [
  {
    slug: "grande-salle",
    title: "Grande salle de réunion",
    acf: {
      nom: "Grande salle de réunion",
      descriptif: "Salle modulable équipée pour vos réunions et présentations.",
      capacite_max: 80,
      superficie_m2: 120,
      privatisable: true,
      prix_privatisation_journee: 450,
      equipements: [
        "videoprojecteur",
        "paperboard",
        "wifi_fibre",
        "sonorisation",
        "mobilier_modulable",
      ],
      ambiance: "professionnel",
      description_immersive:
        "Baignée de lumière naturelle grâce à ses grandes baies vitrées, la salle se prête aussi bien aux présentations qu'aux ateliers collaboratifs.",
    },
  },
  {
    slug: "espace-lounge",
    title: "Espace lounge",
    acf: {
      nom: "Espace lounge",
      descriptif: "Espace cosy avec canapés et ambiance feutrée.",
      capacite_max: 40,
      superficie_m2: 60,
      privatisable: true,
      prix_privatisation_journee: 300,
      equipements: ["wifi_fibre", "sonorisation"],
      ambiance: "decontracte",
      description_immersive:
        "Canapés profonds, éclairage tamisé, bar en bois brut. Le lounge invite à la détente et aux discussions informelles.",
    },
  },
  {
    slug: "terrasse-panoramique",
    title: "Terrasse panoramique",
    acf: {
      nom: "Terrasse panoramique",
      descriptif: "Grande terrasse avec vue sur le parc et la campagne.",
      capacite_max: 60,
      superficie_m2: 200,
      privatisable: true,
      prix_privatisation_journee: 250,
      equipements: ["mobilier_modulable"],
      ambiance: "decontracte",
      description_immersive:
        "La brise légère, la vue sur les champs et les forêts à perte de vue. La terrasse est l'endroit parfait pour un cocktail ou un repas en plein air.",
    },
  },
  {
    slug: "salle-reception",
    title: "Salle de réception",
    acf: {
      nom: "Salle de réception",
      descriptif: "Salle voûtée de caractère pour vos soirées de gala.",
      capacite_max: 100,
      superficie_m2: 150,
      privatisable: true,
      prix_privatisation_journee: 600,
      equipements: ["sonorisation", "ecran_geant", "cuisine_equipee"],
      ambiance: "festif",
      description_immersive:
        "Sous les voûtes en pierre, les lumières dansent. La salle de réception se transforme selon vos envies : dîner assis, cocktail dînatoire ou soirée dansante.",
    },
  },
  {
    slug: "salle-creative",
    title: "Salle créative",
    acf: {
      nom: "Salle créative",
      descriptif: "Espace atelier avec matériel créatif à disposition.",
      capacite_max: 25,
      superficie_m2: 45,
      privatisable: true,
      prix_privatisation_journee: 200,
      equipements: ["paperboard", "wifi_fibre", "mobilier_modulable"],
      ambiance: "intimiste",
      description_immersive:
        "Murs blancs, grandes tables de travail, matériel à profusion. Un espace conçu pour libérer la créativité de vos équipes.",
    },
  },
  {
    slug: "jardin-clos",
    title: "Jardin clos",
    acf: {
      nom: "Jardin clos",
      descriptif: "Jardin privatif entouré de haies, idéal pour les activités en extérieur.",
      capacite_max: 50,
      superficie_m2: 500,
      privatisable: true,
      prix_privatisation_journee: 150,
      equipements: ["mobilier_modulable"],
      ambiance: "decontracte",
      description_immersive:
        "Un écrin de verdure à l'abri des regards. Le jardin clos accueille vos olympiades, pique-niques et moments de détente en toute intimité.",
    },
  },
]

// ─── Services ────────────────────────────────────────────────

export const demoServices: SimService[] = [
  {
    slug: "traiteur-buffet",
    title: "Traiteur buffet",
    acf: {
      nom: "Traiteur buffet",
      descriptif: "Buffet déjeuner ou dîner avec produits locaux et de saison.",
      prix_par_personne: 35,
      mode_tarification: "par_personne",
      inclus_par_defaut: false,
      description_courte: "Buffet avec produits du terroir",
      options: [
        { nom: "Buffet standard", supplement_par_personne: 0 },
        { nom: "Buffet premium", supplement_par_personne: 15 },
        { nom: "Barbecue champêtre", supplement_par_personne: 8 },
      ],
    },
    categories: [{ slug: "restauration", name: "Restauration" }],
  },
  {
    slug: "petit-dejeuner",
    title: "Petit-déjeuner",
    acf: {
      nom: "Petit-déjeuner",
      descriptif:
        "Petit-déjeuner continental avec viennoiseries, fruits frais et boissons chaudes.",
      prix_par_personne: 12,
      mode_tarification: "par_personne",
      inclus_par_defaut: true,
      description_courte: "Continental avec viennoiseries",
    },
    categories: [{ slug: "restauration", name: "Restauration" }],
  },
  {
    slug: "navette-gare",
    title: "Navette gare",
    acf: {
      nom: "Navette gare",
      descriptif: "Transport aller-retour depuis la gare la plus proche.",
      prix_forfaitaire: 250,
      mode_tarification: "forfaitaire",
      inclus_par_defaut: false,
      description_courte: "A/R gare — L'Hermitage",
    },
    categories: [{ slug: "transport-logistique", name: "Transport & Logistique" }],
  },
  {
    slug: "dj-soiree",
    title: "DJ soirée",
    acf: {
      nom: "DJ soirée",
      descriptif: "DJ professionnel pour animer votre soirée avec sono et éclairages.",
      prix_forfaitaire: 800,
      mode_tarification: "forfaitaire",
      inclus_par_defaut: false,
      description_courte: "Animation musicale professionnelle",
    },
    categories: [{ slug: "animation-soiree", name: "Animation de soirée" }],
  },
  {
    slug: "feu-de-camp",
    title: "Feu de camp",
    acf: {
      nom: "Feu de camp",
      descriptif: "Soirée autour du feu avec marshmallows et guitare (selon saison).",
      prix_forfaitaire: 150,
      mode_tarification: "forfaitaire",
      inclus_par_defaut: false,
      description_courte: "Soirée conviviale autour du feu",
    },
    categories: [{ slug: "animation-soiree", name: "Animation de soirée" }],
  },
  {
    slug: "brunch-depart",
    title: "Brunch de départ",
    acf: {
      nom: "Brunch de départ",
      descriptif: "Brunch généreux pour clôturer le séjour en beauté.",
      prix_par_personne: 22,
      mode_tarification: "par_personne",
      inclus_par_defaut: false,
      description_courte: "Brunch gourmand le dernier jour",
    },
    categories: [{ slug: "restauration", name: "Restauration" }],
  },
  {
    slug: "yoga-matinal",
    title: "Yoga matinal",
    acf: {
      nom: "Yoga matinal",
      descriptif: "Séance de yoga douce de 30 minutes pour bien démarrer la journée.",
      prix_par_personne: 8,
      mode_tarification: "par_personne",
      inclus_par_defaut: false,
      description_courte: "30 min de yoga au réveil",
    },
    categories: [{ slug: "bien-etre", name: "Bien-être" }],
  },
  {
    slug: "photographe",
    title: "Photographe professionnel",
    acf: {
      nom: "Photographe professionnel",
      descriptif: "Reportage photo de votre séjour, livré en galerie numérique.",
      prix_forfaitaire: 650,
      mode_tarification: "forfaitaire",
      inclus_par_defaut: false,
      description_courte: "Reportage photo du séjour",
    },
    categories: [{ slug: "sur-mesure", name: "Sur mesure" }],
  },
]

// ─── Templates de séjour ─────────────────────────────────────

export const demoTemplates: SimSejourTemplate[] = [
  {
    slug: "cohesion-2j",
    title: "Séjour cohésion 2 jours",
    category: "cohesion-team-building",
    acf: {
      duree_jours: 2,
      description_promesse:
        "Deux jours pour renforcer les liens de votre équipe à travers des activités collaboratives et des moments de partage dans un cadre naturel exceptionnel.",
      programme_defaut: [
        {
          jour_numero: 1,
          creneaux: [
            {
              heure_debut: "10:00",
              type_creneau: "activite",
              activite_suggeree: { slug: "course-orientation", title: "Course d'orientation" },
            },
            {
              heure_debut: "12:30",
              type_creneau: "repas",
              label_personnalise: "Déjeuner buffet champêtre",
            },
            {
              heure_debut: "14:30",
              type_creneau: "activite",
              activite_suggeree: { slug: "escape-game", title: "Escape Game grandeur nature" },
            },
            {
              heure_debut: "19:30",
              type_creneau: "soiree",
              label_personnalise: "Dîner & soirée conviviale",
            },
          ],
        },
        {
          jour_numero: 2,
          creneaux: [
            {
              heure_debut: "09:00",
              type_creneau: "activite",
              activite_suggeree: { slug: "atelier-creatif", title: "Atelier créatif collectif" },
            },
            { heure_debut: "12:00", type_creneau: "repas", label_personnalise: "Brunch de départ" },
          ],
        },
      ],
    },
  },
  {
    slug: "seminaire-3j",
    title: "Séminaire stratégique 3 jours",
    category: "seminaire-strategique",
    acf: {
      duree_jours: 3,
      description_promesse:
        "Trois jours pour combiner réflexion stratégique et expériences fédératrices. Des sessions de travail productives alternent avec des activités de détente.",
      programme_defaut: [
        {
          jour_numero: 1,
          creneaux: [
            {
              heure_debut: "09:30",
              type_creneau: "travail",
              espace_suggere: { slug: "grande-salle", title: "Grande salle de réunion" },
              label_personnalise: "Session plénière",
            },
            { heure_debut: "12:30", type_creneau: "repas", label_personnalise: "Déjeuner" },
            {
              heure_debut: "14:30",
              type_creneau: "activite",
              activite_suggeree: { slug: "atelier-fresque-climat", title: "Fresque du climat" },
            },
            {
              heure_debut: "19:30",
              type_creneau: "soiree",
              label_personnalise: "Dîner & networking",
            },
          ],
        },
        {
          jour_numero: 2,
          creneaux: [
            {
              heure_debut: "09:00",
              type_creneau: "travail",
              espace_suggere: { slug: "grande-salle", title: "Grande salle de réunion" },
              label_personnalise: "Ateliers en sous-groupes",
            },
            { heure_debut: "12:30", type_creneau: "repas", label_personnalise: "Déjeuner" },
            {
              heure_debut: "14:30",
              type_creneau: "activite",
              activite_suggeree: { slug: "olympiades", title: "Olympiades d'équipe" },
            },
            {
              heure_debut: "19:30",
              type_creneau: "soiree",
              activite_suggeree: {
                slug: "degustation-oenologique",
                title: "Dégustation œnologique",
              },
            },
          ],
        },
        {
          jour_numero: 3,
          creneaux: [
            {
              heure_debut: "09:00",
              type_creneau: "activite",
              activite_suggeree: { slug: "yoga-plein-air", title: "Yoga en plein air" },
            },
            {
              heure_debut: "10:00",
              type_creneau: "travail",
              espace_suggere: { slug: "grande-salle", title: "Grande salle de réunion" },
              label_personnalise: "Restitution & plan d'action",
            },
            {
              heure_debut: "12:30",
              type_creneau: "repas",
              label_personnalise: "Brunch de clôture",
            },
          ],
        },
      ],
    },
  },
  {
    slug: "incentive-1j",
    title: "Journée incentive",
    category: "incentive-recompense",
    acf: {
      duree_jours: 1,
      description_promesse:
        "Une journée intense et mémorable pour récompenser vos meilleurs éléments. Sport, gastronomie et surprises au programme.",
      programme_defaut: [
        {
          jour_numero: 1,
          creneaux: [
            {
              heure_debut: "09:30",
              type_creneau: "activite",
              activite_suggeree: { slug: "olympiades", title: "Olympiades d'équipe" },
            },
            {
              heure_debut: "12:30",
              type_creneau: "repas",
              label_personnalise: "Déjeuner gastronomique",
            },
            {
              heure_debut: "14:30",
              type_creneau: "activite",
              activite_suggeree: { slug: "atelier-cuisine", title: "Atelier cuisine" },
            },
            {
              heure_debut: "18:00",
              type_creneau: "soiree",
              activite_suggeree: {
                slug: "degustation-oenologique",
                title: "Dégustation œnologique",
              },
            },
          ],
        },
      ],
    },
  },
]

// ─── Settings par défaut ─────────────────────────────────────

export const demoSettings: SimulateurSettings = {
  nom_lieu: "L'Hermitage",
  description_lieu:
    "Tiers-lieu rural de 30 hectares en Picardie, dédié aux séjours corporate sur mesure.",
  capacite_totale_max: 200,
  prix_base_journee_personne: 95,
  coefficient_weekend: 1.15,
  coefficient_haute_saison: 1.25,
  periodes_haute_saison: [
    { date_debut: "2026-06-01", date_fin: "2026-08-31" },
    { date_debut: "2026-12-15", date_fin: "2027-01-05" },
  ],
  email_commercial: "sejours@lhermitage.fr",
  telephone_commercial: "+33 3 44 XX XX XX",
}

// ─── Export complet ──────────────────────────────────────────

export const demoData: SimulateurData = {
  activites: demoActivites,
  hebergements: demoHebergements,
  espaces: demoEspaces,
  services: demoServices,
  templates: demoTemplates,
  settings: demoSettings,
}
