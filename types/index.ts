export interface SiteMeta {
  title: string;
  description: string;
  version: string;
}

export interface HomeContent {
  headline: string;
  subtitle: string;
  animationStyle: 'fadeInUp' | 'fadeIn' | 'slideIn';
}

export interface SiteData {
  meta: SiteMeta;
  home: HomeContent;
}
