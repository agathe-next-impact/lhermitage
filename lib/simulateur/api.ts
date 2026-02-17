import { gqlRequestList, gqlRequest } from "@/lib/wordpress/graphql/client"
import {
  GET_ACTIVITES_SIMULATEUR,
  GET_HEBERGEMENTS_SIMULATEUR,
  GET_ESPACES_SIMULATEUR,
  GET_SERVICES_SIMULATEUR,
  GET_SEJOUR_TEMPLATES,
  GET_SIMULATEUR_SETTINGS,
} from "@/lib/wordpress/graphql/queries/simulateur"
import {
  transformActiviteSim,
  transformHebergementSim,
  transformEspaceSim,
  transformServiceSim,
  transformSejourTemplate,
  transformSimulateurSettings,
} from "./transformers"
import { demoData } from "./fixtures/demo-data"
import type {
  SimActivite,
  SimHebergement,
  SimEspace,
  SimService,
  SimSejourTemplate,
  SimulateurSettings,
  SimulateurData,
} from "@/lib/simulateur/types"

export const simulateurApi = {
  async getActivites(): Promise<SimActivite[]> {
    try {
      const data = await gqlRequestList<any>(GET_ACTIVITES_SIMULATEUR)
      const nodes = data?.activitS?.nodes
      if (nodes?.length) return nodes.map(transformActiviteSim)
    } catch {
      /* fall through to demo */
    }
    return demoData.activites
  },

  async getHebergements(): Promise<SimHebergement[]> {
    try {
      const data = await gqlRequestList<any>(GET_HEBERGEMENTS_SIMULATEUR)
      const nodes = data?.hBergements?.nodes
      if (nodes?.length) return nodes.map(transformHebergementSim)
    } catch {
      /* fall through to demo */
    }
    return demoData.hebergements
  },

  async getEspaces(): Promise<SimEspace[]> {
    try {
      const data = await gqlRequestList<any>(GET_ESPACES_SIMULATEUR)
      const nodes = data?.espacesDeTravail?.nodes
      if (nodes?.length) return nodes.map(transformEspaceSim)
    } catch {
      /* fall through to demo */
    }
    return demoData.espaces
  },

  async getServices(): Promise<SimService[]> {
    try {
      const data = await gqlRequestList<any>(GET_SERVICES_SIMULATEUR)
      const nodes = data?.services?.nodes
      if (nodes?.length) return nodes.map(transformServiceSim)
    } catch {
      /* fall through to demo */
    }
    return demoData.services
  },

  async getSejourTemplates(): Promise<SimSejourTemplate[]> {
    try {
      const data = await gqlRequestList<any>(GET_SEJOUR_TEMPLATES)
      const nodes = data?.sejourTemplates?.nodes
      if (nodes?.length) return nodes.map(transformSejourTemplate)
    } catch {
      /* fall through to demo */
    }
    return demoData.templates
  },

  async getSettings(): Promise<SimulateurSettings> {
    try {
      const data = await gqlRequest<any>(GET_SIMULATEUR_SETTINGS)
      const raw = data?.simulateurSettings?.simulateurSettings
      if (raw) return transformSimulateurSettings(raw)
    } catch {
      /* fall through to demo */
    }
    return demoData.settings
  },

  async getAllData(): Promise<SimulateurData> {
    const [activites, hebergements, espaces, services, templates, settings] = await Promise.all([
      this.getActivites(),
      this.getHebergements(),
      this.getEspaces(),
      this.getServices(),
      this.getSejourTemplates(),
      this.getSettings(),
    ])
    return { activites, hebergements, espaces, services, templates, settings }
  },
}
