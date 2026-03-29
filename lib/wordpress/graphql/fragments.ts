import { gql } from "graphql-request"

export const IMAGE_FIELDS = gql`
  fragment ImageFields on MediaItem {
    databaseId
    sourceUrl
    altText
    mediaDetails {
      width
      height
      sizes {
        name
        sourceUrl
        width
        height
      }
    }
  }
`

export const FEATURED_IMAGE_FRAGMENT = gql`
  fragment FeaturedImageFields on NodeWithFeaturedImageToMediaItemConnectionEdge {
    node {
      ...ImageFields
    }
  }
  ${IMAGE_FIELDS}
`

export const PAGE_FIELDS = gql`
  fragment PageFields on Page {
    databaseId
    slug
    title
    content
    date
    status
    link
    parentDatabaseId
    menuOrder
    featuredImage {
      ...FeaturedImageFields
    }
    elementsDePage {
      hero {
        sousTitre
        image {
          node {
            ...ImageFields
          }
        }
        imagesLaterales {
          nodes {
            ...ImageFields
          }
        }
      }
    }
    pageDAccueil {
      slogan
      video
      videoAutoHerbegee {
        node {
          mediaItemUrl
          mimeType
        }
      }
    }
    pageDevenirSocietaire {
      chapeau
      bandeau {
        titre
        cta {
          url
          title
          target
        }
        galerie {
          nodes {
            databaseId
            sourceUrl
            altText
          }
        }
      }
      pourquoiRejoindre {
        titre
        raisons {
          raison
        }
      }
      questCeQueLaScic {
        titre
        caracteristiquesDeLaScic {
          caracteristique {
            titre
            descriptif
          }
        }
      }
      informationsSocietariat {
        titre
        descriptif
      }
      historique {
        titre
        descriptif
        etapes {
          annee
          descriptif
        }
      }
      documentsLegaux {
        titre
        fichiers {
          nomDuDocument
          fichierDuDocument {
            node {
              mediaItemUrl
              title
              mimeType
              fileSize
            }
          }
        }
      }
      impact {
        titre
        descriptif
        citation
      }
    }
    pageStructures {
      structuresInternes {
        titreDeSection
        imageDeSection {
          node {
            ...ImageFields
          }
        }
      }
      structuresHebergees {
        titreDeSection
        imageDeSection {
          node {
            ...ImageFields
          }
        }
      }
    }
    pageLocalisation {
      adresse {
        ligne1
        ligne2
        description
        image {
          node {
            ...ImageFields
          }
        }
        carteUrl
      }
      moyensAcces {
        titre
        icone
        couleur
        duree
        contenu
      }
      logistique {
        titre
        texte
        services {
          label
          icone
        }
        note
        image {
          node {
            ...ImageFields
          }
        }
      }
    }
    pageHoraires {
      horairesPage {
        imageAmbiance {
          node {
            ...ImageFields
          }
        }
        accroche
        bonASavoir
        cafe {
          titre
          sousTitre
          horaires {
            jour
            heures
            ferme
            note
            evenement
          }
          encarts {
            titre
            texte
            icone
            couleur
          }
        }
        domaine {
          titre
          sousTitre
          texte
          image {
            node {
              ...ImageFields
            }
          }
          badges {
            label
            description
          }
          note
        }
        sejours {
          titre
          sousTitre
          accroche
          texte
        }
      }
    }
    pageContacts {
      contactsEquipe {
        nom
        role
        organisation
        photo {
          node {
            ...ImageFields
          }
        }
        email
        telephones {
          numero
          label
        }
        adresse
      }
    }
    pageRecrutement {
      introRecrutement {
        titre
        texte
        chiffresCles {
          icone
          categorie
          valeur
          description
        }
      }
      offres {
        icone
        titre
        descriptif
        missions {
          texte
        }
        profil {
          texte
        }
        ctaTexte
        ctaLien
      }
      cadreDeVie {
        titre
        blocs {
          icone
          titre
          texteIntro
          elements {
            titre
            description
          }
          note
          image {
            node {
              ...ImageFields
            }
          }
        }
      }
      temoignages {
        citation
        auteur
        role
        photo {
          node {
            ...ImageFields
          }
        }
      }
      candidature {
        titre
        texte
        email
        emailSecondaire
        activerFormulaire
        champs {
          label
          typeChamp
          requis
          options
        }
      }
    }
  }
  ${FEATURED_IMAGE_FRAGMENT}
`

export const MENU_ITEM_FIELDS = gql`
  fragment MenuItemFields on MenuItem {
    databaseId
    label
    url
    parentDatabaseId
    order
  }
`
