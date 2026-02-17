import { createContext, useContext, useState, type ReactNode } from "react";

export type Language = "pt" | "en";

export type UserProfile = {
  name: string;
  avatarUrl: string;
  language: Language;
};

type UserContextType = {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
};

const defaultProfile: UserProfile = {
  name: "Usuário",
  avatarUrl: "",
  language: "pt",
};

function loadProfile(): UserProfile {
  try {
    const stored = localStorage.getItem("userProfile");
    if (stored) return { ...defaultProfile, ...JSON.parse(stored) };
  } catch {
    return defaultProfile;
  }
  return defaultProfile;
}

const UserContext = createContext<UserContextType>({
  profile: defaultProfile,
  updateProfile: () => {},
});

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(loadProfile);

  function updateProfile(updates: Partial<UserProfile>) {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem("userProfile", JSON.stringify(next));
      return next;
    });
  }

  return (
    <UserContext.Provider value={{ profile, updateProfile }}>
      {children}
    </UserContext.Provider>
  );
}

// ─── Translations ────────────────────────────────────────────────────────────

export const translations = {
  pt: {
    dashboard: "Dashboard",
    applications: "Candidaturas",
    statistics: "Estatísticas",
    settings: "Configurações",
    search_placeholder: "Buscar candidaturas...",
    search_navigate_hint: "Pressione Enter para buscar",
    profile: "Perfil",
    appearance: "Aparência",
    language: "Idioma",
    theme_light: "Claro",
    theme_dark: "Escuro",
    name: "Nome",
    avatar_url: "URL da foto de perfil",
    save: "Salvar",
    saved: "Salvo!",
    notifications: "Notificações",
    open_menu: "Abrir menu",
    clear_search: "Limpar busca",
    close: "Fechar",
    cancel: "Cancelar",
    edit: "Editar",
    delete: "Deletar",
    previous: "Anterior",
    next: "Próximo",
    status: "Status",
    applied_date: "Data de aplicação",
    company_required: "Empresa *",
    role_required: "Cargo/Vaga *",
    error: "Erro",
    error_loading: "Erro ao carregar",
    profile_menu: "Perfil",
    show_sidebar: "Mostrar menu lateral",
    hide_sidebar: "Esconder menu lateral",
    status_applied: "Aplicada",
    status_interview: "Entrevista",
    status_offer: "Oferta",
    status_rejected: "Rejeitada",
    // Dashboard
    total: "Total",
    applied: "Aplicadas",
    interview: "Entrevistas",
    offers: "Ofertas",
    rejected: "Rejeitadas",
    overview: "Visão geral das suas candidaturas",
    metrics: "Métricas",
    interview_rate: "Taxa de entrevista",
    offer_rate: "Taxa de oferta",
    see_all: "Ver todas →",
    see_stats: "Ver estatísticas completas →",
    new_application: "Nova Candidatura",
    recent_applications: "Candidaturas recentes",
    no_applications_yet: "Nenhuma candidatura ainda.",
    start_now: "Comece agora!",
    add_first_desc: "Adicione sua primeira candidatura para começar a acompanhar.",
    add_application: "Adicionar candidatura",
    loading: "Carregando...",
    registered: "candidaturas registradas",
    of: "de",
    applications_count: (n: number) => `${n} candidatura${n !== 1 ? "s" : ""} registradas`,
    // Statistics
    status_distribution: "Distribuição por status",
    conversion_funnel: "Funil de conversão",
    conversion_rates: "Taxas de conversão",
    monthly_chart: "Candidaturas por mês",
    no_data_title: "Sem dados ainda",
    no_data_desc: "Adicione candidaturas para ver as estatísticas aqui.",
    total_applications: (n: number) => `${n} candidaturas no total`,
    reached_interview: "Chegaram a entrevista",
    received_offer: "Receberam oferta",
    all_applications: "Total candidatas",
    app_to_interview: "Aplicação → Entrevista",
    interview_to_offer: "Entrevista → Oferta",
    app_to_offer: "Aplicação → Oferta (geral)",
    of_interviews: "entrevistas",
    of_applications: "candidaturas",
    // Applications page
    applications_title: "Minhas Candidaturas",
    applications_registered: (n: number) => `${n} candidaturas registradas`,
    applications_filter_all: "Todas",
    applications_sort_by: "Ordenar por:",
    applications_sort_date_desc: "Data (mais recente)",
    applications_sort_date_asc: "Data (mais antiga)",
    applications_sort_company_asc: "Empresa (A-Z)",
    applications_search_placeholder: "Buscar por empresa ou vaga...",
    applications_page_of: (page: number, totalPages: number) => `Página ${page} de ${totalPages}`,
    applications_empty_title: "Nenhuma candidatura ainda",
    applications_empty_desc: "Adicione sua primeira candidatura para começar a acompanhar.",
    applications_add_first: "Adicionar primeira candidatura",
    applications_not_found_title: "Nada encontrado",
    applications_not_found_desc: "Tente buscar por outro termo (empresa ou vaga).",
    applications_no_match_filters: "Nenhuma candidatura corresponde aos filtros atuais.",
    applications_clear_filters: "Limpar filtros",
    applications_applied_on: "Aplicado em:",
    applications_change_status: "Mudar status",
    applications_change_status_title: "Mudar status",
    applications_edit_title: "Editar candidatura",
    applications_delete_title: "Deletar candidatura",
    applications_delete_confirm: (company: string, role: string) =>
      `Tem certeza que deseja deletar a candidatura de ${company} para ${role}?`,
    applications_busy_updating: "Atualizando...",
    applications_busy_saving: "Salvando...",
    applications_busy_deleting: "Deletando...",
    applications_created_title: "Candidatura criada!",
    applications_created_msg: "Salva com sucesso.",
    applications_updated_title: "Atualizada!",
    applications_updated_msg: "Candidatura editada com sucesso.",
    applications_deleted_title: "Removida!",
    applications_deleted_msg: "Candidatura deletada.",
    applications_status_updated_title: "Status atualizado!",
    applications_status_updated_msg: (status: string) => `Agora está como ${status}.`,
    applications_error_fetch: "Erro ao buscar candidaturas",
    applications_error_create: "Erro ao criar",
    applications_error_edit: "Erro ao editar",
    applications_error_update_status: "Erro ao atualizar status",
    applications_error_delete: "Erro ao deletar",
    applications_error_retry: "Tente novamente.",
    applications_error_api_hint:
      "Confere se a API está rodando em localhost:8080 e se o CORS está liberado para localhost:5173.",
  },
  en: {
    dashboard: "Dashboard",
    applications: "Applications",
    statistics: "Statistics",
    settings: "Settings",
    search_placeholder: "Search applications...",
    search_navigate_hint: "Press Enter to search",
    profile: "Profile",
    appearance: "Appearance",
    language: "Language",
    theme_light: "Light",
    theme_dark: "Dark",
    name: "Name",
    avatar_url: "Profile photo URL",
    save: "Save",
    saved: "Saved!",
    notifications: "Notifications",
    open_menu: "Open menu",
    clear_search: "Clear search",
    close: "Close",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    previous: "Previous",
    next: "Next",
    status: "Status",
    applied_date: "Applied date",
    company_required: "Company *",
    role_required: "Role/Position *",
    error: "Error",
    error_loading: "Error loading",
    profile_menu: "Profile",
    show_sidebar: "Show sidebar",
    hide_sidebar: "Hide sidebar",
    status_applied: "Applied",
    status_interview: "Interview",
    status_offer: "Offer",
    status_rejected: "Rejected",
    // Dashboard
    total: "Total",
    applied: "Applied",
    interview: "Interviews",
    offers: "Offers",
    rejected: "Rejected",
    overview: "Overview of your job applications",
    metrics: "Metrics",
    interview_rate: "Interview rate",
    offer_rate: "Offer rate",
    see_all: "See all →",
    see_stats: "See full statistics →",
    new_application: "New Application",
    recent_applications: "Recent applications",
    no_applications_yet: "No applications yet.",
    start_now: "Start now!",
    add_first_desc: "Add your first application to start tracking.",
    add_application: "Add application",
    loading: "Loading...",
    registered: "applications registered",
    of: "of",
    applications_count: (n: number) => `${n} application${n !== 1 ? "s" : ""} registered`,
    // Statistics
    status_distribution: "Status distribution",
    conversion_funnel: "Conversion funnel",
    conversion_rates: "Conversion rates",
    monthly_chart: "Applications by month",
    no_data_title: "No data yet",
    no_data_desc: "Add applications to see statistics here.",
    total_applications: (n: number) => `${n} total application${n !== 1 ? "s" : ""}`,
    reached_interview: "Reached interview",
    received_offer: "Received offer",
    all_applications: "Total applied",
    app_to_interview: "Application → Interview",
    interview_to_offer: "Interview → Offer",
    app_to_offer: "Application → Offer (overall)",
    of_interviews: "interviews",
    of_applications: "applications",
    // Applications page
    applications_title: "My Applications",
    applications_registered: (n: number) => `${n} applications registered`,
    applications_filter_all: "All",
    applications_sort_by: "Sort by:",
    applications_sort_date_desc: "Date (newest)",
    applications_sort_date_asc: "Date (oldest)",
    applications_sort_company_asc: "Company (A-Z)",
    applications_search_placeholder: "Search by company or role...",
    applications_page_of: (page: number, totalPages: number) => `Page ${page} of ${totalPages}`,
    applications_empty_title: "No applications yet",
    applications_empty_desc: "Add your first application to start tracking.",
    applications_add_first: "Add first application",
    applications_not_found_title: "No results found",
    applications_not_found_desc: "Try searching for another term (company or role).",
    applications_no_match_filters: "No applications match the current filters.",
    applications_clear_filters: "Clear filters",
    applications_applied_on: "Applied on:",
    applications_change_status: "Change status",
    applications_change_status_title: "Change status",
    applications_edit_title: "Edit application",
    applications_delete_title: "Delete application",
    applications_delete_confirm: (company: string, role: string) =>
      `Are you sure you want to delete the application for ${role} at ${company}?`,
    applications_busy_updating: "Updating...",
    applications_busy_saving: "Saving...",
    applications_busy_deleting: "Deleting...",
    applications_created_title: "Application created!",
    applications_created_msg: "Saved successfully.",
    applications_updated_title: "Updated!",
    applications_updated_msg: "Application updated successfully.",
    applications_deleted_title: "Removed!",
    applications_deleted_msg: "Application deleted.",
    applications_status_updated_title: "Status updated!",
    applications_status_updated_msg: (status: string) => `It is now ${status}.`,
    applications_error_fetch: "Error fetching applications",
    applications_error_create: "Error creating",
    applications_error_edit: "Error editing",
    applications_error_update_status: "Error updating status",
    applications_error_delete: "Error deleting",
    applications_error_retry: "Please try again.",
    applications_error_api_hint:
      "Make sure the API is running on localhost:8080 and CORS is enabled for localhost:5173.",
  },
} as const;

export type Translations = (typeof translations)["pt"];

export function useTranslation(): Translations {
  const { profile } = useUser();
  return translations[profile.language] as unknown as Translations;
}
