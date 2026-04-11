import { gql } from "graphql-request"
import { IMAGE_FIELDS } from "../fragments"

/**
 * Isolated query for the "Page Nous Soutenir" ACF field group.
 *
 * Mirrors the patrimoine/video-dentete pattern: kept out of PAGE_FIELDS so
 * that the central page query keeps working even before the WP admin
 * imports the matching ACF field group.
 *
 * Expected ACF graphql_field_name: `pageNousSoutenir`
 * (set on the field group in WP admin — accents/apostrophes stripped).
 */
export const GET_PAGE_NOUS_SOUTENIR_DATA = gql`
  query GetPageNousSoutenirData($id: ID!) {
    page(id: $id, idType: DATABASE_ID) {
      databaseId
      pageNousSoutenir {
        heroTitre
        heroMotsRotatifs {
          mot
        }
        heroSousTitre
        heroImage {
          node {
            ...ImageFields
          }
        }
        piliers {
          pilierTitre
          pilierSousTitre
          pilierImage {
            node {
              ...ImageFields
            }
          }
          pilierCards {
            cardMontant
            cardDescription
          }
        }
        ctaDonTexte
        ctaDonUrl {
          url
          title
          target
        }
        fiscalTitre
        fiscalDescription
        fiscalImageTableau {
          node {
            ...ImageFields
          }
        }
        fiscalImageDetail {
          node {
            ...ImageFields
          }
        }
        fiscalCtaTexte
        fiscalCtaUrl {
          url
          title
          target
        }
        presentationSurtitre
        presentationIntro
        presentationParagraphe1
        presentationParagraphe2
        presentationParagraphe3
        compteurs {
          compteurValeur
          compteurLabel
        }
        societaireSurtitre
        societaireTitre
        societaireDescription
        societaireCtaTexte
        societaireCtaUrl {
          url
          title
          target
        }
        societaireImage {
          node {
            ...ImageFields
          }
        }
      }
    }
  }
  ${IMAGE_FIELDS}
`
