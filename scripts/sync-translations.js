const fs = require('fs');
const path = require('path');

const en = require('../src/messages/en.json');
const fr = require('../src/messages/fr.json');
const es = require('../src/messages/es.json');
const de = require('../src/messages/de.json');
const ar = require('../src/messages/ar.json');

// Deep merge helper
function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && !Array.isArray(source[key])) {
      if (!target[key]) Object.assign(target, { [key]: {} });
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// 1. FRENCH TRANSLATIONS
const frExtensions = {
  Common: {
    bookCall: "Réserver un appel",
    emailUs: "Écrivez-nous",
    whatsapp: "WhatsApp",
    search: "Rechercher",
    toggleTheme: "Changer de thème",
    readMore: "Lire la suite",
    learnAbout: "Découvrir le studio"
  },
  Home: {
    hero: {
      imageAlt: "Deux designers examinant ensemble une mise en page web sur ordinateur portable.",
      available: "Nouveaux projets acceptés"
    },
    band: {
      eyebrow: "Réponses directes",
      title: "Nous vous disons ce que nous construisons, ce que cela coûte et le délai requis.",
      body: "Pas de discours commercial flou ni d'estimations vagues. Vous obtenez un engagement ferme et écrit avant tout début de projet.",
      cta: "Obtenir un tarif"
    }
  },
  Services: {
    items: {
      custom: { imageAlt: "Un designer et un développeur examinant ensemble la mise en page d'un site sur mesure." },
      wordpress: { imageAlt: "Deux personnes éditant des contenus ensemble sur un système de gestion de contenu." },
      wix: { imageAlt: "Un ordinateur portable sur un bureau affichant un site nouvellement mis en ligne." },
      ecommerce: { imageAlt: "Une boutique en ligne affichée à côté d'un terminal de paiement sécurisé." }
    }
  },
  Portfolio: {
    viewCaseStudy: "Lire l'étude de cas",
    caseStudies: "Études de cas",
    inside: {
      eyebrow: "Dans les coulisses d'un projet",
      title: "Ce que vous recevez concrètement.",
      subtitle: "Ouvrez un dossier pour découvrir son contenu. Chaque projet que nous livrons comprend systématiquement ces quatre piliers.",
      hint: "Ouvrir le dossier",
      items: {
        design: {
          title: "Design",
          caption: "Chaque écran est rigoureusement conçu avant d'écrire la moindre ligne de code.",
          files: ["Wireframes de chaque page", "Palette, typographies et composants", "Maquettes haute fidélité pour tous les écrans", "Prototype interactif testable"]
        },
        build: {
          title: "Développement",
          caption: "Le site réel, pensé pour la vitesse et livré avec une architecture propre.",
          files: ["Code source complet", "Éditeur de contenu intuitif pour votre équipe", "Paiements et intégrations tierces", "Tests automatisés des parcours clés"]
        },
        content: {
          title: "Contenu & SEO",
          caption: "Le travail de fond indispensable pour être visible et pertinent.",
          files: ["Textes de pages rédigés au besoin", "Balises titres et méta-descriptions", "Plan de site et URLs soignées", "Tableaux de bord d'analyse clairs"]
        },
        handover: {
          title: "Transmission",
          caption: "Pour que vous puissiez gérer le site en toute autonomie.",
          files: ["Documentation écrite détaillée", "Vidéo pas-à-pas de prise en main", "Tous les comptes à votre nom", "30 jours d'assistance offerts après lancement"]
        }
      }
    }
  },
  Contact: {
    hours: "Disponibilité",
    hoursNote: "Nous travaillons à distance avec des clients du monde entier. Vous pouvez nous écrire 24h/24 et 7j/7.",
    beforeYouWrite: "Avant de nous écrire",
    days: {
      weekdays: "Du lundi au vendredi",
      saturday: "Samedi",
      sunday: "Dimanche"
    },
    bookingTitle: "Réserver un appel découverte de 30 minutes"
  },
  Footer: {
    legal: "Mentions légales",
    newsletter: "Lettre d'information",
    hours: "Horaires du studio"
  },
  Admin: {
    nav: { design: "Design" },
    design: en.Admin.design // Admin panel preserves complete keys
  },
  Capabilities: {
    promises: {
      senior: {
        title: "Vous parlez au concepteur",
        body: "Aucun intermédiaire. La personne qui chiffre votre projet est celle qui le développe."
      },
      scope: {
        title: "Périmètre fixe, prix fixe",
        body: "Vous recevez le plan et le tarif par écrit avant tout début de chantier."
      },
      reply: {
        title: "Une réponse sous 48 heures",
        body: "Chaque message reçoit une réponse claire et rapide."
      },
      handover: {
        title: "Vous êtes propriétaire de tout",
        body: "Le code source, les maquettes et les accès vous appartiennent, intégralement documentés."
      }
    }
  },
  Command: {
    label: "Palette de commandes",
    placeholder: "Rechercher pages, services, projets et actions…",
    empty: "Aucun résultat trouvé.",
    openHint: "Rechercher",
    groups: {
      pages: "Pages",
      services: "Services",
      actions: "Actions"
    },
    themeLight: "Passer au thème clair",
    themeDark: "Passer au thème sombre",
    actions: {
      quote: "Obtenir un tarif",
      book: "Réserver un appel",
      email: "Écrire au studio",
      whatsapp: "Demander un Google Meet",
      admin: "Ouvrir le tableau de bord"
    }
  },
  Pricing: {
    eyebrow: "Tarifs",
    title: "Des tarifs simples et transparents.",
    subtitle: "Pas de forfaits opaques ni de paliers inventés — chaque projet est tarifé selon ses besoins réels.",
    from: "Projets à partir de",
    note: "C'est notre tarif plancher. Les projets réels sont chiffrés après un court échange, avec un montant garanti par écrit avant le début des travaux.",
    secondary: "Découvrir ce qui est inclus"
  },
  Faq: {
    eyebrow: "Bon à savoir",
    title: "Questions fréquentes.",
    items: {
      timeline: {
        q: "Combien de temps prend un projet ?",
        a: "Un site vitrine simple prend généralement deux à quatre semaines. Une plateforme sur mesure ou une boutique en ligne demande six à douze semaines, selon le périmètre et la rapidité de vos retours."
      },
      stack: {
        q: "Quelles technologies utilisez-vous ?",
        a: "Nos développements sur mesure reposent sur React et Next.js, avec Supabase pour la base de données, l'authentification et les fichiers. Nous concevons également sur WordPress et Wix lorsque cela correspond mieux à vos besoins."
      },
      ownership: {
        q: "Sommes-nous propriétaires du site ?",
        a: "Oui, à 100%. Vous possédez l'intégralité du code source, des designs et des accès hébergeurs. Nous vous transmettons tous les livrables avec une vidéo explicative."
      },
      support: {
        q: "Que se passe-t-il après le lancement ?",
        a: "Chaque projet inclut 30 jours d'assistance complète après mise en ligne. Ensuite, vous pouvez gérer le site en autonomie ou souscrire un forfait de maintenance mensuel."
      },
      payments: {
        q: "Comment fonctionnent les paiements ?",
        a: "Les projets sont divisés en un acompte initial et des règlements par jalons validés. Paiement sécurisé par carte, virement ou mobile money dans votre devise."
      },
      start: {
        q: "Comment démarrer ?",
        a: "Envoyez-nous un message via le formulaire ou réservez un appel découverte. Nous vous répondrons sous 48h avec une proposition claire et un tarif ferme."
      }
    }
  },
  Newsletter: {
    eyebrow: "Lettre d'information",
    title: "Notes techniques périodiques. Zéro bruit.",
    body: "Environ un email par mois sur la performance web, les paiements et le déploiement de produits digitaux sur mesure.",
    label: "Adresse email",
    placeholder: "vous@entreprise.com",
    submit: "S'abonner",
    success: "Vous êtes bien inscrit — merci.",
    error: "Une erreur s'est produite. Veuillez réessayer.",
    invalid: "Veuillez saisir une adresse email valide.",
    privacy: "Zéro spam. Nous ne partageons jamais votre adresse."
  },
  Cookie: {
    title: "Gestion des cookies",
    body: "Nous utilisons quelques cookies pour mémoriser votre langue et votre thème, ainsi qu'une mesure d'audience anonyme. Zéro traceur publicitaire.",
    accept: "Tout accepter",
    decline: "Essentiels uniquement",
    policy: "Politique de confidentialité"
  },
  Booking: {
    eyebrow: "Toujours disponible",
    title: "Réserver un appel découverte",
    body: "Un échange court et convivial sur vos objectifs et vos délais. Choisissez le créneau qui vous convient.",
    cta: "Choisir un horaire",
    note: "Vous préférez par écrit ? Envoyez-nous un email et nous répondrons rapidement.",
    noteCta: "Demander un Google Meet",
    timezone: "Disponible sur tous les fuseaux horaires."
  },
  About: {
    metaTitle: "À propos du studio · Ingénierie web et savoir-faire d'excellence",
    metaDescription: "Découvrez Virtue & Co. Webworks — un studio d'ingénierie web dédié à la création d'expériences ultra-rapides, au code irréprochable et aux prix fixes garantis.",
    eyebrow: "À propos",
    title: "Un studio indépendant pour des sites web exigeants.",
    intro: "Nous sommes un studio à taille humaine et nous tenons à le rester. L'ingénieur qui chiffre votre projet est celui qui le conçoit et le code, pour une communication fluide sans déperdition.",
    story: {
      title: "Pourquoi nous avons créé le studio",
      body: "Nous avons trop souvent rencontré des entreprises bloquées avec des sites lents, instables, impossibles à modifier et dépendants d'agences opaques. Nous avons fondé Virtue & Co. Webworks pour bâtir exactement l'inverse : des sites web performants, documentés et faciles à gérer soi-même."
    },
    principles: {
      title: "Nos engagements",
      items: {
        senior: {
          title: "Directement avec l'ingénieur",
          body: "Aucun commercial ni stagiaire. Vous échangez directement avec les spécialistes qui conçoivent votre site."
        },
        fast: {
          title: "La vitesse au cœur du design",
          body: "La performance est pensée dès la première maquette. Un site lent est un site manqué."
        },
        clear: {
          title: "Périmètre fixe, prix fixe",
          body: "Tout est cadré par écrit avant de commencer. Les évolutions éventuelles font l'objet d'un devis préalable — jamais de surprise."
        },
        owned: {
          title: "Pleine propriété",
          body: "Le code source, les maquettes, le nom de domaine et les accès vous appartiennent intégralement."
        }
      }
    },
    capabilities: {
      title: "Nos domaines d'excellence",
      items: [
        "Sites web et applications sur mesure",
        "Sites vitrines avec gestion de contenu autonome",
        "Boutiques en ligne et passerelles de paiement",
        "Optimisation et refonte de sites existants",
        "Design systems et bibliothèques d'interfaces"
      ]
    },
    cta: {
      title: "Un projet à concrétiser ?",
      body: "Expliquez-nous votre besoin : vous recevrez un plan d'action détaillé et un devis fixe sous deux jours ouvrés.",
      button: "Obtenir un tarif"
    },
    bandAlt: "Membres du studio travaillant ensemble autour d'une table avec des ordinateurs portables.",
    bandCaption: "Une équipe senior resserrée — vous collaborez directement avec les artisans de votre site."
  },
  Blog: {
    metaTitle: "Articles & Notes Techniques",
    metaDescription: "Analyses et retours d'expérience de Virtue & Co. Webworks sur la vitesse web, les paiements et le développement moderne.",
    eyebrow: "Articles",
    title: "Notes sur la conception web moderne.",
    subtitle: "Écrits pratiques sur la performance, les architectures de paiement et l'artisanat logiciel.",
    readMore: "Lire l'article",
    readTime: "{minutes} min de lecture",
    publishedOn: "Publié le",
    updated: "Mis à jour",
    back: "Retour aux articles",
    empty: "Aucun article publié pour le moment.",
    relatedTitle: "Dans la même thématique"
  },
  CaseStudy: {
    back: "Retour au portfolio",
    client: "Client",
    year: "Année",
    role: "Rôle",
    timeline: "Durée",
    stack: "Technologies",
    visit: "Visiter le site en ligne",
    challenge: "Le défi",
    approach: "Notre approche",
    outcome: "Le résultat",
    results: "Impact mesuré",
    gallery: "Aperçus du projet",
    next: "Projet suivant",
    notFound: "Étude de cas introuvable"
  },
  WhatsApp: {
    label: "Prendre rendez-vous",
    title: "Planifier un rendez-vous",
    body: "Échangez en direct avec notre équipe d'ingénierie sur vos objectifs et votre calendrier.",
    cta: "Demander un Google Meet",
    close: "Fermer"
  },
  Legal: {
    updated: "Dernière mise à jour :",
    contactNote: "Pour toute question juridique ou relative à vos données, écrivez à privacy@virtuecowebworks.solutions.",
    privacy: {
      title: "Politique de confidentialité",
      metaTitle: "Politique de confidentialité · Virtue & Co. Webworks",
      metaDescription: "Découvrez comment Virtue & Co. Webworks protège vos données personnelles et respecte votre vie privée.",
      intro: "La confidentialité de vos informations est fondamentale. Cette politique expose nos principes de collecte minimale et de sécurisation absolue de vos données.",
      sections: en.Legal.privacy.sections
    },
    terms: {
      title: "Conditions générales de service",
      metaTitle: "Conditions générales de service · Virtue & Co. Webworks",
      metaDescription: "Conditions contractuelles, propriété intellectuelle, garanties et modalités de réalisation des projets chez Virtue & Co. Webworks.",
      intro: "Ces conditions régissent nos prestations d'ingénierie et de conception web, garantissant un partenariat clair, équitable et transparent.",
      sections: en.Legal.terms.sections
    }
  },
  Photos: {
    services: { alt: "Développeurs travaillant sur du code et du design d'interface.", caption: "Ingénierie sur mesure et standards de performance élevés." },
    work: { alt: "Aperçu de projets web récents sur différents appareils.", caption: "Des interfaces réactives qui convertissent sur mobile et ordinateur." },
    blog: { alt: "Architecture logicielle moderne et performances web.", caption: "Des réflexions issues de chantiers réels." },
    contact: { alt: "Échange et cadrage de projet digital.", caption: "Une écoute attentive dès le premier contact." },
    process: { alt: "Cycle de conception et validation par étapes.", caption: "Un processus fluide en cinq étapes sans surprise." }
  }
};

// 2. SPANISH TRANSLATIONS
const esExtensions = {
  Common: {
    bookCall: "Reservar una llamada",
    emailUs: "Escríbenos",
    whatsapp: "WhatsApp",
    search: "Buscar",
    toggleTheme: "Cambiar tema",
    readMore: "Leer más",
    learnAbout: "Conocer el estudio"
  },
  Home: {
    hero: {
      imageAlt: "Dos diseñadores revisando juntos el diseño de un sitio web en un portátil.",
      available: "Aceptando nuevos proyectos"
    },
    band: {
      eyebrow: "Respuestas claras",
      title: "Te decimos qué construiríamos, cuánto cuesta y cuánto tiempo tomará.",
      body: "Sin presentaciones interminables ni presupuestos vagos. Recibes una propuesta por escrito antes de comprometerte.",
      cta: "Obtener presupuesto"
    }
  },
  Services: {
    items: {
      custom: { imageAlt: "Un diseñador y un desarrollador revisando el diseño de un sitio web personalizado." },
      wordpress: { imageAlt: "Dos personas editando páginas juntas en un gestor de contenidos." },
      wix: { imageAlt: "Un ordenador portátil mostrando un sitio web recién publicado." },
      ecommerce: { imageAlt: "Una tienda online abierta junto a un terminal de pago con tarjeta." }
    }
  },
  Portfolio: {
    viewCaseStudy: "Ver caso de estudio",
    caseStudies: "Casos de estudio",
    inside: {
      eyebrow: "Dentro de un proyecto",
      title: "Lo que realmente recibes.",
      subtitle: "Abre una carpeta para ver su contenido. Cada proyecto incluye siempre estos cuatro pilares esenciales.",
      hint: "Abrir carpeta",
      items: {
        design: {
          title: "Diseño",
          caption: "Cada pantalla se diseña meticulosamente antes de escribir código.",
          files: ["Wireframes de cada pantalla", "Tus colores, fuentes y componentes", "Diseños definitivos para móvil y escritorio", "Prototipo interactivo navegable"]
        },
        build: {
          title: "Desarrollo",
          caption: "El sitio web real, optimizado para la velocidad y entregado con código limpio.",
          files: ["Código fuente completo", "Panel de gestión intuitivo para tu equipo", "Pasarelas de pago e integraciones", "Pruebas automatizadas en flujos clave"]
        },
        content: {
          title: "Contenido y SEO",
          caption: "El trabajo esencial para que tu negocio sea encontrado en Google.",
          files: ["Redacción de páginas adaptada", "Títulos y meta-descripciones optimizados", "Mapa del sitio y enlaces limpios", "Analítica clara y comprensible"]
        },
        handover: {
          title: "Entrega",
          caption: "Para que gestiones el sitio con total autonomía sin depender de nosotros.",
          files: ["Documentación escrita paso a paso", "Paseo grabado en vídeo", "Todas las cuentas a tu nombre", "30 días de soporte garantizado tras el lanzamiento"]
        }
      }
    }
  },
  Contact: {
    hours: "Disponibilidad",
    hoursNote: "Trabajamos en remoto con clientes de todo el mundo. Puedes escribirnos en cualquier momento 24/7.",
    beforeYouWrite: "Antes de escribirnos",
    days: {
      weekdays: "Lunes a Viernes",
      saturday: "Sábado",
      sunday: "Domingo"
    },
    bookingTitle: "Reservar una llamada de presentación de 30 minutos"
  },
  Footer: {
    legal: "Aviso legal",
    newsletter: "Boletín",
    hours: "Horario del estudio"
  },
  Admin: {
    nav: { design: "Diseño" },
    design: en.Admin.design
  },
  Capabilities: {
    promises: {
      senior: {
        title: "Hablas con quien construye",
        body: "Sin intermediarios. La misma persona que presupuesta tu proyecto es quien lo programa."
      },
      scope: {
        title: "Alcance fijo, precio fijo",
        body: "Recibes el plan y el precio exacto por escrito antes de comenzar."
      },
      reply: {
        title: "Respuesta en 48 horas",
        body: "Cada mensaje recibe una respuesta ágil y profesional."
      },
      handover: {
        title: "Eres dueño de todo",
        body: "El código, los diseños y las cuentas son tuyos, documentados y entregados."
      }
    }
  },
  Command: {
    label: "Paleta de comandos",
    placeholder: "Buscar páginas, servicios, proyectos y acciones…",
    empty: "No se encontraron resultados.",
    openHint: "Buscar",
    groups: {
      pages: "Páginas",
      services: "Servicios",
      actions: "Acciones"
    },
    themeLight: "Cambiar a modo claro",
    themeDark: "Cambiar a modo oscuro",
    actions: {
      quote: "Obtener presupuesto",
      book: "Reservar llamada",
      email: "Escribir al estudio",
      whatsapp: "Pedir un Google Meet",
      admin: "Abrir panel"
    }
  },
  Pricing: {
    eyebrow: "Precios",
    title: "Precios transparentes y directos.",
    subtitle: "Sin paquetes genéricos ni costes ocultos — presupuestamos según las necesidades reales de tu proyecto.",
    from: "Proyectos desde",
    note: "Este es nuestro proyecto mínimo. Cada trabajo se cotiza tras una breve charla, con un precio final por escrito antes de empezar.",
    secondary: "Ver qué incluye"
  },
  Faq: {
    eyebrow: "Preguntas frecuentes",
    title: "Respuestas a tus dudas.",
    items: {
      timeline: {
        q: "¿Cuánto tiempo lleva un proyecto?",
        a: "Un sitio web estándar toma de dos a cuatro semanas. Una plataforma personalizada o tienda online requiere de seis a doce semanas, según complejidad y rapidez en el intercambio de contenido."
      },
      stack: {
        q: "¿Con qué tecnologías construyen?",
        a: "Los desarrollos a medida se programan en React y Next.js con Supabase para bases de datos y autenticación. También creamos sitios en WordPress y Wix cuando es la opción óptima para ti."
      },
      ownership: {
        q: "¿Somos los dueños del sitio web?",
        a: "Sí, al 100%. Eres dueño del código fuente, los archivos de diseño y todas las cuentas. Te entregamos todo con documentación y un vídeo explicativo."
      },
      support: {
        q: "¿Qué sucede tras el lanzamiento?",
        a: "Todos los proyectos incluyen 30 días de soporte post-lanzamiento. Después puedes gestionarlo internamente o mantener un acuerdo mensual de mejoras."
      },
      payments: {
        q: "¿Cómo funcionan los pagos?",
        a: "Los proyectos se dividen en un depósito inicial y pagos por hitos aprobados. Aceptamos tarjeta, transferencia bancaria y pagos locales en tu divisa."
      },
      start: {
        q: "¿Cómo empezamos?",
        a: "Envíanos un mensaje mediante el formulario o reserva una llamada introductoria. Te responderemos en dos días laborables con un plan y precio fijo."
      }
    }
  },
  Newsletter: {
    eyebrow: "Boletín",
    title: "Notas periódicas. Cero ruido.",
    body: "Aproximadamente un correo al mes sobre rendimiento web, pagos online y software entregado a tiempo.",
    label: "Correo electrónico",
    placeholder: "tu@empresa.com",
    submit: "Suscribirse",
    success: "Te has suscrito con éxito — gracias.",
    error: "Ha ocurrido un error. Inténtalo de nuevo.",
    invalid: "Introduce un correo electrónico válido.",
    privacy: "Cero spam. Jamás compartiremos tu dirección."
  },
  Cookie: {
    title: "Sobre el uso de cookies",
    body: "Utilizamos cookies estrictamente para recordar tu idioma y tema preferido, además de analítica anónima sin rastreadores publicitarios.",
    accept: "Aceptar todas",
    decline: "Solo esenciales",
    policy: "Política de privacidad"
  },
  Booking: {
    eyebrow: "Siempre disponible",
    title: "Reserva una llamada de descubrimiento",
    body: "Una charla amigable y concisa sobre tus objetivos y plazos. Elige el horario que mejor te convenga.",
    cta: "Elegir horario",
    note: "¿Prefieres escribirnos? Envíanos un correo y responderemos rápidamente.",
    noteCta: "Pedir un Google Meet",
    timezone: "Disponible en todas las zonas horarias."
  },
  About: {
    metaTitle: "Sobre el estudio · Ingeniería web y artesanía digital de alto nivel",
    metaDescription: "Conoce Virtue & Co. Webworks — un estudio de ingeniería web enfocado en sitios ultrarrápidos, código impecable y precios fijos garantizados.",
    eyebrow: "Sobre nosotros",
    title: "Un estudio boutique para proyectos web exigentes.",
    intro: "Somos un estudio pequeño y nos mantenemos así deliberadamente. Quien calcula tu presupuesto es quien programa tu web, asegurando comunicación directa sin pérdidas.",
    story: {
      title: "Por qué empezamos",
      body: "Conocimos a muchas empresas que habían pagado por una web y terminaron con un problema: sitios lentos, frágiles, difíciles de editar y cautivos de agencias. Creamos Virtue & Co. Webworks para hacer lo contrario: páginas bien construidas, veloces y fáciles de administrar por ti mismo."
    },
    principles: {
      title: "Cómo trabajamos",
      items: {
        senior: {
          title: "Tratas con quien programa",
          body: "Sin ejecutivos de cuentas ni juniors aprendiendo con tu presupuesto. Hablas directamente con los desarrolladores."
        },
        fast: {
          title: "La velocidad es parte del diseño",
          body: "Diseñamos para la rapidez desde el primer minuto. Una web atractiva pero lenta es una oportunidad perdida."
        },
        clear: {
          title: "Alcance fijo, precio fijo",
          body: "Recibes el plan y el coste por escrito antes de comenzar. Cualquier ampliación se cotiza previamente."
        },
        owned: {
          title: "Eres dueño de todo",
          body: "El código, los diseños, el dominio y los accesos te pertenecen por completo."
        }
      }
    },
    capabilities: {
      title: "Nuestras mayores fortalezas",
      items: [
        "Sitios web y aplicaciones personalizadas",
        "Páginas corporativas con gestión de contenidos",
        "Tiendas online y pasarelas de pago seguras",
        "Optimización y rescate de webs lentas",
        "Sistemas de diseño y bibliotecas de componentes"
      ]
    },
    cta: {
      title: "¿Tienes un proyecto en mente?",
      body: "Cuéntanos lo que necesitas y te enviaremos una propuesta detallada con precio fijo en menos de dos días laborables.",
      button: "Obtener presupuesto"
    },
    bandAlt: "Miembros del estudio trabajando juntos frente a ordenadores portátiles.",
    bandCaption: "Un equipo senior y cercano — trabajas directamente con los artífices de tu sitio."
  },
  Blog: {
    metaTitle: "Artículos y Notas de Ingeniería",
    metaDescription: "Publicaciones de Virtue & Co. Webworks sobre rendimiento web, comercio electrónico y desarrollo a medida.",
    eyebrow: "Artículos",
    title: "Notas sobre creación web moderna.",
    subtitle: "Consejos prácticos sobre velocidad, pagos en línea y metodologías ágiles de entrega.",
    readMore: "Leer artículo",
    readTime: "{minutes} min de lectura",
    publishedOn: "Publicado",
    updated: "Actualizado",
    back: "Volver a artículos",
    empty: "No hay artículos publicados todavía.",
    relatedTitle: "Artículos relacionados"
  },
  CaseStudy: {
    back: "Volver al portfolio",
    client: "Cliente",
    year: "Año",
    role: "Rol",
    timeline: "Plazo",
    stack: "Tecnologías",
    visit: "Visitar sitio web",
    challenge: "El desafío",
    approach: "Nuestra solución",
    outcome: "El resultado",
    results: "Impacto alcanzado",
    gallery: "Capturas del proyecto",
    next: "Siguiente proyecto",
    notFound: "Caso de estudio no encontrado"
  },
  WhatsApp: {
    label: "Agendar reunión",
    title: "Coordinar una llamada",
    body: "Conversa directamente con nuestro equipo de ingeniería sobre tus ideas y cronograma.",
    cta: "Pedir un Google Meet",
    close: "Cerrar"
  },
  Legal: {
    updated: "Última actualización:",
    contactNote: "Para cualquier consulta legal o sobre protección de datos, escribe a privacy@virtuecowebworks.solutions.",
    privacy: {
      title: "Política de privacidad",
      metaTitle: "Política de privacidad · Virtue & Co. Webworks",
      metaDescription: "Conoce cómo Virtue & Co. Webworks protege tus datos personales y respeta tu privacidad.",
      intro: "La privacidad de tu información es primordial. Esta política detalla nuestras prácticas de recopilación mínima y protección exhaustiva de tus datos.",
      sections: en.Legal.privacy.sections
    },
    terms: {
      title: "Términos y condiciones de servicio",
      metaTitle: "Términos del servicio · Virtue & Co. Webworks",
      metaDescription: "Términos contractuales, derechos de autor, garantías y plazos de entrega de proyectos en Virtue & Co. Webworks.",
      intro: "Estas condiciones rigen todos los servicios de diseño y desarrollo web que realizamos, garantizando un marco claro y transparente.",
      sections: en.Legal.terms.sections
    }
  },
  Photos: {
    services: { alt: "Desarrolladores colaborando en código e interfaces web.", caption: "Ingeniería a medida y altos estándares de velocidad." },
    work: { alt: "Muestra de proyectos web recientes en diferentes dispositivos.", caption: "Sitios rápidos que convierten visitantes en clientes." },
    blog: { alt: "Arquitectura moderna de software y rendimiento digital.", caption: "Lecciones y aprendizajes de proyectos reales." },
    contact: { alt: "Reunión de planificación y alcance de proyecto digital.", caption: "Atención personalizada desde el primer día." },
    process: { alt: "Metodología de entrega estructurada en fases.", caption: "Cinco etapas transparentes sin sorpresas." }
  }
};

// 3. GERMAN TRANSLATIONS
const deExtensions = {
  Common: {
    bookCall: "Gespräch buchen",
    emailUs: "E-Mail schreiben",
    whatsapp: "WhatsApp",
    search: "Suchen",
    toggleTheme: "Design wechseln",
    readMore: "Weiterlesen",
    learnAbout: "Über das Studio"
  },
  Home: {
    hero: {
      imageAlt: "Zwei Designer überprüfen gemeinsam ein Website-Layout auf einem Laptop.",
      available: "Freie Kapazitäten für neue Projekte"
    },
    band: {
      eyebrow: "Klare Fakten",
      title: "Wir sagen Ihnen genau, was wir bauen, was es kostet und wie lange es dauert.",
      body: "Keine vagen Schätzungen und keine endlosen Präsentationen. Sie erhalten ein verbindliches, schriftliches Festpreisangebot vor Projektstart.",
      cta: "Angebot anfordern"
    }
  },
  Services: {
    items: {
      custom: { imageAlt: "Designer und Entwickler prüfen ein maßgeschneidertes Website-Design." },
      wordpress: { imageAlt: "Zwei Kollegen bearbeiten Inhalte in einem modernen Content-Management-System." },
      wix: { imageAlt: "Ein Laptop auf dem Schreibtisch zeigt eine frisch veröffentlichte Website." },
      ecommerce: { imageAlt: "Ein responsiver Online-Shop auf dem Monitor neben einem Zahlungsterminal." }
    }
  },
  Portfolio: {
    viewCaseStudy: "Fallstudie ansehen",
    caseStudies: "Fallstudien",
    inside: {
      eyebrow: "Einblicke ins Projekt",
      title: "Was Sie tatsächlich erhalten.",
      subtitle: "Öffnen Sie einen Ordner, um die Ergebnisse zu sehen. Jedes Projekt enthält ausnahmslos diese vier Bausteine.",
      hint: "Ordner öffnen",
      items: {
        design: {
          title: "Design",
          caption: "Jede Unterseite wird sorgfältig gestaltet, bevor die erste Zeile Code entsteht.",
          files: ["Wireframes für jeden Seitentyp", "Ihre Farben, Schriften und Komponenten", "Fertige Layouts für alle Bildschirmgrößen", "Interaktiver Prototyp zum Ausprobieren"]
        },
        build: {
          title: "Entwicklung",
          caption: "Die fertige Website – blitzschnell geladen und mit sauberem Quellcode übergeben.",
          files: ["Vollständiger Quellcode", "Einfaches Redaktionssystem für Ihr Team", "Zahlungsschnittstellen und API-Anbindungen", "Automatisierte Tests für kritische Nutzerpfade"]
        },
        content: {
          title: "Inhalte & SEO",
          caption: "Die unverzichtbare Basis für beste Auffindbarkeit auf Google.",
          files: ["Professionell formulierte Texte", "Optimierte Seitentitel und Meta-Beschreibungen", "Saubere XML-Sitemap und lesbare URLs", "Verständliche Web-Analysen"]
        },
        handover: {
          title: "Übergabe",
          caption: "Damit Sie Ihre Website eigenständig pflegen können – ohne ständige Agenturabhängigkeit.",
          files: ["Schriftliche Schritt-für-Schritt-Anleitung", "Aufgezeichnete Video-Einweisung", "Alle Benutzerkonten auf Ihren Namen", "30 Tage persönliche Unterstützung nach Launch"]
        }
      }
    }
  },
  Contact: {
    hours: "Verfügbarkeit",
    hoursNote: "Wir arbeiten remote mit Kunden aus aller Welt. Sie können uns jederzeit rund um die Uhr erreichen.",
    beforeYouWrite: "Vor Ihrer Anfrage",
    days: {
      weekdays: "Montag – Freitag",
      saturday: "Samstag",
      sunday: "Sonntag"
    },
    bookingTitle: "30-minütiges Kennenlerngespräch vereinbaren"
  },
  Footer: {
    legal: "Rechtliches",
    newsletter: "Newsletter",
    hours: "Studio-Zeiten"
  },
  Admin: {
    nav: { design: "Design" },
    design: en.Admin.design
  },
  Capabilities: {
    promises: {
      senior: {
        title: "Direkter Kontakt zu den Entwicklern",
        body: "Keine Mittelsmänner. Die Person, die Ihr Angebot kalkuliert, baut auch Ihre Website."
      },
      scope: {
        title: "Fester Umfang, fester Preis",
        body: "Sie erhalten Projektplan und Festpreis schriftlich garantiert vor Arbeitsbeginn."
      },
      reply: {
        title: "Rückmeldung innerhalb von 48 Stunden",
        body: "Jede Nachricht wird schnell und kompetent beantwortet."
      },
      handover: {
        title: "Volles Eigentum",
        body: "Code, Design-Dateien und Accounts gehören vollständig Ihnen – sauber dokumentiert."
      }
    }
  },
  Command: {
    label: "Befehlsmenü",
    placeholder: "Seiten, Leistungen, Arbeiten und Aktionen durchsuchen…",
    empty: "Keine passenden Treffer gefunden.",
    openHint: "Suchen",
    groups: {
      pages: "Seiten",
      services: "Leistungen",
      actions: "Aktionen"
    },
    themeLight: "Helles Design aktivieren",
    themeDark: "Dunkles Design aktivieren",
    actions: {
      quote: "Angebot einholen",
      book: "Gespräch buchen",
      email: "E-Mail an das Studio",
      whatsapp: "Google Meet anfragen",
      admin: "Dashboard öffnen"
    }
  },
  Pricing: {
    eyebrow: "Preise",
    title: "Einfache, transparente Preisgestaltung.",
    subtitle: "Keine versteckten Gebühren oder künstlichen Tarife – jedes Projekt wird nach tatsächlichem Bedarf kalkuliert.",
    from: "Projekte ab",
    note: "Dies ist unser Einstiegspreis. Jedes Projekt wird nach kurzem Austausch kalkuliert – mit garantiertem Festpreis vor Projektstart.",
    secondary: "Leistungsumfang ansehen"
  },
  Faq: {
    eyebrow: "Häufige Fragen",
    title: "Fragen und Antworten.",
    items: {
      timeline: {
        q: "Wie lange dauert ein Projekt?",
        a: "Eine übersichtliche Website dauert in der Regel zwei bis vier Wochen. Eine maßgeschneiderte Plattform oder ein E-Commerce-Shop benötigt sechs bis zwölf Wochen."
      },
      stack: {
        q: "Welche Technologien nutzen Sie?",
        a: "Individuelle Projekte entwickeln wir mit React und Next.js, unterstützt von Supabase für Datenbank und Authentifizierung. Bei passenden Anforderungen setzen wir auch auf WordPress und Wix."
      },
      ownership: {
        q: "Gehört die Website vollständig uns?",
        a: "Ja, zu 100%. Sie erhalten das uneingeschränkte Eigentum am Quellcode, an den Designs und allen Accounts samt Videoanleitung."
      },
      support: {
        q: "Was geschieht nach dem Start?",
        a: "Jedes Projekt beinhaltet 30 Tage kostenfreie Betreuung nach dem Launch. Danach können Sie die Pflege selbst übernehmen oder ein monatliches Wartungspaket buchen."
      },
      payments: {
        q: "Wie läuft die Bezahlung ab?",
        a: "Projekte werden in eine Anzahlung und Meilensteinzahlungen aufgeteilt. Zahlung per Kreditkarte, Überweisung oder lokalen Zahlungsmethoden in Ihrer Währung."
      },
      start: {
        q: "Wie starten wir die Zusammenarbeit?",
        a: "Senden Sie uns eine Nachricht über das Kontaktformular oder buchen Sie ein kurzes Gespräch. Wir antworten innerhalb von zwei Werktagen mit einem klaren Fahrplan und Festpreis."
      }
    }
  },
  Newsletter: {
    eyebrow: "Newsletter",
    title: "Regelmäßige Einblicke. Kein Spam.",
    body: "Etwa eine E-Mail pro Monat zu Web-Performance, Online-Zahlungen und erfolgreicher Softwareentwicklung.",
    label: "E-Mail-Adresse",
    placeholder: "name@unternehmen.de",
    submit: "Abonnieren",
    success: "Vielen Dank – Sie sind erfolgreich eingetragen.",
    error: "Etwas ist schiefgelaufen. Bitte erneut versuchen.",
    invalid: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
    privacy: "Kein Spam. Wir geben Ihre Daten niemals weiter."
  },
  Cookie: {
    title: "Hinweis zu Cookies",
    body: "Wir nutzen lediglich essenzielle Cookies zur Speicherung von Sprache und Design sowie anonyme Webanalysen ohne Werbetracker.",
    accept: "Alle akzeptieren",
    decline: "Nur essenzielle",
    policy: "Datenschutzerklärung"
  },
  Booking: {
    eyebrow: "Jederzeit erreichbar",
    title: "Kennenlerngespräch vereinbaren",
    body: "Ein kurzes, unverbindliches Gespräch über Ihre Ziele und Fristen. Wählen Sie den passenden Termin.",
    cta: "Termin auswählen",
    note: "Lieber schriftlich? Schreiben Sie uns eine E-Mail und wir antworten umgehend.",
    noteCta: "Google Meet anfragen",
    timezone: "Verfügbar über alle Zeitzonen hinweg."
  },
  About: {
    metaTitle: "Über das Studio · Web-Engineering und digitale Handwerkskunst",
    metaDescription: "Lernen Sie Virtue & Co. Webworks kennen – ein Web-Engineering-Studio für blitzschnelle Ladezeiten, sauberen Code und feste Preise.",
    eyebrow: "Über uns",
    title: "Ein spezialisiertes Studio für erstklassige Websites.",
    intro: "Wir sind ein bewusst kompaktes Studio. Die Person, die Ihr Projekt kalkuliert, setzt es auch technisch um – so geht keine Information verloren.",
    story: {
      title: "Unsere Motivation",
      body: "Wir trafen immer wieder Unternehmen mit langsamen, fehleranfälligen Websites, die kaum zu pflegen und von Agenturen abhängig waren. Wir haben Virtue & Co. Webworks gegründet, um das Gegenteil zu liefern: robuste, extrem schnelle Websites mit voller Eigenständigkeit."
    },
    principles: {
      title: "Unsere Prinzipien",
      items: {
        senior: {
          title: "Direkter Entwicklerkontakt",
          body: "Keine Account Manager oder Einsteiger, die an Ihrem Budget lernen. Sie sprechen direkt mit erfahrenen Spezialisten."
        },
        fast: {
          title: "Geschwindigkeit als Grundprinzip",
          body: "Wir optimieren die Ladezeit vom ersten Entwurf an. Eine schöne Website, die langsam lädt, verfehlt ihr Ziel."
        },
        clear: {
          title: "Fester Umfang, fester Preis",
          body: "Fahrplan und Kosten stehen vor Beginn schriftlich fest. Zusatzwünsche werden vorab kalkuliert – niemals überraschende Rechnungen."
        },
        owned: {
          title: "100% Ihr Eigentum",
          body: "Quellcode, Design, Domain und Benutzerkonten gehören ausnahmslos Ihnen."
        }
      }
    },
    capabilities: {
      title: "Unsere Kernkompetenzen",
      items: [
        "Maßgeschneiderte Webanwendungen und Websites",
        "Leistungsstarke Content-Management-Systeme",
        "Online-Shops und integrierte Zahlungssysteme",
        "Performance-Optimierung und Relaunch bestehender Seiten",
        "Design-Systeme und UI-Komponentenbibliotheken"
      ]
    },
    cta: {
      title: "Planen Sie ein neues Projekt?",
      body: "Erzählen Sie uns von Ihrem Vorhaben und erhalten Sie innerhalb von zwei Werktagen ein maßgeschneidertes Festpreisangebot.",
      button: "Angebot anfordern"
    },
    bandAlt: "Studio-Team arbeitet konzentriert an Laptops zusammen.",
    bandCaption: "Ein eingespieltes Senior-Team – Sie arbeiten direkt mit den Machern Ihrer Website."
  },
  Blog: {
    metaTitle: "Einblicke und technische Fachartikel",
    metaDescription: "Praxisberichte von Virtue & Co. Webworks über Web-Performance, moderne Zahlungssysteme und termingerechte Softwarelieferung.",
    eyebrow: "Fachartikel",
    title: "Gedanken zu modernem Webdesign.",
    subtitle: "Praxisorientierte Beiträge zu Geschwindigkeit, E-Commerce-Architektur und Software-Handwerk.",
    readMore: "Artikel lesen",
    readTime: "{minutes} Min. Lesezeit",
    publishedOn: "Veröffentlicht",
    updated: "Aktualisiert",
    back: "Zurück zur Übersicht",
    empty: "Derzeit sind noch keine Artikel veröffentlicht.",
    relatedTitle: "Verwandte Artikel"
  },
  CaseStudy: {
    back: "Zurück zum Portfolio",
    client: "Kunde",
    year: "Jahr",
    role: "Aufgabe",
    timeline: "Dauer",
    stack: "Technologien",
    visit: "Live-Website ansehen",
    challenge: "Die Herausforderung",
    approach: "Unser Lösungsansatz",
    outcome: "Das Ergebnis",
    results: "Messbare Erfolge",
    gallery: "Projekt-Screenshots",
    next: "Nächstes Projekt",
    notFound: "Fallstudie nicht gefunden"
  },
  WhatsApp: {
    label: "Termin buchen",
    title: "Gespräch vereinbaren",
    body: "Sprechen Sie direkt mit unserem Entwicklerteam über Ihre Pläne und Terminvorgaben.",
    cta: "Google Meet anfragen",
    close: "Schließen"
  },
  Legal: {
    updated: "Zuletzt aktualisiert:",
    contactNote: "Bei rechtlichen Fragen oder Datenschutzanliegen wenden Sie sich bitte an privacy@virtuecowebworks.solutions.",
    privacy: {
      title: "Datenschutzerklärung",
      metaTitle: "Datenschutzerklärung · Virtue & Co. Webworks",
      metaDescription: "Erfahren Sie, wie Virtue & Co. Webworks Ihre personenbezogenen Daten schützt und Vertraulichkeit wahrt.",
      intro: "Der Schutz Ihrer Privatsphäre ist für uns oberstes Gebot. Diese Richtlinie erklärt unsere sparsame Datenerhebung und strenge Sicherheitsvorkehrungen.",
      sections: en.Legal.privacy.sections
    },
    terms: {
      title: "Allgemeine Geschäftsbedingungen",
      metaTitle: "Allgemeine Geschäftsbedingungen · Virtue & Co. Webworks",
      metaDescription: "Vertragsbedingungen, Urheberrechte, Garantien und Meilensteine bei Virtue & Co. Webworks.",
      intro: "Diese Bedingungen regeln alle Web-Engineering- und Designdienstleistungen unseres Studios transparent und fair.",
      sections: en.Legal.terms.sections
    }
  },
  Photos: {
    services: { alt: "Entwickler bei der Gestaltung von Benutzeroberflächen und Code.", caption: "Individuelle Architektur und höchste Performance-Standards." },
    work: { alt: "Übersicht aktueller Webprojekte auf Desktop und Smartphone.", caption: "Schnelle Websites, die Besucher zu Kunden machen." },
    blog: { alt: "Moderne Softwarearchitektur und Web-Performance-Grafiken.", caption: "Erkenntnisse aus echten Kundenprojekten." },
    contact: { alt: "Projektbesprechung und Anforderungsanalyse.", caption: "Persönliche Beratung ab der ersten Minute." },
    process: { alt: "Fünfstufiger strukturierter Entwicklungsprozess.", caption: "Transparenter Ablauf ohne versteckte Kosten." }
  }
};

// 4. ARABIC TRANSLATIONS (RTL)
const arExtensions = {
  Common: {
    bookCall: "حجز مكالمة",
    emailUs: "راسلنا عبر البريد",
    whatsapp: "واتساب",
    search: "بحث",
    toggleTheme: "تبديل المظهر",
    readMore: "اقرأ المزيد",
    learnAbout: "تعرف على الاستوديو"
  },
  Home: {
    hero: {
      imageAlt: "مصممان يراجعان معاً تصميم موقع إلكتروني على حاسوب محمول.",
      available: "متاحون لاستقبال مشاريع جديدة"
    },
    band: {
      eyebrow: "إجابات واضحة",
      title: "نخبرك بما سنبنيه، وتكلفته الدقيقة، والمدة الزمنية المحددة.",
      body: "لا عروض ترويجية غامضة ولا تقديرات تقريبية. تحصل على خطة مكتوبة وسعر ثابت قبل الالتزام بأي شيء.",
      cta: "احصل على سعر"
    }
  },
  Services: {
    items: {
      custom: { imageAlt: "مصمم ومطور يراجعان تصميماً مخصصاً لموقع إلكتروني." },
      wordpress: { imageAlt: "شخصان يقومان بتحرير المحتوى عبر نظام إدارة المحتوى." },
      wix: { imageAlt: "حاسوب محمول يعرض موقعاً تم إطلاقه حديثاً." },
      ecommerce: { imageAlt: "متجر إلكتروني معروض بجانب جهاز دفع آمن." }
    }
  },
  Portfolio: {
    viewCaseStudy: "عرض دراسة الحالة",
    caseStudies: "دراسات الحالة",
    inside: {
      eyebrow: "في كواليس المشروع",
      title: "ما ستحصل عليه فعلياً.",
      subtitle: "افتح أي مجلد لمعرفة تفاصيله. كل مشروع نطلقه يشمل هذه العناصر الأربعة دون رسوم خفية.",
      hint: "افتح المجلد",
      items: {
        design: {
          title: "التصميم",
          caption: "يتم تصميم كل صفحة بعناية فائقة قبل كتابة أي سطر برمجي.",
          files: ["مخططات هيكلية لكل صفحة", "ألوانك وخطوطك ومكونات علامتك", "تصاميم نهائية متوافقة مع كل الشاشات", "نموذج أولي تفاعلي للتجربة"]
        },
        build: {
          title: "التطوير البرمجي",
          caption: "الموقع الفعلي مبني للسرعة الفائقة ومُسلّم بكود نظيف.",
          files: ["الكود المصدري كاملاً", "محرر محتوى سلس لفريقك", "بوابات الدفع والربط الخارجي", "اختبارات آلية لرحلة المستخدم"]
        },
        content: {
          title: "المحتوى وتهيئة محركات البحث",
          caption: "الأساس المتين للظهور في محركات البحث بسهولة.",
          files: ["نصوص متقنة لصفحاتك", "عناوين ووصف ميتا مُحسّن", "خريطة موقع وروابط واضحة", "لوحة تحليلات وإحصائيات دقيقة"]
        },
        handover: {
          title: "التسليم والدعم",
          caption: "لتتمكن من إدارة الموقع بنفسك بكل ثقة دون الحاجة إلينا.",
          files: ["دليل استخدام مكتوب ومفصل", "فيديو توضيحي لشرح لوحة التحكم", "جميع الحسابات مسجلة باسمك", "30 يوماً من الدعم المجاني بعد الإطلاق"]
        }
      }
    }
  },
  Contact: {
    hours: "أوقات التوفر",
    hoursNote: "نعمل عن بُعد مع عملاء من مختلف أنحاء العالم. يمكنك التواصل معنا في أي وقت على مدار الساعة.",
    beforeYouWrite: "قبل أن تراسلنا",
    days: {
      weekdays: "الاثنين – الجمعة",
      saturday: "السبت",
      sunday: "الأحد"
    },
    bookingTitle: "حجز مكالمة تمهيدية لمدة 30 دقيقة"
  },
  Footer: {
    legal: "الشؤون القانونية",
    newsletter: "النشرة الإخبارية",
    hours: "أوقات العمل"
  },
  Admin: {
    nav: { design: "التصميم" },
    design: en.Admin.design
  },
  Capabilities: {
    promises: {
      senior: {
        title: "تتحدث مباشرة مع المطور",
        body: "لا وسطاء ولا مسؤولي مبيعات. الشخص الذي يسعّر مشروعك هو نفسه من يبنيه."
      },
      scope: {
        title: "نطاق عمل محدد بسعر ثابت",
        body: "تحصل على خطة العمل والسعر النهائي كتابياً قبل انطلاق المشروع."
      },
      reply: {
        title: "رد خلال 48 ساعة",
        body: "تتلقى كل رسالة رداً واضحاً ومفصلاً في وقت قياسي."
      },
      handover: {
        title: "الملكية الكاملة لك",
        body: "الكود المصدري، ملفات التصميم، وجميع الحسابات ملكك وحدك ومُسلّمة لك."
      }
    }
  },
  Command: {
    label: "لوحة الأوامر",
    placeholder: "ابحث في الصفحات، الخدمات، الأعمال، والإجراءات…",
    empty: "لم يتم العثور على نتائج.",
    openHint: "بحث",
    groups: {
      pages: "الصفحات",
      services: "الخدمات",
      actions: "الإجراءات"
    },
    themeLight: "التحويل للوضع الفاتح",
    themeDark: "التحويل للوضع الداكن",
    actions: {
      quote: "احصل على تسعير",
      book: "احجز مكالمة",
      email: "راسل الاستوديو",
      whatsapp: "طلب لقاء Google Meet",
      admin: "لوحة التحكم"
    }
  },
  Pricing: {
    eyebrow: "الأسعار",
    title: "تسعير واضح وشفاف.",
    subtitle: "لا باقات معقدة ولا تكاليف غير مبررة — يُسعّر كل مشروع بدقة وفقاً لمتطلباته الحقيقية.",
    from: "مشاريع تبدأ من",
    note: "هذا أقل نطاق عمل نقبله. تتحدد أسعار المشاريع بعد مكالمة قصيرة، وتحصل دائماً على المبلغ النهائي كتابياً قبل البدء.",
    secondary: "اكتشف ما هو مشمول"
  },
  Faq: {
    eyebrow: "معلومات تهمك",
    title: "أسئلة شائعة.",
    items: {
      timeline: {
        q: "كم يستغرق بناء الموقع الإلكتروني؟",
        a: "الموقع التعريفي البسيط يستغرق عادة بين أسبوعين إلى أربعة أسابيع. أما المنصات المخصصة والمتاجر الإلكترونية فتتطلب بين ستة إلى اثني عشر أسبوعاً."
      },
      stack: {
        q: "ما هي التقنيات التي تستخدمونها؟",
        a: "المشاريع المخصصة تُبنى بواسطة React و Next.js مع Supabase لقواعد البيانات والمصادقة. كما نبني أيضاً على WordPress و Wix حينما يكون ذلك الخيار الأنسب لك."
      },
      ownership: {
        q: "هل نمتلك الموقع بالكامل؟",
        a: "نعم بنسبة 100%. تمتلك الكود المصدري، ملفات التصميم، وكافة الحسابات. نقوم بتسليم كل شيء مع فيديو شرح تفصيلي."
      },
      support: {
        q: "ماذا يحدث بعد إطلاق الموقع؟",
        a: "يشمل كل مشروع 30 يوماً من الدعم الفني بعد الإطلاق. بعد ذلك، يمكنك إدارته بنفسك أو الاستمرار معنا في خطة تحسينات شهرية."
      },
      payments: {
        q: "كيف تتم الدفعات المالية؟",
        a: "تُقسّم المشاريع إلى دفعة مقدمة ودفعات مرتبطة بالمراحل المنجزة. الدفع آمن عبر البطاقات الائتمانية والتحويل البنكي ووسائل الدفع المحلية."
      },
      start: {
        q: "كيف نبدأ العمل معاً؟",
        a: "أرسل لنا رسالة عبر النموذج أو احجز مكالمة تمهيدية مجانية. سنرد عليك خلال يومي عمل بخطة واضحة وتسعير ثابت."
      }
    }
  },
  Newsletter: {
    eyebrow: "النشرة البريدية",
    title: "أفكار برمجية دورية. دون إزعاج.",
    body: "رسالة واحدة شهرياً تقريباً حول سرعة الويب، بوابات الدفع الإلكتروني، وتسليم البرمجيات بدقة في مواعيدها.",
    label: "البريد الإلكتروني",
    placeholder: "you@company.com",
    submit: "اشتراك",
    success: "تم تسجيلك بنجاح في القائمة البريدية — شكراً لك.",
    error: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
    invalid: "يرجى إدخال عنوان بريد إلكتروني صحيح.",
    privacy: "لا رسائل مزعجة إطلاقاً، ولا نشارك بريدك مع أي طرف ثالث."
  },
  Cookie: {
    title: "ملاحظة حول ملفات تعريف الارتباط",
    body: "نستخدم عدداً محدوداً من ملفات تعريف الارتباط لتذكر لغتك ومظهر الموقع، بالإضافة لتحليلات مجهولة المصدر دون تتبع إعلاني.",
    accept: "قبول الكل",
    decline: "الضرورية فقط",
    policy: "سياسة الخصوصية"
  },
  Booking: {
    eyebrow: "متاحون دائماً",
    title: "احجز مكالمة استكشافية",
    body: "مكالمة قصيرة ومباشرة لمناقشة أهدافك ومواعيدك النهائية. اختر الوقت المناسب لك.",
    cta: "اختر موعداً",
    note: "تفضل المراسلة؟ أرسل لنا رسالة وسنرد عليك بسرعة.",
    noteCta: "طلب لقاء Google Meet",
    timezone: "متاحون في كافة المناطق الزمنية."
  },
  About: {
    metaTitle: "عن الاستوديو · هندسة الويب وحرفية التنفيذ الرقمي",
    metaDescription: "تعرف على Virtue & Co. Webworks — استوديو متخصص في تطوير تجارب رقمية فائقة السرعة، أكواد نظيفة، وشراكات بأسعار ثابتة.",
    eyebrow: "من نحن",
    title: "استوديو هندسي متخصص للمواقع الراقية.",
    intro: "نحن استوديو صغير ونحافظ على حجمنا هذا عن قصد. الشخص الذي يسعر مشروعك هو ذاته من يقوم ببنائه، لتفادي أي ضياع للأفكار أو الوقت.",
    story: {
      title: "لماذا بدأنا",
      body: "التقينا بالكثير من أصحاب الأعمال الذين دفعوا مبالغ كبيرة وحصلوا على مواقع بطيئة، هشة، وصعبة التعديل ومرتهنة لشركات وسيطة. أسسنا هذا الاستوديو لنصنع العكس: مواقع سريعة جداً، موثقة بالكامل، وسهلة الإدارة ذاتياً."
    },
    principles: {
      title: "مبادئ عملنا",
      items: {
        senior: {
          title: "تتواصل مباشرة مع المنفّذ",
          body: "لا مدراء حسابات ولا متدربين يتعلمون على حساب ميزانيتك. حديثك مباشر مع المطورين."
        },
        fast: {
          title: "السرعة جزء أصيل من التصميم",
          body: "نخطط لسرعة التحميل من اليوم الأول. فالموقع الجميل الذي يفتح ببطء موقع فاشل."
        },
        clear: {
          title: "نطاق عمل محدد، سعر ثابت",
          body: "تحصل على خطة العمل والسعر المكتوب قبل الانطلاق. وأي عمل إضافي يُسعّر مسبقاً دون مفاجآت."
        },
        owned: {
          title: "ملكية تامة بنسبة 100%",
          body: "الكود والتصاميم والنطاق والحسابات ملكك وحدك."
        }
      }
    },
    capabilities: {
      title: "أبرز مجالات تميزنا",
      items: [
        "تطوير المواقع وتطبيقات الويب المخصصة",
        "مواقع الشركات مع أنظمة إدارة محتوى سهلة",
        "المتاجر الإلكترونية وأنظمة الدفع المباشر",
        "تحسين وإعادة بناء المواقع البطيئة",
        "أنظمة التصميم ومكتبات المكونات البرمجية"
      ]
    },
    cta: {
      title: "هل لديك مشروع ترغب في تنفيذه؟",
      body: "أخبرنا بتفاصيل ما تريده وسنوافيك بخطة عمل واضحة وسعر ثابت خلال يومي عمل.",
      button: "احصل على سعر"
    },
    bandAlt: "أعضاء الاستوديو يعملون معاً حول طاولة مليئة بالحواسيب المحمولة.",
    bandCaption: "فريق هندسي متخصص — تعمل مباشرة مع الأشخاص الذين يبنون موقعك."
  },
  Blog: {
    metaTitle: "مقالات وأفكار تقنية",
    metaDescription: "رؤى وتجارب من استوديو Virtue & Co. Webworks حول سرعة المواقع، بوابات الدفع، وإنجاز البرمجيات.",
    eyebrow: "المقالات",
    title: "خواطر في صناعة الويب الحديثة.",
    subtitle: "كتابات عملية حول سرعة الأداء، معمارية الدفع، والبرمجة الرصينة.",
    readMore: "اقرأ المقال",
    readTime: "{minutes} دقائق قراءة",
    publishedOn: "تاريخ النشر",
    updated: "تم التحديث",
    back: "العودة للمقالات",
    empty: "لا توجد مقالات منشورة حالياً.",
    relatedTitle: "مقالات ذات صلة"
  },
  CaseStudy: {
    back: "العودة لسجل الأعمال",
    client: "العميل",
    year: "السنة",
    role: "الدور",
    timeline: "المدة الزمنية",
    stack: "التقنيات المستخدمة",
    visit: "زيارة الموقع الحي",
    challenge: "التحدي",
    approach: "منهجية الحل",
    outcome: "النتيجة",
    results: "الأثر والنتائج",
    gallery: "معرض الصور",
    next: "المشروع التالي",
    notFound: "دراسة الحالة غير موجودة"
  },
  WhatsApp: {
    label: "حجز موعد",
    title: "تحديد موعد لقاء",
    body: "تحدث مباشرة مع فريقنا الهندسي لمناقشة أهدافك والجدول الزمني لمشروعك.",
    cta: "طلب لقاء Google Meet",
    close: "إغلاق"
  },
  Legal: {
    updated: "آخر تحديث:",
    contactNote: "لأي استفسارات قانونية أو تتعلق بالخصوصية، يرجى مراسلتنا على privacy@virtuecowebworks.solutions.",
    privacy: {
      title: "سياسة الخصوصية",
      metaTitle: "سياسة الخصوصية · Virtue & Co. Webworks",
      metaDescription: "تعرف على كيفية حماية بياناتك الشخصية وحفظ خصوصيتك لدى Virtue & Co. Webworks.",
      intro: "نولي خصوصية معلوماتك أهمية قصوى. توضح هذه السياسة مبادئنا في الحد الأدنى لجمع البيانات وتأمينها بأعلى المعايير.",
      sections: en.Legal.privacy.sections
    },
    terms: {
      title: "الشروط والأحكام",
      metaTitle: "الشروط والأحكام · Virtue & Co. Webworks",
      metaDescription: "الشروط التعاقدية، حقوق الملكية الفكرية، الضمانات، ومراحل تسليم المشاريع لدى Virtue & Co. Webworks.",
      intro: "تحكم هذه الشروط جميع خدمات التصميم والتطوير البرمجي التي يقدمها الاستوديو، لتوفير إطار تعاوني عادل وشفاف.",
      sections: en.Legal.terms.sections
    }
  },
  Photos: {
    services: { alt: "مطورون يعملون على كتابة الأكواد وتصميم واجهات المستخدم.", caption: "هندسة مخصصة ومعايير أداء فائقة." },
    work: { alt: "عرض لمشاريع الويب الحديثة على أجهزة مختلفة.", caption: "مواقع سريعة تحول الزوار إلى عملاء فعليين." },
    blog: { alt: "معمارية برمجية حديثة ورسوم بيانية لأداء الويب.", caption: "دروس مستفادة من مشاريع واقعية." },
    contact: { alt: "اجتماع تخطيط وتحديد متطلبات المشروع الرقمي.", caption: "اهتمام شخصي من أول لحظة تواصل." },
    process: { alt: "مراحل منهجية العمل الخمس المحددة.", caption: "مسار عمل منظم دون مفاجآت أو تكاليف خفية." }
  }
};

// Merge into respective message files
deepMerge(fr, frExtensions);
deepMerge(es, esExtensions);
deepMerge(de, deExtensions);
deepMerge(ar, arExtensions);

fs.writeFileSync(path.join(__dirname, '../src/messages/fr.json'), JSON.stringify(fr, null, 2) + '\n');
fs.writeFileSync(path.join(__dirname, '../src/messages/es.json'), JSON.stringify(es, null, 2) + '\n');
fs.writeFileSync(path.join(__dirname, '../src/messages/de.json'), JSON.stringify(de, null, 2) + '\n');
fs.writeFileSync(path.join(__dirname, '../src/messages/ar.json'), JSON.stringify(ar, null, 2) + '\n');

console.log('Successfully synced all translations across FR, ES, DE, and AR!');
